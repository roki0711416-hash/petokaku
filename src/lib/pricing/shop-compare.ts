import { hasUnresolvedPackNotation, salesUnitGroupHeading, salesUnitGroupNote, salesUnitSort } from "./pack-count.ts";
import { payableTotal } from "./visible-offers.ts";
import type { PackUnit } from "../types.ts";

export const initialCompareCount = 5;
export const comparePageStep = 10;

export type CompareSort = "item" | "total";

type PricedOffer = {
  price: number | null;
  shippingFee: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "unknown";
  packCount: number | null;
  listingTitle: string | null;
  provider: string;
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

export function sortComparedOffers<T extends { price: number | null; shippingFee: number | null }>(offers: T[], sort: CompareSort): T[] {
  if (sort === "item") {
    return byItemPrice(offers);
  }
  const known = byPayableTotal(offers.filter((offer) => payableTotal(offer) != null));
  const unknown = byItemPrice(offers.filter((offer) => payableTotal(offer) == null));
  return [...known, ...unknown];
}

export function partitionShopComparison<T extends PricedOffer>(offers: T[]): {
  ranked: T[];
  reference: T[];
  otherUnits: T[];
  unavailable: T[];
} {
  const ranked: T[] = [];
  const reference: T[] = [];
  const otherUnits: T[] = [];
  const unavailable: T[] = [];

  for (const offer of offers) {
    const referenceOffer = offer.provider === "rakuten";
    if (!isPrimarySalesUnit(offer)) {
      otherUnits.push(offer);
      continue;
    }
    if (offer.stockStatus !== "in_stock") {
      unavailable.push(offer);
      continue;
    }
    if (referenceOffer) {
      reference.push(offer);
      continue;
    }
    ranked.push(offer);
  }

  return { ranked, reference, otherUnits, unavailable };
}

export type OtherUnitGroup<T> = {
  key: string;
  heading: string;
  note: string;
  offers: T[];
};

export function groupOtherSalesUnits<T extends PricedOffer & { packUnit: PackUnit | null }>(
  offers: T[],
  sort: CompareSort = "item",
): OtherUnitGroup<T>[] {
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
      return {
        key,
        heading: salesUnitGroupHeading(packCount, grouped.map((offer) => offer.packUnit)),
        note: salesUnitGroupNote(packCount),
        offers: sortComparedOffers(grouped, sort),
      };
    })
    .sort((left, right) => salesUnitSort(left.key === "unknown" ? null : Number(left.key)) - salesUnitSort(right.key === "unknown" ? null : Number(right.key)));
}
