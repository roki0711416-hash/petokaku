import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { consentCookieAssignment, isAnalyticsCookieName, parseAnalyticsChoice, resolveAnalyticsChoice } from "./consent.ts";

test("アクセス解析の選択は許可と拒否だけを認める", () => {
  assert.equal(parseAnalyticsChoice("granted"), "granted");
  assert.equal(parseAnalyticsChoice(" denied "), "denied");
  assert.equal(parseAnalyticsChoice("yes"), null);
  assert.equal(parseAnalyticsChoice(null), null);
  assert.equal(resolveAnalyticsChoice(null, "petokaku.cookie-choice=granted"), "granted");
  assert.equal(resolveAnalyticsChoice("denied", "petokaku.cookie-choice=granted"), "denied");
  assert.match(consentCookieAssignment("granted"), /^petokaku\.cookie-choice=granted; Path=\/; Max-Age=31536000; SameSite=Lax$/);
  assert.equal(isAnalyticsCookieName("_ga"), true);
  assert.equal(isAnalyticsCookieName("_ga_CC65"), true);
  assert.equal(isAnalyticsCookieName("petokaku.cookie-choice"), false);
});

test("GA4は許可があるときだけ読み、自動ページビューと重ねない", () => {
  const tag = readFileSync(new URL("../components/google-analytics.tsx", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.equal(layout.match(/<GoogleAnalytics/g)?.length, 1);
  assert.match(tag, /choice !== "granted"/);
  assert.match(tag, /send_page_view:\s*false/);
  assert.equal(tag.match(/gtag\/js/g)?.length, 1);
  assert.doesNotMatch(layout, /googletagmanager|gtag\/js/);
});
