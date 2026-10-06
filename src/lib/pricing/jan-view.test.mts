import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { janViewInsertValues, planJanView } from "./jan-view.ts";

const viewedAt = "2026-10-05T07:00:00.000Z";

test("13桁JANの初回閲覧は1行を作る", () => {
  assert.deepEqual(planJanView("3182550849647", viewedAt, null), {
    action: "insert",
    janCode: "3182550849647",
    lastViewedAt: viewedAt,
    viewCount: 1,
  });
});

test("同じJANを再度開くと時刻と回数だけ更新する", () => {
  assert.deepEqual(
    planJanView("3182550849647", "2026-10-06T01:00:00.000Z", {
      janCode: "3182550849647",
      lastViewedAt: viewedAt,
      viewCount: 2,
    }),
    {
      action: "touch",
      janCode: "3182550849647",
      lastViewedAt: "2026-10-06T01:00:00.000Z",
      viewCount: 3,
    },
  );
});

test("初回閲覧の作成時刻と更新時刻は同じにして、表の制約を満たす", () => {
  const plan = planJanView("3182550849647", viewedAt, null);
  assert.ok(plan);
  assert.deepEqual(janViewInsertValues(plan), {
    janCode: "3182550849647",
    lastViewedAt: viewedAt,
    viewCount: 1,
    createdAt: viewedAt,
    updatedAt: viewedAt,
  });
});

test("13桁でないJANは記録しない", () => {
  assert.equal(planJanView("123", viewedAt, null), null);
  assert.equal(planJanView("31825508496470", viewedAt, null), null);
  assert.equal(planJanView("318255084964a", viewedAt, null), null);
});

test("商品詳細のURLのJANだけを記録し、検索一覧では記録しない", () => {
  const page = readFileSync(new URL("../../app/products/jan/[jan]/page.tsx", import.meta.url), "utf8");
  const search = readFileSync(new URL("../../app/search/page.tsx", import.meta.url), "utf8");
  const preview = readFileSync(new URL("../../app/products/yahoo-preview/page.tsx", import.meta.url), "utf8");
  const recorder = readFileSync(new URL("../supabase/record-jan-view.ts", import.meta.url), "utf8");
  const sql = readFileSync(new URL("../../../db/jan-views.sql", import.meta.url), "utf8");
  assert.equal(page.split("recordDisplayedJanView(").length - 1, 1);
  assert.match(page, /recordDisplayedJanView\(jan\)/);
  assert.doesNotMatch(search, /recordDisplayedJanView|jan_views/);
  assert.doesNotMatch(preview, /recordDisplayedJanView|jan_views/);
  assert.match(recorder, /import "server-only"/);
  assert.doesNotMatch(recorder, /NEXT_PUBLIC_|YAHOO_CLIENT_ID|searchYahooItems/);
  assert.doesNotMatch(sql, /\bDROP\b|\bTRUNCATE\b|\bDELETE\b/);
  assert.match(sql, /GRANT SELECT, INSERT, UPDATE ON TABLE jan_views TO service_role/);
  assert.match(sql, /REVOKE ALL ON TABLE jan_views FROM PUBLIC, anon, authenticated/);
});
