import { hasUnresolvedPackNotation } from "./pack-count.ts";
import { lowestShippingTotal, shippingInclusiveTotal } from "./calculate.ts";
import { tokyoObservationDate } from "./decide-price-write.ts";
import type { ShippingStatus, StockStatus } from "../types.ts";

// 1日は蓄積中。2日から6日は参考。7日以上で30日比較を出してよい。
export const priceHistoryDayThresholds = {
  referenceFromDays: 2,
  comparableFromDays: 7,
  windowDays: 30,
} as const;

export type PriceHistorySufficiency = "accumulating" | "reference" | "comparable";

export type PriceHistoryObservation = {
  id: string;
  price: number | null;
  shippingFee: number | null;
  shippingStatus: ShippingStatus;
  stockStatus: StockStatus;
  observedAt: string;
};

export type PriceHistoryOffer = {
  id: string;
  packCount: number | null;
  listingTitle: string | null;
  observations: PriceHistoryObservation[];
};

export type PriceHistorySummary = {
  currentSellingPrice: number | null;
  currentShippingTotal: number | null;
  currentSellingShippingKnown: boolean;
  low30SellingPrice: number | null;
  low30ShippingTotal: number | null;
  average30SellingPrice: number | null;
  average30ShippingTotal: number | null;
  previousSellingPrice: number | null;
  priceDifference: number | null;
  changeRate: number | null;
  observedDays: number;
  sufficiency: PriceHistorySufficiency;
  singleUnitOffers: number;
  excludedSetOffers: number;
};

type PricedObservation = PriceHistoryObservation & { offerId: string };
type DatedObservation = PricedObservation & { observedOn: string };

function isSingleUnit(offer: PriceHistoryOffer): boolean {
  return (offer.packCount == null || offer.packCount === 1) && !hasUnresolvedPackNotation(offer.listingTitle ?? "");
}

function comparableShippingFee(fee: number | null, status: ShippingStatus): number | null {
  if (status === "free" && fee === 0) {
    return 0;
  }
  if (status === "amount" && fee != null && fee > 0) {
    return fee;
  }
  return null;
}

function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function priceHistorySufficiency(observedDays: number): PriceHistorySufficiency {
  if (observedDays >= priceHistoryDayThresholds.comparableFromDays) {
    return "comparable";
  }
  if (observedDays >= priceHistoryDayThresholds.referenceFromDays) {
    return "reference";
  }
  return "accumulating";
}

function latestObservation(observations: PriceHistoryObservation[]): PriceHistoryObservation | null {
  return [...observations].sort((left, right) => right.observedAt.localeCompare(left.observedAt) || right.id.localeCompare(left.id))[0] ?? null;
}

function mean(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function summarizePriceHistory(input: { now: string; offers: PriceHistoryOffer[] }): PriceHistorySummary {
  const today = tokyoObservationDate(input.now);
  const windowStart = addCalendarDays(today, -(priceHistoryDayThresholds.windowDays - 1));
  const singleOffers = input.offers.filter(isSingleUnit);
  const excludedSetOffers = input.offers.length - singleOffers.length;
  const dated: DatedObservation[] = singleOffers.flatMap((offer) =>
    offer.observations.map((observation) => ({
      ...observation,
      offerId: offer.id,
      observedOn: tokyoObservationDate(observation.observedAt),
    })),
  );
  const inWindow = dated.filter((observation) => observation.observedOn >= windowStart && observation.observedOn <= today);
  const inStockWindow = inWindow.filter((observation) => observation.stockStatus === "in_stock" && observation.price != null);

  const currentCandidates = singleOffers.flatMap((offer) => {
    const latest = latestObservation(offer.observations);
    if (!latest || latest.stockStatus !== "in_stock" || latest.price == null) {
      return [];
    }
    return [{ ...latest, offerId: offer.id }];
  });
  const currentSelling = currentCandidates.reduce<PricedObservation | null>((best, observation) => {
    if (!best) {
      return observation;
    }
    const price = observation.price ?? Number.POSITIVE_INFINITY;
    const bestPrice = best.price ?? Number.POSITIVE_INFINITY;
    if (price < bestPrice) {
      return observation;
    }
    if (price === bestPrice && comparableShippingFee(observation.shippingFee, observation.shippingStatus) != null && comparableShippingFee(best.shippingFee, best.shippingStatus) == null) {
      return observation;
    }
    return best;
  }, null);
  const currentShipping = lowestShippingTotal(
    currentCandidates.map((observation) => ({
      price: observation.price,
      shipping: comparableShippingFee(observation.shippingFee, observation.shippingStatus),
    })),
  );

  const low30SellingPrice = inStockWindow.reduce<number | null>((best, observation) => {
    if (observation.price == null) {
      return best;
    }
    return best == null || observation.price < best ? observation.price : best;
  }, null);
  const low30ShippingTotal = inStockWindow.reduce<number | null>((best, observation) => {
    const total = shippingInclusiveTotal(observation.price, comparableShippingFee(observation.shippingFee, observation.shippingStatus));
    if (total == null) {
      return best;
    }
    return best == null || total < best ? total : best;
  }, null);

  const byDay = new Map<string, DatedObservation[]>();
  for (const observation of inStockWindow) {
    const rows = byDay.get(observation.observedOn) ?? [];
    rows.push(observation);
    byDay.set(observation.observedOn, rows);
  }
  const dailySelling: number[] = [];
  const dailyShipping: number[] = [];
  for (const rows of byDay.values()) {
    const lastByOffer = new Map<string, DatedObservation>();
    for (const observation of rows) {
      const current = lastByOffer.get(observation.offerId);
      if (!current || observation.observedAt.localeCompare(current.observedAt) > 0 || (observation.observedAt === current.observedAt && observation.id.localeCompare(current.id) > 0)) {
        lastByOffer.set(observation.offerId, observation);
      }
    }
    const lastRows = [...lastByOffer.values()];
    const selling = lastRows.reduce<number | null>((best, observation) => {
      if (observation.price == null) {
        return best;
      }
      return best == null || observation.price < best ? observation.price : best;
    }, null);
    if (selling != null) {
      dailySelling.push(selling);
    }
    const shipping = lowestShippingTotal(
      lastRows.map((observation) => ({
        price: observation.price,
        shipping: comparableShippingFee(observation.shippingFee, observation.shippingStatus),
      })),
    );
    if (shipping) {
      dailyShipping.push(shipping.total);
    }
  }

  const currentOfferHistory = dated
    .filter((observation) => observation.offerId === currentSelling?.offerId)
    .sort((left, right) => right.observedAt.localeCompare(left.observedAt) || right.id.localeCompare(left.id));
  let previousSellingPrice: number | null = null;
  for (const observation of currentOfferHistory) {
    if (observation.price == null || observation.price === currentSelling?.price) {
      continue;
    }
    previousSellingPrice = observation.price;
    break;
  }
  const priceDifference =
    currentSelling?.price != null && previousSellingPrice != null ? currentSelling.price - previousSellingPrice : null;
  const changeRate = priceDifference != null && previousSellingPrice ? priceDifference / previousSellingPrice : null;

  return {
    currentSellingPrice: currentSelling?.price ?? null,
    currentShippingTotal: currentShipping?.total ?? null,
    currentSellingShippingKnown: currentSelling != null && comparableShippingFee(currentSelling.shippingFee, currentSelling.shippingStatus) != null,
    low30SellingPrice,
    low30ShippingTotal,
    average30SellingPrice: mean(dailySelling),
    average30ShippingTotal: mean(dailyShipping),
    previousSellingPrice,
    priceDifference,
    changeRate,
    observedDays: byDay.size,
    sufficiency: priceHistorySufficiency(byDay.size),
    singleUnitOffers: singleOffers.length,
    excludedSetOffers,
  };
}

export type DailyPricePoint = {
  date: string;
  sellingPrice: number;
  shippingTotal: number | null;
};

export function priceHistorySeriesDays(days: number | undefined): number {
  if (days == null || !Number.isInteger(days) || days < 1) {
    return priceHistoryDayThresholds.windowDays;
  }
  return Math.min(days, 90);
}

export function priceHistoryDailySeries(input: { now: string; offers: PriceHistoryOffer[]; days?: number }): DailyPricePoint[] {
  const days = priceHistorySeriesDays(input.days);
  const today = tokyoObservationDate(input.now);
  const windowStart = addCalendarDays(today, -(days - 1));
  const rows = input.offers
    .filter(isSingleUnit)
    .flatMap((offer) =>
      offer.observations.map((observation) => ({
        ...observation,
        offerId: offer.id,
        observedOn: tokyoObservationDate(observation.observedAt),
      })),
    )
    .filter((observation) => observation.observedOn >= windowStart && observation.observedOn <= today)
    .filter((observation) => observation.stockStatus === "in_stock" && observation.price != null);
  const byDay = new Map<string, DatedObservation[]>();
  for (const observation of rows) {
    const dayRows = byDay.get(observation.observedOn) ?? [];
    dayRows.push(observation);
    byDay.set(observation.observedOn, dayRows);
  }
  const points: DailyPricePoint[] = [];
  for (const [date, dayRows] of byDay) {
    const lastByOffer = new Map<string, DatedObservation>();
    for (const observation of dayRows) {
      const current = lastByOffer.get(observation.offerId);
      if (!current || observation.observedAt.localeCompare(current.observedAt) > 0 || (observation.observedAt === current.observedAt && observation.id.localeCompare(current.id) > 0)) {
        lastByOffer.set(observation.offerId, observation);
      }
    }
    const lastRows = [...lastByOffer.values()];
    const sellingPrice = lastRows.reduce<number | null>((best, observation) => {
      if (observation.price == null) {
        return best;
      }
      return best == null || observation.price < best ? observation.price : best;
    }, null);
    if (sellingPrice == null) {
      continue;
    }
    const shipping = lowestShippingTotal(
      lastRows.map((observation) => ({
        price: observation.price,
        shipping: comparableShippingFee(observation.shippingFee, observation.shippingStatus),
      })),
    );
    points.push({ date, sellingPrice, shippingTotal: shipping?.total ?? null });
  }
  return points.sort((left, right) => left.date.localeCompare(right.date));
}
