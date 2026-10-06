import assert from "node:assert/strict";
import test from "node:test";
import { buildSearchCandidates } from "./search-candidates.ts";
import type { YahooItem } from "./adapter.ts";

const observedAt = "2026-10-02T04:00:00.000Z";

function item(overrides: Partial<YahooItem> = {}): YahooItem {
  return {
    name: "ロイヤルカナン ミニ インドア アダルト 8kg",
    url: "https://store.shopping.yahoo.co.jp/example/item.html",
    inStock: true,
    code: "chanet_201962",
    price: 9990,
    imageUrl: "https://example.test/image.jpg",
    brandName: "ロイヤルカナン",
    genreName: "ドッグフード",
    parentGenreNames: ["犬"],
    janCode: "3182550849654",
    shipping: { code: 2, name: "送料無料" },
    sellerId: "chanet",
    sellerName: "チャーム",
    ...overrides,
  };
}

test("同じJANは1件にまとめ、別JANは分け、JANなしは商品名でまとめない", () => {
  const cards = buildSearchCandidates(
    [
      item(),
      item({
        sellerId: "shopb",
        sellerName: "ショップB",
        code: "shopb_1",
        price: 12000,
        url: "https://store.shopping.yahoo.co.jp/shopb/1.html",
      }),
      item({
        janCode: "4900000000001",
        sellerId: "other",
        code: "other_1",
        name: "別商品 3kg",
        price: 3000,
      }),
      item({
        janCode: null,
        sellerId: "solo-a",
        code: "a1",
        name: "名前だけ同じ商品",
        price: 1500,
      }),
      item({
        janCode: null,
        sellerId: "solo-b",
        code: "b1",
        name: "名前だけ同じ商品",
        price: 1600,
      }),
    ],
    observedAt,
  );
  assert.equal(cards.filter((card) => card.janCode === "3182550849654").length, 1);
  assert.equal(cards.filter((card) => card.janCode === "4900000000001").length, 1);
  assert.equal(cards.filter((card) => card.name === "名前だけ同じ商品").length, 2);
  const royal = cards.find((card) => card.janCode === "3182550849654");
  assert.equal(royal?.shopCount, 2);
  assert.equal(royal?.sellingPrice, 9990);
  assert.equal(royal?.priceFrom, true);
  assert.equal(royal?.href, "/products/jan/3182550849654");
  assert.equal(cards.find((card) => card.janCode == null)?.href, null);
});

test("通常販売があるとき、セット価格を代表価格にしない", () => {
  const cards = buildSearchCandidates(
    [
      item({ price: 9990 }),
      item({
        sellerId: "set",
        code: "set_1",
        name: "【8kg×2袋】ロイヤルカナン ミニ インドア アダルト",
        price: 8000,
      }),
    ],
    observedAt,
  );
  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.sellingPrice, 9990);
  assert.equal(cards[0]?.salesUnitLabel, null);
});

test("在庫切れの安い価格は代表価格にしない", () => {
  const cards = buildSearchCandidates(
    [
      item({ price: 1000, inStock: false, sellerId: "out", code: "out_1" }),
      item({ price: 9990 }),
    ],
    observedAt,
  );
  assert.equal(cards[0]?.sellingPrice, 9990);
});

test("在庫ありが無いときは購入できる価格として出さない", () => {
  const cards = buildSearchCandidates([item({ inStock: false, price: 9990 })], observedAt);
  assert.equal(cards[0]?.sellingPrice, null);
  assert.equal(cards[0]?.unitYen, null);
});

test("1ショップだけでは容量と参考単価を出さない", () => {
  const cards = buildSearchCandidates([item({ name: "成犬時体重10kgまで 8kg" })], observedAt);
  assert.equal(cards[0]?.sizeLabel, null);
  assert.equal(cards[0]?.unitYen, null);
  assert.equal(cards[0]?.shopLabel, "この検索では1ショップ");
});

test("複数ショップが8kgで一致したときだけ内容量と参考単価を出す", () => {
  const cards = buildSearchCandidates(
    [
      item({ name: "成犬時体重10kgまで 8kg", price: 9990 }),
      item({
        sellerId: "shopb",
        code: "shopb_1",
        name: "ロイヤルカナン 8kg",
        price: 11000,
      }),
    ],
    observedAt,
  );
  assert.equal(cards[0]?.sizeLabel, "8kg");
  assert.notEqual(cards[0]?.sizeLabel, "10kg");
  assert.equal(cards[0]?.unitYen, 125);
  assert.equal(cards[0]?.unitExact, false);
  assert.equal(cards[0]?.unitLabel, "100g");
});

test("通常販売が無いセットだけなら販売単位を付けて代表にする", () => {
  const cards = buildSearchCandidates(
    [
      item({ name: "【8kg×2袋】ロイヤルカナン", price: 19980 }),
      item({
        sellerId: "shopb",
        code: "shopb_1",
        name: "ロイヤルカナン 8kg×2袋",
        price: 21000,
      }),
    ],
    observedAt,
  );
  assert.equal(cards[0]?.sellingPrice, 19980);
  assert.equal(cards[0]?.salesUnitLabel, "2袋セット");
  assert.equal(cards[0]?.sizeLabel, "8kg");
  assert.equal(cards[0]?.unitYen, 125);
});

test("個数が矛盾するセット価格を通常販売の代表にしない", () => {
  const cards = buildSearchCandidates(
    [
      item({
        name: "LION ニオイをとる砂 5L×4個",
        price: 3190,
        janCode: "4903351011250",
        brandName: "ニオイをとる砂",
      }),
      item({
        name: "猫砂 ニオイをとる砂 国産 5L 8袋（4袋×2箱）",
        sellerId: "case",
        code: "case_1",
        price: 6392,
        janCode: "4903351011250",
      }),
    ],
    observedAt,
  );
  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.sellingPrice, 3190);
  assert.equal(cards[0]?.salesUnitLabel, "4個セット");
  assert.match(cards[0]?.name ?? "", /5L×4個/);
  assert.equal(cards[0]?.unitYen, 160);
  assert.equal(cards[0]?.unitLabel, "L");
});
