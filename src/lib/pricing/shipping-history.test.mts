import assert from "node:assert/strict";
import test from "node:test";
import { formatAsOf, formatYen } from "../format.ts";
import { cheapestPrices, partitionShopComparison } from "./shop-compare.ts";
import { presentShippingHistory, rankedShippingPoints, type StoredShippingOffer } from "./shipping-history.ts";

const now = "2026-11-21T21:00:00.000Z";

function stored(id: string, overrides: Partial<StoredShippingOffer> = {}): StoredShippingOffer {
  return {
    id,
    provider: "yahoo",
    sellerId: id,
    shopName: id,
    packCount: null,
    listingTitle: "ドッグフード 4kg",
    observations: [],
    ...overrides,
  };
}

test("取得時刻は日本時間で、時のゼロ埋めをしない", () => {
  assert.equal(formatAsOf("2026-11-21T21:00:00.000Z"), "2026年11月22日 6:00時点");
  assert.equal(formatAsOf("not-a-time"), null);
});

test("送料込み最安は商品ページの順位と同じ掲載だけを日ごとに残す", () => {
  const points = rankedShippingPoints({
    now,
    offers: [
      stored("free", {
        observations: [
          {
            id: "d1",
            price: 5000,
            shippingFee: 0,
            shippingStatus: "free",
            stockStatus: "in_stock",
            observedAt: "2026-11-20T21:00:00.000Z",
          },
          {
            id: "d2-early",
            price: 4900,
            shippingFee: 0,
            shippingStatus: "free",
            stockStatus: "in_stock",
            observedAt: "2026-11-21T16:00:00.000Z",
          },
          {
            id: "d2-late",
            price: 4700,
            shippingFee: 200,
            shippingStatus: "amount",
            stockStatus: "in_stock",
            observedAt: "2026-11-21T21:00:00.000Z",
          },
        ],
      }),
      stored("unknown", {
        observations: [
          {
            id: "unknown",
            price: 4300,
            shippingFee: null,
            shippingStatus: "unknown",
            stockStatus: "in_stock",
            observedAt: "2026-11-21T21:00:00.000Z",
          },
        ],
      }),
      stored("set", {
        packCount: 4,
        listingTitle: "【4kg×4袋】",
        observations: [
          {
            id: "set",
            price: 3000,
            shippingFee: 0,
            shippingStatus: "free",
            stockStatus: "in_stock",
            observedAt: "2026-11-21T21:00:00.000Z",
          },
        ],
      }),
      stored("reference", {
        provider: "rakuten",
        sellerId: null,
        shopName: "楽天市場",
        observations: [
          {
            id: "reference",
            price: 1000,
            shippingFee: 0,
            shippingStatus: "free",
            stockStatus: "in_stock",
            observedAt: "2026-11-21T21:00:00.000Z",
          },
        ],
      }),
      stored("out", {
        observations: [
          {
            id: "out",
            price: 1000,
            shippingFee: 0,
            shippingStatus: "free",
            stockStatus: "out_of_stock",
            observedAt: "2026-11-21T21:00:00.000Z",
          },
        ],
      }),
    ],
  });
  const todayOffers = [
    { provider: "yahoo", sellerId: "free", shopName: "free", packCount: null, listingTitle: "ドッグフード 4kg", price: 4700, shippingFee: 200, stockStatus: "in_stock" as const },
    { provider: "yahoo", sellerId: "unknown", shopName: "unknown", packCount: null, listingTitle: "ドッグフード 4kg", price: 4300, shippingFee: null, stockStatus: "in_stock" as const },
    { provider: "yahoo", sellerId: "set", shopName: "set", packCount: 4, listingTitle: "【4kg×4袋】", price: 3000, shippingFee: 0, stockStatus: "in_stock" as const },
    { provider: "rakuten", sellerId: null, shopName: "楽天市場", packCount: null, listingTitle: "参考", price: 1000, shippingFee: 0, stockStatus: "in_stock" as const },
    { provider: "yahoo", sellerId: "out", shopName: "out", packCount: null, listingTitle: "ドッグフード 4kg", price: 1000, shippingFee: 0, stockStatus: "out_of_stock" as const },
  ];
  assert.equal(cheapestPrices(partitionShopComparison(todayOffers).ranked).shippingTotal, 4900);
  assert.deepEqual(
    points.map((point) => [point.date, point.total]),
    [
      ["2026-11-21", 5000],
      ["2026-11-22", 4900],
    ],
  );
});

test("2点未満ではグラフを出さず、いまの最安と取得時刻は残す", () => {
  const hidden = presentShippingHistory({
    fetchedAt: now,
    history: [],
    offers: [
      {
        provider: "yahoo",
        sellerId: "shop",
        shopName: "ショップ",
        packCount: null,
        listingTitle: "ドッグフード 4kg",
        price: 4480,
        shippingFee: 0,
        stockStatus: "in_stock",
        priceCheckedAt: now,
      },
    ],
  });
  assert.equal(hidden.showChart, false);
  assert.equal(hidden.total, 4480);
  assert.equal(hidden.headline, `最安（送料込み）${formatYen(4480)}　2026年11月22日 6:00時点`);

  const shown = presentShippingHistory({
    fetchedAt: now,
    history: [{ date: "2026-11-21", total: 4600, observedAt: "2026-11-20T21:00:00.000Z" }],
    offers: [
      {
        provider: "yahoo",
        sellerId: "shop",
        shopName: "ショップ",
        packCount: null,
        listingTitle: "ドッグフード 4kg",
        price: 4480,
        shippingFee: 0,
        stockStatus: "in_stock",
        priceCheckedAt: now,
      },
    ],
  });
  assert.equal(shown.showChart, true);
  assert.deepEqual(
    shown.points.map((point) => point.value),
    [4600, 4480],
  );
});
