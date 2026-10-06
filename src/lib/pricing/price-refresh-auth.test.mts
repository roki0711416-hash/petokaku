import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { decidePriceWrite } from "./decide-price-write.ts";
import { authorizePriceRefresh } from "./price-refresh-auth.ts";

const token = "local-test-token";

test("秘密トークンが一致するときだけ更新を許可する", () => {
  assert.equal(authorizePriceRefresh(`Bearer ${token}`, token), true);
  assert.equal(authorizePriceRefresh(null, token), false);
  assert.equal(authorizePriceRefresh("Bearer wrong-token", token), false);
  assert.equal(authorizePriceRefresh(`Bearer ${token}`, ""), false);
  assert.equal(authorizePriceRefresh(`Bearer ${token}`, undefined), false);
});

test("認証の前に価格更新を始めず、トークンを応答へ出さない", () => {
  const route = readFileSync(new URL("../../app/api/price-refresh/route.ts", import.meta.url), "utf8");
  const authAt = route.indexOf("if (!isAuthorized(request))");
  const lockAt = route.indexOf("withPriceRefreshLock(() => refreshRecentJanPrices())");
  assert.ok(authAt > 0 && lockAt > authAt);
  assert.match(route, /PRICE_REFRESH_SECRET/);
  assert.match(route, /CRON_SECRET/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_|YAHOO_CLIENT_ID|SUPABASE_SECRET_KEY|console\./);
  assert.doesNotMatch(route, /local-test-token|sb_secret_/);
  const lock = readFileSync(new URL("../supabase/price-refresh-lock.ts", import.meta.url), "utf8");
  const guard = readFileSync(new URL("./price-refresh-guard.ts", import.meta.url), "utf8");
  assert.match(lock, /locked_until/);
  assert.match(guard, /finally/);
  assert.doesNotMatch(lock, /PRICE_REFRESH_SECRET|YAHOO_CLIENT_ID|SUPABASE_SECRET_KEY|console\./);
});

test("同時に空の履歴を見ると両方ともinsertになり、同日の一意制約では止まらない", () => {
  const next = { price: 5720, shippingFee: 0, shippingStatus: "free" as const, stockStatus: "in_stock" as const };
  const first = decidePriceWrite({ now: "2026-10-05T01:00:00.000Z", observations: [], next });
  const second = decidePriceWrite({ now: "2026-10-05T01:00:01.000Z", observations: [], next });
  assert.equal(first.action, "insert");
  assert.equal(second.action, "insert");
  const sequential = decidePriceWrite({
    now: "2026-10-05T01:00:01.000Z",
    observations: [{ id: "obs-1", observedAt: "2026-10-05T01:00:00.000Z", ...next }],
    next,
  });
  assert.equal(sequential.action, "confirm");
  const schema = readFileSync(new URL("../../../db/price-history.sql", import.meta.url), "utf8");
  assert.match(schema, /CREATE UNIQUE INDEX price_observations_offer_observed_at_unique/);
  assert.match(schema, /CREATE INDEX price_observations_offer_observed_on_idx/);
  assert.doesNotMatch(schema, /CREATE UNIQUE INDEX price_observations_offer_observed_on/);
  const lock = readFileSync(new URL("../../../db/price-refresh-lock.sql", import.meta.url), "utf8");
  assert.match(lock, /CREATE TABLE price_refresh_lock/);
  assert.doesNotMatch(lock, /\bDROP\b|\bTRUNCATE\b|\bDELETE\b/);
  assert.match(lock, /REVOKE ALL ON TABLE price_refresh_lock FROM PUBLIC, anon, authenticated/);
});
