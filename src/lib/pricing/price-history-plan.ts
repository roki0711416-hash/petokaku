import type { AdaptedYahooProduct } from "../sources/yahoo/adapter.ts";
import type { CategoryId, PackUnit, QuantityConfidence, QuantitySource, ShippingStatus, StockStatus } from "../types.ts";
import type { QuantityUnit, UnitPriceType } from "./calculate.ts";
import { decidePriceWrite, tokyoObservationDate, type CommercialState, type StoredPriceObservation } from "./decide-price-write.ts";

export const pilotListingKey = {
  janCode: "3182550849647",
  provider: "yahoo",
  sellerId: "1096dog",
  itemCode: "1096dog_50676",
} as const;

export type VerifiedListing = {
  observedAt: string;
  product: {
    name: string;
    brand: string;
    category: CategoryId;
    unitPriceType: UnitPriceType;
  };
  variant: {
    janCode: string;
    sizeLabel: string;
    statedQuantity: number | null;
    statedUnit: QuantityUnit | null;
    quantity: number | null;
    quantityUnit: QuantityUnit | null;
    quantityConfidence: QuantityConfidence;
    quantitySource: QuantitySource | null;
    modelNumber: string | null;
  };
  offer: {
    provider: "yahoo";
    sellerId: string;
    itemCode: string;
    shopName: string;
    productUrl: string | null;
    listingTitle: string | null;
    packCount: number | null;
    packUnit: PackUnit | null;
  };
  observation: CommercialState;
};

export type PriceHistoryCatalog = {
  variant: { id: string; productId: string } | null;
  offer: { id: string; variantId: string } | null;
  observations: StoredPriceObservation[];
};

type NewRef = { kind: "new" };
type ExistingRef = { kind: "existing"; id: string };
type ParentRef = NewRef | ExistingRef;

export type ProductInsert = {
  name: string;
  brand: string;
  category: CategoryId;
  unit_price_type: UnitPriceType;
  created_at: string;
  updated_at: string;
};

export type VariantInsert = {
  product_id: ParentRef;
  jan_code: string;
  size_label: string;
  stated_quantity: number | null;
  stated_unit: QuantityUnit | null;
  quantity: number | null;
  quantity_unit: QuantityUnit | null;
  quantity_confidence: QuantityConfidence;
  quantity_source: QuantitySource | null;
  model_number: string | null;
  created_at: string;
  updated_at: string;
};

export type OfferInsert = {
  variant_id: ParentRef;
  provider: "yahoo";
  seller_id: string;
  item_code: string;
  shop_name: string;
  product_url: string | null;
  listing_title: string | null;
  pack_count: number | null;
  pack_unit: PackUnit | null;
  created_at: string;
  updated_at: string;
};

export type ObservationInsert = {
  offer_id: ParentRef;
  provider: "yahoo";
  jan_code: string;
  seller_id: string;
  item_code: string;
  price: number | null;
  shipping_fee: number | null;
  shipping_status: ShippingStatus;
  stock_status: StockStatus;
  observed_at: string;
  last_confirmed_at: string;
  observed_on: string;
};

export type PriceHistoryPlan =
  | {
      ok: true;
      product: { action: "insert"; row: ProductInsert } | { action: "reuse"; id: string };
      variant: { action: "insert"; row: VariantInsert } | { action: "reuse"; id: string };
      offer: { action: "insert"; row: OfferInsert } | { action: "reuse"; id: string };
      price:
        | { action: "insert"; row: ObservationInsert }
        | { action: "confirm"; id: string; lastConfirmedAt: string; observedOn: string };
    }
  | { ok: false; reason: string };

const quantityUnits = new Set(["g", "kg", "ml", "l", "sheet", "piece"]);
const packUnits = new Set(["袋", "個", "本", "パック"]);

function validJan(value: string): boolean {
  return /^[0-9]{13}$/.test(value);
}

function shippingConsistent(fee: number | null, status: ShippingStatus): boolean {
  if (status === "free") {
    return fee === 0;
  }
  if (status === "conditional_free" || status === "unknown") {
    return fee === null;
  }
  return fee != null && fee > 0;
}

function integerOrNull(value: number | null): boolean {
  return value === null || (Number.isInteger(value) && value >= 0);
}

export function isPilotListing(listing: VerifiedListing): boolean {
  return (
    listing.variant.janCode === pilotListingKey.janCode &&
    listing.offer.provider === pilotListingKey.provider &&
    listing.offer.sellerId === pilotListingKey.sellerId &&
    listing.offer.itemCode === pilotListingKey.itemCode
  );
}

export function pilotOfferIndex(adapted: AdaptedYahooProduct): number {
  return adapted.detail.offers.findIndex((offer) => {
    return (
      adapted.detail.janCode === pilotListingKey.janCode &&
      offer.provider === pilotListingKey.provider &&
      offer.sellerId === pilotListingKey.sellerId &&
      offer.itemCode === pilotListingKey.itemCode &&
      offer.stockStatus === "in_stock" &&
      (offer.packCount == null || offer.packCount === 1) &&
      typeof offer.price === "number" &&
      Number.isInteger(offer.price) &&
      offer.price >= 0 &&
      shippingConsistent(offer.shippingFee, offer.shippingStatus)
    );
  });
}

export function verifiedListingFromAdapted(adapted: AdaptedYahooProduct, observedAt: string): VerifiedListing | null {
  const index = pilotOfferIndex(adapted);
  if (index < 0) {
    return null;
  }
  const offer = adapted.detail.offers[index];
  if (!offer?.sellerId || !offer.itemCode || adapted.variant.janCode !== pilotListingKey.janCode) {
    return null;
  }
  return {
    observedAt,
    product: {
      name: offer.listingTitle?.trim() || adapted.product.name.trim(),
      brand: adapted.product.brand.trim(),
      category: adapted.product.category,
      unitPriceType: adapted.product.unitPriceType,
    },
    variant: {
      janCode: adapted.variant.janCode,
      sizeLabel: adapted.variant.sizeLabel,
      statedQuantity: adapted.variant.statedQuantity,
      statedUnit: adapted.variant.statedUnit,
      quantity: adapted.variant.quantity,
      quantityUnit: adapted.variant.quantityUnit,
      quantityConfidence: adapted.variant.quantityConfidence,
      quantitySource: adapted.variant.quantitySource,
      modelNumber: adapted.variant.modelNumber,
    },
    offer: {
      provider: "yahoo",
      sellerId: offer.sellerId,
      itemCode: offer.itemCode,
      shopName: offer.shopName,
      productUrl: offer.productUrl,
      listingTitle: offer.listingTitle,
      packCount: offer.packCount,
      packUnit: offer.packUnit,
    },
    observation: {
      price: offer.price,
      shippingFee: offer.shippingFee,
      shippingStatus: offer.shippingStatus,
      stockStatus: offer.stockStatus,
    },
  };
}

export function listingsForJanDetail(urlJan: string, adapted: AdaptedYahooProduct, observedAt: string): VerifiedListing[] {
  if (!validJan(urlJan) || adapted.variant.janCode !== urlJan || adapted.detail.janCode !== urlJan) {
    return [];
  }
  const name = adapted.product.name.trim();
  const sizeLabel = adapted.variant.sizeLabel.trim();
  if (!name || !sizeLabel) {
    return [];
  }
  const listings: VerifiedListing[] = [];
  for (const offer of adapted.detail.offers) {
    const sellerId = offer.sellerId?.trim() ?? "";
    const itemCode = offer.itemCode?.trim() ?? "";
    if (offer.provider !== "yahoo" || !sellerId || !itemCode || !offer.shopName.trim()) {
      continue;
    }
    if (!integerOrNull(offer.price) || !integerOrNull(offer.shippingFee)) {
      continue;
    }
    if (!shippingConsistent(offer.shippingFee, offer.shippingStatus)) {
      continue;
    }
    if (offer.packUnit && !packUnits.has(offer.packUnit)) {
      continue;
    }
    if (offer.packCount != null && (!Number.isInteger(offer.packCount) || offer.packCount < 1)) {
      continue;
    }
    listings.push({
      observedAt,
      product: {
        name,
        brand: adapted.product.brand.trim(),
        category: adapted.product.category,
        unitPriceType: adapted.product.unitPriceType,
      },
      variant: {
        janCode: urlJan,
        sizeLabel,
        statedQuantity: adapted.variant.statedQuantity,
        statedUnit: adapted.variant.statedUnit,
        quantity: adapted.variant.quantity,
        quantityUnit: adapted.variant.quantityUnit,
        quantityConfidence: adapted.variant.quantityConfidence,
        quantitySource: adapted.variant.quantitySource,
        modelNumber: adapted.variant.modelNumber,
      },
      offer: {
        provider: "yahoo",
        sellerId,
        itemCode,
        shopName: offer.shopName.trim(),
        productUrl: offer.productUrl,
        listingTitle: offer.listingTitle,
        packCount: offer.packCount,
        packUnit: offer.packUnit,
      },
      observation: {
        price: offer.price,
        shippingFee: offer.shippingFee,
        shippingStatus: offer.shippingStatus,
        stockStatus: offer.stockStatus,
      },
    });
  }
  return listings;
}

export type JanPriceSaveSummary = {
  targets: number;
  inserted: number;
  confirmed: number;
  failed: number;
};

export async function settlePriceHistorySaves(
  listings: VerifiedListing[],
  commit: (listing: VerifiedListing) => Promise<"insert" | "confirm">,
): Promise<JanPriceSaveSummary> {
  const summary: JanPriceSaveSummary = { targets: listings.length, inserted: 0, confirmed: 0, failed: 0 };
  for (const listing of listings) {
    try {
      const action = await commit(listing);
      if (action === "confirm") {
        summary.confirmed += 1;
      } else {
        summary.inserted += 1;
      }
    } catch {
      summary.failed += 1;
    }
  }
  return summary;
}

export function planPriceHistorySave(listing: VerifiedListing, catalog: PriceHistoryCatalog): PriceHistoryPlan {
  if (!validJan(listing.variant.janCode)) {
    return { ok: false, reason: "JANが13桁として確認できていません" };
  }
  if (!listing.offer.sellerId.trim() || !listing.offer.itemCode.trim()) {
    return { ok: false, reason: "掲載の販売者IDと商品コードが確認できていません" };
  }
  if (!listing.product.name.trim() || !listing.variant.sizeLabel.trim() || !listing.offer.shopName.trim()) {
    return { ok: false, reason: "商品名、容量、ショップ名が確認できていません" };
  }
  if (!integerOrNull(listing.observation.price) || !integerOrNull(listing.observation.shippingFee)) {
    return { ok: false, reason: "価格または送料が確認できていません" };
  }
  if (!shippingConsistent(listing.observation.shippingFee, listing.observation.shippingStatus)) {
    return { ok: false, reason: "送料の金額と状態が一致していません" };
  }
  if (listing.variant.statedUnit && !quantityUnits.has(listing.variant.statedUnit)) {
    return { ok: false, reason: "容量の単位が確認できていません" };
  }
  if (listing.variant.quantityUnit && !quantityUnits.has(listing.variant.quantityUnit)) {
    return { ok: false, reason: "容量の単位が確認できていません" };
  }
  if (listing.offer.packUnit && !packUnits.has(listing.offer.packUnit)) {
    return { ok: false, reason: "個数の単位が確認できていません" };
  }
  if (listing.offer.packCount != null && (!Number.isInteger(listing.offer.packCount) || listing.offer.packCount < 1)) {
    return { ok: false, reason: "個数が確認できていません" };
  }
  if (!catalog.variant && catalog.offer) {
    return { ok: false, reason: "同じ掲載が別の商品に紐づいているため保存しません" };
  }
  if (catalog.offer && catalog.variant && catalog.offer.variantId !== catalog.variant.id) {
    return { ok: false, reason: "同じ掲載が別の容量に紐づいているため保存しません" };
  }
  if (!catalog.offer && catalog.observations.length > 0) {
    return { ok: false, reason: "掲載がない価格履歴は保存しません" };
  }

  const decision = decidePriceWrite({
    now: listing.observedAt,
    observations: catalog.offer ? catalog.observations : [],
    next: listing.observation,
  });
  if (decision.action === "confirm") {
    const current = catalog.observations.find((observation) => observation.id === decision.observationId);
    if (!current || listing.observedAt < current.observedAt) {
      return { ok: false, reason: "確認時刻が既存の観測より前です" };
    }
  }

  const product = catalog.variant
    ? { action: "reuse" as const, id: catalog.variant.productId }
    : {
        action: "insert" as const,
        row: {
          name: listing.product.name.trim(),
          brand: listing.product.brand.trim(),
          category: listing.product.category,
          unit_price_type: listing.product.unitPriceType,
          created_at: listing.observedAt,
          updated_at: listing.observedAt,
        },
      };
  const variant = catalog.variant
    ? { action: "reuse" as const, id: catalog.variant.id }
    : {
        action: "insert" as const,
        row: {
          product_id: { kind: "new" as const },
          jan_code: listing.variant.janCode,
          size_label: listing.variant.sizeLabel,
          stated_quantity: listing.variant.statedQuantity,
          stated_unit: listing.variant.statedUnit,
          quantity: listing.variant.quantity,
          quantity_unit: listing.variant.quantityUnit,
          quantity_confidence: listing.variant.quantityConfidence,
          quantity_source: listing.variant.quantitySource,
          model_number: listing.variant.modelNumber,
          created_at: listing.observedAt,
          updated_at: listing.observedAt,
        },
      };
  const offer = catalog.offer
    ? { action: "reuse" as const, id: catalog.offer.id }
    : {
        action: "insert" as const,
        row: {
          variant_id: catalog.variant ? { kind: "existing" as const, id: catalog.variant.id } : { kind: "new" as const },
          provider: "yahoo" as const,
          seller_id: listing.offer.sellerId,
          item_code: listing.offer.itemCode,
          shop_name: listing.offer.shopName,
          product_url: listing.offer.productUrl,
          listing_title: listing.offer.listingTitle,
          pack_count: listing.offer.packCount,
          pack_unit: listing.offer.packUnit,
          created_at: listing.observedAt,
          updated_at: listing.observedAt,
        },
      };
  const offerRef: ParentRef = catalog.offer ? { kind: "existing", id: catalog.offer.id } : { kind: "new" };
  const price =
    decision.action === "confirm"
      ? { action: "confirm" as const, id: decision.observationId, lastConfirmedAt: listing.observedAt, observedOn: decision.observedOn }
      : {
          action: "insert" as const,
          row: {
            offer_id: offerRef,
            provider: "yahoo" as const,
            jan_code: listing.variant.janCode,
            seller_id: listing.offer.sellerId,
            item_code: listing.offer.itemCode,
            price: listing.observation.price,
            shipping_fee: listing.observation.shippingFee,
            shipping_status: listing.observation.shippingStatus,
            stock_status: listing.observation.stockStatus,
            observed_at: listing.observedAt,
            last_confirmed_at: listing.observedAt,
            observed_on: decision.observedOn,
          },
        };

  if (price.action === "insert" && price.row.observed_on !== tokyoObservationDate(listing.observedAt)) {
    return { ok: false, reason: "日本時間の日付が確認できていません" };
  }

  return { ok: true, product, variant, offer, price };
}

export type ResolvedObservationInsert = Omit<ObservationInsert, "offer_id"> & { offer_id: string };
export type ResolvedVariantInsert = Omit<VariantInsert, "product_id"> & { product_id: string };
export type ResolvedOfferInsert = Omit<OfferInsert, "variant_id"> & { variant_id: string };

export type PriceHistoryWriter = {
  insertProduct(row: ProductInsert): Promise<string>;
  insertVariant(row: ResolvedVariantInsert): Promise<string>;
  insertOffer(row: ResolvedOfferInsert): Promise<string>;
  insertObservation(row: ResolvedObservationInsert): Promise<string>;
  confirmObservation(id: string, lastConfirmedAt: string): Promise<void>;
};

export async function applyPriceHistoryPlan(writer: PriceHistoryWriter, plan: Extract<PriceHistoryPlan, { ok: true }>): Promise<void> {
  const productId = plan.product.action === "insert" ? await writer.insertProduct(plan.product.row) : plan.product.id;
  const variantId =
    plan.variant.action === "insert"
      ? await writer.insertVariant({ ...plan.variant.row, product_id: productId })
      : plan.variant.id;
  const offerId =
    plan.offer.action === "insert" ? await writer.insertOffer({ ...plan.offer.row, variant_id: variantId }) : plan.offer.id;
  if (plan.price.action === "insert") {
    await writer.insertObservation({ ...plan.price.row, offer_id: offerId });
    return;
  }
  await writer.confirmObservation(plan.price.id, plan.price.lastConfirmedAt);
}
