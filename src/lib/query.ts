import { isCategoryId } from "@/lib/categories";
import { searchProducts } from "@/lib/search";
import type { CategoryId, ProductDetail } from "@/lib/types";

export const pageSize = 8;

export const sortKeys = ["recommended", "price-asc", "price-desc"] as const;

export type SortKey = (typeof sortKeys)[number];

export const priceBandIds = ["under-1000", "1000-3000", "3000-5000", "5000-10000", "over-10000"] as const;

export type PriceBandId = (typeof priceBandIds)[number];

export const priceBands: { id: PriceBandId; label: string }[] = [
  { id: "under-1000", label: "1,000円以下" },
  { id: "1000-3000", label: "1,000〜3,000円" },
  { id: "3000-5000", label: "3,000〜5,000円" },
  { id: "5000-10000", label: "5,000〜10,000円" },
  { id: "over-10000", label: "10,000円以上" },
];

export type ProductQueryInput = Record<string, string | string[] | undefined>;

export type ParsedProductQuery = {
  q: string;
  category: CategoryId | null;
  unknownCategory: string | null;
  brand: string | null;
  priceBand: PriceBandId | null;
  sort: SortKey;
  page: number;
};

function firstValue(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ?? "";
}

function cleanText(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 80);
}

function parseSort(value: string): SortKey {
  if (sortKeys.includes(value as SortKey)) {
    return value as SortKey;
  }
  return "recommended";
}

function parsePriceBand(value: string): PriceBandId | null {
  if (priceBandIds.includes(value as PriceBandId)) {
    return value as PriceBandId;
  }
  return null;
}

function parsePage(value: string): number {
  if (!/^[1-9][0-9]{0,3}$/.test(value)) {
    return 1;
  }
  return Number(value);
}

export function parseProductQuery(input: ProductQueryInput): ParsedProductQuery {
  const q = cleanText(firstValue(input.q));
  const categoryRaw = cleanText(firstValue(input.category));
  const category = isCategoryId(categoryRaw) ? categoryRaw : null;
  const unknownCategory = categoryRaw && !category ? categoryRaw : null;
  const brand = cleanText(firstValue(input.brand));

  return {
    q,
    category,
    unknownCategory,
    brand: brand || null,
    priceBand: parsePriceBand(cleanText(firstValue(input.price))),
    sort: parseSort(cleanText(firstValue(input.sort))),
    page: parsePage(cleanText(firstValue(input.page))),
  };
}

export function activeFilterCount(query: ParsedProductQuery): number {
  return [query.category, query.brand, query.priceBand].filter(Boolean).length;
}

export function listingHref(query: ParsedProductQuery, page = query.page): string {
  const params = new URLSearchParams();
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.brand) {
    params.set("brand", query.brand);
  }
  if (query.priceBand) {
    params.set("price", query.priceBand);
  }
  if (query.sort !== "recommended") {
    params.set("sort", query.sort);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const search = params.toString();
  return search ? `/products?${search}` : "/products";
}

export function clearFiltersHref(query: ParsedProductQuery): string {
  return listingHref({ ...query, category: null, unknownCategory: null, brand: null, priceBand: null, page: 1 });
}

export function queryProducts(
  products: ProductDetail[],
  query: ParsedProductQuery,
): {
  items: ProductDetail[];
  total: number;
  page: number;
  pageCount: number;
} {
  const sorted = searchProducts(products, query);
  const pageCount = sorted.length === 0 ? 0 : Math.ceil(sorted.length / pageSize);
  const page = pageCount === 0 ? 1 : Math.min(query.page, pageCount);
  const start = (page - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageCount,
  };
}
