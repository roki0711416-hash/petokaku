import { rakutenGet } from "./http.ts";

const endpoint = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";
const siteOrigin = "https://petokaku.com";

export type RakutenProbeResult = {
  ok: boolean;
  httpStatus: number | null;
  reason: "not-configured" | "request-failed" | "parameter" | "not-found" | "rate-limited" | "unavailable" | "connected";
  error: string | null;
  topLevelKeys: string[];
  fieldNames: string[];
  hasItemName: boolean;
  hasItemPrice: boolean;
  hasItemUrl: boolean;
  hasShopName: boolean;
  hasImageUrl: boolean;
  janFieldPresent: boolean;
  itemCount: number | null;
};

function emptyProbe(reason: RakutenProbeResult["reason"], httpStatus: number | null, error: string | null): RakutenProbeResult {
  return {
    ok: false,
    httpStatus,
    reason,
    error,
    topLevelKeys: [],
    fieldNames: [],
    hasItemName: false,
    hasItemPrice: false,
    hasItemUrl: false,
    hasShopName: false,
    hasImageUrl: false,
    janFieldPresent: false,
    itemCount: null,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function safeError(value: unknown): string | null {
  const record = asRecord(value);
  const description = record?.error_description;
  const code = record?.error;
  const text = [code, description].filter((part) => typeof part === "string").join(": ");
  if (text === "") {
    return null;
  }
  return text.replace(/applicationId|accessKey|affiliateId/gi, "[redacted]").slice(0, 180);
}

export function summarizeRakutenSearchPayload(payload: unknown): Pick<
  RakutenProbeResult,
  "topLevelKeys" | "fieldNames" | "hasItemName" | "hasItemPrice" | "hasItemUrl" | "hasShopName" | "hasImageUrl" | "janFieldPresent" | "itemCount"
> {
  const body = asRecord(payload);
  const topLevelKeys = body ? Object.keys(body).sort() : [];
  const rawItems = body?.items ?? body?.Items;
  const items = Array.isArray(rawItems) ? rawItems : [];
  const wrapped = asRecord(items[0]);
  const first = asRecord(wrapped?.item) ?? wrapped;
  const fieldNames = first ? Object.keys(first).sort() : [];
  const images = first?.mediumImageUrls ?? first?.smallImageUrls;
  const hasImageUrl = Array.isArray(images) && images.some((image) => typeof image === "string" || typeof asRecord(image)?.imageUrl === "string");
  const price = first?.itemPrice;
  return {
    topLevelKeys,
    fieldNames,
    hasItemName: typeof first?.itemName === "string",
    hasItemPrice: typeof price === "number" || (typeof price === "string" && price !== ""),
    hasItemUrl: typeof first?.itemUrl === "string",
    hasShopName: typeof first?.shopName === "string",
    hasImageUrl,
    janFieldPresent: hasJanField(first),
    itemCount: typeof body?.count === "number" ? body.count : items.length > 0 ? items.length : null,
  };
}

function hasJanField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => hasJanField(item));
  }
  const record = asRecord(value);
  if (!record) {
    return false;
  }
  return Object.entries(record).some(([key, nested]) => /jan/i.test(key) || hasJanField(nested));
}

export function rakutenProbeRequest(applicationId: string, keyword: string, accessKey = ""): { url: URL; headers: Record<string, string> } {
  const url = new URL(endpoint);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("hits", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatVersion", "2");
  return {
    url,
    headers: {
      Accept: "application/json",
      Origin: siteOrigin,
      Referer: `${siteOrigin}/`,
      ...(accessKey === "" ? {} : { accessKey }),
    },
  };
}


export async function probeRakutenItemSearch(keyword: string): Promise<RakutenProbeResult> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim() ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim() ?? "";
  if (applicationId === "" || accessKey === "") {
    return emptyProbe("not-configured", null, null);
  }

  const { url, headers } = rakutenProbeRequest(applicationId, keyword, accessKey);
  let status = 0;
  let text = "";
  try {
    const response = await rakutenGet(url, headers);
    status = response.status;
    text = response.text;
  } catch {
    return emptyProbe("request-failed", null, null);
  }
  let payload: unknown = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = null;
  }
  const excerpt = text
    .split(applicationId)
    .join("[redacted]")
    .split(accessKey)
    .join("[redacted]")
    .replace(/\s+/g, " ")
    .slice(0, 240);

  const errorText = safeError(payload) ?? (excerpt === "" ? null : excerpt);
  if (status === 429) {
    return { ...emptyProbe("rate-limited", status, errorText), httpStatus: status };
  }
  if (status === 404) {
    return { ...emptyProbe("not-found", status, errorText) };
  }
  if (status === 400) {
    return { ...emptyProbe("parameter", status, errorText) };
  }
  if (status === 503 || status >= 500) {
    return { ...emptyProbe("unavailable", status, errorText) };
  }
  if (status < 200 || status >= 300) {
    return { ...emptyProbe("request-failed", status, errorText) };
  }

  return {
    ok: true,
    httpStatus: status,
    reason: "connected",
    error: null,
    ...summarizeRakutenSearchPayload(payload),
  };
}
