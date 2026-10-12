import assert from "node:assert/strict";
import test from "node:test";
import type { Offer } from "../../types.ts";
import { rakutenComparisonDetail } from "./compare-detail.ts";

const observedAt = "2026-10-12T00:00:00.000Z";
const jan = "3182550706933";

function offer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: "off-a",
    variantId: "var",
    shopName: "A店",
    listingTitle: "ロイヤルカナン 4kg",
    price: 5980,
    shippingFee: 0,
    productUrl: "https://item.rakuten.co.jp/a/1/",
    affiliateUrl: "https://hb.afl.rakuten.co.jp/example",
    priceCheckedAt: observedAt,
    priceSnapshotId: null,
    shippingStatus: "free",
    stockStatus: "in_stock",
    source: "rakuten",
    provider: "rakuten",
    sellerId: "shop-a",
    itemCode: "a:1",
    packCount: 1,
    packUnit: null,
    totalQuantity: null,
    unitPriceReady: false,
    isSample: false,
    ...overrides,
  };
}

test("楽天の2ショップが同じ販売単位なら詳細を作る", () => {
  const first = offer();
  const detail = rakutenComparisonDetail(
    jan,
    [first, offer({ id: "off-b", shopName: "B店", sellerId: "shop-b", itemCode: "b:1", price: 6200 })],
    observedAt,
  );
  assert.equal(detail?.janCode, jan);
  assert.equal(detail?.offers[0]?.affiliateUrl, first.affiliateUrl);
  assert.equal(detail?.offers.length, 2);
});

test("1ショップや容量違いは楽天だけの詳細にしない", () => {
  assert.equal(rakutenComparisonDetail(jan, [offer()], observedAt), null);
  assert.equal(
    rakutenComparisonDetail(
      jan,
      [offer(), offer({ id: "off-b", shopName: "B店", sellerId: "shop-b", listingTitle: "ロイヤルカナン 8kg", price: 8000 })],
      observedAt,
    ),
    null,
  );
  assert.equal(
    rakutenComparisonDetail(
      jan,
      [offer(), offer({ id: "off-b", shopName: "A店", sellerId: "shop-a", itemCode: "a:2", price: 5900 })],
      observedAt,
    ),
    null,
  );
});
