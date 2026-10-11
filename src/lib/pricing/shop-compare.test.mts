import assert from "node:assert/strict";
import test from "node:test";
import { compareWindow, groupOtherSalesUnits, initialCompareCount, partitionShopComparison, sortComparedOffers } from "./shop-compare.ts";
import { yahooRetrievalLimited } from "../sources/yahoo/search.ts";

function offer(partial: {
  id: string;
  price: number | null;
  shippingFee: number | null;
  provider?: string;
  stockStatus?: "in_stock" | "out_of_stock" | "unknown";
  packCount?: number | null;
  packUnit?: "個" | "袋" | "本" | "パック" | null;
  listingTitle?: string | null;
}) {
  return {
    id: partial.id,
    price: partial.price,
    shippingFee: partial.shippingFee,
    provider: partial.provider ?? "yahoo",
    stockStatus: partial.stockStatus ?? "in_stock",
    packCount: partial.packCount ?? 1,
    packUnit: partial.packUnit ?? "個",
    listingTitle: partial.listingTitle ?? "商品 1個",
  };
}

test("本体価格順はモールと送料の状態を混ぜ、送料未確認も一覧に残す", () => {
  const parts = partitionShopComparison([
    offer({ id: "yahoo-known", price: 3000, shippingFee: 0 }),
    offer({ id: "yahoo-unknown", price: 1000, shippingFee: null }),
    offer({ id: "rakuten", price: 900, shippingFee: null, provider: "rakuten", packCount: null, listingTitle: "商品価格ナビ" }),
    offer({ id: "set", price: 500, shippingFee: 0, packCount: 2, listingTitle: "商品 2個セット" }),
    offer({ id: "out", price: 100, shippingFee: 0, stockStatus: "out_of_stock" }),
  ]);
  const ranked = sortComparedOffers(parts.ranked, "item");
  assert.deepEqual(
    ranked.map((item) => item.id),
    ["yahoo-unknown", "yahoo-known"],
  );
  assert.deepEqual(parts.reference.map((item) => item.id), ["rakuten"]);
  assert.deepEqual(parts.otherUnits.map((item) => item.id), ["set"]);
  assert.deepEqual(parts.unavailable.map((item) => item.id), ["out"]);
});

test("送料込み順は確認できた合計を先にし、送料未確認を0円にしない", () => {
  const ranked = sortComparedOffers(
    [
      offer({ id: "unknown-cheap", price: 1000, shippingFee: null }),
      offer({ id: "known-higher", price: 2500, shippingFee: 0 }),
      offer({ id: "known-lower", price: 1800, shippingFee: 500 }),
    ],
    "total",
  );
  assert.deepEqual(
    ranked.map((item) => item.id),
    ["known-lower", "known-higher", "unknown-cheap"],
  );
  assert.equal(ranked[0]?.price, 1800);
});

test("最初の5件に本体価格の最安を含め、表示を切っても判定対象は全件", () => {
  const offers = Array.from({ length: 12 }, (_, index) => offer({ id: `s${index}`, price: 2000 - index * 10, shippingFee: index % 2 === 0 ? 0 : null }));
  const ranked = sortComparedOffers(partitionShopComparison(offers).ranked, "item");
  const firstPage = ranked.slice(0, initialCompareCount);
  assert.equal(firstPage[0]?.id, ranked[0]?.id);
  assert.equal(ranked[0]?.price, 1890);
  assert.equal(compareWindow(ranked.length, initialCompareCount).next, 12);
});

test("もっと見るは10件ずつ増やす", () => {
  assert.equal(compareWindow(30, 5).next, 15);
  assert.equal(compareWindow(30, 15).next, 25);
  assert.equal(compareWindow(30, 25).next, 30);
});

test("セットは個数ごとに分け、指定した順で並べる", () => {
  const groups = groupOtherSalesUnits(
    [
      offer({ id: "two-dear", price: 4000, shippingFee: 0, packCount: 2, listingTitle: "2個セット" }),
      offer({ id: "two-cheap", price: 2000, shippingFee: null, packCount: 2, listingTitle: "2個セット" }),
      offer({ id: "four", price: 8000, shippingFee: 0, packCount: 4, packUnit: "袋", listingTitle: "4袋セット" }),
    ],
    "item",
  );
  assert.deepEqual(
    groups.map((group) => group.key),
    ["2", "4"],
  );
  assert.deepEqual(groups[0]?.offers.map((item) => item.id), ["two-cheap", "two-dear"]);
});

test("Yahooの取得件数が総ヒットより少ないときは全店舗の最安としない", () => {
  assert.equal(yahooRetrievalLimited({ totalAvailable: 80, returnedCount: 50, requested: 50 }), true);
  assert.equal(yahooRetrievalLimited({ totalAvailable: 12, returnedCount: 12, requested: 50 }), false);
  assert.equal(yahooRetrievalLimited({ totalAvailable: null, returnedCount: 50, requested: 50 }), true);
  assert.equal(yahooRetrievalLimited({ totalAvailable: null, returnedCount: 3, requested: 50 }), false);
});
