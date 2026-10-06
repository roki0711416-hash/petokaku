import assert from "node:assert/strict";
import test from "node:test";
import { priceHistoryDailySeries, priceHistorySeriesDays, type PriceHistoryOffer } from "./price-history-summary.ts";

const now = "2026-10-05T07:00:00.000Z";

function offer(id: string, overrides: Partial<PriceHistoryOffer> = {}): PriceHistoryOffer {
  return {
    id,
    packCount: null,
    listingTitle: "ロイヤルカナン 4kg",
    observations: [],
    ...overrides,
  };
}

test("欠測日は埋めず、セットと送料不明を分ける", () => {
  const points = priceHistoryDailySeries({
    now,
    offers: [
      offer("single", {
        observations: [
          {
            id: "morning",
            price: 6000,
            shippingFee: 0,
            shippingStatus: "free",
            stockStatus: "in_stock",
            observedAt: "2026-10-03T01:00:00.000Z",
          },
          {
            id: "evening",
            price: 5800,
            shippingFee: 0,
            shippingStatus: "free",
            stockStatus: "in_stock",
            observedAt: "2026-10-03T08:00:00.000Z",
          },
          {
            id: "today-unknown",
            price: 5130,
            shippingFee: null,
            shippingStatus: "unknown",
            stockStatus: "in_stock",
            observedAt: "2026-10-05T01:00:00.000Z",
          },
        ],
      }),
      offer("known", {
        observations: [
          {
            id: "known",
            price: 5720,
            shippingFee: 0,
            shippingStatus: "free",
            stockStatus: "in_stock",
            observedAt: "2026-10-05T02:00:00.000Z",
          },
        ],
      }),
      offer("set", {
        packCount: 4,
        listingTitle: "【4kg×4袋】",
        observations: [
          {
            id: "set",
            price: 23931,
            shippingFee: 0,
            shippingStatus: "free",
            stockStatus: "in_stock",
            observedAt: "2026-10-05T03:00:00.000Z",
          },
        ],
      }),
    ],
  });
  assert.deepEqual(points, [
    { date: "2026-10-03", sellingPrice: 5800, shippingTotal: 5800 },
    { date: "2026-10-05", sellingPrice: 5130, shippingTotal: 5720 },
  ]);
});

test("30日では古い日を含めず、90日では含める", () => {
  const old = offer("old", {
    observations: [
      {
        id: "old",
        price: 4000,
        shippingFee: 0,
        shippingStatus: "free",
        stockStatus: "in_stock",
        observedAt: "2026-08-01T01:00:00.000Z",
      },
    ],
  });
  assert.equal(priceHistorySeriesDays(30), 30);
  assert.equal(priceHistorySeriesDays(90), 90);
  assert.equal(priceHistoryDailySeries({ now, offers: [old], days: 30 }).length, 0);
  assert.equal(priceHistoryDailySeries({ now, offers: [old], days: 90 })[0]?.sellingPrice, 4000);
});
