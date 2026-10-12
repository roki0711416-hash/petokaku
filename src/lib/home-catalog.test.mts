import assert from "node:assert/strict";
import test from "node:test";
import { homeCatalogFromItems } from "./home-catalog.ts";
import type { YahooItem } from "./sources/yahoo/adapter.ts";

const observedAt = "2026-10-11T14:00:00.000Z";

function item(overrides: Partial<YahooItem> = {}): YahooItem {
  return {
    name: "ロイヤルカナン 猫用 4kg",
    url: "https://store.shopping.yahoo.co.jp/example/item.html",
    inStock: true,
    code: "shop_1",
    price: 5980,
    imageUrl: "https://item-shopping.c.yimg.jp/i/l/example",
    brandName: "ロイヤルカナン",
    genreName: "キャットフード",
    parentGenreNames: ["猫用品"],
    janCode: "3182550706933",
    shipping: { code: 2, name: "送料無料" },
    sellerId: "shop-a",
    sellerName: "A店",
    ...overrides,
  };
}

test("TOPの商品はJANと販売単位が一致するものだけまとめ、名前だけではまとめない", () => {
  const catalog = homeCatalogFromItems(
    [
      item(),
      item({
        sellerId: "shop-b",
        sellerName: "B店",
        code: "shop_2",
        price: 6200,
        url: "https://store.shopping.yahoo.co.jp/shop-b/item.html",
      }),
      item({
        sellerId: "set",
        code: "set_1",
        name: "ロイヤルカナン 猫用 4kg×2袋",
        price: 11000,
      }),
      item({
        sellerId: "set-b",
        code: "set_2",
        name: "ロイヤルカナン 猫用 4kg×2袋",
        price: 11200,
        url: "https://store.shopping.yahoo.co.jp/set-b/item.html",
      }),
      item({
        janCode: null,
        sellerId: "solo-a",
        code: "solo-a",
        name: "名前だけ同じ猫おもちゃ",
        genreName: "猫用おもちゃ",
        price: 800,
      }),
      item({
        janCode: null,
        sellerId: "solo-b",
        code: "solo-b",
        name: "名前だけ同じ猫おもちゃ",
        genreName: "猫用おもちゃ",
        price: 900,
      }),
      item({
        janCode: "4900000000018",
        sellerId: "dog",
        code: "dog_1",
        name: "ドッグフード 8kg",
        genreName: "ドッグフード",
        parentGenreNames: ["犬用品"],
        price: 4000,
      }),
      item({
        janCode: "4900000000018",
        sellerId: "dog-b",
        code: "dog_2",
        name: "ドッグフード 8kg",
        genreName: "ドッグフード",
        parentGenreNames: ["犬用品"],
        price: 4200,
        url: "https://store.shopping.yahoo.co.jp/dog-b/item.html",
      }),
    ],
    observedAt,
  );
  assert.equal(catalog.status, "ready");
  assert.match(catalog.observedLabel, /2026年10月11日/);
  const royal = catalog.popular.filter((card) => card.href === "/products/jan/3182550706933");
  assert.equal(royal.length, 2);
  assert.equal(royal.every((card) => card.shopCount >= 2 && card.compare), true);
  assert.equal(catalog.popular.filter((card) => card.name === "名前だけ同じ猫おもちゃ").length, 0);
  assert.equal(catalog.popular.every((card) => card.href.startsWith("/products/jan/") && card.price != null && card.price > 0), true);
  const cat = catalog.categories.find((category) => category.id === "cat");
  const dog = catalog.categories.find((category) => category.id === "dog");
  assert.equal(cat?.cards.some((card) => card.href === "/products/jan/3182550706933"), true);
  assert.equal(dog?.cards.some((card) => card.href === "/products/jan/4900000000018"), true);
  assert.equal(cat?.cards.some((card) => card.name === "ドッグフード 8kg"), false);
});

test("商品が無いときは架空の価格を作らない", () => {
  const catalog = homeCatalogFromItems([], observedAt);
  assert.equal(catalog.status, "empty");
  assert.equal(catalog.popular.length, 0);
  assert.equal(catalog.categories.every((category) => category.cards.length === 0), true);
});
