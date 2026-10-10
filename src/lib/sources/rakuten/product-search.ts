import { hasUnresolvedPackNotation } from "../../pricing/pack-count.ts";
import { parseTitleQuantity } from "../../pricing/quantity-parse.ts";
import type { Offer } from "../../types.ts";
import { rakutenGet, rakutenSiteOrigin } from "./http.ts";

const endpoint = "https://openapi.rakuten.co.jp/ichibaproduct/api/Product/Search/20250801";

export type RakutenProductProbe = {
  httpStatus: number | null;
  reason: "not-configured" | "request-failed" | "parameter" | "not-found" | "rate-limited" | "unavailable" | "matched" | "unmatched";
  matchedJan: boolean;
  hasPrice: boolean;
  hasProductUrl: boolean;
  hasAffiliateUrl: boolean;
  fieldNames: string[];
  priceKinds: Record<string, string>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function yen(value: unknown): number | null {
  const amount = typeof value === "number" ? value : typeof value === "string" && /^[0-9]+$/.test(value) ? Number(value) : null;
  if (amount == null || !Number.isInteger(amount) || amount <= 0 || amount >= 1_000_000_000) {
    return null;
  }
  return amount;
}

function countOf(value: unknown): number | null {
  const count = typeof value === "number" ? value : typeof value === "string" && /^[0-9]+$/.test(value) ? Number(value) : null;
  if (count == null || !Number.isInteger(count) || count < 0) {
    return null;
  }
  return count;
}

function janOf(value: unknown): string | null {
  const text = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  return /^[0-9]{13}$/.test(text) ? text : null;
}

function rakutenHttps(value: unknown): string | null {
  if (typeof value !== "string" || value === "") {
    return null;
  }
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || (host !== "rakuten.co.jp" && !host.endsWith(".rakuten.co.jp"))) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function rakutenProductSearchRequest(
  applicationId: string,
  accessKey: string,
  janCode: string,
  affiliateId = "",
): { url: URL; headers: Record<string, string> } {
  const url = new URL(endpoint);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("productCode", janCode);
  url.searchParams.set("hits", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatVersion", "2");
  if (affiliateId !== "") {
    url.searchParams.set("affiliateId", affiliateId);
  }
  return {
    url,
    headers: {
      Accept: "application/json",
      Origin: rakutenSiteOrigin,
      Referer: `${rakutenSiteOrigin}/`,
      ...(accessKey === "" ? {} : { accessKey }),
    },
  };
}

function productRecords(payload: unknown): Record<string, unknown>[] {
  const body = asRecord(payload);
  const raw = body?.Products ?? body?.products ?? body?.Items ?? body?.items;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((entry) => {
    const record = asRecord(entry);
    if (!record) {
      return [];
    }
    return [asRecord(record.Product) ?? asRecord(record.product) ?? asRecord(record.item) ?? record];
  });
}

export function rakutenProductOfferFromPayload(payload: unknown, janCode: string, observedAt: string, affiliateRequested: boolean): Offer | null {
  const product = productRecords(payload).find((record) => janOf(record.productCode) === janCode);
  if (!product) {
    return null;
  }
  const name = typeof product.productName === "string" ? product.productName.trim() : "";
  const price = yen(product.usedExcludeSalesMinPrice);
  const purchasable = countOf(product.usedExcludeSalesItemCount);
  const productUrl = rakutenHttps(product.productUrlPC);
  const affiliateUrl = affiliateRequested ? rakutenHttps(product.affiliateUrl) : null;
  if (name === "" || price == null || purchasable == null || purchasable < 1 || productUrl == null) {
    return null;
  }
  if (hasUnresolvedPackNotation(name)) {
    return null;
  }
  const reading = parseTitleQuantity(name);
  const packCount = reading.packConfidence === "high" ? reading.packCount : null;
  return {
    id: `off_rk_navi_${janCode}`,
    variantId: `prd_rk_${janCode}`,
    shopName: "楽天市場",
    listingTitle: name,
    price,
    shippingFee: null,
    productUrl,
    affiliateUrl,
    priceCheckedAt: observedAt,
    priceSnapshotId: null,
    shippingStatus: "unknown",
    stockStatus: "in_stock",
    source: "rakuten",
    provider: "rakuten",
    sellerId: null,
    itemCode: null,
    packCount,
    packUnit: reading.packConfidence === "high" ? reading.packUnit : null,
    totalQuantity: null,
    unitPriceReady: false,
    isSample: false,
  };
}

export async function probeRakutenProduct(janCode: string): Promise<RakutenProductProbe> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim() ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim() ?? "";
  const empty = (reason: RakutenProductProbe["reason"], httpStatus: number | null): RakutenProductProbe => ({
    httpStatus,
    reason,
    matchedJan: false,
    hasPrice: false,
    hasProductUrl: false,
    hasAffiliateUrl: false,
    fieldNames: [],
    priceKinds: {},
  });
  if (applicationId === "" || accessKey === "" || !/^[0-9]{13}$/.test(janCode)) {
    return empty("not-configured", null);
  }
  const { url, headers } = rakutenProductSearchRequest(applicationId, accessKey, janCode);
  let status = 0;
  let text = "";
  try {
    const response = await rakutenGet(url, headers);
    status = response.status;
    text = response.text;
  } catch {
    return empty("request-failed", null);
  }
  if (status === 429) return empty("rate-limited", status);
  if (status === 404) return empty("not-found", status);
  if (status === 400) return empty("parameter", status);
  if (status === 503 || status >= 500) return empty("unavailable", status);
  if (status < 200 || status >= 300) return empty("request-failed", status);
  let payload: unknown = null;
  try {
    payload = JSON.parse(text);
  } catch {
    return empty("request-failed", status);
  }
  const product = productRecords(payload).find((record) => janOf(record.productCode) === janCode) ?? null;
  return {
    httpStatus: status,
    reason: product ? "matched" : "unmatched",
    matchedJan: product != null,
    hasPrice: yen(product?.usedExcludeSalesMinPrice) != null,
    hasProductUrl: rakutenHttps(product?.productUrlPC) != null,
    hasAffiliateUrl: rakutenHttps(product?.affiliateUrl) != null,
    fieldNames: product ? Object.keys(product).sort() : [],
    priceKinds: Object.fromEntries(
      ["usedExcludeSalesMinPrice", "salesMinPrice", "minPrice", "usedExcludeSalesItemCount", "salesItemCount", "itemCount"].map((key) => {
        const value = product?.[key];
        const kind = value == null ? "null" : typeof value === "number" ? (Number.isInteger(value) ? "int" : "float") : typeof value;
        return [key, kind];
      }),
    ),
  };
}
