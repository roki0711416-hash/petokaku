import type { Offer, ProductDetail } from "@/lib/types";
import { recordPriceError } from "@/lib/sources/errors";
import { getPriceSource } from "@/lib/sources/registry";
import type { LiveOfferDraft } from "@/lib/sources/types";

export type RefreshResult =
  | {
      offers: Offer[];
      updated: false;
      reason: "sample-mode" | "not-configured" | "fetch-failed" | "mismatched-product";
    }
  | {
      offers: LiveOfferDraft[];
      updated: true;
      reason: "updated";
    };

export async function refreshProductOffers(
  product: ProductDetail,
  currentOffers: Offer[],
): Promise<RefreshResult> {
  const requested = process.env.PRICE_SOURCE?.trim() || "sample";
  if (requested === "sample") {
    return { offers: currentOffers, updated: false, reason: "sample-mode" };
  }

  const source = getPriceSource(requested);
  if (!source || !source.isConfigured()) {
    recordPriceError({
      source: source?.id ?? "unknown",
      variantId: product.id,
      message: "価格の取得元が未設定のため、いまの価格を残しました。",
      at: new Date().toISOString(),
    });
    return { offers: currentOffers, updated: false, reason: "not-configured" };
  }

  const result = await source.fetchOffers({ id: product.id, name: product.name, janCode: product.janCode });
  if (!result.ok) {
    recordPriceError({
      source: result.source,
      variantId: product.id,
      message: result.message,
      at: result.at,
    });
    return { offers: currentOffers, updated: false, reason: "fetch-failed" };
  }

  const invalid = result.offers.length === 0 || result.offers.some((offer) => offer.variantId !== product.id);
  if (invalid) {
    recordPriceError({
      source: result.source,
      variantId: product.id,
      message: "取得結果がこの商品の価格として使えないため、いまの価格を残しました。",
      at: new Date().toISOString(),
    });
    return { offers: currentOffers, updated: false, reason: "mismatched-product" };
  }

  return { offers: result.offers, updated: true, reason: "updated" };
}
