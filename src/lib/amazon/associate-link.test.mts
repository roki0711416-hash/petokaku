import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { amazonAssociateLinks } from "../../data/amazon-links.ts";
import { amazonAssociateLink, isAmazonAssociateUrl, type AmazonAssociateEntry } from "./associate-link.ts";

const jan = "4905009714353";
const storeUrl = "https://www.amazon.co.jp/dp/B00TESTITEM?tag=example-22&linkCode=ure";

function entry(patch: Partial<AmazonAssociateEntry> = {}): AmazonAssociateEntry {
  return {
    jan,
    url: storeUrl,
    confirmedOn: "2026-10-13",
    ...patch,
  };
}

test("許可したAmazonのURLだけを受け、登録した文字列は変えない", () => {
  assert.equal(isAmazonAssociateUrl(storeUrl), true);
  assert.equal(isAmazonAssociateUrl("https://amzn.to/example"), true);
  assert.equal(isAmazonAssociateUrl("https://amzn.asia/example"), true);
  assert.equal(isAmazonAssociateUrl("https://link.amazon/example"), true);
  assert.equal(isAmazonAssociateUrl("https://amazon.co.jp/dp/B00TESTITEM"), true);
  assert.equal(amazonAssociateLink(jan, [entry()])?.url, storeUrl);
});

test("商品ページ以外や未確認の登録は出さない", () => {
  assert.equal(isAmazonAssociateUrl("http://www.amazon.co.jp/dp/B00TESTITEM"), false);
  assert.equal(isAmazonAssociateUrl("https://user:pass@www.amazon.co.jp/dp/B00TESTITEM"), false);
  assert.equal(isAmazonAssociateUrl("https://www.amazon.com/dp/B00TESTITEM"), false);
  assert.equal(isAmazonAssociateUrl("https://example.com/dp/B00TESTITEM"), false);
  assert.equal(amazonAssociateLink("123", [entry()]), null);
  assert.equal(amazonAssociateLink(jan, [entry({ confirmedOn: "" })]), null);
  assert.equal(amazonAssociateLink(jan, [entry({ confirmedOn: "2026-02-31" })]), null);
  assert.equal(amazonAssociateLink(jan, [entry(), entry({ url: "https://amzn.to/other" })]), null);
  assert.equal(amazonAssociateLink("4900000000000", [entry()]), null);
});

test("初期データに未確認のAmazon URLは無い", () => {
  const source = readFileSync(new URL("../../data/amazon-links.ts", import.meta.url), "utf8");
  assert.equal(source.includes("link.amazon/B0irHe5OO"), false);
  assert.equal(amazonAssociateLinks.length, 0);
  for (const item of amazonAssociateLinks) {
    assert.ok(amazonAssociateLink(item.jan, [item]));
  }
});
