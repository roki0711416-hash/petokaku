import assert from "node:assert/strict";
import test from "node:test";
import { probeRakutenItemSearch, rakutenProbeRequest, summarizeRakutenSearchPayload } from "./probe.ts";

test("接続確認はアフィリエイトIDを送らず、アクセスキーをURLに載せない", () => {
  const { url, headers } = rakutenProbeRequest("app-id", "猫砂", "access-key");
  assert.equal(url.origin + url.pathname, "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701");
  assert.equal(url.searchParams.get("applicationId"), "app-id");
  assert.equal(url.searchParams.get("affiliateId"), null);
  assert.equal(url.searchParams.get("accessKey"), null);
  assert.equal(headers.accessKey, "access-key");
  assert.equal(headers.Origin, "https://petokaku.com");
  assert.equal(headers.Referer, "https://petokaku.com/");
  assert.equal(url.searchParams.get("hits"), "1");
});

test("商品検索の応答から項目名だけを読む", () => {
  const flat = summarizeRakutenSearchPayload({
    count: 2,
    items: [{ itemName: "猫砂", itemPrice: 980, itemUrl: "https://example.invalid/item", shopName: "店", mediumImageUrls: ["https://example.invalid/a.jpg"] }],
  });
  assert.equal(flat.hasItemName, true);
  assert.equal(flat.hasItemPrice, true);
  assert.equal(flat.hasItemUrl, true);
  assert.equal(flat.hasShopName, true);
  assert.equal(flat.hasImageUrl, true);
  assert.equal(flat.janFieldPresent, false);
  assert.deepEqual(flat.topLevelKeys, ["count", "items"]);

  const nested = summarizeRakutenSearchPayload({
    count: 1,
    Items: [{ item: { itemName: "猫砂", itemPrice: "980", janCode: "4900000000000" } }],
  });
  assert.equal(nested.hasItemName, true);
  assert.equal(nested.hasItemPrice, true);
  assert.equal(nested.janFieldPresent, true);
});

test("認証が無い接続確認は通信しない", async () => {
  const previousId = process.env.RAKUTEN_APPLICATION_ID;
  const previousKey = process.env.RAKUTEN_ACCESS_KEY;
  delete process.env.RAKUTEN_APPLICATION_ID;
  delete process.env.RAKUTEN_ACCESS_KEY;
  try {
    const result = await probeRakutenItemSearch("猫砂");
    assert.equal(result.reason, "not-configured");
  } finally {
    if (previousId == null) delete process.env.RAKUTEN_APPLICATION_ID;
    else process.env.RAKUTEN_APPLICATION_ID = previousId;
    if (previousKey == null) delete process.env.RAKUTEN_ACCESS_KEY;
    else process.env.RAKUTEN_ACCESS_KEY = previousKey;
  }
});
