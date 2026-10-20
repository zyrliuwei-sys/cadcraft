/**
 * First-party funnel analytics: the browser reports each funnel step into
 * `analytics_event`; sign-ups and payments are read from `user` / `order`,
 * joined to visitors through the user id the server stamps on their events.
 *
 * Counting rules (shown as the dashboard footnote):
 * - Every step counts unique visitors, never raw event counts, and steps are
 *   independent (a visitor can click download without opening /download).
 * - Source / country / build / landing are the visitor's first event in the
 *   range: first-touch source and landing page, the country and page build
 *   they arrived with.
 * - Visitors that ever sent an `internal` event (admins, test devices) are
 *   dropped, along with their sign-ups and orders.
 * - A user seen on several devices counts once, on their earliest visitor.
 * - `sign_up` is a canonical registration metric sourced from user creation;
 *   the browser `sign_up` event is not used for that count.
 */

import { and, desc, eq, gte, isNotNull, lt, sql } from 'drizzle-orm';

import { db } from '@/core/db';
import {
  analyticsEvent,
  order,
  user,
  type NewAnalyticsEvent,
} from '@/config/db/schema';

/**
 * Funnel steps in display order: `visit` is any event, `view_*` a page view
 * (PAGE_STEPS), `sign_up` / `paid` come from user / order, the rest are
 * event names.
 */
export const FUNNEL_STEPS = [
  'visit',
  'view_download',
  'download_click',
  'view_online',
  'online_app_loaded',
  'view_tutorials',
  'view_compare',
  'sign_up',
  'paid',
] as const;

const PAGE_STEPS: Record<string, string> = {
  view_download: '/download',
  view_online: '/online',
  view_tutorials: '/tutorials',
  view_compare: '/vs-autocad',
};

/** Locale-free path: `/zh/download/` → `/download`. */
function normalizePath(path: string) {
  return path.replace(/^\/zh(?=\/|$)/, '').replace(/(.)\/$/, '$1') || '/';
}

export type FunnelStep = (typeof FUNNEL_STEPS)[number];
export const DIMENSIONS = ['source', 'country', 'build', 'landing'] as const;
export type Dimension = (typeof DIMENSIONS)[number];

// D1 caps bound parameters at 100 per statement; 14 columns → 7 rows.
const INSERT_CHUNK = 7;

export async function recordEvents(rows: NewAnalyticsEvent[]) {
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    await db()
      .insert(analyticsEvent)
      .values(rows.slice(i, i + INSERT_CHUNK));
  }
}

export interface Totals {
  visitors: number;
  signups: number;
  payers: number;
  orders: number;
  revenue: number;
}

export interface BreakdownRow extends Totals {
  value: string;
  steps: Record<string, number>;
}

export interface DailyRow extends Totals {
  date: string;
}

export interface FunnelReport {
  totals: Totals;
  steps: { key: FunnelStep; visitors: number }[];
  events: { name: string; visitors: number }[];
  pages: { path: string; visitors: number }[];
  breakdown: Record<Dimension, BreakdownRow[]>;
  daily: DailyRow[];
  /** Paid orders whose user never showed up in the event table. */
  unattributed: { orders: number; revenue: number };
}

interface Visitor {
  id: string;
  firstAt: number;
  attrs: Record<Dimension, string>;
  names: Set<string>;
  pages: Set<string>;
  userIds: Set<string>;
  signup?: number;
  orders: { amount: number; paidAt: number }[];
}

const emptyTotals = (): Totals => ({
  visitors: 0,
  signups: 0,
  payers: 0,
  orders: 0,
  revenue: 0,
});

function addVisitor(t: Totals, v: Visitor) {
  t.visitors++;
  if (v.signup !== undefined) t.signups++;
  if (v.orders.length) t.payers++;
  t.orders += v.orders.length;
  t.revenue += v.orders.reduce((s, o) => s + o.amount, 0);
}

const ms = (d: Date | number) => (d instanceof Date ? d.getTime() : Number(d));

/** Local calendar day (yyyy-mm-dd) for a UTC offset in minutes (UTC+8 → 480). */
function dayKey(t: number, tzOffsetMin: number) {
  return new Date(t + tzOffsetMin * 60_000).toISOString().slice(0, 10);
}

export async function getFunnelReport(opts: {
  from: Date;
  to: Date;
  tzOffsetMin?: number;
}): Promise<FunnelReport> {
  const { from, to } = opts;
  const tz = opts.tzOffsetMin ?? 0;
  const inRange = and(
    gte(analyticsEvent.createdAt, from),
    lt(analyticsEvent.createdAt, to)
  );

  // First event per visitor in range — the dimensions they're bucketed by.
  const firsts = db()
    .select({
      visitorId: analyticsEvent.visitorId,
      firstAt: sql<number>`min(${analyticsEvent.createdAt})`.as('first_at'),
    })
    .from(analyticsEvent)
    .where(inRange)
    .groupBy(analyticsEvent.visitorId)
    .as('firsts');

  const [internalRows, firstRows, stepRows, userRows, newUsers, paidOrders] =
    await Promise.all([
      db()
        .selectDistinct({ visitorId: analyticsEvent.visitorId })
        .from(analyticsEvent)
        .where(and(inRange, eq(analyticsEvent.internal, 1))),
      db()
        .select({
          visitorId: analyticsEvent.visitorId,
          createdAt: analyticsEvent.createdAt,
          source: analyticsEvent.source,
          country: analyticsEvent.country,
          build: analyticsEvent.build,
          landing: analyticsEvent.landing,
        })
        .from(analyticsEvent)
        .innerJoin(
          firsts,
          and(
            eq(analyticsEvent.visitorId, firsts.visitorId),
            eq(analyticsEvent.createdAt, firsts.firstAt)
          )
        ),
      db()
        .selectDistinct({
          visitorId: analyticsEvent.visitorId,
          name: analyticsEvent.name,
          path: analyticsEvent.path,
        })
        .from(analyticsEvent)
        .where(inRange),
      db()
        .selectDistinct({
          visitorId: analyticsEvent.visitorId,
          userId: analyticsEvent.userId,
        })
        .from(analyticsEvent)
        .where(and(inRange, isNotNull(analyticsEvent.userId))),
      db()
        .select({ id: user.id, createdAt: user.createdAt })
        .from(user)
        .where(and(gte(user.createdAt, from), lt(user.createdAt, to))),
      db()
        .select({
          userId: order.userId,
          amount: order.amount,
          paidAt: order.paidAt,
        })
        .from(order)
        .where(
          and(
            eq(order.status, 'paid'),
            gte(order.paidAt, from),
            lt(order.paidAt, to)
          )
        )
        .orderBy(desc(order.paidAt)),
    ]);

  const internal = new Set(
    internalRows.map((r: { visitorId: string }) => r.visitorId)
  );
  const visitors = new Map<string, Visitor>();
  for (const r of firstRows) {
    if (internal.has(r.visitorId) || visitors.has(r.visitorId)) continue;
    visitors.set(r.visitorId, {
      id: r.visitorId,
      firstAt: ms(r.createdAt),
      attrs: {
        source: r.source || 'direct',
        country: r.country || 'unknown',
        build: r.build || 'unknown',
        landing: r.landing ? normalizePath(r.landing) : 'unknown',
      },
      names: new Set(),
      pages: new Set(),
      userIds: new Set(),
      orders: [],
    });
  }
  for (const r of stepRows) {
    const v = visitors.get(r.visitorId);
    if (!v) continue;
    v.names.add(r.name);
    if (r.name === 'page_view' && r.path) v.pages.add(normalizePath(r.path));
  }

  // Each user belongs to their earliest visitor; users also seen on an
  // internal device are internal.
  const owner = new Map<string, Visitor>();
  const internalUsers = new Set<string>();
  for (const r of userRows) {
    const uid = r.userId!;
    if (internal.has(r.visitorId)) {
      internalUsers.add(uid);
      continue;
    }
    const v = visitors.get(r.visitorId);
    if (!v) continue;
    const cur = owner.get(uid);
    if (!cur || v.firstAt < cur.firstAt) owner.set(uid, v);
  }
  for (const [uid, v] of owner) {
    if (internalUsers.has(uid)) owner.delete(uid);
    else v.userIds.add(uid);
  }

  for (const u of newUsers) {
    const v = owner.get(u.id);
    if (v) v.signup = Math.min(v.signup ?? Infinity, ms(u.createdAt));
  }
  const unattributed = { orders: 0, revenue: 0 };
  for (const o of paidOrders) {
    if (internalUsers.has(o.userId)) continue;
    const amount = (o.amount || 0) / 100;
    const v = owner.get(o.userId);
    if (v) v.orders.push({ amount, paidAt: ms(o.paidAt!) });
    else {
      unattributed.orders++;
      unattributed.revenue += amount;
    }
  }

  const reached = (v: Visitor, step: string) =>
    step === 'visit'
      ? true
      : step === 'sign_up'
        ? v.signup !== undefined
        : step === 'paid'
          ? v.orders.length > 0
          : step in PAGE_STEPS
            ? v.pages.has(PAGE_STEPS[step])
            : v.names.has(step);

  const totals = emptyTotals();
  const stepCounts = Object.fromEntries(FUNNEL_STEPS.map((s) => [s, 0]));
  const eventCounts = new Map<string, number>();
  const pageCounts = new Map<string, number>();
  const groups = Object.fromEntries(
    DIMENSIONS.map((d) => [d, new Map<string, BreakdownRow>()])
  ) as Record<Dimension, Map<string, BreakdownRow>>;
  const days = new Map<string, DailyRow>();
  const day = (key: string) => {
    let row = days.get(key);
    if (!row) days.set(key, (row = { date: key, ...emptyTotals() }));
    return row;
  };

  for (const v of visitors.values()) {
    addVisitor(totals, v);
    for (const s of FUNNEL_STEPS) if (reached(v, s)) stepCounts[s]++;
    // Registration is a business fact, not a best-effort browser event.
    // The funnel derives it from `user.createdAt`, so exclude the raw event
    // here and add the canonical count below to keep both views consistent.
    for (const n of v.names) {
      if (n !== 'sign_up')
        eventCounts.set(n, (eventCounts.get(n) ?? 0) + 1);
    }
    for (const p of v.pages) pageCounts.set(p, (pageCounts.get(p) ?? 0) + 1);
    for (const d of DIMENSIONS) {
      const value = v.attrs[d];
      let row = groups[d].get(value);
      if (!row) {
        row = { value, ...emptyTotals(), steps: {} };
        groups[d].set(value, row);
      }
      addVisitor(row, v);
      for (const s of FUNNEL_STEPS)
        if (reached(v, s)) row.steps[s] = (row.steps[s] ?? 0) + 1;
    }
    // Daily: visitors on their first day in range, sign-ups and payments on
    // the day they happened.
    day(dayKey(v.firstAt, tz)).visitors++;
    if (v.signup !== undefined) day(dayKey(v.signup, tz)).signups++;
    const payDays = new Set<string>();
    for (const o of v.orders) {
      const row = day(dayKey(o.paidAt, tz));
      row.orders++;
      row.revenue += o.amount;
      payDays.add(row.date);
    }
    for (const d of payDays) day(d).payers++;
  }

  const byVisitors = (a: { visitors: number }, b: { visitors: number }) =>
    b.visitors - a.visitors;
  // Expose the same user-creation-based registration count in the events
  // table. This prevents the dashboard from comparing a durable business
  // record with a lossy client beacon.
  if (stepCounts.sign_up > 0) {
    eventCounts.set('sign_up', stepCounts.sign_up);
  }
  return {
    totals,
    steps: FUNNEL_STEPS.map((key) => ({ key, visitors: stepCounts[key] })),
    events: [...eventCounts]
      .map(([name, n]) => ({ name, visitors: n }))
      .sort(byVisitors),
    pages: [...pageCounts]
      .map(([path, n]) => ({ path, visitors: n }))
      .sort(byVisitors)
      .slice(0, 50),
    breakdown: Object.fromEntries(
      DIMENSIONS.map((d) => [d, [...groups[d].values()].sort(byVisitors)])
    ) as Record<Dimension, BreakdownRow[]>,
    daily: [...days.values()].sort((a, b) => b.date.localeCompare(a.date)),
    unattributed,
  };
}
