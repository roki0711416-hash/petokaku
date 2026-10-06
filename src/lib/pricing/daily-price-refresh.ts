import { tokyoObservationDate } from "./decide-price-write.ts";

export const dailyPriceRefreshDefaults = {
  windowDays: 30,
  dailyLimit: 5,
  intervalMs: 1100,
  maxDailyLimit: 20,
} as const;

export type DailyRefreshView = {
  janCode: string;
  lastViewedAt: string;
};

export type DailyRefreshReport = {
  targets: number;
  skipped: number;
  deferred: number;
  yahooCalls: number;
  succeeded: number;
  failed: number;
  inserted: number;
  confirmed: number;
  stopped: "not-configured" | null;
};

export function refreshWindowDays(days: number | undefined): number {
  if (days == null || !Number.isInteger(days) || days < 1) {
    return dailyPriceRefreshDefaults.windowDays;
  }
  return Math.min(days, dailyPriceRefreshDefaults.windowDays);
}

export function refreshDailyLimit(limit: number | undefined): number {
  if (limit == null || !Number.isInteger(limit) || limit < 1) {
    return dailyPriceRefreshDefaults.dailyLimit;
  }
  return Math.min(limit, dailyPriceRefreshDefaults.maxDailyLimit);
}

export function refreshIntervalMs(intervalMs: number | undefined): number {
  if (intervalMs == null || !Number.isFinite(intervalMs)) {
    return dailyPriceRefreshDefaults.intervalMs;
  }
  return Math.max(dailyPriceRefreshDefaults.intervalMs, Math.trunc(intervalMs));
}

function tokyoDateOrNull(value: string): string | null {
  try {
    return tokyoObservationDate(value);
  } catch {
    return null;
  }
}

function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function selectRefreshJans(input: {
  now: string;
  views: DailyRefreshView[];
  refreshedJanCodes: string[];
  windowDays?: number;
  limit?: number;
}): { jans: string[]; skipped: number; targets: number; deferred: number } {
  const today = tokyoObservationDate(input.now);
  const windowStart = addCalendarDays(today, -(refreshWindowDays(input.windowDays) - 1));
  const refreshed = new Set(input.refreshedJanCodes);
  const latest = new Map<string, string>();
  for (const view of input.views) {
    if (!/^[0-9]{13}$/.test(view.janCode)) {
      continue;
    }
    const viewedOn = tokyoDateOrNull(view.lastViewedAt);
    if (!viewedOn || viewedOn < windowStart || viewedOn > today) {
      continue;
    }
    const current = latest.get(view.janCode);
    if (!current || view.lastViewedAt > current) {
      latest.set(view.janCode, view.lastViewedAt);
    }
  }
  const ordered = [...latest.entries()].sort((left, right) => right[1].localeCompare(left[1]) || left[0].localeCompare(right[0]));
  const pending = ordered.filter(([janCode]) => !refreshed.has(janCode)).map(([janCode]) => janCode);
  const limit = refreshDailyLimit(input.limit);
  return {
    jans: pending.slice(0, limit),
    targets: ordered.length,
    skipped: ordered.length - pending.length,
    deferred: Math.max(0, pending.length - limit),
  };
}

export async function runDailyPriceRefresh<T>(input: {
  jans: string[];
  intervalMs?: number;
  sleep: (ms: number) => Promise<void>;
  search: (
    janCode: string,
  ) => Promise<
    { ok: true; value: T; called: boolean } | { ok: false; reason: "not-configured" | "request-failed" | "no-jan"; called: boolean }
  >;
  save: (janCode: string, value: T) => Promise<{ inserted: number; confirmed: number }>;
}): Promise<DailyRefreshReport> {
  const intervalMs = refreshIntervalMs(input.intervalMs);
  const report: DailyRefreshReport = {
    targets: input.jans.length,
    skipped: 0,
    deferred: 0,
    yahooCalls: 0,
    succeeded: 0,
    failed: 0,
    inserted: 0,
    confirmed: 0,
    stopped: null,
  };
  for (let index = 0; index < input.jans.length; index += 1) {
    if (index > 0) {
      await input.sleep(intervalMs);
    }
    const janCode = input.jans[index] ?? "";
    let found: { ok: true; value: T; called: boolean } | { ok: false; reason: "not-configured" | "request-failed" | "no-jan"; called: boolean };
    try {
      found = await input.search(janCode);
    } catch {
      report.failed += 1;
      continue;
    }
    if (found.called) {
      report.yahooCalls += 1;
    }
    if (!found.ok) {
      report.failed += 1;
      if (found.reason === "not-configured") {
        report.stopped = "not-configured";
        return report;
      }
      continue;
    }
    try {
      const saved = await input.save(janCode, found.value);
      report.succeeded += 1;
      report.inserted += saved.inserted;
      report.confirmed += saved.confirmed;
    } catch {
      report.failed += 1;
    }
  }
  return report;
}
