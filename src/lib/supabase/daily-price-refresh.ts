import "server-only";

import { refreshIntervalMs, refreshWindowDays, runDailyPriceRefresh, selectRefreshJans, type DailyRefreshReport } from "../pricing/daily-price-refresh.ts";
import { tokyoObservationDate } from "../pricing/decide-price-write.ts";
import { loadYahooJan } from "../sources/yahoo/preview.ts";
import { saveDisplayedJanPrices } from "./save-price-history.ts";
import { getSupabaseServerClient } from "./server.ts";

function refreshFailed(): never {
  throw new Error("日次の価格更新に失敗しました");
}

function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function tokyoDayStartIso(tokyoDate: string): string {
  return new Date(`${tokyoDate}T00:00:00+09:00`).toISOString();
}

async function readRecentViews(now: string, windowDays: number): Promise<{ janCode: string; lastViewedAt: string }[]> {
  const today = tokyoObservationDate(now);
  const windowStart = tokyoDayStartIso(addCalendarDays(today, -(windowDays - 1)));
  const result = await getSupabaseServerClient()
    .from("jan_views")
    .select("jan_code, last_viewed_at")
    .gte("last_viewed_at", windowStart)
    .order("last_viewed_at", { ascending: false });
  if (result.error || !result.data) {
    refreshFailed();
  }
  return result.data.map((row) => ({ janCode: String(row.jan_code), lastViewedAt: String(row.last_viewed_at) }));
}

async function readRefreshedToday(janCodes: string[], now: string): Promise<string[]> {
  if (janCodes.length === 0) {
    return [];
  }
  const result = await getSupabaseServerClient()
    .from("price_observations")
    .select("jan_code")
    .in("jan_code", janCodes)
    .gte("last_confirmed_at", tokyoDayStartIso(tokyoObservationDate(now)));
  if (result.error || !result.data) {
    refreshFailed();
  }
  return [...new Set(result.data.flatMap((row) => (typeof row.jan_code === "string" ? [row.jan_code] : [])))];
}

export async function refreshRecentJanPrices(options?: {
  now?: string;
  limit?: number;
  intervalMs?: number;
  windowDays?: number;
  sleep?: (ms: number) => Promise<void>;
}): Promise<DailyRefreshReport> {
  const now = options?.now ?? new Date().toISOString();
  const windowDays = refreshWindowDays(options?.windowDays);
  const views = await readRecentViews(now, windowDays);
  const refreshedJanCodes = await readRefreshedToday(
    views.map((view) => view.janCode),
    now,
  );
  const selected = selectRefreshJans({ now, views, refreshedJanCodes, windowDays, limit: options?.limit });
  const report = await runDailyPriceRefresh({
    jans: selected.jans,
    intervalMs: refreshIntervalMs(options?.intervalMs),
    sleep: options?.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms))),
    search: async (janCode) => {
      const result = await loadYahooJan(janCode);
      if (!result.ok) {
        return { ok: false as const, reason: result.reason, called: result.reason === "request-failed" };
      }
      return { ok: true as const, value: result.adapted, called: true };
    },
    save: async (janCode, adapted) => {
      const summary = await saveDisplayedJanPrices(janCode, adapted);
      return { inserted: summary.inserted, confirmed: summary.confirmed };
    },
  });
  return { ...report, targets: selected.targets, skipped: selected.skipped, deferred: selected.deferred };
}

export async function previewRecentJanPrices(options?: { now?: string; limit?: number; windowDays?: number }): Promise<{
  targets: number;
  skipped: number;
  deferred: number;
  yahooCalls: number;
}> {
  const now = options?.now ?? new Date().toISOString();
  const windowDays = refreshWindowDays(options?.windowDays);
  const views = await readRecentViews(now, windowDays);
  const refreshedJanCodes = await readRefreshedToday(
    views.map((view) => view.janCode),
    now,
  );
  const selected = selectRefreshJans({ now, views, refreshedJanCodes, windowDays, limit: options?.limit });
  return {
    targets: selected.targets,
    skipped: selected.skipped,
    deferred: selected.deferred,
    yahooCalls: selected.jans.length,
  };
}
