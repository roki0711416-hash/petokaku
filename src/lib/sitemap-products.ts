import { petPages } from "./pets.ts";
import { loadPetListings, type PetListingGroup } from "./pets-listings.ts";
import { validJanCode } from "./sources/yahoo/adapter.ts";

export function canonicalJanPaths(hrefs: readonly string[]): string[] {
  const seen = new Set<string>();
  const paths: string[] = [];
  for (const href of hrefs) {
    let url: URL;
    try {
      url = new URL(href, "https://petokaku.com");
    } catch {
      continue;
    }
    if (url.origin !== "https://petokaku.com") {
      continue;
    }
    const jan = url.pathname.match(/^\/products\/jan\/([0-9]{13})$/)?.[1];
    if (!jan || validJanCode(jan) == null || seen.has(jan)) {
      continue;
    }
    seen.add(jan);
    paths.push(`/products/jan/${jan}`);
  }
  return paths;
}

function publishedHrefs(group: PetListingGroup): string[] {
  if (group.status !== "ready") {
    return [];
  }
  return group.cards.flatMap((card) => (card.compare && card.href.trim() !== "" ? [card.href] : []));
}

export async function publishedProductPaths(): Promise<string[]> {
  const listings = await Promise.all(petPages().map((pet) => loadPetListings(pet)));
  return canonicalJanPaths(listings.flatMap((listing) => [...publishedHrefs(listing.yahoo), ...publishedHrefs(listing.rakuten)]));
}
