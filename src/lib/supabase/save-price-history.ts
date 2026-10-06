import "server-only";

import {
  applyPriceHistoryPlan,
  listingsForJanDetail,
  planPriceHistorySave,
  settlePriceHistorySaves,
  type JanPriceSaveSummary,
  type PriceHistoryCatalog,
  type PriceHistoryWriter,
  type VerifiedListing,
} from "../pricing/price-history-plan.ts";
import type { StoredPriceObservation } from "../pricing/decide-price-write.ts";
import type { ShippingStatus, StockStatus } from "../types.ts";
import { getSupabaseServerClient } from "./server.ts";

type VariantRow = { id: string; product_id: string };
type OfferRow = { id: string; variant_id: string };
type ObservationRow = {
  id: string;
  price: number | null;
  shipping_fee: number | null;
  shipping_status: ShippingStatus;
  stock_status: StockStatus;
  observed_at: string;
};

function readFailed(): never {
  throw new Error("価格履歴の確認に失敗しました");
}

async function readCatalog(listing: VerifiedListing): Promise<PriceHistoryCatalog> {
  const supabase = getSupabaseServerClient();
  const variantResult = await supabase
    .from("variants")
    .select("id, product_id")
    .eq("jan_code", listing.variant.janCode)
    .maybeSingle();
  if (variantResult.error) {
    readFailed();
  }
  const variant = variantResult.data as VariantRow | null;

  const offerResult = await supabase
    .from("offers")
    .select("id, variant_id")
    .eq("provider", listing.offer.provider)
    .eq("seller_id", listing.offer.sellerId)
    .eq("item_code", listing.offer.itemCode)
    .maybeSingle();
  if (offerResult.error) {
    readFailed();
  }
  const offer = offerResult.data as OfferRow | null;

  if (!offer) {
    return {
      variant: variant ? { id: variant.id, productId: variant.product_id } : null,
      offer: null,
      observations: [],
    };
  }

  const observationResult = await supabase
    .from("price_observations")
    .select("id, price, shipping_fee, shipping_status, stock_status, observed_at")
    .eq("offer_id", offer.id);
  if (observationResult.error || !observationResult.data) {
    readFailed();
  }
  const observations = (observationResult.data as ObservationRow[]).map(
    (row): StoredPriceObservation => ({
      id: row.id,
      price: row.price,
      shippingFee: row.shipping_fee,
      shippingStatus: row.shipping_status,
      stockStatus: row.stock_status,
      observedAt: row.observed_at,
    }),
  );
  return {
    variant: variant ? { id: variant.id, productId: variant.product_id } : null,
    offer: { id: offer.id, variantId: offer.variant_id },
    observations,
  };
}

export async function previewPriceHistorySave(listing: VerifiedListing) {
  return planPriceHistorySave(listing, await readCatalog(listing));
}

function supabaseWriter(): PriceHistoryWriter {
  const supabase = getSupabaseServerClient();
  return {
    async insertProduct(row) {
      const result = await supabase.from("products").insert(row).select("id").single();
      if (result.error || !result.data?.id) {
        throw new Error("productsへの保存に失敗しました");
      }
      return String(result.data.id);
    },
    async insertVariant(row) {
      const result = await supabase.from("variants").insert(row).select("id").single();
      if (result.error || !result.data?.id) {
        throw new Error("variantsへの保存に失敗しました");
      }
      return String(result.data.id);
    },
    async insertOffer(row) {
      const result = await supabase.from("offers").insert(row).select("id").single();
      if (result.error || !result.data?.id) {
        throw new Error("offersへの保存に失敗しました");
      }
      return String(result.data.id);
    },
    async insertObservation(row) {
      const result = await supabase.from("price_observations").insert(row).select("id").single();
      if (result.error || !result.data?.id) {
        throw new Error("price_observationsへの保存に失敗しました");
      }
      return String(result.data.id);
    },
    async confirmObservation(id, lastConfirmedAt) {
      const result = await supabase.from("price_observations").update({ last_confirmed_at: lastConfirmedAt }).eq("id", id);
      if (result.error) {
        throw new Error("price_observationsの確認時刻の更新に失敗しました");
      }
    },
  };
}

export async function commitPriceHistorySave(listing: VerifiedListing): Promise<"insert" | "confirm"> {
  const plan = await previewPriceHistorySave(listing);
  if (!plan.ok) {
    throw new Error(plan.reason);
  }
  await applyPriceHistoryPlan(supabaseWriter(), plan);
  return plan.price.action;
}

export async function saveDisplayedJanPrices(
  urlJan: string,
  adapted: Parameters<typeof listingsForJanDetail>[1],
): Promise<JanPriceSaveSummary> {
  const observedAt = adapted.detail.latestCheckedAt ?? new Date().toISOString();
  return settlePriceHistorySaves(listingsForJanDetail(urlJan, adapted, observedAt), commitPriceHistorySave);
}
