import type { Offer } from "../types.ts";

export const comparisonMalls = ["yahoo", "rakuten"] as const;

export type ComparisonMall = (typeof comparisonMalls)[number];

const mallLabels: Record<ComparisonMall, string> = {
  yahoo: "Yahoo!ショッピング",
  rakuten: "楽天市場",
};

export function comparisonMallOf(offer: { provider: string; isSample: boolean }): ComparisonMall | null {
  if (offer.isSample) {
    return null;
  }
  if (offer.provider === "yahoo" || offer.provider === "rakuten") {
    return offer.provider;
  }
  return null;
}

export function groupOffersByMall<T extends { provider: string; isSample: boolean; sellerId: string | null; shopName: string }>(
  offers: T[],
): { mall: ComparisonMall; label: string; offers: T[]; shopCount: number }[] {
  const buckets = new Map<ComparisonMall, T[]>();
  for (const offer of offers) {
    const mall = comparisonMallOf(offer);
    if (!mall) {
      continue;
    }
    const grouped = buckets.get(mall) ?? [];
    grouped.push(offer);
    buckets.set(mall, grouped);
  }

  return comparisonMalls.flatMap((mall) => {
    const grouped = buckets.get(mall);
    if (!grouped || grouped.length === 0) {
      return [];
    }
    const shops = new Set(grouped.map((offer) => (offer.sellerId ? offer.sellerId : offer.shopName)));
    return [{ mall, label: mallLabels[mall], offers: grouped, shopCount: shops.size }];
  });
}

export function confirmedJanOffers(pageJan: string, batches: { janCode: string | null; offers: Offer[] }[]): Offer[] {
  if (!/^[0-9]{13}$/.test(pageJan)) {
    return [];
  }
  const seen = new Set<string>();
  const merged: Offer[] = [];
  for (const batch of batches) {
    if (batch.janCode !== pageJan) {
      continue;
    }
    for (const offer of batch.offers) {
      if (offer.isSample || seen.has(offer.id)) {
        continue;
      }
      seen.add(offer.id);
      merged.push(offer);
    }
  }
  return merged;
}
