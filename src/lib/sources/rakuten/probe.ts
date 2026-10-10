const endpoint = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";

export type RakutenProbeResult = {
  ok: boolean;
  httpStatus: number | null;
  reason: "not-configured" | "request-failed" | "parameter" | "not-found" | "rate-limited" | "unavailable" | "connected";
  error: string | null;
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

export function rakutenProbeRequest(applicationId: string, keyword: string): { url: URL; headers: Headers } {
  const url = new URL(endpoint);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("hits", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatVersion", "2");
  return { url, headers: new Headers({ Accept: "application/json" }) };
}

export async function probeRakutenItemSearch(keyword: string): Promise<RakutenProbeResult> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim() ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim() ?? "";
  if (applicationId === "" || accessKey === "") {
    return emptyProbe("not-configured", null, null);
  }

  const { url, headers } = rakutenProbeRequest(applicationId, keyword);
  headers.set("accessKey", accessKey);
  let response: Response;
  try {
    response = await fetch(url, { headers, cache: "no-store" });
  } catch {
    return emptyProbe("request-failed", null, null);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 429) {
    return { ...emptyProbe("rate-limited", response.status, safeError(payload)), httpStatus: response.status };
  }
  if (response.status === 404) {
    return { ...emptyProbe("not-found", response.status, safeError(payload)) };
  }
  if (response.status === 400) {
    return { ...emptyProbe("parameter", response.status, safeError(payload)) };
  }
  if (response.status === 503 || response.status >= 500) {
    return { ...emptyProbe("unavailable", response.status, safeError(payload)) };
  }
  if (!response.ok) {
    return { ...emptyProbe("request-failed", response.status, safeError(payload)) };
  }

  const body = asRecord(payload);
  const items = Array.isArray(body?.items) ? body.items : [];
  const first = asRecord(items[0]);
  const fieldNames = first ? Object.keys(first).sort() : [];
  const images = first?.mediumImageUrls ?? first?.smallImageUrls;
  const hasImageUrl = Array.isArray(images) && images.some((image) => typeof image === "string" || typeof asRecord(image)?.imageUrl === "string");
  return {
    ok: true,
    httpStatus: response.status,
    reason: "connected",
    error: null,
    fieldNames,
    hasItemName: typeof first?.itemName === "string",
    hasItemPrice: typeof first?.itemPrice === "number",
    hasItemUrl: typeof first?.itemUrl === "string",
    hasShopName: typeof first?.shopName === "string",
    hasImageUrl,
    janFieldPresent: hasJanField(first),
    itemCount: typeof body?.count === "number" ? body.count : items.length,
  };
}
