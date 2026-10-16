import assert from "node:assert/strict";
import test from "node:test";
import {
  detailHrefForJan,
  isListableProduct,
  listingSkipReason,
  prepareComparableCards,
  type ShopCountedListing,
} from "./listing-eligibility.ts";

const jan = "3182550706933";
const other = "4900000000018";

function card(overrides: Partial<ShopCountedListing> = {}): ShopCountedListing {
  return {
    name: "ロイヤルカナン 4kg",
    janCode: jan,
    href: detailHrefForJan(jan),
    price: 5980,
    shopCount: 2,
    salesUnitKey: "1|4:kg",
    salesUnitConfirmed: true,
    shopKeys: ["yahoo:a", "yahoo:b"],
    sizeLabel: "4kg",
    ...overrides,
  };
}

test("2ショップ以上で詳細を開ける商品だけを一覧に残す", () => {
  const cards = [
    card(),
    card({ name: "容量違いの関連", href: `/products/jan/${jan}?with=${other}`, shopKeys: ["yahoo:a", "yahoo:c"] }),
    card({ name: "JANなし", janCode: null, href: "/search?q=JANなし", shopKeys: ["yahoo:a", "yahoo:b"] }),
    card({ name: "桁不足", janCode: "123", href: "/products/jan/123", shopKeys: ["yahoo:a", "yahoo:b"] }),
    card({ name: "価格なし", price: null, shopKeys: ["yahoo:a", "yahoo:b"] }),
    card({ name: "", shopKeys: ["yahoo:a", "yahoo:b"] }),
    card({ name: "別ページ", href: "/products/sample", shopKeys: ["yahoo:a", "yahoo:b"] }),
    card({ name: "名前検索", href: "/search?q=royal", shopKeys: ["yahoo:a", "yahoo:b"] }),
    card({ name: "1ショップ", shopCount: 1, shopKeys: ["yahoo:a"] }),
    card({ name: "単位不明", salesUnitKey: null, salesUnitConfirmed: false, shopKeys: ["yahoo:a", "yahoo:b"] }),
  ];
  assert.deepEqual(
    cards.map((item) => listingSkipReason(item)),
    [
      null,
      null,
      "jan-missing",
      "jan-invalid",
      "price-missing",
      "name-missing",
      "detail-url-mismatch",
      "detail-url-mismatch",
      "shops-insufficient",
      "unit-unconfirmed",
    ],
  );
  const listed = prepareComparableCards(cards);
  assert.equal(cards.filter((item) => listingSkipReason(item) === null).length, 2);
  assert.equal(listed.length, 1);
  assert.equal(listed.every((item) => isListableProduct(item) && item.href?.startsWith("/products/jan/") && item.shopCount >= 2), true);
});

test("不正なJANからは詳細URLを作らない", () => {
  assert.equal(detailHrefForJan(jan), `/products/jan/${jan}`);
  assert.equal(detailHrefForJan("123"), null);
  assert.equal(detailHrefForJan(""), null);
  assert.equal(detailHrefForJan("0000000000000"), null);
});

test("Yahooだけ、楽天だけ、両モール合わせて2ショップなら掲載する", () => {
  const yahooOnly = prepareComparableCards([card({ shopKeys: ["yahoo:a", "yahoo:b"] })]);
  const rakutenOnly = prepareComparableCards([card({ shopKeys: ["rakuten:a", "rakuten:b"] })]);
  const combined = prepareComparableCards([
    card({ shopKeys: ["yahoo:a"], shopCount: 1 }),
    card({ name: "楽天の同じ商品", shopKeys: ["rakuten:b"], shopCount: 1, sizeLabel: null }),
  ]);
  assert.equal(yahooOnly.length, 1);
  assert.equal(rakutenOnly.length, 1);
  assert.equal(combined.length, 1);
  assert.equal(combined[0]?.shopCount, 2);
  assert.deepEqual(combined[0]?.shopKeys, ["yahoo:a", "rakuten:b"]);
});

test("同じショップの複数掲載は2ショップに数えない", () => {
  const listed = prepareComparableCards([
    card({ shopKeys: ["yahoo:a"], shopCount: 1 }),
    card({ name: "同じ店の別出品", shopKeys: ["yahoo:a"], shopCount: 1, price: 6100 }),
  ]);
  assert.equal(listed.length, 0);
});

test("容量違いとセット違いは合算しない", () => {
  const listed = prepareComparableCards([
    card({ name: "4kg", salesUnitKey: "1|4:kg", shopKeys: ["yahoo:a"], shopCount: 1 }),
    card({ name: "8kg", salesUnitKey: "1|8:kg", shopKeys: ["yahoo:b"], shopCount: 1, sizeLabel: "8kg" }),
    card({ name: "4kg×2袋", salesUnitKey: "2:袋|4:kg", shopKeys: ["rakuten:c"], shopCount: 1, sizeLabel: null }),
  ]);
  assert.equal(listed.length, 0);
});

test("容量表記のない掲載は、容量が1種類だけのときに同じ比較へ入れる", () => {
  const joined = prepareComparableCards([
    card({ name: "4kg", salesUnitKey: "1|4:kg", shopKeys: ["yahoo:a"], shopCount: 1 }),
    card({ name: "容量表記なし", salesUnitKey: "1|open", shopKeys: ["rakuten:b"], shopCount: 1, sizeLabel: null }),
  ]);
  assert.equal(joined.length, 1);
  assert.equal(joined[0]?.shopCount, 2);
  assert.equal(joined[0]?.name, "4kg");

  const conflicted = prepareComparableCards([
    card({ name: "4kg", salesUnitKey: "1|4:kg", shopKeys: ["yahoo:a"], shopCount: 1 }),
    card({ name: "8kg", salesUnitKey: "1|8:kg", shopKeys: ["yahoo:b"], shopCount: 1, sizeLabel: "8kg" }),
    card({ name: "容量表記なし", salesUnitKey: "1|open", shopKeys: ["rakuten:c"], shopCount: 1, sizeLabel: null }),
  ]);
  assert.equal(conflicted.length, 0);
});
