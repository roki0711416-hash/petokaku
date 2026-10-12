import { comparableShopKey, minimumComparableShops, salesUnitKeyOf } from "../../listing-eligibility.ts";
import { unknownQuantityLabel } from "../../pricing/quantity-parse.ts";
import type { Offer, ProductDetail } from "../../types.ts";

export function rakutenComparisonDetail(janCode: string, offers: Offer[], observedAt: string): ProductDetail | null {
  if (!/^[0-9]{13}$/.test(janCode)) {
    return null;
  }
  const buckets = new Map<string, Set<string>>();
  for (const offer of offers) {
    if (offer.isSample || offer.stockStatus !== "in_stock" || offer.price == null || !Number.isInteger(offer.price) || offer.price <= 0) {
      continue;
    }
    const unit = salesUnitKeyOf(offer.listingTitle ?? "");
    const shop = comparableShopKey("rakuten", offer.sellerId, offer.shopName);
    if (!unit || !shop) {
      continue;
    }
    const shops = buckets.get(unit) ?? new Set<string>();
    shops.add(shop);
    buckets.set(unit, shops);
  }
  const comparable = [...buckets.values()].some((shops) => shops.size >= minimumComparableShops);
  if (!comparable) {
    return null;
  }
  const name = offers.find((offer) => offer.listingTitle?.trim())?.listingTitle?.trim() || "商品";
  const prices = offers.flatMap((offer) => (offer.price != null && offer.price > 0 ? [offer.price] : []));
  return {
    id: `prd_rk_${janCode}`,
    productId: `prd_rk_${janCode}`,
    slug: "rakuten-compare",
    name,
    brand: "",
    category: "other",
    variant: 1,
    janCode,
    modelNumber: null,
    sizeLabel: unknownQuantityLabel,
    description: "同じJANコードの販売情報を、ショップごとに比較しています。",
    quantity: null,
    quantityUnit: null,
    statedQuantity: null,
    statedUnit: null,
    quantityConfidence: "unknown",
    quantitySource: null,
    unitPriceType: "none",
    createdAt: observedAt,
    updatedAt: observedAt,
    isSample: false,
    imageUrl: null,
    sourceCategoryName: null,
    popular: false,
    recommended: false,
    offers,
    lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
    highestPrice: prices.length > 0 ? Math.max(...prices) : null,
    latestCheckedAt: observedAt,
  };
}
