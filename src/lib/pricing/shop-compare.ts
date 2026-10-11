import { hasUnresolvedPackNotation, salesUnitGroupHeading, salesUnitGroupNote, salesUnitSort } from "./pack-count.ts";
import { payableTotal } from "./visible-offers.ts";
import type { PackUnit } from "../types.ts";

export const initialCompareCount = 5;
export const comparePageStep = 10;

type PricedOffer = {
  price: number | null;
  shippingFee: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "unknown";
  packCount: number | null;
  listingTitle: string | null;
};

export function isPrimarySalesUnit(offer: { packCount: number | null; listingTitle: string | null }): boolean {
  return (offer.packCount == null || offer.packCount === 1) && !hasUnresolvedPackNotation(offer.listingTitle ?? "");
}

export function compareWindow(total: number, shown: number): { shown: number; next: number; remaining: number } {
  const visible = Math.min(Math.max(shown, 0), total);
  const remaining = total - visible;
  const next = Math.min(total, visible + comparePageStep);
  return { shown: visible, next, remaining };
}

function byPayableTotal<T extends { price: number | null; shippingFee: number | null }>(offers: T[]): T[] {
  return [...offers].sort(
    (left, right) => (payableTotal(left) ?? Number.POSITIVE_INFINITY) - (payableTotal(right) ?? Number.POSITIVE_INFINITY),
  );
}

function byItemPrice<T extends { price: number | null }>(offers: T[]): T[] {
  return [...offers].sort((left, right) => (left.price ?? Number.POSITIVE_INFINITY) - (right.price ?? Number.POSITIVE_INFINITY));
}

export function partitionShopComparison<T extends PricedOffer>(offers: T[]): {
  confirmed: T[];
  unknownShipping: T[];
  otherUnits: T[];
  unavailable: T[];
} {
  const confirmed: T[] = [];
  const unknownShipping: T[] = [];
  const otherUnits: T[] = [];
  const unavailable: T[] = [];

  for (const offer of offers) {
    if (!isPrimarySalesUnit(offer)) {
      otherUnits.push(offer);
      continue;
    }
    if (offer.stockStatus !== "in_stock") {
      unavailable.push(offer);
      continue;
    }
    if (payableTotal(offer) == null) {
      unknownShipping.push(offer);
      continue;
    }
    confirmed.push(offer);
  }

  return {
    confirmed: byPayableTotal(confirmed),
    unknownShipping: byItemPrice(unknownShipping),
    otherUnits,
    unavailable: byPayableTotal(unavailable),
  };
}

export type OtherUnitGroup<T> = {
  key: string;
  heading: string;
  note: string;
  offers: T[];
};

export function groupOtherSalesUnits<T extends PricedOffer & { packUnit: PackUnit | null }>(offers: T[]): OtherUnitGroup<T>[] {
  const buckets = new Map<string, T[]>();
  for (const offer of offers) {
    const key = offer.packCount == null ? "unknown" : String(offer.packCount);
    const grouped = buckets.get(key) ?? [];
    grouped.push(offer);
    buckets.set(key, grouped);
  }

  return [...buckets.entries()]
    .map(([key, grouped]) => {
      const packCount = key === "unknown" ? null : Number(key);
      const priced = grouped.filter((offer) => payableTotal(offer) != null);
      const unpriced = grouped.filter((offer) => payableTotal(offer) == null);
      return {
        key,
        heading: salesUnitGroupHeading(packCount, grouped.map((offer) => offer.packUnit)),
        note: salesUnitGroupNote(packCount),
        offers: [...byPayableTotal(priced), ...byItemPrice(unpriced)],
      };
    })
    .sort((left, right) => salesUnitSort(left.key === "unknown" ? null : Number(left.key)) - salesUnitSort(right.key === "unknown" ? null : Number(right.key)));
}
