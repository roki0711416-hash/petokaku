import assert from "node:assert/strict";
import test from "node:test";
import { loadRakutenShopOffers, mentionsExactJan, rakutenReviewSearchRequest, rakutenShopItemsFromPayload, rakutenShopSearchRequest } from "./item-search.ts";

const jan = "3182550706933";

test("店舗検索はJANをキーワードにし、アクセスキーをURLに載せない", () => {
  const { url, headers } = rakutenShopSearchRequest("app-id", "access-key", jan, "affiliate-id");
  assert.equal(url.origin + url.pathname, "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701");
  assert.equal(url.searchParams.get("keyword"), jan);
  assert.equal(url.searchParams.get("hits"), "30");
  assert.equal(url.searchParams.get("availability"), "1");
  assert.equal(url.searchParams.get("field"), "1");
  assert.equal(url.searchParams.get("sort"), "+itemPrice");
  assert.equal(url.searchParams.get("affiliateId"), "affiliate-id");
  assert.equal(url.searchParams.get("genreId"), null);
  assert.equal(url.searchParams.get("accessKey"), null);
  assert.equal(headers.accessKey, "access-key");
  const plain = rakutenShopSearchRequest("app-id", "access-key", jan);
  assert.equal(plain.url.searchParams.get("affiliateId"), null);
});

test("レビュー件数の多い掲載はアフィリエイトIDを付けず、在庫ありだけを取る", () => {
  const { url, headers } = rakutenReviewSearchRequest("app-id", "access-key", "犬 用品");
  assert.equal(url.searchParams.get("keyword"), "犬 用品");
  assert.equal(url.searchParams.get("genreId"), null);
  assert.equal(url.searchParams.get("hits"), "20");
  assert.equal(url.searchParams.get("availability"), "1");
  assert.equal(url.searchParams.get("sort"), "-reviewCount");
  assert.equal(url.searchParams.get("affiliateId"), null);
  assert.equal(url.searchParams.get("accessKey"), null);
  assert.equal(headers.accessKey, "access-key");
  const dogGenre = rakutenReviewSearchRequest("app-id", "access-key", "犬 用品", 507513);
  assert.equal(dogGenre.url.searchParams.get("genreId"), "507513");
  assert.equal(dogGenre.url.searchParams.get("keyword"), "犬 用品");
  assert.equal(dogGenre.url.searchParams.get("affiliateId"), null);
  const nextPage = rakutenReviewSearchRequest("app-id", "access-key", "猫 用品", 507524, 2, 30);
  assert.equal(nextPage.url.searchParams.get("page"), "2");
  assert.equal(nextPage.url.searchParams.get("hits"), "30");
  assert.equal(nextPage.url.searchParams.get("affiliateId"), null);
  const capped = rakutenReviewSearchRequest("app-id", "access-key", "猫 用品", 507524, 200, 100);
  assert.equal(capped.url.searchParams.get("page"), "100");
  assert.equal(capped.url.searchParams.get("hits"), "30");
});

test("JANは前後が数字でないときだけ一致する", () => {
  assert.equal(mentionsExactJan(`JAN:${jan}`, jan), true);
  assert.equal(mentionsExactJan(`x${jan}9`, jan), false);
  assert.equal(mentionsExactJan("別の商品", jan), false);
});

test("商品名にJANがある店舗だけを残し、送料別と税別と重複を分ける", () => {
  const previous = process.env.RAKUTEN_AFFILIATE_ID;
  process.env.RAKUTEN_AFFILIATE_ID = "affiliate-id";
  try {
    const parsed = rakutenShopItemsFromPayload(
      {
        count: 40,
        items: [
          {
            itemName: `ロイヤルカナン 4kg ${jan}`,
            itemPrice: 5980,
            itemUrl: "https://item.rakuten.co.jp/shop-a/100/",
            affiliateUrl: "https://hb.afl.rakuten.co.jp/hgc/affiliate-id/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshop-a%2F100%2F",
            shopName: "A店",
            shopCode: "shop-a",
            itemCode: "shop-a:100",
            availability: 1,
            postageFlag: 0,
            taxFlag: 0,
            mediumImageUrls: ["https://thumbnail.image.rakuten.co.jp/example.jpg"],
          },
          {
            itemName: `ロイヤルカナン 4kg ${jan} 2個セット`,
            itemPrice: 11000,
            itemUrl: "https://hb.afl.rakuten.co.jp/hgc/affiliate-id/",
            affiliateUrl: "https://hb.afl.rakuten.co.jp/hgc/affiliate-id/",
            shopName: "B店",
            shopCode: "shop-b",
            itemCode: "shop-b:200",
            availability: 1,
            postageFlag: 1,
            taxFlag: 0,
          },
          {
            itemName: "JANが説明に無いフード",
            itemCaption: "別商品",
            itemPrice: 1000,
            itemUrl: "https://item.rakuten.co.jp/shop-c/300/",
            shopName: "C店",
            shopCode: "shop-c",
            itemCode: "shop-c:300",
            availability: 1,
            postageFlag: 0,
            taxFlag: 0,
          },
          {
            itemName: `税別 ${jan}`,
            itemPrice: 5000,
            itemUrl: "https://item.rakuten.co.jp/shop-d/400/",
            shopName: "D店",
            shopCode: "shop-d",
            itemCode: "shop-d:400",
            availability: 1,
            postageFlag: 0,
            taxFlag: 1,
          },
          {
            itemName: `在庫なし ${jan}`,
            itemPrice: 4500,
            itemUrl: "https://item.rakuten.co.jp/shop-e/500/",
            shopName: "E店",
            shopCode: "shop-e",
            itemCode: "shop-e:500",
            availability: 0,
            postageFlag: 0,
            taxFlag: 0,
          },
          {
            itemName: `送料フラグなし ${jan}`,
            itemPrice: 6100,
            itemUrl: "https://item.rakuten.co.jp/shop-f/600/",
            shopName: "F店",
            shopCode: "shop-f",
            itemCode: "shop-f:600",
            availability: 1,
            taxFlag: 0,
          },
          {
            itemName: `重複 ${jan}`,
            itemPrice: 7000,
            itemUrl: "https://item.rakuten.co.jp/shop-a/100/",
            shopName: "A店",
            shopCode: "shop-a",
            itemCode: "shop-a:100",
            availability: 1,
            postageFlag: 0,
            taxFlag: 0,
          },
        ],
      },
      jan,
      "affiliate-id",
    );
    assert.equal(parsed.truncated, true);
    assert.deepEqual(
      parsed.items.map((item) => [item.shopCode, item.price, item.shippingStatus, item.shippingFee, item.inStock, item.affiliateUrl != null, item.url]),
      [
        ["shop-a", 5980, "free", 0, true, true, "https://item.rakuten.co.jp/shop-a/100/"],
        ["shop-b", 11000, "unknown", null, true, true, null],
        ["shop-e", 4500, "free", 0, false, false, "https://item.rakuten.co.jp/shop-e/500/"],
        ["shop-f", 6100, "unknown", null, true, false, "https://item.rakuten.co.jp/shop-f/600/"],
      ],
    );
  } finally {
    if (previous == null) delete process.env.RAKUTEN_AFFILIATE_ID;
    else process.env.RAKUTEN_AFFILIATE_ID = previous;
  }
});

test("認証が無い店舗検索は接続しない", async () => {
  const previousId = process.env.RAKUTEN_APPLICATION_ID;
  const previousKey = process.env.RAKUTEN_ACCESS_KEY;
  delete process.env.RAKUTEN_APPLICATION_ID;
  delete process.env.RAKUTEN_ACCESS_KEY;
  let called = 0;
  try {
    const result = await loadRakutenShopOffers(jan, () => {
      called += 1;
      return Promise.resolve({ status: 200, text: "{}" });
    });
    assert.equal(called, 0);
    assert.deepEqual(result, { ok: false, reason: "not-configured" });
  } finally {
    if (previousId == null) delete process.env.RAKUTEN_APPLICATION_ID;
    else process.env.RAKUTEN_APPLICATION_ID = previousId;
    if (previousKey == null) delete process.env.RAKUTEN_ACCESS_KEY;
    else process.env.RAKUTEN_ACCESS_KEY = previousKey;
  }
});

test("429のときは空の成功にせず、サイト表示用の失敗にする", async () => {
  const previousId = process.env.RAKUTEN_APPLICATION_ID;
  const previousKey = process.env.RAKUTEN_ACCESS_KEY;
  process.env.RAKUTEN_APPLICATION_ID = "app-id";
  process.env.RAKUTEN_ACCESS_KEY = "access-key";
  try {
    const result = await loadRakutenShopOffers(jan, () => Promise.resolve({ status: 429, text: "" }));
    assert.deepEqual(result, { ok: false, reason: "rate-limited" });
  } finally {
    if (previousId == null) delete process.env.RAKUTEN_APPLICATION_ID;
    else process.env.RAKUTEN_APPLICATION_ID = previousId;
    if (previousKey == null) delete process.env.RAKUTEN_ACCESS_KEY;
    else process.env.RAKUTEN_ACCESS_KEY = previousKey;
  }
});
