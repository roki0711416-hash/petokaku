import assert from "node:assert/strict";
import test from "node:test";
import { productStructuredData } from "./product-jsonld.ts";

test("商品の構造化データは実在する価格と在庫だけを入れる", () => {
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
    ],
  });
  assert.equal(data?.["@type"], "Product");
  assert.equal(data?.gtin13, "3182550706933");
  assert.equal("aggregateRating" in (data ?? {}), false);
  assert.equal("review" in (data ?? {}), false);
  const offers = data?.offers as Array<Record<string, unknown>>;
  assert.equal(offers.length, 2);
  assert.equal(offers[0]?.availability, "https://schema.org/InStock");
  assert.equal("availability" in (offers[1] ?? {}), false);
  assert.equal(JSON.stringify(data).includes("shippingDetails"), false);
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
