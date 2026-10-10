import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { googleAnalyticsId } from "./analytics.ts";

test("測定IDはG-で始まる値だけを使う", () => {
  assert.equal(googleAnalyticsId("G-CC65BDRSTL"), "G-CC65BDRSTL");
  assert.equal(googleAnalyticsId("  G-CC65BDRSTL  "), "G-CC65BDRSTL");
  assert.equal(googleAnalyticsId(""), null);
  assert.equal(googleAnalyticsId(undefined), null);
  assert.equal(googleAnalyticsId("GTM-ABC123"), null);
  assert.equal(googleAnalyticsId("g-l1x99g7567"), null);
});

test("GA4は1か所だけで、自動ページビューと手動送信を重ねない", () => {
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const tag = readFileSync(new URL("../components/google-analytics.tsx", import.meta.url), "utf8");
  assert.equal(layout.match(/<GoogleAnalytics/g)?.length, 1);
  assert.match(tag, /send_page_view:false/);
  assert.equal(tag.match(/gtag\/js/g)?.length, 1);
  assert.doesNotMatch(layout, /googletagmanager|gtag\/js/);
});
