import assert from "node:assert/strict";
import test from "node:test";
import { compareWindow, groupOtherSalesUnits, initialCompareCount, partitionShopComparison } from "./shop-compare.ts";
import { yahooRetrievalLimited } from "../sources/yahoo/search.ts";

function offer(partial: {
  id: string;
  price: number | null;
  shippingFee: number | null;
  stockStatus?: "in_stock" | "out_of_stock" | "unknown";
  packCount?: number | null;
  packUnit?: "個" | "袋" | "本" | "パック" | null;
  listingTitle?: string | null;
}) {
  return {
    id: partial.id,
    price: partial.price,
    shippingFee: partial.shippingFee,
    stockStatus: partial.stockStatus ?? "in_stock",
    packCount: partial.packCount ?? 1,
    packUnit: partial.packUnit ?? "個",
    listingTitle: partial.listingTitle ?? "商品 1個",
  };
}

test("送料込み合計が安い順で、商品価格だけでは並べない", () => {
  const { confirmed } = partitionShopComparison([
    offer({ id: "dear-item", price: 1000, shippingFee: 800 }),
    offer({ id: "cheap-total", price: 1500, shippingFee: 0 }),
  ]);
  assert.deepEqual(
    confirmed.map((item) => item.id),
    ["cheap-total", "dear-item"],
  );
  assert.equal(confirmed[0]?.id, "cheap-total");
});

test("最初の5件は全体の最安を含み、表示を切っても判定対象は全件のまま", () => {
  const offers = Array.from({ length: 12 }, (_, index) =>
    offer({ id: `s${index}`, price: 2000 - index * 10, shippingFee: 0 }),
  );
  const { confirmed } = partitionShopComparison(offers);
  const firstPage = confirmed.slice(0, initialCompareCount);
  assert.equal(firstPage.length, 5);
  assert.equal(firstPage[0]?.id, confirmed[0]?.id);
  assert.equal(confirmed[0]?.price, 1890);
  const window = compareWindow(confirmed.length, initialCompareCount);
  assert.equal(window.remaining, 7);
  assert.equal(window.next, 12);
});

test("もっと見るは10件ずつ増やす", () => {
  const first = compareWindow(30, 5);
  assert.equal(first.next, 15);
  const second = compareWindow(30, first.next);
  assert.equal(second.next, 25);
  assert.equal(compareWindow(30, 25).next, 30);
});

test("送料未確認、在庫なし、セットは送料込みの比較枠に入れない", () => {
  const parts = partitionShopComparison([
    offer({ id: "single", price: 3000, shippingFee: 0 }),
    offer({ id: "unknown-ship", price: 1000, shippingFee: null }),
    offer({ id: "out", price: 500, shippingFee: 0, stockStatus: "out_of_stock" }),
    offer({ id: "pair", price: 2000, shippingFee: 0, packCount: 2, packUnit: "個", listingTitle: "商品 2個セット" }),
    offer({ id: "ambiguous", price: 900, shippingFee: 0, packCount: null, listingTitle: "商品 2個または3個" }),
  ]);
  assert.deepEqual(parts.confirmed.map((item) => item.id), ["single"]);
  assert.deepEqual(parts.unknownShipping.map((item) => item.id), ["unknown-ship"]);
  assert.deepEqual(parts.unavailable.map((item) => item.id), ["out"]);
  assert.deepEqual(
    parts.otherUnits.map((item) => item.id),
    ["pair", "ambiguous"],
  );
});

test("セットは個数ごとに分け、枠の中も送料込み合計の順", () => {
  const groups = groupOtherSalesUnits([
    offer({ id: "two-dear", price: 4000, shippingFee: 500, packCount: 2, listingTitle: "2個セット" }),
    offer({ id: "two-cheap", price: 4200, shippingFee: 0, packCount: 2, listingTitle: "2個セット" }),
    offer({ id: "four", price: 8000, shippingFee: 0, packCount: 4, packUnit: "袋", listingTitle: "4袋セット" }),
  ]);
  assert.deepEqual(
    groups.map((group) => group.key),
    ["2", "4"],
  );
  assert.deepEqual(groups[0]?.offers.map((item) => item.id), ["two-cheap", "two-dear"]);
  assert.match(groups[1]?.heading ?? "", /4袋セット/);
});

test("Yahooの取得件数が総ヒットより少ないときは全店舗の最安としない", () => {
  assert.equal(yahooRetrievalLimited({ totalAvailable: 80, returnedCount: 50, requested: 50 }), true);
  assert.equal(yahooRetrievalLimited({ totalAvailable: 12, returnedCount: 12, requested: 50 }), false);
  assert.equal(yahooRetrievalLimited({ totalAvailable: null, returnedCount: 50, requested: 50 }), true);
  assert.equal(yahooRetrievalLimited({ totalAvailable: null, returnedCount: 3, requested: 50 }), false);
});
