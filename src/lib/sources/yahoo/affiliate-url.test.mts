import assert from "node:assert/strict";
import test from "node:test";
import { splitYahooShoppingUrl, yahooAffiliateQuery } from "./affiliate-url.ts";

const storeUrl = "https://store.shopping.yahoo.co.jp/example-shop/item1.html";

test("アフィリエイトIDは公式の参照URLを一度だけエンコードできる形で作る", () => {
  const query = yahooAffiliateQuery("11", "22");
  assert.ok(query);
  assert.equal(query.affiliate_type, "vc");
  const params = new URLSearchParams();
  params.set("affiliate_id", query.affiliate_id);
  assert.equal(params.get("affiliate_id"), "http://ck.jp.ap.valuecommerce.com/servlet/referral?sid=11&pid=22&vc_url=");
  assert.equal(yahooAffiliateQuery("11", ""), null);
  assert.equal(yahooAffiliateQuery("abc", "22"), null);
});

test("バリューコマースURLのvc_urlだけを販売ページにし、クリックURLは別にする", () => {
  const affiliate = `http://ck.jp.ap.valuecommerce.com/servlet/referral?sid=11&pid=22&vc_url=${encodeURIComponent(storeUrl)}`;
  assert.deepEqual(splitYahooShoppingUrl(affiliate), {
    productUrl: storeUrl,
    affiliateUrl: affiliate,
  });
});

test("検証できないアフィリエイトURLは販売ページだけを残す", () => {
  const missingIds = `https://ck.jp.ap.valuecommerce.com/servlet/referral?vc_url=${encodeURIComponent(storeUrl)}`;
  assert.deepEqual(splitYahooShoppingUrl(missingIds), { productUrl: storeUrl, affiliateUrl: null });
  const otherHost = `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=11&pid=22&vc_url=${encodeURIComponent("https://example.com/item")}`;
  assert.deepEqual(splitYahooShoppingUrl(otherHost), { productUrl: null, affiliateUrl: null });
  assert.deepEqual(splitYahooShoppingUrl("https://shopping.yahoo.co.jp/search?p=cat"), { productUrl: null, affiliateUrl: null });
});

test("通常のショップURLはそのまま商品URLにする", () => {
  assert.deepEqual(splitYahooShoppingUrl(storeUrl), { productUrl: storeUrl, affiliateUrl: null });
});
