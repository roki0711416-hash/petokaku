import assert from "node:assert/strict";
import test from "node:test";
import { comparisonCountLabel, splitOffersForDisplay } from "./visible-offers.ts";

function offer(partial: {
  id: string;
  price: number;
  shippingFee: number | null;
  stockStatus?: "in_stock" | "out_of_stock" | "unknown";
}) {
  return {
    id: partial.id,
    price: partial.price,
    shippingFee: partial.shippingFee,
    stockStatus: partial.stockStatus ?? "in_stock",
  };
}

test("支払総額が安い順にし、商品価格だけでは並べない", () => {
  const { initial, rest } = splitOffersForDisplay([
    offer({ id: "b", price: 9800, shippingFee: 550 }),
    offer({ id: "a", price: 9990, shippingFee: 0 }),
  ]);
  assert.deepEqual(initial.map((item) => item.id), ["a", "b"]);
  assert.equal(rest.length, 0);
});

test("在庫ありの安い5件だけを最初に出し、在庫切れは残りに回す", () => {
  const offers = [
    offer({ id: "cheap-out", price: 1000, shippingFee: 0, stockStatus: "out_of_stock" }),
    offer({ id: "1", price: 100, shippingFee: 0 }),
    offer({ id: "2", price: 200, shippingFee: 0 }),
    offer({ id: "3", price: 300, shippingFee: 0 }),
    offer({ id: "4", price: 400, shippingFee: 0 }),
    offer({ id: "5", price: 500, shippingFee: 0 }),
    offer({ id: "6", price: 600, shippingFee: 0 }),
    offer({ id: "unknown-stock", price: 50, shippingFee: 0, stockStatus: "unknown" }),
  ];
  const { initial, rest } = splitOffersForDisplay(offers);
  assert.deepEqual(initial.map((item) => item.id), ["1", "2", "3", "4", "5"]);
  assert.deepEqual(rest.map((item) => item.id), ["6", "unknown-stock", "cheap-out"]);
});

test("送料不明は支払総額が分かるショップより前に出さない", () => {
  const { initial } = splitOffersForDisplay([
    offer({ id: "unknown", price: 500, shippingFee: null }),
    offer({ id: "known", price: 9000, shippingFee: 0 }),
  ]);
  assert.deepEqual(initial.map((item) => item.id), ["known", "unknown"]);
});

test("5件以下なら在庫未確認も最初から見せる", () => {
  const { initial, rest } = splitOffersForDisplay([
    offer({ id: "known", price: 13800, shippingFee: 0 }),
    offer({ id: "unknown-ship", price: 12000, shippingFee: null, stockStatus: "unknown" }),
    offer({ id: "with-fee", price: 13200, shippingFee: 880 }),
  ]);
  assert.deepEqual(initial.map((item) => item.id), ["known", "with-fee", "unknown-ship"]);
  assert.equal(rest.length, 0);
});

test("5件以下なら残りを作らない", () => {
  const { initial, rest } = splitOffersForDisplay([
    offer({ id: "a", price: 100, shippingFee: 0 }),
    offer({ id: "b", price: 200, shippingFee: 0 }),
    offer({ id: "c", price: 300, shippingFee: 0 }),
  ]);
  assert.equal(initial.length, 3);
  assert.equal(rest.length, 0);
});

test("ショップ数と販売情報数を分ける", () => {
  assert.equal(
    comparisonCountLabel([
      { sellerId: "a", shopName: "ショップA" },
      { sellerId: "a", shopName: "ショップA" },
      { sellerId: "b", shopName: "ショップB" },
    ]),
    "2ショップを比較（販売情報3件）",
  );
  assert.equal(
    comparisonCountLabel([
      { sellerId: "a", shopName: "ショップA" },
      { sellerId: "b", shopName: "ショップB" },
    ]),
    "2ショップを比較",
  );
});
