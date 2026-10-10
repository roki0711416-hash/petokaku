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
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    decoded = url;
  }
  return url.includes(affiliateId) || decoded.includes(affiliateId);
}

export function describeRakutenAffiliateField(value: unknown, affiliateId: string): {
  kind: "null" | "empty" | "url" | "other";
  host: string | null;
  officialHost: boolean;
  idReflected: boolean;
} {
  if (value == null) {
    return { kind: "null", host: null, officialHost: false, idReflected: false };
  }
  if (typeof value !== "string") {
    return { kind: "other", host: null, officialHost: false, idReflected: false };
  }
  if (value.trim() === "") {
    return { kind: "empty", host: null, officialHost: false, idReflected: false };
  }
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    const officialHost = host === "hb.afl.rakuten.co.jp";
    return {
      kind: "url",
      host,
      officialHost,
      idReflected: officialHost && rakutenAffiliateIdReflected(value, affiliateId),
    };
  } catch {
    return { kind: "other", host: null, officialHost: false, idReflected: false };
  }
}

export function officialRakutenAffiliateUrl(value: unknown, affiliateId: string): string | null {
  const url = rakutenAffiliateUrl(value);
  if (!rakutenAffiliateIdReflected(url, affiliateId)) {
    return null;
  }
  return url;
}
