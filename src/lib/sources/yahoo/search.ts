import type { YahooItem } from "@/lib/sources/yahoo/adapter";
import { splitYahooShoppingUrl, yahooAffiliateQuery } from "./affiliate-url.ts";

const endpoint = "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";

// Yahooカテゴリ一覧APIの第1階層で「ペット用品、生き物」として返るID。商品名の語では判定しない。
export const petSupplyGenreCategoryId = 2509;

export const yahooJanSearchLimit = 50;
const yahooSearchTimeoutMs = 8000;

export type YahooSearchResult =
  | { ok: true; items: YahooItem[]; totalAvailable: number | null; returnedCount: number }
  | { ok: false; reason: "not-configured" | "request-failed" };

export function yahooRetrievalLimited(input: {
  totalAvailable: number | null;
  returnedCount: number;
  requested: number;
}): boolean {
  if (input.totalAvailable != null) {
    return input.totalAvailable > input.returnedCount;
  }
  return input.requested > 0 && input.returnedCount >= input.requested;
}

type YahooSearchParams = {
  query?: string;
  janCode?: string;
  results: number;
  start?: number;
  revalidate?: number;
  sort?: "-review_count" | "+price" | "-price" | "-score";
  genreCategoryId?: number;
};

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

function integer(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 10_000_000) {
    return null;
  }
  return value;
}

function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

// 商品検索APIの image_size の上限。76 / 106 / 132 / 146 / 300 / 600 のうち最大。
export const yahooDetailImageSize = "600";

const yahooShoppingImage = /^https:\/\/item-shopping\.c\.yimg\.jp\/i\/([a-z])\/([^/?#]+)$/;
const smallYahooImageCodes = new Set(["b", "c", "d", "e", "g", "h", "i", "j", "k", "m", "o"]);

export function preferDetailImageUrl(value: string): string {
  const match = yahooShoppingImage.exec(value);
  if (!match || !smallYahooImageCodes.has(match[1] ?? "")) {
    return value;
  }
  return `https://item-shopping.c.yimg.jp/i/l/${match[2]}`;
}

function detailImageUrl(...candidates: unknown[]): string | null {
  for (const candidate of candidates) {
    const url = httpsUrl(candidate);
    if (url) {
      return preferDetailImageUrl(url);
    }
  }
  return null;
}

function genreCategoryIds(record: Record<string, unknown>): number[] {
  const genre = asRecord(record.genreCategory);
  const parents = Array.isArray(record.parentGenreCategories) ? record.parentGenreCategories : [];
  const ids = [genre?.id, ...parents.map((parent) => asRecord(parent)?.id)];
  return ids.filter((id): id is number => typeof id === "number" && Number.isInteger(id));
}

export function isPetSupplyHit(value: unknown): boolean {
  const record = asRecord(value);
  if (!record) {
    return false;
  }
  return genreCategoryIds(record).includes(petSupplyGenreCategoryId);
}

export function readYahooItem(value: unknown): YahooItem | null {
  const record = asRecord(value);
  const name = text(record?.name);
  if (!record || !name) {
    return null;
  }

  const image = asRecord(record.image);
  const exImage = asRecord(record.exImage);
  const brand = asRecord(record.brand);
  const genre = asRecord(record.genreCategory);
  const shipping = asRecord(record.shipping);
  const seller = asRecord(record.seller);
  const parents = Array.isArray(record.parentGenreCategories) ? record.parentGenreCategories : [];

  const links = splitYahooShoppingUrl(record.url);
  return {
    name,
    url: links.productUrl,
    affiliateUrl: links.affiliateUrl,
    inStock: typeof record.inStock === "boolean" ? record.inStock : null,
    code: text(record.code),
    price: integer(record.price),
    imageUrl: detailImageUrl(exImage?.url, image?.medium, image?.small),
    brandName: text(brand?.name),
    genreName: text(genre?.name),
    parentGenreNames: parents
      .map((parent) => text(asRecord(parent)?.name))
      .filter((parent): parent is string => parent != null),
    janCode: text(record.janCode),
    reviewCount: integer(asRecord(record.review)?.count),
    shipping: shipping
      ? {
          code: integer(shipping.code),
          name: text(shipping.name),
        }
      : null,
    sellerId: text(seller?.sellerId),
    sellerName: text(seller?.name),
  };
}

export async function searchYahooItems(params: YahooSearchParams): Promise<YahooSearchResult> {
  const appid = process.env.YAHOO_CLIENT_ID?.trim();
  if (!appid) {
    return { ok: false, reason: "not-configured" };
  }

  const url = new URL(endpoint);
  url.searchParams.set("appid", appid);
  if (params.query) {
    url.searchParams.set("query", params.query);
  }
  if (params.janCode) {
    url.searchParams.set("jan_code", params.janCode);
  }
  url.searchParams.set("genre_category_id", String(params.genreCategoryId ?? petSupplyGenreCategoryId));
  url.searchParams.set("results", String(params.results));
  if (params.start != null && params.start > 1) {
    url.searchParams.set("start", String(params.start));
  }
  url.searchParams.set("image_size", yahooDetailImageSize);
  const affiliate = yahooAffiliateQuery(process.env.YAHOO_AFFILIATE_SID?.trim() ?? "", process.env.YAHOO_AFFILIATE_PID?.trim() ?? "");
  if (affiliate) {
    url.searchParams.set("affiliate_type", affiliate.affiliate_type);
    url.searchParams.set("affiliate_id", affiliate.affiliate_id);
  }
  if (params.sort) {
    url.searchParams.set("sort", params.sort);
  }

  const init =
    params.revalidate != null
      ? { next: { revalidate: params.revalidate }, headers: { Accept: "application/json" }, signal: AbortSignal.timeout(yahooSearchTimeoutMs) }
      : { cache: "no-store" as const, headers: { Accept: "application/json" }, signal: AbortSignal.timeout(yahooSearchTimeoutMs) };
  let response: Response;
  try {
    response = await fetch(url, init);
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      response = await fetch(url, init);
    }
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    console.error("[petokaku] Yahoo商品検索に失敗しました", { status: null, kind: timedOut ? "timeout" : "network" });
    return { ok: false, reason: "request-failed" };
  }

  if (!response.ok) {
    console.error("[petokaku] Yahoo商品検索に失敗しました", {
      status: response.status,
      kind: response.status === 429 ? "rate-limited" : "http",
    });
    return { ok: false, reason: "request-failed" };
  }

  try {
    const payload: unknown = await response.json();
    const record = asRecord(payload);
    const hits = record?.hits;
    if (!Array.isArray(hits)) {
      console.error("[petokaku] Yahoo商品検索に失敗しました", { status: response.status, kind: "invalid-body" });
      return { ok: false, reason: "request-failed" };
    }
    return {
      ok: true,
      items: hits.filter(isPetSupplyHit).map(readYahooItem).filter((item): item is YahooItem => item != null),
      totalAvailable: integer(record?.totalResultsAvailable),
      returnedCount: hits.length,
    };
  } catch {
    console.error("[petokaku] Yahoo商品検索に失敗しました", { status: response.status, kind: "invalid-body" });
    return { ok: false, reason: "request-failed" };
  }
}
