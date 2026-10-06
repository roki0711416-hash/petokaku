import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { AdaptedYahooProduct } from "../sources/yahoo/adapter.ts";
import type { Offer } from "../types.ts";
import {
  applyPriceHistoryPlan,
  isPilotListing,
  listingsForJanDetail,
  pilotListingKey,
  pilotOfferIndex,
  planPriceHistorySave,
  settlePriceHistorySaves,
  verifiedListingFromAdapted,
  type PriceHistoryCatalog,
  type PriceHistoryWriter,
  type VerifiedListing,
} from "./price-history-plan.ts";

const observedAt = "2026-10-05T06:10:00.000Z";

function listing(overrides: {
  janCode?: string;
  sellerId?: string;
  itemCode?: string;
  price?: number | null;
  shippingFee?: number | null;
  shippingStatus?: VerifiedListing["observation"]["shippingStatus"];
  stockStatus?: VerifiedListing["observation"]["stockStatus"];
  observedAt?: string;
} = {}): VerifiedListing {
  return {
    observedAt: overrides.observedAt ?? observedAt,
    product: {
      name: "ロイヤルカナン ミニ インドア アダルト 4kg",
      brand: "サイズ ヘルス ニュートリション",
      category: "dog",
      unitPriceType: "per_100g",
    },
    variant: {
      janCode: overrides.janCode ?? pilotListingKey.janCode,
      sizeLabel: "4kg",
      statedQuantity: 4,
      statedUnit: "kg",
      quantity: 4000,
      quantityUnit: "g",
      quantityConfidence: "high",
      quantitySource: "shop_titles",
      modelNumber: null,
    },
    offer: {
      provider: "yahoo",
      sellerId: overrides.sellerId ?? pilotListingKey.sellerId,
      itemCode: overrides.itemCode ?? pilotListingKey.itemCode,
      shopName: "モコペットチャリティストア",
      productUrl: "https://store.shopping.yahoo.co.jp/example/item",
      listingTitle: "ロイヤルカナン ミニ インドア アダルト 4kg",
      packCount: null,
      packUnit: null,
    },
    observation: {
      price: overrides.price === undefined ? 5956 : overrides.price,
      shippingFee: overrides.shippingFee === undefined ? 0 : overrides.shippingFee,
      shippingStatus: overrides.shippingStatus ?? "free",
      stockStatus: overrides.stockStatus ?? "in_stock",
    },
  };
}

function emptyCatalog(): PriceHistoryCatalog {
  return { variant: null, offer: null, observations: [] };
}

function offer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: "off",
    variantId: "var",
    shopName: "モコペットチャリティストア",
    listingTitle: "ロイヤルカナン ミニ インドア アダルト 4kg",
    price: 5956,
    shippingFee: 0,
    productUrl: null,
    affiliateUrl: null,
    priceCheckedAt: observedAt,
    priceSnapshotId: null,
    shippingStatus: "free",
    stockStatus: "in_stock",
    source: "yahoo",
    provider: "yahoo",
    sellerId: pilotListingKey.sellerId,
    itemCode: pilotListingKey.itemCode,
    packCount: null,
    packUnit: null,
    totalQuantity: 4000,
    unitPriceReady: true,
    isSample: false,
    ...overrides,
  };
}

function adapted(offers: Offer[]): AdaptedYahooProduct {
  return {
    detail: { janCode: pilotListingKey.janCode, offers },
    product: {
      name: "別ショップの商品名",
      brand: "サイズ ヘルス ニュートリション",
      category: "dog",
      unitPriceType: "per_100g",
    },
    variant: {
      janCode: pilotListingKey.janCode,
      sizeLabel: "4kg",
      statedQuantity: 4,
      statedUnit: "kg",
      quantity: 4000,
      quantityUnit: "g",
      quantityConfidence: "high",
      quantitySource: "shop_titles",
      modelNumber: null,
    },
  } as AdaptedYahooProduct;
}

test("空のDBでは4テーブルとも新規で、今日の価格はinsert", () => {
  const plan = planPriceHistorySave(listing(), emptyCatalog());
  assert.equal(plan.ok, true);
  if (!plan.ok) {
    return;
  }
  assert.equal(plan.product.action, "insert");
  assert.equal(plan.variant.action, "insert");
  assert.equal(plan.offer.action, "insert");
  assert.equal(plan.price.action, "insert");
  if (plan.price.action !== "insert" || plan.variant.action !== "insert" || plan.offer.action !== "insert" || plan.product.action !== "insert") {
    return;
  }
  assert.equal(plan.product.row.brand, "サイズ ヘルス ニュートリション");
  assert.equal(plan.product.row.category, "dog");
  assert.equal(plan.product.row.unit_price_type, "per_100g");
  assert.equal(plan.variant.row.jan_code, "3182550849647");
  assert.equal(plan.variant.row.size_label, "4kg");
  assert.equal(plan.variant.row.product_id.kind, "new");
  assert.equal(plan.offer.row.provider, "yahoo");
  assert.equal(plan.offer.row.seller_id, "1096dog");
  assert.equal(plan.offer.row.item_code, "1096dog_50676");
  assert.equal(plan.offer.row.pack_count, null);
  assert.equal(plan.price.row.price, 5956);
  assert.equal(plan.price.row.shipping_fee, 0);
  assert.equal(plan.price.row.shipping_status, "free");
  assert.equal(plan.price.row.stock_status, "in_stock");
  assert.equal(plan.price.row.observed_on, "2026-10-05");
  assert.equal(plan.price.row.last_confirmed_at, observedAt);
  assert.equal(JSON.stringify(plan).includes("今は安い"), false);
});

test("同じJANが既にあればproductとvariantは再利用する", () => {
  const plan = planPriceHistorySave(listing(), {
    variant: { id: "variant-1", productId: "product-1" },
    offer: null,
    observations: [],
  });
  assert.equal(plan.ok, true);
  if (!plan.ok) {
    return;
  }
  assert.deepEqual(plan.product, { action: "reuse", id: "product-1" });
  assert.deepEqual(plan.variant, { action: "reuse", id: "variant-1" });
  assert.equal(plan.offer.action, "insert");
  if (plan.offer.action === "insert") {
    assert.deepEqual(plan.offer.row.variant_id, { kind: "existing", id: "variant-1" });
  }
});

test("同じ掲載で今日の状態が同じならlast_confirmed_atだけ更新する", () => {
  const plan = planPriceHistorySave(listing(), {
    variant: { id: "variant-1", productId: "product-1" },
    offer: { id: "offer-1", variantId: "variant-1" },
    observations: [
      {
        id: "obs-1",
        observedAt: "2026-10-05T01:00:00.000Z",
        price: 5956,
        shippingFee: 0,
        shippingStatus: "free",
        stockStatus: "in_stock",
      },
    ],
  });
  assert.equal(plan.ok, true);
  if (!plan.ok) {
    return;
  }
  assert.equal(plan.product.action, "reuse");
  assert.equal(plan.variant.action, "reuse");
  assert.equal(plan.offer.action, "reuse");
  assert.deepEqual(plan.price, {
    action: "confirm",
    id: "obs-1",
    lastConfirmedAt: observedAt,
    observedOn: "2026-10-05",
  });
});

test("同じ掲載でも価格が変わっていれば新しい観測をinsertする", () => {
  const plan = planPriceHistorySave(listing({ price: 5800 }), {
    variant: { id: "variant-1", productId: "product-1" },
    offer: { id: "offer-1", variantId: "variant-1" },
    observations: [
      {
        id: "obs-1",
        observedAt: "2026-10-05T01:00:00.000Z",
        price: 5956,
        shippingFee: 0,
        shippingStatus: "free",
        stockStatus: "in_stock",
      },
    ],
  });
  assert.equal(plan.ok, true);
  if (!plan.ok || plan.price.action !== "insert") {
    return;
  }
  assert.equal(plan.price.row.price, 5800);
  assert.deepEqual(plan.price.row.offer_id, { kind: "existing", id: "offer-1" });
});

test("日本時間で日付が変われば同じ価格でもinsertする", () => {
  const plan = planPriceHistorySave(listing({ observedAt: "2026-10-05T15:30:00.000Z" }), {
    variant: { id: "variant-1", productId: "product-1" },
    offer: { id: "offer-1", variantId: "variant-1" },
    observations: [
      {
        id: "obs-1",
        observedAt: "2026-10-05T14:30:00.000Z",
        price: 5956,
        shippingFee: 0,
        shippingStatus: "free",
        stockStatus: "in_stock",
      },
    ],
  });
  assert.equal(plan.ok, true);
  if (!plan.ok || plan.price.action !== "insert") {
    return;
  }
  assert.equal(plan.price.row.observed_on, "2026-10-06");
});

test("送料不明は0円にしない", () => {
  const plan = planPriceHistorySave(listing({ shippingFee: null, shippingStatus: "unknown" }), emptyCatalog());
  assert.equal(plan.ok, true);
  if (!plan.ok || plan.price.action !== "insert") {
    return;
  }
  assert.equal(plan.price.row.shipping_fee, null);
  assert.equal(plan.price.row.shipping_status, "unknown");
});

test("13桁の別JANは保存でき、販売者不明やURLのJAN不一致は保存しない", () => {
  assert.equal(planPriceHistorySave(listing({ janCode: "3182550849654" }), emptyCatalog()).ok, true);
  assert.equal(planPriceHistorySave(listing({ janCode: "123" }), emptyCatalog()).ok, false);
  assert.equal(planPriceHistorySave(listing({ sellerId: " " }), emptyCatalog()).ok, false);
  assert.equal(isPilotListing(listing()), true);
  const offers = [
    offer({ sellerId: "other", itemCode: "cheaper", price: 5130, shopName: "別ショップ" }),
    offer(),
    offer({ sellerId: pilotListingKey.sellerId, itemCode: "1096dog_set", packCount: 2, packUnit: "個", price: 11184 }),
    offer({ sellerId: null, itemCode: "missing-seller" }),
  ];
  const listings = listingsForJanDetail(pilotListingKey.janCode, adapted(offers), observedAt);
  assert.deepEqual(
    listings.map((item) => item.offer.itemCode),
    ["cheaper", pilotListingKey.itemCode, "1096dog_set"],
  );
  assert.equal(listingsForJanDetail("3182550849654", adapted(offers), observedAt).length, 0);
  assert.equal(listingsForJanDetail("not-a-jan", adapted(offers), observedAt).length, 0);
});

test("別容量に紐づく掲載は保存しない", () => {
  const plan = planPriceHistorySave(listing(), {
    variant: { id: "variant-1", productId: "product-1" },
    offer: { id: "offer-1", variantId: "variant-other" },
    observations: [],
  });
  assert.equal(plan.ok, false);
});

test("対象掲載は1件だけで、セットや他ショップは選ばない", () => {
  const offers = [
    offer({ sellerId: "other", itemCode: "cheaper", price: 5130 }),
    offer(),
    offer({ sellerId: pilotListingKey.sellerId, itemCode: "1096dog_set", packCount: 2, packUnit: "個", price: 11184 }),
  ];
  assert.equal(pilotOfferIndex(adapted(offers)), 1);
  const selected = verifiedListingFromAdapted(adapted(offers), observedAt);
  assert.equal(selected?.offer.itemCode, pilotListingKey.itemCode);
  assert.equal(selected?.offer.packCount, null);
  assert.equal(selected?.observation.price, 5956);
});

test("対象掲載がセットなら保存対象にしない", () => {
  assert.equal(pilotOfferIndex(adapted([offer({ packCount: 2, packUnit: "袋" })])), -1);
  assert.equal(verifiedListingFromAdapted(adapted([offer({ packCount: 2, packUnit: "袋" })]), observedAt), null);
});

test("価格履歴の保存は商品詳細の取得済みデータだけを使い、検索一覧では保存しない", () => {
  const page = readFileSync(new URL("../../app/products/jan/[jan]/page.tsx", import.meta.url), "utf8");
  const search = readFileSync(new URL("../../app/search/page.tsx", import.meta.url), "utf8");
  const saver = readFileSync(new URL("../supabase/save-price-history.ts", import.meta.url), "utf8");
  assert.match(page, /saveDisplayedJanPrices\(jan, result\.adapted\)/);
  assert.doesNotMatch(page, /searchYahooItems/);
  assert.doesNotMatch(search, /saveDisplayedJanPrices|commitPriceHistorySave/);
  assert.doesNotMatch(saver, /searchYahooItems|loadYahooJan/);
  assert.match(saver, /import "server-only"/);
});

test("1件の保存失敗でも残りの掲載は続け、例外にしない", async () => {
  const listings = [listing({ itemCode: "first" }), listing({ itemCode: "second" }), listing()];
  const summary = await settlePriceHistorySaves(listings, async (item) => {
    if (item.offer.itemCode === "second") {
      throw new Error("保存に失敗しました");
    }
    return item.offer.itemCode === "first" ? "insert" : "confirm";
  });
  assert.deepEqual(summary, { targets: 3, inserted: 1, confirmed: 1, failed: 1 });
});

test("新規計画は4件のinsertで、confirmは確認時刻だけを書く", async () => {
  const calls: string[] = [];
  const writer: PriceHistoryWriter = {
    async insertProduct() {
      calls.push("product");
      return "product-id";
    },
    async insertVariant(row) {
      calls.push(`variant:${row.product_id}`);
      return "variant-id";
    },
    async insertOffer(row) {
      calls.push(`offer:${row.variant_id}`);
      return "offer-id";
    },
    async insertObservation(row) {
      calls.push(`observation:${row.offer_id}:${row.price}`);
      return "observation-id";
    },
    async confirmObservation(id, lastConfirmedAt) {
      calls.push(`confirm:${id}:${lastConfirmedAt}`);
    },
  };
  const inserted = planPriceHistorySave(listing(), emptyCatalog());
  assert.equal(inserted.ok, true);
  if (!inserted.ok) {
    return;
  }
  await applyPriceHistoryPlan(writer, inserted);
  assert.deepEqual(calls, ["product", "variant:product-id", "offer:variant-id", "observation:offer-id:5956"]);

  calls.length = 0;
  const confirmed = planPriceHistorySave(listing(), {
    variant: { id: "variant-1", productId: "product-1" },
    offer: { id: "offer-1", variantId: "variant-1" },
    observations: [
      {
        id: "obs-1",
        observedAt: "2026-10-05T01:00:00.000Z",
        price: 5956,
        shippingFee: 0,
        shippingStatus: "free",
        stockStatus: "in_stock",
      },
    ],
  });
  assert.equal(confirmed.ok, true);
  if (!confirmed.ok) {
    return;
  }
  await applyPriceHistoryPlan(writer, confirmed);
  assert.deepEqual(calls, [`confirm:obs-1:${observedAt}`]);
});
