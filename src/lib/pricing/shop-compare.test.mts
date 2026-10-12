import assert from "node:assert/strict";
import test from "node:test";
import { cheapestPrices, compareWindow, competitionRanks, confirmedPriceSummary, groupOtherSalesUnits, initialCompareCount, itemPriceGap, listingShopCounts, partitionShopComparison, sortComparedOffers } from "./shop-compare.ts";
import { payableTotal } from "./visible-offers.ts";
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
  sellerId?: string | null;
  shopName?: string;
}) {
  return {
    id: partial.id,
    price: partial.price,
    shippingFee: partial.shippingFee,
    provider: partial.provider ?? "yahoo",
    sellerId: partial.sellerId,
    shopName: partial.shopName,
    stockStatus: partial.stockStatus ?? "in_stock",
    packCount: partial.packCount ?? 1,
    packUnit: partial.packUnit ?? "個",
    listingTitle: partial.listingTitle ?? "商品 1個",
  };
}

test("楽天の実店舗はYahooと同じ本体価格順に入り、商品価格ナビは別枠のまま", () => {
  const parts = partitionShopComparison([
    offer({ id: "yahoo", price: 3000, shippingFee: 0, shopName: "Yahoo店", provider: "yahoo", sellerId: "yahoo-a" }),
    offer({ id: "rakuten-shop", price: 900, shippingFee: null, shopName: "楽天実店舗", provider: "rakuten", sellerId: "shop-a" }),
    offer({ id: "rakuten-named", price: 800, shippingFee: null, shopName: "店舗コードなし", provider: "rakuten", sellerId: null }),
    offer({ id: "navi", price: 100, shippingFee: null, shopName: "楽天市場", provider: "rakuten", sellerId: null, listingTitle: "商品価格ナビ" }),
  ]);
  assert.deepEqual(sortComparedOffers(parts.ranked, "item").map((item) => item.id), ["rakuten-named", "rakuten-shop", "yahoo"]);
  assert.deepEqual(parts.reference.map((item) => item.id), ["navi"]);
});

test("同じ価格ではモールではなくショップ名で並べる", () => {
  const ranked = sortComparedOffers(
    [
      offer({ id: "yahoo", price: 1000, shippingFee: null, shopName: "ん店", provider: "yahoo", sellerId: "y" }),
      offer({ id: "rakuten", price: 1000, shippingFee: null, shopName: "あ店", provider: "rakuten", sellerId: "r" }),
    ],
    "item",
  );
  assert.deepEqual(ranked.map((item) => item.id), ["rakuten", "yahoo"]);
});

test("同じショップの同じ商品だけを安値にまとめ、別商品は残す", () => {
  const parts = partitionShopComparison([
    offer({ id: "dear", price: 2000, shippingFee: 0, shopName: "A店", provider: "rakuten", sellerId: "shop-a", listingTitle: "【送料無料】湿度計" }),
    offer({ id: "cheap", price: 1200, shippingFee: null, shopName: "A店", provider: "rakuten", sellerId: "shop-a", listingTitle: "湿度計 送料無料" }),
    offer({ id: "other", price: 900, shippingFee: 0, shopName: "A店", provider: "rakuten", sellerId: "shop-a", listingTitle: "温度計" }),
    offer({ id: "set", price: 800, shippingFee: 0, shopName: "A店", provider: "rakuten", sellerId: "shop-a", packCount: 2, listingTitle: "湿度計 2個セット" }),
    offer({ id: "yahoo-same", price: 1500, shippingFee: 0, shopName: "Y店", provider: "yahoo", sellerId: "y", listingTitle: "湿度計" }),
    offer({ id: "yahoo-dup", price: 1800, shippingFee: 0, shopName: "Y店", provider: "yahoo", sellerId: "y", listingTitle: "湿度計" }),
  ]);
  assert.deepEqual(sortComparedOffers(parts.ranked, "item").map((item) => item.id), ["other", "cheap", "yahoo-same"]);
  assert.deepEqual(parts.otherUnits.map((item) => item.id), ["set"]);
});

test("本体価格順はモールと送料の状態を混ぜ、送料未確認も一覧に残す", () => {
  const parts = partitionShopComparison([
    offer({ id: "yahoo-known", price: 3000, shippingFee: 0 }),
    offer({ id: "yahoo-unknown", price: 1000, shippingFee: null }),
    offer({ id: "rakuten", price: 900, shippingFee: null, provider: "rakuten", sellerId: null, packCount: null, listingTitle: "商品価格ナビ" }),
    offer({ id: "rakuten-shop", price: 1200, shippingFee: null, provider: "rakuten", sellerId: "shop-a", listingTitle: "商品 1個" }),
    offer({ id: "set", price: 500, shippingFee: 0, packCount: 2, listingTitle: "商品 2個セット" }),
    offer({ id: "out", price: 100, shippingFee: 0, stockStatus: "out_of_stock" }),
  ]);
  const ranked = sortComparedOffers(parts.ranked, "item");
  assert.deepEqual(
    ranked.map((item) => item.id),
    ["yahoo-unknown", "rakuten-shop", "yahoo-known"],
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

test("最安バッジは本体価格と、送料が分かる合計を別々に見る", () => {
  const prices = cheapestPrices([
    offer({ id: "unknown-cheap", price: 1000, shippingFee: null }),
    offer({ id: "known-lower", price: 1800, shippingFee: 500 }),
    offer({ id: "known-higher", price: 2500, shippingFee: 0 }),
  ]);
  assert.deepEqual(prices, { itemPrice: 1000, shippingTotal: 2300 });
  const both = cheapestPrices([
    offer({ id: "same", price: 1000, shippingFee: 0 }),
    offer({ id: "tie", price: 1000, shippingFee: 0 }),
  ]);
  assert.deepEqual(both, { itemPrice: 1000, shippingTotal: 1000 });
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

test("確認できた最安とショップ数は在庫ありの実店舗だけで、参考価格と送料不明の合計は入れない", () => {
  const offers = [
    offer({ id: "low", price: 634, shippingFee: null, shopName: "カウモール", sellerId: "cow" }),
    offer({ id: "same-shop", price: 700, shippingFee: 0, shopName: "カウモール", sellerId: "cow", listingTitle: "別掲載" }),
    offer({ id: "high", price: 800, shippingFee: 0, shopName: "別店", sellerId: "other" }),
    offer({ id: "navi", price: 508, shippingFee: null, shopName: "楽天市場", provider: "rakuten", sellerId: null }),
    offer({ id: "set", price: 100, shippingFee: 0, shopName: "セット店", sellerId: "set", packCount: 2, listingTitle: "2個セット" }),
  ];
  const summary = confirmedPriceSummary(offers);
  assert.equal(summary.lowestPrice, 634);
  assert.equal(summary.shopCount, 2);
  assert.equal(itemPriceGap(800, summary.lowestPrice), 166);
  assert.equal(itemPriceGap(634, summary.lowestPrice), 0);
  assert.equal(itemPriceGap(null, summary.lowestPrice), null);
  assert.equal(payableTotal(offers[0]!), null);
});

test("同額は同じ順位にし、次の順位は飛ばす", () => {
  assert.deepEqual(
    competitionRanks(
      [
        { price: 100, shippingFee: 0 },
        { price: 100, shippingFee: 0 },
        { price: 120, shippingFee: 0 },
      ],
      "item",
    ),
    [1, 1, 3],
  );
});

test("送料込み順は合計が分かる掲載だけ順位を付け、送料不明は0円にしない", () => {
  assert.deepEqual(
    competitionRanks(
      [
        { price: 500, shippingFee: 100 },
        { price: 100, shippingFee: null },
        { price: 700, shippingFee: 0 },
      ],
      "total",
    ),
    [1, null, 2],
  );
});

test("件数は出品ごと、店舗数は同じ店舗を1件に数える", () => {
  assert.deepEqual(
    listingShopCounts([
      offer({ id: "a", price: 100, shippingFee: 0, sellerId: "same", shopName: "A店" }),
      offer({ id: "b", price: 200, shippingFee: 0, sellerId: "same", shopName: "A店", listingTitle: "別掲載" }),
      offer({ id: "c", price: 150, shippingFee: 0, provider: "rakuten", sellerId: "other", shopName: "B店" }),
    ]),
    { listingCount: 3, shopCount: 2 },
  );
});

test("Yahooの取得件数が総ヒットより少ないときは全店舗の最安としない", () => {
  assert.equal(yahooRetrievalLimited({ totalAvailable: 80, returnedCount: 50, requested: 50 }), true);
  assert.equal(yahooRetrievalLimited({ totalAvailable: 12, returnedCount: 12, requested: 50 }), false);
  assert.equal(yahooRetrievalLimited({ totalAvailable: null, returnedCount: 50, requested: 50 }), true);
  assert.equal(yahooRetrievalLimited({ totalAvailable: null, returnedCount: 3, requested: 50 }), false);
});
