/**
 * CADCraft Online Pro cloud drawings: DXF files in the private DRAWINGS
 * bucket, ownership and version history in `cad_drawing` /
 * `cad_drawing_version`. Auto-saves within VERSION_WINDOW of the current
 * version overwrite it, so history is one entry per working stretch; an
 * explicit save (`checkpoint`) always starts a new version. Versions older
 * than VERSION_DAYS are pruned on the next save, except the current one.
 */

import * as crypto from 'crypto';
import { and, desc, eq, gt, inArray, isNull, like, lt, or } from 'drizzle-orm';

import { db } from '@/core/db';
import { getBucket } from '@/core/storage/bucket';
import {
  cadDrawing,
  cadDrawingVersion,
  subscription,
  type CadDrawing,
} from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

export const MAX_DRAWING_BYTES = 20 * 1024 * 1024;
export const MAX_DRAWINGS = 500;
const VERSION_DAYS = 30;
const VERSION_WINDOW = 10 * 60_000;
// D1 caps bound parameters at 100 per statement.
const PRUNE_BATCH = 90;
const PRO_PRODUCT_PREFIX = 'cad_pro_';
const PRO_STATUSES = ['active', 'trialing', 'pending_cancel'];

const bucket = () => getBucket('DRAWINGS');

export type DrawingSummary = Pick<
  CadDrawing,
  'id' | 'name' | 'size' | 'shareToken' | 'createdAt' | 'updatedAt'
>;

const summaryColumns = {
  id: cadDrawing.id,
  name: cadDrawing.name,
  size: cadDrawing.size,
  shareToken: cadDrawing.shareToken,
  createdAt: cadDrawing.createdAt,
  updatedAt: cadDrawing.updatedAt,
};

/**
 * A paid CADCraft Online Pro subscription. A canceled one stays Pro until
 * the end of the period already paid for.
 */
export async function hasProSubscription(userId: string) {
  const now = new Date();
  const [row] = await db()
    .select({ id: subscription.id })
    .from(subscription)
    .where(
      and(
        eq(subscription.userId, userId),
        like(subscription.productId, `${PRO_PRODUCT_PREFIX}%`),
        isNull(subscription.deletedAt),
        or(
          and(
            inArray(subscription.status, PRO_STATUSES),
            or(
              isNull(subscription.currentPeriodEnd),
              gt(subscription.currentPeriodEnd, now)
            )
          ),
          and(
            eq(subscription.status, 'canceled'),
            gt(subscription.currentPeriodEnd, now)
          )
        )
      )
    )
    .limit(1);
  return !!row;
}

export async function listDrawings(userId: string): Promise<DrawingSummary[]> {
  return db()
    .select(summaryColumns)
    .from(cadDrawing)
    .where(eq(cadDrawing.userId, userId))
    .orderBy(desc(cadDrawing.updatedAt))
    .limit(MAX_DRAWINGS);
}

async function ownDrawing(userId: string, id: string) {
  const [row] = await db()
    .select()
    .from(cadDrawing)
    .where(and(eq(cadDrawing.id, id), eq(cadDrawing.userId, userId)))
    .limit(1);
  return row ?? null;
}

/** New drawing when `id` is empty, else a new version of the user's drawing. */
export async function saveDrawing(
  userId: string,
  opts: { id?: string; name: string; data: ArrayBuffer; checkpoint?: boolean }
): Promise<DrawingSummary> {
  const now = new Date();
  const size = opts.data.byteLength;
  const existing = opts.id ? await ownDrawing(userId, opts.id) : null;
  if (opts.id && !existing) throw new Error('Drawing not found');
  if (!existing && (await listDrawings(userId)).length >= MAX_DRAWINGS)
    throw new Error('Too many drawings');

  const drawing: CadDrawing = existing ?? {
    id: getUuid(),
    userId,
    name: opts.name,
    currentVersionId: null,
    size: 0,
    shareToken: null,
    createdAt: now,
    updatedAt: now,
  };
  const [current] = drawing.currentVersionId
    ? await db()
        .select()
        .from(cadDrawingVersion)
        .where(eq(cadDrawingVersion.id, drawing.currentVersionId))
        .limit(1)
    : [];
  const overwrite =
    !!current &&
    !opts.checkpoint &&
    now.getTime() - current.createdAt.getTime() < VERSION_WINDOW;
  const versionId = overwrite ? current.id : getUuid();
  const objectKey = overwrite
    ? current.objectKey
    : `users/${userId}/drawings/${drawing.id}/${versionId}.dxf`;

  // Bytes first: rows are only written once the file is safely in R2, so a
  // failed upload never leaves a drawing that points at nothing.
  await bucket().put(objectKey, opts.data, 'application/dxf');

  if (!existing) {
    await db()
      .insert(cadDrawing)
      .values({ ...drawing, currentVersionId: versionId, size });
  }
  if (overwrite) {
    await db()
      .update(cadDrawingVersion)
      .set({ size })
      .where(eq(cadDrawingVersion.id, versionId));
  } else {
    await db().insert(cadDrawingVersion).values({
      id: versionId,
      drawingId: drawing.id,
      objectKey,
      size,
      createdAt: now,
    });
  }
  if (existing) {
    await db()
      .update(cadDrawing)
      .set({
        name: opts.name,
        currentVersionId: versionId,
        size,
        updatedAt: now,
      })
      .where(eq(cadDrawing.id, drawing.id));
  }

  await pruneVersions(drawing.id, versionId);
  return {
    id: drawing.id,
    name: opts.name,
    size,
    shareToken: drawing.shareToken,
    createdAt: drawing.createdAt,
    updatedAt: now,
  };
}

async function pruneVersions(drawingId: string, keepId: string) {
  const cutoff = new Date(Date.now() - VERSION_DAYS * 86_400_000);
  const old = await db()
    .select({
      id: cadDrawingVersion.id,
      objectKey: cadDrawingVersion.objectKey,
    })
    .from(cadDrawingVersion)
    .where(
      and(
        eq(cadDrawingVersion.drawingId, drawingId),
        lt(cadDrawingVersion.createdAt, cutoff)
      )
    )
    .limit(PRUNE_BATCH + 1);
  const stale = old.filter((v: { id: string }) => v.id !== keepId);
  if (!stale.length) return;
  await bucket().delete(stale.map((v: { objectKey: string }) => v.objectKey));
  await db()
    .delete(cadDrawingVersion)
    .where(
      inArray(
        cadDrawingVersion.id,
        stale.map((v: { id: string }) => v.id)
      )
    );
}

export async function listVersions(userId: string, id: string) {
  const drawing = await ownDrawing(userId, id);
  if (!drawing) return null;
  const versions = await db()
    .select({
      id: cadDrawingVersion.id,
      size: cadDrawingVersion.size,
      createdAt: cadDrawingVersion.createdAt,
    })
    .from(cadDrawingVersion)
    .where(eq(cadDrawingVersion.drawingId, id))
    .orderBy(desc(cadDrawingVersion.createdAt));
  return { currentVersionId: drawing.currentVersionId, versions };
}

async function readVersion(drawing: CadDrawing, versionId?: string | null) {
  const vid = versionId || drawing.currentVersionId;
  if (!vid) return null;
  const [version] = await db()
    .select({ objectKey: cadDrawingVersion.objectKey })
    .from(cadDrawingVersion)
    .where(
      and(
        eq(cadDrawingVersion.id, vid),
        eq(cadDrawingVersion.drawingId, drawing.id)
      )
    )
    .limit(1);
  if (!version) return null;
  const data = await bucket().get(version.objectKey);
  return data ? { name: drawing.name, data } : null;
}

export async function readDrawing(
  userId: string,
  id: string,
  versionId?: string | null
) {
  const drawing = await ownDrawing(userId, id);
  return drawing ? readVersion(drawing, versionId) : null;
}

export async function readSharedDrawing(token: string) {
  const [drawing] = await db()
    .select()
    .from(cadDrawing)
    .where(eq(cadDrawing.shareToken, token))
    .limit(1);
  return drawing ? readVersion(drawing) : null;
}

/** Turn the view-only link on (returns its token) or off (returns null). */
export async function setSharing(userId: string, id: string, on: boolean) {
  const drawing = await ownDrawing(userId, id);
  if (!drawing) throw new Error('Drawing not found');
  const token = on
    ? (drawing.shareToken ?? crypto.randomBytes(18).toString('base64url'))
    : null;
  await db()
    .update(cadDrawing)
    .set({ shareToken: token })
    .where(eq(cadDrawing.id, id));
  return token;
}

export async function renameDrawing(userId: string, id: string, name: string) {
  const drawing = await ownDrawing(userId, id);
  if (!drawing) throw new Error('Drawing not found');
  await db().update(cadDrawing).set({ name }).where(eq(cadDrawing.id, id));
}

export async function deleteDrawing(userId: string, id: string) {
  const drawing = await ownDrawing(userId, id);
  if (!drawing) return false;
  const versions = await db()
    .select({ objectKey: cadDrawingVersion.objectKey })
    .from(cadDrawingVersion)
    .where(eq(cadDrawingVersion.drawingId, id));
  await bucket().delete(
    versions.map((v: { objectKey: string }) => v.objectKey)
  );
  await db()
    .delete(cadDrawingVersion)
    .where(eq(cadDrawingVersion.drawingId, id));
  await db().delete(cadDrawing).where(eq(cadDrawing.id, id));
  return true;
}
