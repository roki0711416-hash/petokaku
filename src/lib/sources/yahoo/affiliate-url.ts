const affiliateHost = "ck.jp.ap.valuecommerce.com";
const productHost = "store.shopping.yahoo.co.jp";

export function yahooAffiliateQuery(sid: string, pid: string): { affiliate_type: "vc"; affiliate_id: string } | null {
  if (!/^[0-9]{1,16}$/.test(sid) || !/^[0-9]{1,16}$/.test(pid)) {
    return null;
  }
  return {
    affiliate_type: "vc",
    affiliate_id: `http://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=`,
  };
}

function httpUrl(value: unknown): URL | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function yahooStoreUrl(value: string | null): string | null {
  if (value == null) {
    return null;
  }
  const url = httpUrl(value);
  if (!url || url.hostname.toLowerCase() !== productHost || url.pathname.length <= 1) {
    return null;
  }
  url.protocol = "https:";
  url.hash = "";
  return url.toString();
}

export function splitYahooShoppingUrl(value: unknown): { productUrl: string | null; affiliateUrl: string | null } {
  const url = httpUrl(value);
  if (!url) {
    return { productUrl: null, affiliateUrl: null };
  }
  const host = url.hostname.toLowerCase();
  if (host === productHost) {
    return { productUrl: yahooStoreUrl(url.toString()), affiliateUrl: null };
  }
  if (host !== affiliateHost || url.pathname !== "/servlet/referral") {
    return { productUrl: null, affiliateUrl: null };
  }
  const productUrl = yahooStoreUrl(url.searchParams.get("vc_url"));
  const sid = url.searchParams.get("sid") ?? "";
  const pid = url.searchParams.get("pid") ?? "";
  if (!productUrl || !/^[0-9]+$/.test(sid) || !/^[0-9]+$/.test(pid)) {
    return { productUrl, affiliateUrl: null };
  }
  url.hash = "";
  return { productUrl, affiliateUrl: url.toString() };
}
