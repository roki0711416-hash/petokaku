import { hasUnresolvedPackNotation, salesUnitGroupHeading, salesUnitGroupNote, salesUnitSort } from "./pack-count.ts";
import { payableTotal } from "./visible-offers.ts";
import type { PackUnit } from "../types.ts";

export const initialCompareCount = 5;
export const comparePageStep = 10;

export type CompareSort = "item" | "total";

type PricedOffer = {
  id?: string;
  shopName?: string | null;
  price: number | null;
  shippingFee: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "unknown";
  packCount: number | null;
  listingTitle: string | null;
  provider: string;
  sellerId?: string | null;
};

export function isRakutenReferencePrice(offer: { provider: string; sellerId?: string | null; shopName?: string | null }): boolean {
  if (offer.provider !== "rakuten") {
    return false;
  }
  if ((offer.sellerId ?? "").trim() !== "") {
    return false;
  }
  const shop = (offer.shopName ?? "").trim();
  return shop === "" || shop === "楽天市場";
}

export function isPrimarySalesUnit(offer: { packCount: number | null; listingTitle: string | null }): boolean {
  return (offer.packCount == null || offer.packCount === 1) && !hasUnresolvedPackNotation(offer.listingTitle ?? "");
}

export function itemPriceGap(price: number | null, lowest: number | null): number | null {
  if (price == null || lowest == null || !Number.isInteger(price) || !Number.isInteger(lowest) || price < 0 || lowest < 0) {
    return null;
  }
  return price - lowest;
}

export function confirmedPriceSummary<T extends PricedOffer>(offers: readonly T[]): { lowestPrice: number | null; shopCount: number } {
  const shops = new Set<string>();
  let lowestPrice: number | null = null;
  for (const offer of partitionShopComparison([...offers]).ranked) {
    if (offer.price == null || !Number.isInteger(offer.price) || offer.price <= 0) {
      continue;
    }
    if (lowestPrice == null || offer.price < lowestPrice) {
      lowestPrice = offer.price;
    }
    const shop = (offer.sellerId ?? "").trim() || (offer.shopName ?? "").trim();
    if (shop !== "") {
      shops.add(`${offer.provider}:${shop}`);
    }
  }
  return { lowestPrice, shopCount: shops.size };
}

export function compareWindow(total: number, shown: number): { shown: number; next: number; remaining: number } {
  const visible = Math.min(Math.max(shown, 0), total);
  const remaining = total - visible;
  const next = Math.min(total, visible + comparePageStep);
  return { shown: visible, next, remaining };
}

function tieBreak(left: { shopName?: string | null; id?: string }, right: { shopName?: string | null; id?: string }): number {
  const byShop = (left.shopName ?? "").localeCompare(right.shopName ?? "", "ja");
  if (byShop !== 0) {
    return byShop;
  }
  return (left.id ?? "").localeCompare(right.id ?? "");
}

function byPayableTotal<T extends { price: number | null; shippingFee: number | null; shopName?: string | null; id?: string }>(offers: T[]): T[] {
  return [...offers].sort((left, right) => {
    const byTotal = (payableTotal(left) ?? Number.POSITIVE_INFINITY) - (payableTotal(right) ?? Number.POSITIVE_INFINITY);
    return byTotal === 0 ? tieBreak(left, right) : byTotal;
  });
}

function byItemPrice<T extends { price: number | null; shopName?: string | null; id?: string }>(offers: T[]): T[] {
  return [...offers].sort((left, right) => {
    const byPrice = (left.price ?? Number.POSITIVE_INFINITY) - (right.price ?? Number.POSITIVE_INFINITY);
    return byPrice === 0 ? tieBreak(left, right) : byPrice;
  });
}

function listingIdentity(title: string | null): string {
  return (title ?? "")
    .normalize("NFKC")
    .replace(/【[^】]*】/g, "")
    .replace(/送料無料|送料込/g, "")
    .replace(/\s+/g, "")
    .slice(0, 80);
}

function sameShopKey(offer: PricedOffer): string | null {
  if (isRakutenReferencePrice(offer)) {
    return null;
  }
  const shop = (offer.sellerId ?? "").trim() || (offer.shopName ?? "").trim();
  if (shop === "") {
    return null;
  }
  const unit = isPrimarySalesUnit(offer) ? "primary" : `pack:${offer.packCount ?? "unknown"}`;
  return `${offer.provider}:${shop}:${unit}:${offer.stockStatus}:${listingIdentity(offer.listingTitle)}`;
}

export function collapseSameShopOffers<T extends PricedOffer>(offers: readonly T[]): T[] {
  const kept = new Map<string, T>();
  const passthrough: T[] = [];
  for (const offer of offers) {
    const key = sameShopKey(offer);
    if (key == null) {
      passthrough.push(offer);
      continue;
    }
    const current = kept.get(key);
    if (!current || (offer.price ?? Number.POSITIVE_INFINITY) < (current.price ?? Number.POSITIVE_INFINITY)) {
      kept.set(key, offer);
    }
  }
  return [...kept.values(), ...passthrough];
}

export function cheapestPrices<T extends { price: number | null; shippingFee: number | null }>(offers: T[]): {
  itemPrice: number | null;
  shippingTotal: number | null;
} {
  let itemPrice: number | null = null;
  let shippingTotal: number | null = null;
  for (const offer of offers) {
    if (offer.price != null && (itemPrice == null || offer.price < itemPrice)) {
      itemPrice = offer.price;
    }
    const total = payableTotal(offer);
    if (total != null && (shippingTotal == null || total < shippingTotal)) {
      shippingTotal = total;
    }
  }
  return { itemPrice, shippingTotal };
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

  for (const offer of collapseSameShopOffers(offers)) {
    if (isRakutenReferencePrice(offer)) {
      reference.push(offer);
      continue;
    }
    if (!isPrimarySalesUnit(offer)) {
      otherUnits.push(offer);
      continue;
    }
    if (offer.stockStatus !== "in_stock") {
      unavailable.push(offer);
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
