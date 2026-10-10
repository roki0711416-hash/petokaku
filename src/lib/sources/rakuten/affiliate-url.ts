const affiliateHost = "hb.afl.rakuten.co.jp";

export function rakutenAffiliateUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  try {
    const url = new URL(value.trim());
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.hostname.toLowerCase() !== affiliateHost) {
      return null;
    }
    url.protocol = "https:";
    return url.toString();
  } catch {
    return null;
  }
}

export function rakutenAffiliateIdReflected(url: string | null, affiliateId: string): boolean {
  if (url == null || affiliateId.length < 8) {
    return false;
  }
  return url.includes(affiliateId);
}

export function officialRakutenAffiliateUrl(value: unknown, affiliateId: string): string | null {
  const url = rakutenAffiliateUrl(value);
  if (!rakutenAffiliateIdReflected(url, affiliateId)) {
    return null;
  }
  return url;
}
