import assert from "node:assert/strict";
import test from "node:test";
import type { Offer } from "../types.ts";
import { pageComparisonJsonOffers, productStructuredData } from "./product-jsonld.ts";

test("商品の構造化データは実在する価格と在庫だけを入れ、送料込みの幅を集約する", () => {
  const data = productStructuredData({
    name: "室内猫用 4kg",
    brand: "ロイヤルカナン",
    janCode: "3182550706933",
    imageUrl: "https://example.com/item.jpg",
    pageUrl: "https://petokaku.com/products/jan/3182550706933",
    sizeLabel: "4kg",
    offers: [
      { shopName: "ショップA", price: 5990, url: "https://shop.example/a", stockStatus: "in_stock" },
      { shopName: "ショップB", price: null, url: "https://shop.example/b", stockStatus: "in_stock" },
      { shopName: "ショップC", price: 6200, url: "https://shop.example/c", stockStatus: "unknown" },
      { shopName: "価格なし", price: 0, url: "https://shop.example/zero", stockStatus: "in_stock" },
    ],
  });
  assert.equal(data?.["@type"], "Product");
  assert.equal(data?.gtin13, "3182550706933");
  assert.equal("aggregateRating" in (data ?? {}), false);
  assert.equal("review" in (data ?? {}), false);
  const aggregate = data?.offers as Record<string, unknown>;
  assert.equal(aggregate["@type"], "AggregateOffer");
  assert.equal(aggregate.priceCurrency, "JPY");
  assert.equal(aggregate.lowPrice, 5990);
  assert.equal(aggregate.highPrice, 6200);
  assert.equal(aggregate.offerCount, 2);
  const offers = aggregate.offers as Array<Record<string, unknown>>;
  assert.equal(offers.length, 2);
  assert.equal(offers[0]?.availability, "https://schema.org/InStock");
  assert.equal("availability" in (offers[1] ?? {}), false);
  assert.equal(JSON.stringify(data).includes("shippingDetails"), false);
});

function comparedOffer(partial: {
  id: string;
  price: number | null;
  shippingFee: number | null;
  shopName?: string;
  provider?: Offer["provider"];
  sellerId?: string | null;
  stockStatus?: Offer["stockStatus"];
  packCount?: number | null;
  listingTitle?: string | null;
}): Offer {
  return {
    id: partial.id,
    variantId: "variant",
    shopName: partial.shopName ?? partial.id,
    listingTitle: partial.listingTitle ?? "商品",
    price: partial.price,
    shippingFee: partial.shippingFee,
    productUrl: `https://shop.example/${partial.id}`,
    affiliateUrl: null,
    priceCheckedAt: null,
    priceSnapshotId: null,
    shippingStatus: partial.shippingFee == null ? "unknown" : "free",
    stockStatus: partial.stockStatus ?? "in_stock",
    source: partial.provider ?? "yahoo",
    provider: partial.provider ?? "yahoo",
    sellerId: partial.sellerId === undefined ? partial.id : partial.sellerId,
    itemCode: partial.id,
    packCount: partial.packCount ?? null,
    packUnit: null,
    totalQuantity: null,
    unitPriceReady: false,
    isSample: false,
  };
}

test("構造化データの価格はページの送料込み順位と同じ掲載だけにする", () => {
  const offers = pageComparisonJsonOffers([
    comparedOffer({ id: "low", price: 1000, shippingFee: 0, shopName: "Pet館" }),
    comparedOffer({ id: "item-only", price: 634, shippingFee: null, shopName: "カウモール" }),
    comparedOffer({ id: "out", price: 521, shippingFee: null, stockStatus: "out_of_stock", shopName: "ウエルシア" }),
    comparedOffer({ id: "set", price: 12621, shippingFee: 0, packCount: 6, shopName: "ケース店", listingTitle: "7L×6袋" }),
    comparedOffer({ id: "ref", price: 508, shippingFee: null, provider: "rakuten", sellerId: null, shopName: "楽天市場", listingTitle: "参考" }),
    comparedOffer({ id: "fee", price: 900, shippingFee: 130, shopName: "送料あり店" }),
  ]);
  assert.deepEqual(
    offers.map((offer) => offer.price),
    [1000, 1030],
  );
  const data = productStructuredData({
    name: "アイリスオーヤマ 紙の猫砂 7L",
    brand: "アイリスオーヤマ",
    janCode: "4905009714353",
    imageUrl: null,
    pageUrl: "https://petokaku.com/products/jan/4905009714353",
    sizeLabel: "7L",
    offers,
  });
  const aggregate = data?.offers as Record<string, unknown>;
  assert.equal(aggregate.lowPrice, 1000);
  assert.equal(aggregate.highPrice, 1030);
  assert.equal(aggregate.offerCount, 2);
  assert.equal(aggregate.priceCurrency, "JPY");
  assert.equal(JSON.stringify(data).includes("634"), false);
  assert.equal(JSON.stringify(data).includes("521"), false);
  assert.equal(JSON.stringify(data).includes("12621"), false);
});

test("商品名が無い構造化データは出さない", () => {
  assert.equal(
    productStructuredData({
      name: "  ",
      brand: "",
      janCode: null,
      imageUrl: null,
      pageUrl: "https://petokaku.com/",
      sizeLabel: null,
      offers: [],
    }),
    null,
  );
});
