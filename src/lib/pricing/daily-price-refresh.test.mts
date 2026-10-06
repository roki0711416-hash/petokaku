import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { refreshDailyLimit, refreshIntervalMs, runDailyPriceRefresh, selectRefreshJans } from "./daily-price-refresh.ts";

const now = "2026-10-05T07:00:00.000Z";

test("直近30日で今日未更新のJANだけを、新しい閲覧から選ぶ", () => {
  const selected = selectRefreshJans({
    now,
    refreshedJanCodes: ["3182550849647"],
    views: [
      { janCode: "3182550849647", lastViewedAt: "2026-10-05T01:00:00.000Z" },
      { janCode: "4901234567894", lastViewedAt: "2026-10-04T01:00:00.000Z" },
      { janCode: "4901234567894", lastViewedAt: "2026-09-01T01:00:00.000Z" },
      { janCode: "123", lastViewedAt: "2026-10-05T01:00:00.000Z" },
      { janCode: "4900000000001", lastViewedAt: "2026-08-01T01:00:00.000Z" },
    ],
  });
  assert.deepEqual(selected.jans, ["4901234567894"]);
  assert.equal(selected.skipped, 1);
  assert.equal(selected.targets, 2);
});

test("1日の上限は初期値5、指定しても20まで", () => {
  assert.equal(refreshDailyLimit(undefined), 5);
  assert.equal(refreshDailyLimit(100), 20);
  const views = Array.from({ length: 8 }, (_, index) => ({
    janCode: `490000000000${index}`.slice(0, 13),
    lastViewedAt: `2026-10-0${index + 1}T00:00:00.000Z`,
  })).filter((view) => view.janCode.length === 13);
  const selected = selectRefreshJans({ now, views, refreshedJanCodes: [], limit: 2 });
  assert.equal(selected.jans.length, 2);
});

test("JANの間隔は1.1秒未満にしない", () => {
  assert.equal(refreshIntervalMs(undefined), 1100);
  assert.equal(refreshIntervalMs(100), 1100);
  assert.equal(refreshIntervalMs(2000), 2000);
});

test("1件失敗しても残りを続け、未設定なら後続の検索をしない", async () => {
  const calls: string[] = [];
  const sleeps: number[] = [];
  const failed = await runDailyPriceRefresh({
    jans: ["4900000000001", "4900000000002"],
    intervalMs: 100,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    search: async (janCode) => {
      calls.push(janCode);
      if (janCode.endsWith("1")) {
        throw new Error("https://shopping.yahooapis.jp/?appid=secret");
      }
      return { ok: true as const, value: janCode, called: true };
    },
    save: async () => ({ inserted: 1, confirmed: 0 }),
  });
  assert.deepEqual(calls, ["4900000000001", "4900000000002"]);
  assert.deepEqual(sleeps, [1100]);
  assert.equal(failed.failed, 1);
  assert.equal(failed.succeeded, 1);
  assert.equal(failed.inserted, 1);
  assert.equal(failed.yahooCalls, 1);
  assert.equal(JSON.stringify(failed).includes("secret"), false);

  const stoppedCalls: string[] = [];
  const stopped = await runDailyPriceRefresh({
    jans: ["4900000000001", "4900000000002"],
    sleep: async () => undefined,
    search: async (janCode) => {
      stoppedCalls.push(janCode);
      return { ok: false as const, reason: "not-configured" as const, called: false };
    },
    save: async () => ({ inserted: 0, confirmed: 0 }),
  });
  assert.deepEqual(stoppedCalls, ["4900000000001"]);
  assert.equal(stopped.stopped, "not-configured");
});

test("日次更新は商品詳細の表示からは呼ばない", () => {
  const page = readFileSync(new URL("../../app/products/jan/[jan]/page.tsx", import.meta.url), "utf8");
  const search = readFileSync(new URL("../../app/search/page.tsx", import.meta.url), "utf8");
  const server = readFileSync(new URL("../supabase/daily-price-refresh.ts", import.meta.url), "utf8");
  assert.doesNotMatch(page, /refreshRecentJanPrices/);
  assert.doesNotMatch(search, /refreshRecentJanPrices/);
  assert.match(server, /import "server-only"/);
  assert.match(server, /loadYahooJan/);
  assert.match(server, /saveDisplayedJanPrices/);
  assert.equal(server.split("loadYahooJan(").length - 1, 1);
  assert.doesNotMatch(server, /console\.|YAHOO_CLIENT_ID|SUPABASE_SECRET_KEY|NEXT_PUBLIC_/);
});
