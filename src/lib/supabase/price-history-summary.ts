import "server-only";

import {
  priceHistoryDailySeries,
  summarizePriceHistory,
  type DailyPricePoint,
  type PriceHistoryOffer,
  type PriceHistorySummary,
} from "../pricing/price-history-summary.ts";
import type { ShippingStatus, StockStatus } from "../types.ts";
import { getSupabaseServerClient } from "./server.ts";

type OfferRow = {
  id: string;
  pack_count: number | null;
  listing_title: string | null;
};

type ObservationRow = {
  id: string;
  offer_id: string;
  price: number | null;
  shipping_fee: number | null;
  shipping_status: ShippingStatus;
  stock_status: StockStatus;
  observed_at: string;
};

function readFailed(): never {
  throw new Error("価格履歴の集計に失敗しました");
}

async function loadGroupedOffers(janCode: string): Promise<PriceHistoryOffer[]> {
  if (!/^[0-9]{13}$/.test(janCode)) {
    throw new Error("JANが確認できていません");
  }
  const supabase = getSupabaseServerClient();
  const variantResult = await supabase.from("variants").select("id").eq("jan_code", janCode).maybeSingle();
  if (variantResult.error) {
    readFailed();
  }
  if (!variantResult.data?.id) {
    return [];
  }
  const offerResult = await supabase.from("offers").select("id, pack_count, listing_title").eq("variant_id", variantResult.data.id);
  if (offerResult.error || !offerResult.data) {
    readFailed();
  }
  const offers = offerResult.data as OfferRow[];
  const offerIds = offers.map((offer) => offer.id);
  const observationResult =
    offerIds.length === 0
      ? { data: [] as ObservationRow[], error: null }
      : await supabase
          .from("price_observations")
          .select("id, offer_id, price, shipping_fee, shipping_status, stock_status, observed_at")
          .in("offer_id", offerIds);
  if (observationResult.error || !observationResult.data) {
    readFailed();
  }
  const observations = observationResult.data as ObservationRow[];
  return offers.map((offer) => ({
    id: offer.id,
    packCount: offer.pack_count == null ? null : Number(offer.pack_count),
    listingTitle: offer.listing_title,
    observations: observations
      .filter((observation) => observation.offer_id === offer.id)
      .map((observation) => ({
        id: observation.id,
        price: observation.price,
        shippingFee: observation.shipping_fee,
        shippingStatus: observation.shipping_status,
        stockStatus: observation.stock_status,
        observedAt: observation.observed_at,
      })),
  }));
}

export async function loadJanPriceHistorySummary(janCode: string, now = new Date().toISOString()): Promise<PriceHistorySummary> {
  return summarizePriceHistory({ now, offers: await loadGroupedOffers(janCode) });
}

export async function loadJanPriceSeries(janCode: string, days = 30, now = new Date().toISOString()): Promise<DailyPricePoint[]> {
  return priceHistoryDailySeries({ now, offers: await loadGroupedOffers(janCode), days });
}

export async function loadJanPriceView(janCode: string, now = new Date().toISOString()): Promise<{
  summary: PriceHistorySummary;
  series: DailyPricePoint[];
}> {
  const offers = await loadGroupedOffers(janCode);
  return {
    summary: summarizePriceHistory({ now, offers }),
    series: priceHistoryDailySeries({ now, offers, days: 90 }),
  };
}
