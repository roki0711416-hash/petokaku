import { formatAsOf, formatYen } from "../format.ts";
import { tokyoObservationDate } from "./decide-price-write.ts";
import { priceHistorySeriesDays } from "./price-history-summary.ts";
import { consecutiveChartSegments, type ChartValue } from "./price-chart.ts";
import { cheapestPrices, partitionShopComparison } from "./shop-compare.ts";
import { payableTotal } from "./visible-offers.ts";
import type { ShippingStatus, StockStatus } from "../types.ts";

export type RankedShippingPoint = {
  date: string;
  total: number;
  observedAt: string;
};

export type StoredShippingOffer = {
  id: string;
  provider: string;
  sellerId: string | null;
  shopName: string | null;
  packCount: number | null;
  listingTitle: string | null;
  observations: {
    id: string;
    price: number | null;
    shippingFee: number | null;
    shippingStatus: ShippingStatus;
    stockStatus: StockStatus;
    observedAt: string;
  }[];
};

export type LiveShippingOffer = {
  provider: string;
  sellerId?: string | null;
  shopName?: string | null;
  packCount: number | null;
  listingTitle: string | null;
  price: number | null;
  shippingFee: number | null;
  stockStatus: StockStatus;
  priceCheckedAt?: string | null;
};

export type ShippingHistoryPresentation = {
  total: number | null;
  checkedAt: string | null;
  asOfLabel: string | null;
  headline: string | null;
  points: ChartValue[];
  showChart: boolean;
};

function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function tokyoDateOrNull(value: string): string | null {
  try {
    return tokyoObservationDate(value);
  } catch {
    return null;
  }
}

function latestTime(values: readonly (string | null | undefined)[]): string | null {
  const valid = values.filter((value): value is string => {
    if (!value) {
      return false;
    }
    return !Number.isNaN(Date.parse(value));
  });
  valid.sort((left, right) => left.localeCompare(right));
  return valid.at(-1) ?? null;
}

function shortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}

export function shippingChartLabel(points: readonly ChartValue[]): string {
  const described = points.map((point) => `${shortDate(point.date)} ${formatYen(point.value)}`).join("、");
  return `送料込み最安の記録。${described}。欠けている日は線でつなぎません。`;
}

export function shippingChartSegments(points: readonly ChartValue[]): ChartValue[][] {
  return consecutiveChartSegments([...points]);
}

export function rankedShippingPoints(input: { now: string; offers: readonly StoredShippingOffer[]; days?: number }): RankedShippingPoint[] {
  const days = priceHistorySeriesDays(input.days ?? 90);
  const today = tokyoObservationDate(input.now);
  const windowStart = addCalendarDays(today, -(days - 1));
  const byDay = new Map<string, LiveShippingOffer[]>();

  for (const offer of input.offers) {
    const latestByDay = new Map<string, StoredShippingOffer["observations"][number]>();
    for (const observation of offer.observations) {
      const observedOn = tokyoDateOrNull(observation.observedAt);
      if (!observedOn || observedOn < windowStart || observedOn > today) {
        continue;
      }
      const current = latestByDay.get(observedOn);
      if (
        !current ||
        observation.observedAt.localeCompare(current.observedAt) > 0 ||
        (observation.observedAt === current.observedAt && observation.id.localeCompare(current.id) > 0)
      ) {
        latestByDay.set(observedOn, observation);
      }
    }
    for (const [date, observation] of latestByDay) {
      const rows = byDay.get(date) ?? [];
      rows.push({
        provider: offer.provider,
        sellerId: offer.sellerId,
        shopName: offer.shopName,
        packCount: offer.packCount,
        listingTitle: offer.listingTitle,
        price: observation.price,
        shippingFee: observation.shippingFee,
        stockStatus: observation.stockStatus,
        priceCheckedAt: observation.observedAt,
      });
      byDay.set(date, rows);
    }
  }

  const points: RankedShippingPoint[] = [];
  for (const [date, offers] of byDay) {
    const ranked = partitionShopComparison([...offers]).ranked;
    const total = cheapestPrices(ranked).shippingTotal;
    if (total == null) {
      continue;
    }
    const winners = ranked.filter((offer) => payableTotal(offer) === total);
    const observedAt = latestTime(winners.map((offer) => offer.priceCheckedAt)) ?? latestTime(ranked.map((offer) => offer.priceCheckedAt));
    if (!observedAt) {
      continue;
    }
    points.push({ date, total, observedAt });
  }
  return points.sort((left, right) => left.date.localeCompare(right.date) || left.observedAt.localeCompare(right.observedAt));
}

export function presentShippingHistory(input: {
  offers: readonly LiveShippingOffer[];
  history: readonly RankedShippingPoint[];
  fetchedAt: string | null;
}): ShippingHistoryPresentation {
  const ranked = partitionShopComparison([...input.offers]).ranked;
  const total = cheapestPrices(ranked).shippingTotal;
  const winners = total == null ? [] : ranked.filter((offer) => payableTotal(offer) === total);
  const checkedAt =
    latestTime(winners.map((offer) => offer.priceCheckedAt)) ??
    latestTime(input.offers.map((offer) => offer.priceCheckedAt)) ??
    latestTime([input.fetchedAt]);
  let points = input.history.map((point) => ({ date: point.date, value: point.total }));
  const checkedDate = checkedAt ? tokyoDateOrNull(checkedAt) : null;
  if (checkedDate && input.offers.length > 0) {
    points = points.filter((point) => point.date !== checkedDate);
    if (total != null) {
      points.push({ date: checkedDate, value: total });
      points.sort((left, right) => left.date.localeCompare(right.date));
    }
  }
  const asOfLabel = formatAsOf(checkedAt);
  const headline =
    total != null && asOfLabel
      ? `最安（送料込み）${formatYen(total)}　${asOfLabel}`
      : total != null
        ? `最安（送料込み）${formatYen(total)}`
        : asOfLabel;
  return {
    total,
    checkedAt,
    asOfLabel,
    headline,
    points,
    showChart: points.length >= 2,
  };
}
