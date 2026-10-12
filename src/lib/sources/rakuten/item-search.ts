import type { Offer } from "../../types.ts";
import { officialRakutenAffiliateUrl } from "./affiliate-url.ts";
import { rakutenSiteOrigin } from "./http.ts";
import { rakutenOffersForJan } from "./offers.ts";
import type { RakutenSourceItem } from "./types.ts";

const endpoint = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";

// 公式の1リクエストあたりの上限。2ページ目は別リクエストになるため、商品詳細では1ページだけ取る。
export const rakutenShopSearchHits = 30;
const shopSearchRevalidateSeconds = 3600;

export type RakutenShopSearchResult =
  | { ok: true; offers: Offer[]; truncated: boolean }
  | { ok: false; reason: "not-configured" | "request-failed" | "not-found" | "rate-limited" };

export function rakutenReviewSearchRequest(
  applicationId: string,
  accessKey: string,
  keyword: string,
  genreId?: number,
  page = 1,
  hits = 20,
): { url: URL; headers: Record<string, string> } {
  const url = new URL(endpoint);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("keyword", keyword);
  if (genreId != null) {
    url.searchParams.set("genreId", String(genreId));
  }
  const safeHits = Number.isInteger(hits) ? Math.min(rakutenShopSearchHits, Math.max(1, hits)) : 20;
  const safePage = Number.isInteger(page) ? Math.min(100, Math.max(1, page)) : 1;
  url.searchParams.set("hits", String(safeHits));
  url.searchParams.set("page", String(safePage));
  url.searchParams.set("availability", "1");
  url.searchParams.set("field", "1");
  url.searchParams.set("sort", "-reviewCount");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatVersion", "2");
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

export function rakutenShopSearchRequest(
  applicationId: string,
  accessKey: string,
  janCode: string,
  affiliateId = "",
): { url: URL; headers: Record<string, string> } {
  const url = new URL(endpoint);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("keyword", janCode);
  url.searchParams.set("hits", String(rakutenShopSearchHits));
  url.searchParams.set("page", "1");
  // 在庫切れが安い順の30件を埋めると、購入できる店舗が欠ける。検索範囲は商品名を優先し、説明文だけの別商品を混ぜない。
  url.searchParams.set("availability", "1");
  url.searchParams.set("field", "1");
  url.searchParams.set("sort", "+itemPrice");
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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function text(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function yen(value: unknown): number | null {
  const amount = typeof value === "number" ? value : typeof value === "string" && /^[0-9]+$/.test(value) ? Number(value) : null;
  if (amount == null || !Number.isInteger(amount) || amount <= 0 || amount >= 1_000_000_000) {
    return null;
  }
  return amount;
}

function flag(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" && /^[0-9]+$/.test(value) ? Number(value) : null;
  if (parsed == null || !Number.isInteger(parsed)) {
    return null;
  }
  return parsed;
}

export function mentionsExactJan(value: string, janCode: string): boolean {
  let from = 0;
  while (from < value.length) {
    const at = value.indexOf(janCode, from);
    if (at < 0) {
      return false;
    }
    const before = at > 0 ? value[at - 1] : "";
    const after = value[at + janCode.length] ?? "";
    if (!/\d/.test(before) && !/\d/.test(after)) {
      return true;
    }
    from = at + 1;
  }
  return false;
}

function plainItemUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || host === "hb.afl.rakuten.co.jp" || (host !== "rakuten.co.jp" && !host.endsWith(".rakuten.co.jp"))) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function imageUrl(record: Record<string, unknown>): string | null {
  for (const key of ["mediumImageUrls", "smallImageUrls"]) {
    const images = record[key];
    if (!Array.isArray(images)) {
      continue;
    }
    for (const image of images) {
      const candidate = typeof image === "string" ? image : text(asRecord(image)?.imageUrl);
      const url = plainItemUrl(candidate);
      if (url) {
        return url;
      }
    }
  }
  return null;
}

function itemRecords(payload: unknown): Record<string, unknown>[] {
  const body = asRecord(payload);
  const raw = body?.items ?? body?.Items;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((entry) => {
    const record = asRecord(entry);
    if (!record) {
      return [];
    }
    return [asRecord(record.item) ?? asRecord(record.Item) ?? record];
  });
}

function listingText(record: Record<string, unknown>): string {
  return [record.itemName, record.catchcopy, record.itemCaption].map((part) => text(part) ?? "").join("\n");
}

export function rakutenShopItemsFromPayload(payload: unknown, janCode: string, affiliateId: string): { items: RakutenSourceItem[]; truncated: boolean } {
  const body = asRecord(payload);
  const records = itemRecords(payload);
  const count = typeof body?.count === "number" && Number.isInteger(body.count) ? body.count : null;
  const kept = new Map<string, RakutenSourceItem>();
  for (const record of records) {
    const name = text(record.itemName);
    const shopName = text(record.shopName);
    const price = yen(record.itemPrice);
    if (!name || !shopName || price == null || !mentionsExactJan(listingText(record), janCode)) {
      continue;
    }
    if (flag(record.taxFlag) === 1) {
      continue;
    }
    const shopCode = text(record.shopCode);
    const itemCode = text(record.itemCode);
    const postage = flag(record.postageFlag);
    const availability = flag(record.availability);
    const item: RakutenSourceItem = {
      name,
      price,
      url: plainItemUrl(record.itemUrl),
      affiliateUrl: officialRakutenAffiliateUrl(record.affiliateUrl, affiliateId),
      imageUrl: imageUrl(record),
      shopName,
      shopCode,
      itemCode,
      janCode,
      shippingFee: postage === 0 ? 0 : null,
      shippingStatus: postage === 0 ? "free" : "unknown",
      inStock: availability === 1 ? true : availability === 0 ? false : null,
    };
    const key = itemCode ?? `${shopCode ?? shopName}:${name}`;
    const current = kept.get(key);
    if (!current || (current.price != null && item.price != null && item.price < current.price)) {
      kept.set(key, item);
    }
  }
  return {
    items: [...kept.values()],
    truncated: count != null && count > records.length,
  };
}

async function fetchRakuten(url: URL, headers: Record<string, string>): Promise<{ status: number; text: string }> {
  const response = await fetch(url, {
    headers,
    next: { revalidate: shopSearchRevalidateSeconds },
  });
  return { status: response.status, text: await response.text() };
}

export async function loadRakutenShopOffers(
  janCode: string,
  transport: typeof fetchRakuten = fetchRakuten,
): Promise<RakutenShopSearchResult> {
  if (!/^[0-9]{13}$/.test(janCode)) {
    return { ok: false, reason: "not-found" };
  }
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim() ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim() ?? "";
  if (applicationId === "" || accessKey === "") {
    return { ok: false, reason: "not-configured" };
  }
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID?.trim() ?? "";
  const { url, headers } = rakutenShopSearchRequest(applicationId, accessKey, janCode, affiliateId);
  let status = 0;
  let text = "";
  try {
    const response = await transport(url, headers);
    status = response.status;
    text = response.text;
  } catch {
    return { ok: false, reason: "request-failed" };
  }
  if (status === 429) {
    return { ok: false, reason: "rate-limited" };
  }
  if (status === 404) {
    return { ok: true, offers: [], truncated: false };
  }
  if (status < 200 || status >= 300) {
    return { ok: false, reason: "request-failed" };
  }
  let payload: unknown = null;
  try {
    payload = JSON.parse(text);
  } catch {
    return { ok: false, reason: "request-failed" };
  }
  const parsed = rakutenShopItemsFromPayload(payload, janCode, affiliateId);
  return {
    ok: true,
    offers: rakutenOffersForJan(parsed.items, janCode, new Date().toISOString()),
    truncated: parsed.truncated,
  };
}
