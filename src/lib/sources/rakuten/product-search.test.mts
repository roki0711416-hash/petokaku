import assert from "node:assert/strict";
import test from "node:test";
import { rakutenProductOfferFromPayload, rakutenProductSearchRequest } from "./product-search.ts";

const jan = "3182550706933";
const observedAt = "2026-10-11T00:00:00.000Z";

test("製品検索はJANだけを送り、アクセスキーをURLに載せない", () => {
  const { url, headers } = rakutenProductSearchRequest("app-id", "access-key", jan, "affiliate-id");
  assert.equal(url.origin + url.pathname, "https://openapi.rakuten.co.jp/ichibaproduct/api/Product/Search/20250801");
  assert.equal(url.searchParams.get("productCode"), jan);
  assert.equal(url.searchParams.get("keyword"), null);
  assert.equal(url.searchParams.get("accessKey"), null);
  assert.equal(url.searchParams.get("affiliateId"), "affiliate-id");
  assert.equal(headers.accessKey, "access-key");
  assert.equal(headers.Origin, "https://petokaku.com");
  const plain = rakutenProductSearchRequest("app-id", "access-key", jan);
  assert.equal(plain.url.searchParams.get("affiliateId"), null);
});

test("同じJANの中古を除く購入可能価格だけを楽天の掲載にする", () => {
  const offer = rakutenProductOfferFromPayload(
    {
      Products: [
        {
          Product: {
            productCode: jan,
            productName: "ロイヤルカナン 猫 4kg",
            usedExcludeSalesMinPrice: 5980,
            usedExcludeSalesItemCount: 12,
            minPrice: 1000,
            productUrlPC: "https://product.rakuten.co.jp/product/-/example/",
            affiliateUrl: "https://hb.afl.rakuten.co.jp/hgc/affiliate-id/",
          },
        },
        { Product: { productCode: "4900000000000", productName: "別商品", usedExcludeSalesMinPrice: 100, usedExcludeSalesItemCount: 1, productUrlPC: "https://product.rakuten.co.jp/product/-/other/" } },
      ],
    },
    jan,
    observedAt,
    "affiliate-id",
  );
  assert.equal(offer?.price, 5980);
  assert.equal(offer?.shopName, "楽天市場");
  assert.equal(offer?.productUrl, "https://product.rakuten.co.jp/product/-/example/");
  assert.equal(offer?.affiliateUrl, "https://hb.afl.rakuten.co.jp/hgc/affiliate-id/");
  assert.equal(offer?.shippingFee, null);
  assert.equal(offer?.packCount, null);
  assert.equal(offer?.itemCode, "new");
  assert.equal(offer?.isSample, false);
});

test("中古を除く価格が無いときは購入可能最安を出し、上部の商品価格には使わない", () => {
  const offer = rakutenProductOfferFromPayload(
    {
      products: [
        {
          productCode: jan,
          productName: "ロイヤルカナン 猫 4kg",
          usedExcludeSalesMinPrice: null,
          usedExcludeSalesItemCount: null,
          salesMinPrice: 6120,
          salesItemCount: 4,
          productUrlPC: "https://product.rakuten.co.jp/product/-/example/",
        },
      ],
    },
    jan,
    observedAt,
    "",
  );
  assert.equal(offer?.price, 6120);
  assert.equal(offer?.itemCode, null);
  assert.equal(offer?.stockStatus, "in_stock");
});

test("JAN不一致、購入可能数なし、楽天以外のURL、曖昧なセットは出さない", () => {
  const base = {
    productCode: jan,
    productName: "猫砂",
    usedExcludeSalesMinPrice: 980,
    usedExcludeSalesItemCount: 2,
    productUrlPC: "https://product.rakuten.co.jp/product/-/item/",
  };
  assert.equal(rakutenProductOfferFromPayload({ products: [{ ...base, productCode: "4900000000000" }] }, jan, observedAt, ""), null);
  assert.equal(rakutenProductOfferFromPayload({ products: [{ ...base, usedExcludeSalesItemCount: 0 }] }, jan, observedAt, ""), null);
  assert.equal(rakutenProductOfferFromPayload({ products: [{ ...base, usedExcludeSalesMinPrice: null }] }, jan, observedAt, ""), null);
  assert.equal(rakutenProductOfferFromPayload({ products: [{ ...base, productUrlPC: "https://shopping.yahoo.co.jp/item" }] }, jan, observedAt, ""), null);
  assert.equal(
    rakutenProductOfferFromPayload({ products: [{ ...base, productName: "猫砂 2個 3個" }] }, jan, observedAt, ""),
    null,
  );
  const unofficial = rakutenProductOfferFromPayload(
    { products: [{ ...base, affiliateUrl: "https://product.rakuten.co.jp/product/-/item/" }] },
    jan,
    observedAt,
    "affiliate-id",
  );
  assert.equal(unofficial?.affiliateUrl, null);
  assert.equal(unofficial?.productUrl, "https://product.rakuten.co.jp/product/-/item/");
  const withoutAffiliate = rakutenProductOfferFromPayload(
    { products: [{ ...base, affiliateUrl: "https://hb.afl.rakuten.co.jp/hgc/affiliate-id/" }] },
    jan,
    observedAt,
    "",
  );
  assert.equal(withoutAffiliate?.affiliateUrl, null);
  const officialWithoutLiteralId = rakutenProductOfferFromPayload(
    { products: [{ ...base, affiliateUrl: "https://hb.afl.rakuten.co.jp/hgc/someone-else/" }] },
    jan,
    observedAt,
    "affiliate-id",
  );
  assert.equal(officialWithoutLiteralId?.affiliateUrl, "https://hb.afl.rakuten.co.jp/hgc/someone-else/");
  assert.equal(officialWithoutLiteralId?.productUrl, "https://product.rakuten.co.jp/product/-/item/");
});
