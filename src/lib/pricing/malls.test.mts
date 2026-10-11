import assert from "node:assert/strict";
import test from "node:test";
import { confirmedJanOffers, groupOffersByMall, offersComparableAsNew } from "./malls.ts";
import type { Offer } from "../types.ts";

function offer(patch: Partial<Offer> & Pick<Offer, "id" | "provider" | "shopName">): Offer {
  return {
    variantId: "prd",
    listingTitle: null,
    price: 1000,
    shippingFee: 0,
    productUrl: "https://example.com/item",
    affiliateUrl: null,
    priceCheckedAt: "2026-10-10T00:00:00.000Z",
    priceSnapshotId: null,
    shippingStatus: "free",
    stockStatus: "in_stock",
    source: patch.provider,
    sellerId: "seller",
    itemCode: "item",
    packCount: null,
    packUnit: null,
    totalQuantity: null,
    unitPriceReady: false,
    isSample: false,
    ...patch,
  };
}

test("掲載があるモールだけを出し、サンプルと未対応モールは出さない", () => {
  const groups = groupOffersByMall([
    offer({ id: "y1", provider: "yahoo", shopName: "A店", sellerId: "a" }),
    offer({ id: "y2", provider: "yahoo", shopName: "B店", sellerId: "b" }),
    offer({ id: "r1", provider: "rakuten", shopName: "C店", sellerId: "c" }),
    offer({ id: "s1", provider: "sample", shopName: "サンプル", sellerId: "s", isSample: true }),
  ]);
  assert.deepEqual(
    groups.map((group) => [group.mall, group.label, group.shopCount, group.offers.map((item) => item.id)]),
    [
      ["yahoo", "Yahoo!ショッピング", 2, ["y1", "y2"]],
      ["rakuten", "楽天市場", 1, ["r1"]],
    ],
  );
});

test("店舗別の楽天掲載と、中古を除いた商品価格ナビを上部の商品価格に入れる", () => {
  const yahoo = offer({ id: "y1", provider: "yahoo", shopName: "A店" });
  const shop = offer({ id: "rshop", provider: "rakuten", shopName: "楽天ショップ", sellerId: "shop", itemCode: "shop:1" });
  const naviNew = offer({ id: "r1", provider: "rakuten", shopName: "楽天市場", sellerId: null, itemCode: "new" });
  const naviMixed = offer({ id: "r2", provider: "rakuten", shopName: "楽天市場", sellerId: null, itemCode: null });
  assert.deepEqual(offersComparableAsNew([yahoo, shop, naviNew, naviMixed]).map((item) => item.id), ["y1", "rshop", "r1"]);
});

test("同じJANの掲載だけをまとめ、別JANとサンプルは落とす", () => {
  const merged = confirmedJanOffers("3182550849647", [
    { janCode: "3182550849647", offers: [offer({ id: "y1", provider: "yahoo", shopName: "A店" })] },
    { janCode: "3182550849654", offers: [offer({ id: "other", provider: "yahoo", shopName: "別容量" })] },
    { janCode: "3182550849647", offers: [offer({ id: "s1", provider: "sample", shopName: "サンプル", isSample: true })] },
    { janCode: null, offers: [offer({ id: "none", provider: "rakuten", shopName: "JANなし" })] },
  ]);
  assert.deepEqual(merged.map((item) => item.id), ["y1"]);
});
