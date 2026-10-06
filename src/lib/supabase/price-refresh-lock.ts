import "server-only";

import { randomUUID } from "node:crypto";
import { priceRefreshLockLeaseMs, runWithHeldLock, type HeldPriceRefreshLock } from "../pricing/price-refresh-guard.ts";
import { getSupabaseServerClient } from "./server.ts";

function lockFailed(): never {
  throw new Error("日次更新のロックに失敗しました");
}

export async function acquirePriceRefreshLock(now = new Date()): Promise<HeldPriceRefreshLock | null> {
  const owner = randomUUID();
  const lockedUntil = new Date(now.getTime() + priceRefreshLockLeaseMs).toISOString();
  const result = await getSupabaseServerClient()
    .from("price_refresh_lock")
    .update({ owner, locked_until: lockedUntil })
    .eq("id", 1)
    .lt("locked_until", now.toISOString())
    .select("id");
  if (result.error) {
    lockFailed();
  }
  if (!result.data || result.data.length !== 1) {
    return null;
  }
  return { owner };
}

export async function releasePriceRefreshLock(lock: HeldPriceRefreshLock): Promise<void> {
  const result = await getSupabaseServerClient()
    .from("price_refresh_lock")
    .update({ owner: null, locked_until: new Date(0).toISOString() })
    .eq("id", 1)
    .eq("owner", lock.owner)
    .select("id");
  if (result.error || !result.data || result.data.length !== 1) {
    lockFailed();
  }
}

export function withPriceRefreshLock<T>(work: () => Promise<T>) {
  return runWithHeldLock({
    acquire: () => acquirePriceRefreshLock(),
    release: (lock) => releasePriceRefreshLock(lock),
    work,
  });
}
