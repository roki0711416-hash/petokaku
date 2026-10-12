import assert from "node:assert/strict";
import test from "node:test";
import { janDetailOutcome } from "./jan-detail-outcome.ts";

test("Yahooの通信失敗は、楽天が空でも商品なしにしない", () => {
  assert.equal(janDetailOutcome("request-failed", "none"), "temporary");
  assert.equal(janDetailOutcome("not-configured", "none"), "temporary");
  assert.equal(janDetailOutcome("request-failed", "temporary"), "temporary");
  assert.equal(janDetailOutcome("no-jan", "temporary"), "temporary");
});

test("Yahooに商品がなく楽天にも比較できる商品がないときだけ見つからない", () => {
  assert.equal(janDetailOutcome("no-jan", "none"), "missing");
});

test("どちらかが比較できる商品を返したら楽天の比較を表示できる", () => {
  assert.equal(janDetailOutcome("request-failed", "ready"), "rakuten");
  assert.equal(janDetailOutcome("no-jan", "ready"), "rakuten");
});
