export const initialOfferCount = 5;

type ComparableOffer = {
  price: number | null;
  shippingFee: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "unknown";
};

export function payableTotal(offer: { price: number | null; shippingFee: number | null }): number | null {
  if (offer.price == null || offer.shippingFee == null) {
    return null;
  }
  return offer.price + offer.shippingFee;
}

function byPayableTotal<T extends { price: number | null; shippingFee: number | null }>(offers: T[]): T[] {
  const known = offers
    .filter((offer) => payableTotal(offer) != null)
    .sort((left, right) => (payableTotal(left) ?? 0) - (payableTotal(right) ?? 0));
  const unknownShipping = offers
    .filter((offer) => payableTotal(offer) == null)
    .sort((left, right) => (left.price ?? Number.POSITIVE_INFINITY) - (right.price ?? Number.POSITIVE_INFINITY));
  return [...known, ...unknownShipping];
}

export function splitOffersForDisplay<T extends ComparableOffer>(
  offers: T[],
  limit = initialOfferCount,
): { initial: T[]; rest: T[] } {
  const inStock = byPayableTotal(offers.filter((offer) => offer.stockStatus === "in_stock"));
  const unavailable = byPayableTotal(offers.filter((offer) => offer.stockStatus !== "in_stock"));
  if (offers.length <= limit) {
    return { initial: [...inStock, ...unavailable], rest: [] };
  }
  return {
    initial: inStock.slice(0, limit),
    rest: [...inStock.slice(limit), ...unavailable],
  };
}

export function comparisonCountLabel(offers: { sellerId: string | null; shopName: string }[]): string {
  const shops = new Set(offers.map((offer) => (offer.sellerId ? offer.sellerId : offer.shopName))).size;
  if (shops === offers.length) {
    return `${shops}ショップを比較`;
  }
  return `${shops}ショップを比較（販売情報${offers.length}件）`;
}
