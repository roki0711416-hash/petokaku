import { formatCheckedAt } from "./format.ts";
import { prepareComparableCards } from "./listing-eligibility.ts";
import { listingFitsPet, petPages, type PetId } from "./pets.ts";
import { loadPetDiscoveryItems } from "./pets-listings.ts";
import { buildSearchCandidates, preferComparableCards, type SearchCandidateCard } from "./sources/yahoo/search-candidates.ts";
import type { YahooItem } from "./sources/yahoo/adapter.ts";

export const homePopularLimit = 12;
export const homeCategoryLimit = 8;
export const homePreviewCount = 4;

export type HomeCatalogStatus = "ready" | "empty" | "not-configured" | "request-failed";

export type HomeCatalogCard = {
  id: string;
  name: string;
  href: string;
  compare: boolean;
  price: number | null;
  imageUrl: string | null;
  shopCount: number;
};

export type HomeCatalogCategory = {
  id: PetId;
  label: string;
  href: string;
  cards: HomeCatalogCard[];
};

export type HomeCatalog = {
  status: HomeCatalogStatus;
  observedLabel: string;
  popular: HomeCatalogCard[];
  categories: HomeCatalogCategory[];
};

function toCard(card: SearchCandidateCard): HomeCatalogCard | null {
  if (card.href == null) {
    return null;
  }
  return {
    id: card.id,
    name: card.name,
    href: card.href,
    compare: true,
    price: card.sellingPrice,
    imageUrl: card.imageUrl,
    shopCount: card.shopCount,
  };
}

function cardsFor(items: YahooItem[], observedAt: string, limit: number): HomeCatalogCard[] {
  const comparable = prepareComparableCards(
    buildSearchCandidates(items, observedAt, Math.max(items.length, 1)).map((card) => ({
      ...card,
      price: card.sellingPrice,
      shopCount: card.comparableShopCount,
    })),
  );
  return preferComparableCards(comparable)
    .flatMap((card) => {
      const listed = toCard(card);
      return listed ? [listed] : [];
    })
    .slice(0, limit);
}

function roundRobin(pools: HomeCatalogCard[][], limit: number): HomeCatalogCard[] {
  const selected: HomeCatalogCard[] = [];
  const seen = new Set<string>();
  const depth = Math.max(0, ...pools.map((pool) => pool.length));
  for (let index = 0; index < depth && selected.length < limit; index += 1) {
    for (const pool of pools) {
      const card = pool[index];
      if (!card || seen.has(card.id)) {
        continue;
      }
      seen.add(card.id);
      selected.push(card);
      if (selected.length >= limit) {
        break;
      }
    }
  }
  return selected;
}

export function homeCatalogFromItems(items: YahooItem[], observedAt: string): HomeCatalog {
  const grouped = petPages().map((pet) => ({
    pet,
    items: items.filter((item) => listingFitsPet(item.name, [item.genreName ?? "", ...item.parentGenreNames], pet)),
  }));
  const categories = grouped.map(({ pet, items: matched }) => ({
    id: pet.id,
    label: pet.label,
    href: pet.path,
    cards: cardsFor(matched, observedAt, homeCategoryLimit),
  }));
  const popular = roundRobin(
    grouped.map(({ items: matched }) => cardsFor(matched, observedAt, homePopularLimit)),
    homePopularLimit,
  );
  return {
    status: popular.length === 0 && categories.every((category) => category.cards.length === 0) ? "empty" : "ready",
    observedLabel: formatCheckedAt(observedAt),
    popular,
    categories,
  };
}

function unavailable(status: Exclude<HomeCatalogStatus, "ready" | "empty">, observedAt: string): HomeCatalog {
  return {
    status,
    observedLabel: formatCheckedAt(observedAt),
    popular: [],
    categories: petPages().map((pet) => ({ id: pet.id, label: pet.label, href: pet.path, cards: [] })),
  };
}

export async function loadHomeCatalog(): Promise<HomeCatalog> {
  const observedAt = new Date().toISOString();
  const results = await Promise.all(petPages().map((pet) => loadPetDiscoveryItems(pet)));
  const items = results.flatMap((result) => (result.ok ? result.items : []));
  if (items.length === 0) {
    const missingConfig = results.every((result) => !result.ok && result.reason === "not-configured");
    return unavailable(missingConfig ? "not-configured" : "request-failed", observedAt);
  }
  return homeCatalogFromItems(items, observedAt);
}
