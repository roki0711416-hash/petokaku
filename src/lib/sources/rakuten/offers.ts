import { parseTitleQuantity } from "../../pricing/quantity-parse.ts";
import type { Offer } from "../../types.ts";
import { adaptRakutenItems } from "./adapter.ts";
import type { RakutenSourceItem } from "./types.ts";

function token(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  return cleaned === "" ? "item" : cleaned;
}

export function rakutenOffersForJan(items: RakutenSourceItem[], janCode: string, observedAt: string): Offer[] {
  if (!/^[0-9]{13}$/.test(janCode)) {
    return [];
  }
  const matched = adaptRakutenItems(items, observedAt).filter((product) => product.variant.janCode === janCode);
  const offers: Offer[] = [];
  for (const product of matched) {
    for (const source of product.variant.offers) {
      const title = source.listingTitle?.trim() ?? "";
      const reading = parseTitleQuantity(title);
      const packCount = reading.packConfidence === "high" ? reading.packCount : null;
      offers.push({
        id: `off_rk_${janCode}_${token(source.sellerId ?? source.shopName)}_${token(source.itemCode ?? title)}`,
        variantId: `prd_rk_${janCode}`,
        shopName: source.shopName,
        listingTitle: title || null,
        price: source.observation.price,
        shippingFee: source.observation.shippingFee,
        productUrl: source.productUrl,
        affiliateUrl: source.affiliateUrl,
        priceCheckedAt: source.observation.observedAt,
        priceSnapshotId: null,
        shippingStatus: source.observation.shippingStatus,
        stockStatus: source.observation.stockStatus,
        source: "rakuten",
        provider: "rakuten",
        sellerId: source.sellerId,
        itemCode: source.itemCode,
        packCount,
        packUnit: reading.packConfidence === "high" ? reading.packUnit : null,
        totalQuantity: null,
        unitPriceReady: false,
        isSample: false,
      });
    }
  }
  return offers;
}
