const measurementIdPattern = /^G-[A-Z0-9]+$/;
const gaValueLimit = 100;

export function googleAnalyticsId(raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID): string | null {
  const value = raw?.trim() ?? "";
  if (!measurementIdPattern.test(value)) {
    return null;
  }
  return value;
}

// 同じパスへの再送はしない。初回と、App Router の遷移でパスが変わったときだけ送る。
export function pageViewToSend(lastPagePath: string | null, pagePath: string): string | null {
  if (lastPagePath === pagePath) {
    return null;
  }
  return pagePath;
}

export function outboundAnchorRel(affiliate: boolean): string {
  return affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer";
}

export type ShopClickInput = {
  shop: string;
  shopName?: string | null;
  productId?: string | null;
  productName?: string | null;
  price?: number | null;
  pageType?: string | null;
  position?: number | null;
};

function gaText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, gaValueLimit);
}

function hostnameOf(href: string): string | null {
  try {
    return new URL(href).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isAmazonHost(host: string): boolean {
  return host === "amazon.co.jp" || host.endsWith(".amazon.co.jp") || host === "amazon.com" || host.endsWith(".amazon.com") || host === "amzn.to" || host.endsWith(".amzn.to") || host === "amzn.asia" || host.endsWith(".amzn.asia");
}

function isRakutenHost(host: string): boolean {
  return host === "rakuten.co.jp" || host.endsWith(".rakuten.co.jp") || host.endsWith(".rakuten.ne.jp");
}

function isYahooHost(host: string): boolean {
  return host === "yahoo.co.jp" || host.endsWith(".yahoo.co.jp") || host === "ck.jp.ap.valuecommerce.com";
}

export function shopFromDestination(href: string, provider?: string | null): string {
  const given = provider?.trim().toLowerCase() ?? "";
  if (given === "yahoo" || given === "rakuten" || given === "amazon") {
    return given;
  }
  const host = hostnameOf(href);
  if (!host) {
    return "other";
  }
  if (isAmazonHost(host)) {
    return "amazon";
  }
  if (isRakutenHost(host)) {
    return "rakuten";
  }
  if (isYahooHost(host)) {
    return "yahoo";
  }
  return "other";
}

export function isAffiliateHref(href: string): boolean {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  if (host === "ck.jp.ap.valuecommerce.com" || host === "hb.afl.rakuten.co.jp") {
    return true;
  }
  return isAmazonHost(host) && url.searchParams.has("tag");
}

export function shopClickPayload(input: ShopClickInput): Record<string, string | number> {
  const payload: Record<string, string | number> = {
    shop: gaText(input.shop) || "other",
    transport_type: "beacon",
  };
  const shopName = gaText(input.shopName);
  if (shopName) {
    payload.shop_name = shopName;
  }
  const productId = gaText(input.productId);
  if (productId) {
    payload.product_id = productId;
  }
  const productName = gaText(input.productName);
  if (productName) {
    payload.product_name = productName;
  }
  if (typeof input.price === "number" && Number.isFinite(input.price) && input.price >= 0) {
    payload.price = input.price;
  }
  const pageType = gaText(input.pageType);
  if (pageType) {
    payload.page_type = pageType;
  }
  if (typeof input.position === "number" && Number.isInteger(input.position) && input.position > 0) {
    payload.position = input.position;
  }
  return payload;
}

export function pageContextFromLocation(pathname: string, title: string): { productId: string | null; productName: string | null; pageType: string } {
  const jan = pathname.match(/\/products\/jan\/(\d{13})(?:\/|$)/)?.[1] ?? null;
  const pageType = jan ? "product" : pathname.startsWith("/search") ? "search" : pathname.startsWith("/articles/") ? "article" : "other";
  const cleaned = title.replace(/\s*[|｜]\s*ペトカク\s*$/u, "").replace(/の価格比較\s*$/u, "").trim();
  return {
    productId: jan,
    productName: pageType === "product" && cleaned ? cleaned.slice(0, gaValueLimit) : null,
    pageType,
  };
}

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

// 同意前は gtag が無いので何も送らない。例外でリンク遷移を止めない。
export function trackShopClick(input: ShopClickInput): void {
  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }
    window.gtag("event", "shop_click", shopClickPayload(input));
  } catch {
    // 計測できないときも、ショップのリンクはそのまま開く。
  }
}
