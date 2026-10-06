import { lowestComparableTotal } from "@/lib/catalog";
import { getCategory } from "@/lib/categories";
import type { ParsedProductQuery, PriceBandId, SortKey } from "@/lib/query";
import type { ProductDetail } from "@/lib/types";

export type ComparisonPrice = {
  amount: number | null;
  includesShipping: boolean;
};

export function comparisonPrice(product: ProductDetail): ComparisonPrice {
  const total = lowestComparableTotal(product.offers);
  if (total != null) {
    return { amount: total, includesShipping: true };
  }
  return { amount: product.lowestPrice, includesShipping: false };
}

function normalizeSearchText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-US");
}

export function productSearchText(product: ProductDetail): string {
  const categoryLabel = getCategory(product.category).label;
  return normalizeSearchText(
    [product.name, product.brand, categoryLabel, product.janCode ?? "", product.modelNumber ?? "", product.description].join(
      " ",
    ),
  );
}

function matchesKeyword(product: ProductDetail, keyword: string): boolean {
  if (!keyword) {
    return true;
  }
  const haystack = productSearchText(product);
  return normalizeSearchText(keyword)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

function inPriceBand(amount: number, band: PriceBandId): boolean {
  switch (band) {
    case "under-1000":
      return amount <= 1000;
    case "1000-3000":
      return amount >= 1000 && amount <= 3000;
    case "3000-5000":
      return amount >= 3000 && amount <= 5000;
    case "5000-10000":
      return amount >= 5000 && amount <= 10000;
    case "over-10000":
      return amount >= 10000;
  }
}

export function matchesProductQuery(product: ProductDetail, query: ParsedProductQuery): boolean {
  if (query.category && product.category !== query.category) {
    return false;
  }
  if (query.brand && product.brand !== query.brand) {
    return false;
  }
  if (!matchesKeyword(product, query.q)) {
    return false;
  }
  if (query.priceBand) {
    const price = comparisonPrice(product);
    if (price.amount == null || !inPriceBand(price.amount, query.priceBand)) {
      return false;
    }
  }
  return true;
}

function priceGroup(product: ProductDetail): [number, number] {
  const price = comparisonPrice(product);
  if (price.amount == null) {
    return [2, Number.POSITIVE_INFINITY];
  }
  if (price.includesShipping) {
    return [0, price.amount];
  }
  return [1, price.amount];
}

function compareByPrice(left: ProductDetail, right: ProductDetail, direction: 1 | -1): number {
  const [leftGroup, leftAmount] = priceGroup(left);
  const [rightGroup, rightAmount] = priceGroup(right);
  if (leftGroup !== rightGroup) {
    return leftGroup - rightGroup;
  }
  return (leftAmount - rightAmount) * direction;
}

function recommendRank(product: ProductDetail): number {
  if (product.recommended) {
    return 0;
  }
  if (product.popular) {
    return 1;
  }
  return 2;
}

export function compareProducts(left: ProductDetail, right: ProductDetail, sort: SortKey): number {
  switch (sort) {
    case "price-asc":
      return compareByPrice(left, right, 1);
    case "price-desc":
      return compareByPrice(left, right, -1);
    case "recommended":
      return recommendRank(left) - recommendRank(right) || left.name.localeCompare(right.name, "ja");
  }
}

export function searchProducts(products: ProductDetail[], query: ParsedProductQuery): ProductDetail[] {
  if (query.unknownCategory) {
    return [];
  }
  return products.filter((product) => matchesProductQuery(product, query)).sort((left, right) => compareProducts(left, right, query.sort));
}

export function listBrands(products: ProductDetail[]): string[] {
  return [...new Set(products.map((product) => product.brand))].sort((left, right) => left.localeCompare(right, "ja"));
}
