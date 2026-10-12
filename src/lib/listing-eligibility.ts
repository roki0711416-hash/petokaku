import { detectPackCount, hasUnresolvedPackNotation } from "./pricing/pack-count.ts";
import { parseTitleQuantity } from "./pricing/quantity-parse.ts";
import { validJanCode } from "./sources/yahoo/adapter.ts";

export const minimumComparableShops = 2;

export const listingSkipReasons = [
  "name-missing",
  "jan-missing",
  "jan-invalid",
  "price-missing",
  "detail-url-missing",
  "detail-url-mismatch",
  "unit-unconfirmed",
  "shops-insufficient",
] as const;

export type ListingSkipReason = (typeof listingSkipReasons)[number];

export type ListingGate = {
  name: string;
  janCode: string | null;
  href: string | null;
  price: number | null;
  shopCount: number;
  salesUnitKey: string | null;
  salesUnitConfirmed: boolean;
};

export type ShopCountedListing = ListingGate & {
  shopKeys: readonly string[];
  sizeLabel?: string | null;
};

type PricedShop = {
  sellerId: string | null;
  shopName: string;
  price: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "unknown";
};

export function detailHrefForJan(janCode: string): string | null {
  const jan = validJanCode(janCode);
  if (!jan) {
    return null;
  }
  return `/products/jan/${jan}`;
}

export function salesUnitKeyOf(name: string): string | null {
  if (hasUnresolvedPackNotation(name)) {
    return null;
  }
  const detected = detectPackCount(name);
  const pack = detected.packCount == null || detected.packCount <= 1 ? "1" : `${detected.packCount}:${detected.packUnit ?? ""}`;
  const reading = parseTitleQuantity(name);
  const quantity =
    reading.sizeConfidence === "high" && reading.quantity != null && reading.quantityUnit != null
      ? `${reading.quantity}:${reading.quantityUnit}`
      : "open";
  return `${pack}|${quantity}`;
}

export function comparableShopKey(mall: "yahoo" | "rakuten", sellerId: string | null, shopName: string): string | null {
  const id = (sellerId ?? "").trim() || shopName.trim();
  if (id === "" || id === "ショップ名未設定") {
    return null;
  }
  return `${mall}:${id}`;
}

export function collectShopKeys(mall: "yahoo" | "rakuten", offers: readonly PricedShop[]): string[] {
  const keys = new Set<string>();
  for (const offer of offers) {
    if (offer.stockStatus !== "in_stock" || offer.price == null || !Number.isInteger(offer.price) || offer.price <= 0) {
      continue;
    }
    const key = comparableShopKey(mall, offer.sellerId, offer.shopName);
    if (key) {
      keys.add(key);
    }
  }
  return [...keys];
}

function hrefMatchesJan(href: string, jan: string): boolean {
  let url: URL;
  try {
    url = new URL(href, "https://petokaku.com");
  } catch {
    return false;
  }
  if (url.origin !== "https://petokaku.com" || url.pathname !== `/products/jan/${jan}`) {
    return false;
  }
  const allowed = new Set(["with"]);
  for (const key of url.searchParams.keys()) {
    if (!allowed.has(key)) {
      return false;
    }
  }
  const withJans = url.searchParams.get("with");
  if (withJans == null) {
    return url.search === "";
  }
  const parts = withJans.split(",");
  return parts.length > 0 && parts.every((part) => validJanCode(part) != null);
}

function splitSalesUnitKey(janCode: string | null, salesUnitKey: string | null): { jan: string; pack: string; quantity: string } | null {
  const jan = validJanCode(janCode);
  if (!jan || salesUnitKey == null) {
    return null;
  }
  const bar = salesUnitKey.indexOf("|");
  if (bar <= 0 || bar === salesUnitKey.length - 1) {
    return null;
  }
  return { jan, pack: salesUnitKey.slice(0, bar), quantity: salesUnitKey.slice(bar + 1) };
}

export function harmonizeUnitKeys<T extends { janCode: string | null; salesUnitKey: string | null; salesUnitConfirmed: boolean }>(
  cards: readonly T[],
): T[] {
  const stated = new Map<string, Set<string>>();
  for (const card of cards) {
    const parts = splitSalesUnitKey(card.janCode, card.salesUnitKey);
    if (!parts || parts.quantity === "open") {
      continue;
    }
    const id = `${parts.jan}|${parts.pack}`;
    const quantities = stated.get(id) ?? new Set<string>();
    quantities.add(parts.quantity);
    stated.set(id, quantities);
  }
  return cards.map((card) => {
    const parts = splitSalesUnitKey(card.janCode, card.salesUnitKey);
    if (!parts || parts.quantity !== "open") {
      return card;
    }
    const options = stated.get(`${parts.jan}|${parts.pack}`);
    if (options && options.size > 1) {
      return { ...card, salesUnitConfirmed: false };
    }
    if (options && options.size === 1) {
      const quantity = [...options][0];
      return { ...card, salesUnitKey: `${parts.pack}|${quantity}`, salesUnitConfirmed: true };
    }
    return card;
  });
}

export function applyCombinedShopCounts<T extends ShopCountedListing>(cards: readonly T[]): T[] {
  const grouped = new Map<string, Set<string>>();
  for (const card of cards) {
    const parts = splitSalesUnitKey(card.janCode, card.salesUnitKey);
    if (!parts || !card.salesUnitConfirmed) {
      continue;
    }
    const id = `${parts.jan}|${card.salesUnitKey}`;
    const shops = grouped.get(id) ?? new Set<string>();
    for (const key of card.shopKeys) {
      if (key.trim() !== "") {
        shops.add(key);
      }
    }
    grouped.set(id, shops);
  }
  return cards.map((card) => {
    const parts = splitSalesUnitKey(card.janCode, card.salesUnitKey);
    const id = parts && card.salesUnitConfirmed ? `${parts.jan}|${card.salesUnitKey}` : null;
    const shops = id ? grouped.get(id) : null;
    const shopKeys = shops ? [...shops] : [...card.shopKeys];
    return { ...card, shopCount: shopKeys.length, shopKeys };
  });
}

function dedupeComparableCards<T extends ShopCountedListing>(cards: readonly T[]): T[] {
  const best = new Map<string, T>();
  for (const card of cards) {
    const parts = splitSalesUnitKey(card.janCode, card.salesUnitKey);
    const id = parts ? `${parts.jan}|${card.salesUnitKey}` : null;
    if (!id) {
      continue;
    }
    const current = best.get(id);
    if (!current) {
      best.set(id, card);
      continue;
    }
    const currentSized = current.sizeLabel != null && current.sizeLabel !== "";
    const nextSized = card.sizeLabel != null && card.sizeLabel !== "";
    if (!currentSized && nextSized) {
      best.set(id, card);
    }
  }
  return cards.filter((card) => {
    const parts = splitSalesUnitKey(card.janCode, card.salesUnitKey);
    if (!parts) {
      return true;
    }
    return best.get(`${parts.jan}|${card.salesUnitKey}`) === card;
  });
}

export function listingSkipReason(input: ListingGate): ListingSkipReason | null {
  if (input.name.trim() === "") {
    return "name-missing";
  }
  if (input.janCode == null || input.janCode.trim() === "") {
    return "jan-missing";
  }
  const jan = validJanCode(input.janCode);
  if (!jan) {
    return "jan-invalid";
  }
  if (input.price == null || !Number.isInteger(input.price) || input.price <= 0) {
    return "price-missing";
  }
  if (input.href == null || input.href.trim() === "") {
    return "detail-url-missing";
  }
  if (!hrefMatchesJan(input.href, jan)) {
    return "detail-url-mismatch";
  }
  if (!input.salesUnitConfirmed || input.salesUnitKey == null) {
    return "unit-unconfirmed";
  }
  if (!Number.isInteger(input.shopCount) || input.shopCount < minimumComparableShops) {
    return "shops-insufficient";
  }
  return null;
}

export function isListableProduct(input: ListingGate): boolean {
  return listingSkipReason(input) === null;
}

export function selectListableProducts<T extends ListingGate>(cards: readonly T[]): T[] {
  return cards.filter((card) => isListableProduct(card));
}

// 掲載の入口はこちら。販売単位をそろえてショップ数を合算してから、selectListableProducts で一度だけ判定する。
export function prepareComparableCards<T extends ShopCountedListing>(cards: readonly T[]): T[] {
  return dedupeComparableCards(selectListableProducts(applyCombinedShopCounts(harmonizeUnitKeys(cards))));
}
