import type { YahooItem } from "@/lib/sources/yahoo/adapter";

const endpoint = "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";

// Yahooカテゴリ一覧APIの第1階層で「ペット用品、生き物」として返るID。商品名の語では判定しない。
export const petSupplyGenreCategoryId = 2509;

export type YahooSearchResult = { ok: true; items: YahooItem[] } | { ok: false; reason: "not-configured" | "request-failed" };

type YahooSearchParams = {
  query?: string;
  janCode?: string;
  results: number;
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

  return {
    name,
    url: httpsUrl(record.url),
    inStock: typeof record.inStock === "boolean" ? record.inStock : null,
    code: text(record.code),
    price: integer(record.price),
    imageUrl: httpsUrl(exImage?.url) ?? httpsUrl(image?.medium) ?? httpsUrl(image?.small),
    brandName: text(brand?.name),
    genreName: text(genre?.name),
    parentGenreNames: parents
      .map((parent) => text(asRecord(parent)?.name))
      .filter((parent): parent is string => parent != null),
    janCode: text(record.janCode),
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
  url.searchParams.set("genre_category_id", String(petSupplyGenreCategoryId));
  url.searchParams.set("results", String(params.results));
  url.searchParams.set("image_size", "300");

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
    }
  } catch {
    return { ok: false, reason: "request-failed" };
  }

  if (!response.ok) {
    return { ok: false, reason: "request-failed" };
  }

  try {
    const payload: unknown = await response.json();
    const hits = asRecord(payload)?.hits;
    if (!Array.isArray(hits)) {
      return { ok: false, reason: "request-failed" };
    }
    return {
      ok: true,
      items: hits.filter(isPetSupplyHit).map(readYahooItem).filter((item): item is YahooItem => item != null),
    };
  } catch {
    return { ok: false, reason: "request-failed" };
  }
}
