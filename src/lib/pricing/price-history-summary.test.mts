import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { summarizePriceHistory, type PriceHistoryOffer } from "./price-history-summary.ts";

const now = "2026-10-05T07:00:00.000Z";

function offer(id: string, overrides: Partial<PriceHistoryOffer> = {}): PriceHistoryOffer {
  return {
    id,
    packCount: null,
    listingTitle: "ロイヤルカナン ミニ インドア アダルト 4kg",
    observations: [],
    ...overrides,
  };
}

function observation(id: string, price: number, overrides: Partial<PriceHistoryOffer["observations"][number]> = {}) {
  return {
    id,
    price,
    shippingFee: 0,
    shippingStatus: "free" as const,
    stockStatus: "in_stock" as const,
    observedAt: "2026-10-05T06:00:00.000Z",
    ...overrides,
  };
}

test("セットと極端に高い掲載を通常商品の現在価格と平均に混ぜない", () => {
  const summary = summarizePriceHistory({
    now,
    offers: [
      offer("single-unknown", {
        observations: [observation("a", 5130, { shippingFee: null, shippingStatus: "unknown" })],
      }),
      offer("single-free", {
        observations: [observation("b", 5720)],
      }),
      offer("set", {
        packCount: 4,
        listingTitle: "【4kg×4袋】ロイヤルカナン ミニ インドア アダルト",
        observations: [observation("c", 23931)],
      }),
    ],
  });
  assert.equal(summary.currentSellingPrice, 5130);
  assert.equal(summary.currentSellingShippingKnown, false);
  assert.equal(summary.currentShippingTotal, 5720);
  assert.equal(summary.low30SellingPrice, 5130);
  assert.equal(summary.low30ShippingTotal, 5720);
  assert.equal(summary.average30SellingPrice, 5130);
  assert.equal(summary.average30ShippingTotal, 5720);
  assert.equal(summary.excludedSetOffers, 1);
  assert.equal(summary.singleUnitOffers, 2);
  assert.equal(summary.observedDays, 1);
  assert.equal(summary.sufficiency, "accumulating");
  assert.equal(summary.previousSellingPrice, null);
  assert.equal(summary.priceDifference, null);
  assert.equal(summary.changeRate, null);
});

test("送料不明を0円にしない", () => {
  const summary = summarizePriceHistory({
    now,
    offers: [
      offer("unknown", {
        observations: [observation("a", 1000, { shippingFee: null, shippingStatus: "unknown" })],
      }),
    ],
  });
  assert.equal(summary.currentSellingPrice, 1000);
  assert.equal(summary.currentSellingShippingKnown, false);
  assert.equal(summary.currentShippingTotal, null);
  assert.equal(summary.low30ShippingTotal, null);
  assert.equal(summary.average30ShippingTotal, null);
});

test("在庫切れと欠測日は平均に入れない", () => {
  const summary = summarizePriceHistory({
    now,
    offers: [
      offer("shop", {
        observations: [
          observation("day1", 5000, { observedAt: "2026-10-03T01:00:00.000Z" }),
          observation("oos", 1000, { observedAt: "2026-10-04T01:00:00.000Z", stockStatus: "out_of_stock" }),
          observation("day3", 4700, { observedAt: "2026-10-05T01:00:00.000Z" }),
        ],
      }),
    ],
  });
  assert.equal(summary.observedDays, 2);
  assert.equal(summary.average30SellingPrice, 4850);
  assert.equal(summary.sufficiency, "reference");
  assert.equal(summary.low30SellingPrice, 4700);
  assert.equal(summary.currentSellingPrice, 4700);
});

test("同じ日は最後の在庫あり価格を1点にする", () => {
  const summary = summarizePriceHistory({
    now,
    offers: [
      offer("shop", {
        observations: [
          observation("morning", 6000, { observedAt: "2026-10-05T01:00:00.000Z" }),
          observation("noon", 5800, { observedAt: "2026-10-05T03:00:00.000Z" }),
          observation("confirm-same", 5800, { id: "confirm-same", observedAt: "2026-10-05T03:00:00.000Z" }),
        ],
      }),
    ],
  });
  assert.equal(summary.average30SellingPrice, 5800);
  assert.equal(summary.observedDays, 1);
});

test("同じ価格の継続は価格変化にしない", () => {
  const summary = summarizePriceHistory({
    now,
    offers: [
      offer("shop", {
        observations: [
          observation("old", 6000, { observedAt: "2026-10-01T01:00:00.000Z" }),
          observation("same-next-day", 5500, { observedAt: "2026-10-03T01:00:00.000Z" }),
          observation("today", 5500, { observedAt: "2026-10-05T01:00:00.000Z" }),
        ],
      }),
    ],
  });
  assert.equal(summary.currentSellingPrice, 5500);
  assert.equal(summary.previousSellingPrice, 6000);
  assert.equal(summary.priceDifference, -500);
  assert.equal(summary.changeRate, -500 / 6000);
  assert.equal(summary.observedDays, 3);
  assert.equal(summary.sufficiency, "reference");
});

test("7日分あれば30日比較できる", () => {
  const summary = summarizePriceHistory({
    now,
    offers: [
      offer("shop", {
        observations: [1, 2, 3, 4, 5, 6, 7].map((day) =>
          observation(`d${day}`, 4000 + day, { observedAt: `2026-09-${String(22 + day).padStart(2, "0")}T01:00:00.000Z` }),
        ),
      }),
    ],
  });
  assert.equal(summary.observedDays, 7);
  assert.equal(summary.sufficiency, "comparable");
});

test("商品詳細だけが価格履歴を読み、失敗しても比較表示は残る", () => {
  const page = readFileSync(new URL("../../app/products/jan/[jan]/page.tsx", import.meta.url), "utf8");
  const search = readFileSync(new URL("../../app/search/page.tsx", import.meta.url), "utf8");
  const preview = readFileSync(new URL("../../app/products/yahoo-preview/page.tsx", import.meta.url), "utf8");
  assert.match(page, /loadJanPriceView/);
  assert.match(page, /priceSummary = null/);
  const loadAt = page.indexOf("loadJanPriceView");
  const viewAt = page.indexOf("<YahooProductView");
  assert.ok(loadAt > 0 && viewAt > loadAt);
  assert.doesNotMatch(search, /loadJanPriceView|loadJanPriceHistorySummary|summarizePriceHistory/);
  assert.doesNotMatch(preview, /loadJanPriceView|loadJanPriceHistorySummary|priceSummary/);
});
