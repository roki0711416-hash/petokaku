import { safeHttpUrl } from "../urls.ts";

export function shopProductLink(offer: { affiliateUrl: string | null; productUrl: string | null }): { href: string | null; affiliate: boolean } {
  const affiliateUrl = safeHttpUrl(offer.affiliateUrl);
  if (affiliateUrl) {
    return { href: affiliateUrl, affiliate: true };
  }
  return { href: safeHttpUrl(offer.productUrl), affiliate: false };
}
