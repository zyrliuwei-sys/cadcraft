import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { apiGet } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mirrors modules/analytics/service (components can't import server modules).
type Totals = {
  visitors: number;
  signups: number;
  payers: number;
  orders: number;
  revenue: number;
};
type Dimension = 'source' | 'country' | 'build' | 'landing';
type Report = {
  totals: Totals;
  steps: { key: string; visitors: number }[];
  events: { name: string; visitors: number }[];
  pages: { path: string; visitors: number }[];
  breakdown: Record<
    Dimension,
    (Totals & { value: string; steps: Record<string, number> })[]
  >;
  daily: (Totals & { date: string })[];
  unattributed: { orders: number; revenue: number };
};

const DAY = 86_400_000;
const RANGES = ['today', 'yesterday', '7d', '30d'] as const;
type Range = (typeof RANGES)[number];

/** Local midnight today, as epoch ms. */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function rangeBounds(range: Range): [number, number] {
  const today = startOfToday();
  const now = Date.now();
  if (range === 'today') return [today, now];
  if (range === 'yesterday') return [today - DAY, today];
  return [today - (range === '7d' ? 6 : 29) * DAY, now];
}

function useReport(key: string, from: number, to: number) {
  const tz = -new Date().getTimezoneOffset();
  return useQuery({
    queryKey: ['admin-analytics', key, from, to],
    queryFn: () =>
      apiGet<Report>(`/api/admin/analytics?from=${from}&to=${to}&tz=${tz}`),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
}

const money = (n: number) => `$${n.toFixed(n >= 100 ? 0 : 2)}`;
const pct = (a: number, b: number) =>
  b ? `${((a / b) * 100).toFixed(1)}%` : '—';
const perHead = (revenue: number, n: number) =>
  n ? `$${(revenue / n).toFixed(2)}` : '—';

function stepLabel(key: string) {
  const labels: Record<string, () => string> = {
    visit: m['admin.analytics.step.visit'],
    view_download: m['admin.analytics.step.view_download'],
    download_click: m['admin.analytics.step.download_click'],
    view_online: m['admin.analytics.step.view_online'],
    online_app_loaded: m['admin.analytics.step.online_app_loaded'],
    view_tutorials: m['admin.analytics.step.view_tutorials'],
    view_compare: m['admin.analytics.step.view_compare'],
    sign_up: m['admin.analytics.step.sign_up'],
    paid: m['admin.analytics.step.paid'],
  };
  return labels[key]?.() ?? key;
}

function Compare({
  title,
  today,
  yesterday,
  format = String,
}: {
  title: string;
  today?: number;
  yesterday?: number;
  format?: (n: number) => string;
}) {
  const diff =
    today !== undefined && yesterday ? (today - yesterday) / yesterday : null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">
          {today === undefined ? '…' : format(today)}
        </div>
        <p className="text-muted-foreground mt-1 text-xs tabular-nums">
          {m['admin.analytics.vs_yesterday']({
            value: yesterday === undefined ? '…' : format(yesterday),
          })}
          {diff !== null && (
            <span
              className={cn(
                'ml-2 font-medium',
                diff >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {diff >= 0 ? '+' : ''}
              {(diff * 100).toFixed(0)}%
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

function AnalyticsPage() {
  const [range, setRange] = useState<Range>('7d');
  const [dim, setDim] = useState<Dimension>('source');

  // Today so far vs yesterday up to this same moment — never half a day
  // against a whole one.
  const today = startOfToday();
  const now = Math.floor(Date.now() / 60_000) * 60_000;
  const todayQuery = useReport('today', today, now);
  const yesterdayQuery = useReport(
    'yesterday-same-time',
    today - DAY,
    now - DAY
  );
  const [from, to] = rangeBounds(range);
  const reportQuery = useReport(
    range,
    from,
    range === 'yesterday' ? to : Math.floor(to / 60_000) * 60_000
  );

  const t = todayQuery.data?.totals;
  const y = yesterdayQuery.data?.totals;
  const report = reportQuery.data;
  const first = report?.steps[0]?.visitors ?? 0;

  const dims: { key: Dimension; label: string }[] = [
    { key: 'source', label: m['admin.analytics.dim.source']() },
    { key: 'country', label: m['admin.analytics.dim.country']() },
    { key: 'build', label: m['admin.analytics.dim.build']() },
    { key: 'landing', label: m['admin.analytics.dim.landing']() },
  ];
  const keySteps = [
    'view_download',
    'download_click',
    'view_online',
    'online_app_loaded',
  ];
  const downloads = (r?: Report) =>
    r?.steps.find((s) => s.key === 'download_click')?.visitors;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{m['admin.analytics.title']()}</h1>
        <p className="text-muted-foreground">
          {m['admin.analytics.description']()}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Compare
          title={m['admin.analytics.card.revenue']()}
          today={t?.revenue}
          yesterday={y?.revenue}
          format={money}
        />
        <Compare
          title={m['admin.analytics.card.payers']()}
          today={t?.payers}
          yesterday={y?.payers}
        />
        <Compare
          title={m['admin.analytics.card.visitors']()}
          today={t?.visitors}
          yesterday={y?.visitors}
        />
        <Compare
          title={m['admin.analytics.card.per_visitor']()}
          today={t && (t.visitors ? t.revenue / t.visitors : 0)}
          yesterday={y && (y.visitors ? y.revenue / y.visitors : 0)}
          format={(n) => `$${n.toFixed(2)}`}
        />
        <Compare
          title={m['admin.analytics.card.downloads']()}
          today={downloads(todayQuery.data)}
          yesterday={downloads(yesterdayQuery.data)}
        />
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
        <TabsList>
          {RANGES.map((r) => (
            <TabsTrigger key={r} value={r}>
              {{
                today: m['admin.analytics.range.today'],
                yesterday: m['admin.analytics.range.yesterday'],
                '7d': m['admin.analytics.range.7d'],
                '30d': m['admin.analytics.range.30d'],
              }[r]()}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>{m['admin.analytics.funnel']()}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{m['admin.analytics.col.step']()}</TableHead>
                  <TableHead className="text-right">
                    {m['admin.analytics.col.people']()}
                  </TableHead>
                  <TableHead className="text-right">
                    {m['admin.analytics.col.of_prev']()}
                  </TableHead>
                  <TableHead className="w-1/3">
                    {m['admin.analytics.col.of_visitors']()}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report?.steps.map((s, i) => (
                  <TableRow key={s.key}>
                    <TableCell>{stepLabel(s.key)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {s.visitors}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {i ? pct(s.visitors, report.steps[i - 1].visitors) : ''}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-muted h-2 flex-1 rounded">
                          <div
                            className="bg-primary h-2 rounded"
                            style={{
                              width: `${first ? Math.min(100, (s.visitors / first) * 100) : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right text-xs tabular-nums">
                          {pct(s.visitors, first)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {report && (
              <p className="text-muted-foreground mt-3 text-sm">
                {m['admin.analytics.summary']({
                  revenue: money(report.totals.revenue),
                  orders: report.totals.orders,
                  perVisitor: perHead(
                    report.totals.revenue,
                    report.totals.visitors
                  ),
                })}
                {report.unattributed.orders > 0 &&
                  ` ${m['admin.analytics.unattributed']({
                    orders: report.unattributed.orders,
                    revenue: money(report.unattributed.revenue),
                  })}`}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{m['admin.analytics.events']()}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{m['admin.analytics.col.event']()}</TableHead>
                  <TableHead className="text-right">
                    {m['admin.analytics.col.people']()}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report?.events.map((e) => (
                  <TableRow key={e.name}>
                    <TableCell className="font-mono text-xs">
                      {e.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {e.visitors}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>{m['admin.analytics.col.page']()}</TableHead>
                  <TableHead className="text-right">
                    {m['admin.analytics.col.people']()}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report?.pages.map((p) => (
                  <TableRow key={p.path}>
                    <TableCell className="max-w-[260px] truncate font-mono text-xs">
                      {p.path}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.visitors}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>{m['admin.analytics.breakdown']()}</CardTitle>
          <Tabs value={dim} onValueChange={(v) => setDim(v as Dimension)}>
            <TabsList>
              {dims.map((d) => (
                <TabsTrigger key={d.key} value={d.key}>
                  {d.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dims.find((d) => d.key === dim)?.label}</TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.step.visit']()}
                </TableHead>
                {keySteps.map((s) => (
                  <TableHead key={s} className="text-right">
                    {stepLabel(s)}
                  </TableHead>
                ))}
                <TableHead className="text-right">
                  {m['admin.analytics.step.sign_up']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.payers']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.revenue']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.signup_rate']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.pay_rate']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.per_visitor']()}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.breakdown[dim].slice(0, 50).map((r) => (
                <TableRow key={r.value}>
                  <TableCell className="max-w-[240px] truncate font-medium">
                    {r.value}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.visitors}
                  </TableCell>
                  {keySteps.map((s) => (
                    <TableCell key={s} className="text-right tabular-nums">
                      {r.steps[s] ?? 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-right tabular-nums">
                    {r.signups}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.payers}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {money(r.revenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {pct(r.signups, r.visitors)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {pct(r.payers, r.visitors)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {perHead(r.revenue, r.visitors)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m['admin.analytics.daily']()}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{m['admin.analytics.col.date']()}</TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.step.visit']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.step.sign_up']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.payers']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.orders']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.revenue']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.visit_to_signup']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.visit_to_pay']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.signup_to_pay']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.per_visitor']()}
                </TableHead>
                <TableHead className="text-right">
                  {m['admin.analytics.col.per_signup']()}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.daily.map((d) => (
                <TableRow key={d.date}>
                  <TableCell className="tabular-nums">{d.date}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {d.visitors}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {d.signups}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {d.payers}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {d.orders}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {money(d.revenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {pct(d.signups, d.visitors)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {pct(d.payers, d.visitors)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {pct(d.payers, d.signups)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {perHead(d.revenue, d.visitors)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {perHead(d.revenue, d.signups)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-xs">
        <li>{m['admin.analytics.note.unique']()}</li>
        <li>{m['admin.analytics.note.first_touch']()}</li>
        <li>{m['admin.analytics.note.internal']()}</li>
        <li>{m['admin.analytics.note.daily']()}</li>
        <li>{m['admin.analytics.note.revenue']()}</li>
      </ul>
    </div>
  );
}

export const Route = createFileRoute('/admin/analytics')({
  component: AnalyticsPage,
});
