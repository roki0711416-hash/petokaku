import assert from "node:assert/strict";
import test from "node:test";
import { adaptYahooGroup, mapYahooShipping, sameJanItems, type YahooItem } from "./adapter.ts";

const observedAt = "2026-10-01T14:30:00.000Z";

function item(overrides: Partial<YahooItem> = {}): YahooItem {
  return {
    name: "ロイヤルカナン ミニ インドア アダルト 成犬用 8kg",
    url: "https://store.shopping.yahoo.co.jp/example/item.html",
    inStock: true,
    code: "chanet_201962",
    price: 9999,
    imageUrl: "https://item-shopping.c.yimg.jp/i/g/example",
    brandName: "サイズ ヘルス ニュートリション",
    genreName: "ドッグフード ドライフード",
    parentGenreNames: ["ペット用品"],
    janCode: "3182550849654",
    shipping: { code: 2, name: "送料無料" },
    sellerId: "chanet",
    sellerName: "チャーム charm ヤフー店",
    ...overrides,
  };
}

test("送料無料だけを0円にし、条件付き送料無料は金額なしにする", () => {
  assert.deepEqual(mapYahooShipping({ code: 2, name: "送料無料" }), { shippingFee: 0, shippingStatus: "free" });
  assert.deepEqual(mapYahooShipping({ code: 3, name: "条件付き送料無料" }), {
    shippingFee: null,
    shippingStatus: "conditional_free",
  });
  assert.deepEqual(mapYahooShipping({ code: 1, name: "設定なし" }), { shippingFee: null, shippingStatus: "unknown" });
  assert.deepEqual(mapYahooShipping(null), { shippingFee: null, shippingStatus: "unknown" });
});

test("商品名に容量があっても容量はnullにし、JANは識別子のままにする", () => {
  const adapted = adaptYahooGroup([item()], observedAt);
  assert.ok(adapted);
  assert.equal(adapted.variant.quantity, null);
  assert.equal(adapted.variant.quantityUnit, null);
  assert.equal(adapted.variant.sizeLabel, "容量情報なし");
  assert.equal(adapted.variant.quantityConfidence, "medium");
  assert.equal(adapted.variant.quantitySource, "shop_title");
  assert.equal(adapted.variant.statedQuantity, 8);
  assert.equal(adapted.variant.statedUnit, "kg");
  assert.equal(adapted.product.unitPriceType, "none");
  assert.equal(adapted.variant.janCode, "3182550849654");
  assert.equal(adapted.variant.id, "prd_yh_3182550849654");
  assert.equal(adapted.product.id, "line_yh_3182550849654");
  assert.equal(adapted.offers[0]?.itemCode, "chanet_201962");
  assert.equal(adapted.offers[0]?.id.includes("chanet_201962"), true);
  assert.equal(adapted.variant.id.includes("chanet"), false);
  assert.equal(adapted.detail.quantity, null);
  assert.equal(adapted.detail.offers[0]?.packCount, null);
  assert.equal(adapted.prices[0]?.shippingFee, 0);
  assert.equal(adapted.prices[0]?.observedAt, observedAt);
});

test("同じJANだけを1つのvariantにまとめ、別JANやJANなしは混ぜない", () => {
  const items = [
    item(),
    item({
      code: "shopb_1",
      sellerId: "shopb",
      sellerName: "ショップB",
      price: 8900,
      url: "https://store.shopping.yahoo.co.jp/shopb/1.html",
      shipping: { code: 1, name: "設定なし" },
    }),
    item({
      code: "chanet_201962",
      sellerId: "chanet",
      price: 11111,
    }),
    item({
      name: "ロイヤルカナン ミニ インドア アダルト 成犬用 8kg 別商品",
      janCode: "4900000000001",
      code: "other_1",
      sellerId: "other",
    }),
    item({
      name: "ロイヤルカナン ミニ インドア アダルト 成犬用 8kg",
      janCode: null,
      code: "noname_1",
      sellerId: "noname",
    }),
  ];
  const grouped = sameJanItems(items, "3182550849654");
  assert.equal(grouped.length, 2);
  const adapted = adaptYahooGroup(items, observedAt);
  assert.ok(adapted);
  assert.equal(adapted.offers.length, 2);
  assert.equal(adapted.detail.offers.length, 2);
  assert.deepEqual(
    adapted.offers.map((offer) => offer.sellerId),
    ["chanet", "shopb"],
  );
  assert.equal(adapted.offers[1]?.itemCode, "shopb_1");
  assert.equal(adapted.prices[1]?.shippingFee, null);
  assert.equal(adapted.variant.quantity, 8000);
  assert.equal(adapted.variant.quantityUnit, "g");
  assert.equal(adapted.variant.quantityConfidence, "high");
  assert.equal(adapted.variant.quantitySource, "shop_titles");
  assert.equal(adapted.variant.sizeLabel, "8kg");
  assert.equal(adapted.detail.offers[0]?.packCount, null);
  assert.equal(adapted.detail.offers[0]?.totalQuantity, null);
  assert.equal(adapted.detail.offers[1]?.packCount, null);
  assert.equal(adapted.detail.offers[1]?.totalQuantity, null);
});

test("同じJANでもセット表記がある掲載はpackCountを分ける", () => {
  const adapted = adaptYahooGroup(
    [
      item({ name: "ロイヤルカナン ミニ インドア アダルト 8kg" }),
      item({
        name: "【8kg×2袋】ロイヤルカナン ミニ インドア アダルト",
        code: "sweet-pet_set",
        sellerId: "sweet-pet",
        sellerName: "スイートペットYahoo!店",
        price: 19980,
      }),
    ],
    observedAt,
  );
  assert.ok(adapted);
  assert.equal(adapted.detail.offers[0]?.packCount, null);
  assert.equal(adapted.detail.offers[0]?.totalQuantity, null);
  assert.equal(adapted.detail.offers[1]?.packCount, 2);
  assert.equal(adapted.detail.offers[1]?.packUnit, "袋");
  assert.equal(adapted.detail.offers[1]?.totalQuantity, 16000);
  assert.equal(adapted.variant.quantity, 8000);
  assert.equal(adapted.variant.sizeLabel, "8kg");
  assert.equal(adapted.product.unitPriceType, "per_100g");
});

test("体重10kgまでは商品容量にせず、一致した8kgだけを使う", () => {
  const adapted = adaptYahooGroup(
    [
      item({ name: "ロイヤルカナン インドア 成犬時体重10kgまで 8kg" }),
      item({
        name: "ロイヤルカナン SHN ミニ インドア アダルト 8kg",
        code: "star_1",
        sellerId: "star",
        sellerName: "スターワークス",
      }),
    ],
    observedAt,
  );
  assert.ok(adapted);
  assert.equal(adapted.variant.quantity, 8000);
  assert.equal(adapted.variant.quantityUnit, "g");
  assert.equal(adapted.variant.sizeLabel, "8kg");
  assert.notEqual(adapted.variant.quantity, 10000);
  assert.equal(adapted.variant.quantityConfidence, "high");
  assert.equal(adapted.detail.offers[0]?.packCount, null);
  assert.equal(adapted.detail.offers[1]?.packCount, null);
  assert.equal(adapted.detail.offers[0]?.unitPriceReady, true);
  assert.equal(adapted.detail.offers[1]?.unitPriceReady, true);
});

test("タイトルごとに容量を確定できない掲載は参考単価の対象にしない", () => {
  const adapted = adaptYahooGroup(
    [
      item({ name: "ロイヤルカナン 8kg" }),
      item({
        name: "ロイヤルカナン 8kg",
        code: "shopb_1",
        sellerId: "shopb",
        sellerName: "ショップB",
      }),
      item({
        name: "猫砂 8L(4L×2)",
        code: "unclear_1",
        sellerId: "unclear",
        sellerName: "判定不能ショップ",
      }),
    ],
    observedAt,
  );
  assert.ok(adapted);
  assert.equal(adapted.variant.quantity, 8000);
  assert.equal(adapted.detail.offers[0]?.unitPriceReady, true);
  assert.equal(adapted.detail.offers[1]?.unitPriceReady, true);
  assert.equal(adapted.detail.offers[2]?.unitPriceReady, false);
  assert.equal(adapted.detail.offers[2]?.totalQuantity, null);
});

test("個数が矛盾するセットは1単位の参考単価にしない", () => {
  const adapted = adaptYahooGroup(
    [
      item({ name: "ニオイをとる砂 5L×4個", price: 3190 }),
      item({
        name: "猫砂 ニオイをとる砂 国産 5L 8袋（4袋×2箱）",
        code: "case_1",
        sellerId: "case",
        sellerName: "ケース店",
        price: 6392,
      }),
    ],
    observedAt,
  );
  assert.ok(adapted);
  assert.equal(adapted.detail.offers[0]?.packCount, 4);
  assert.equal(adapted.detail.offers[0]?.unitPriceReady, true);
  assert.equal(adapted.detail.offers[1]?.packCount, null);
  assert.equal(adapted.detail.offers[1]?.unitPriceReady, false);
});
