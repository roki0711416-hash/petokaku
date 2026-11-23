import type { Metadata } from "next";
import { cache } from "react";
import { PetKindPage } from "@/components/pet-kind-page";
import { listingPageHref, listingPageNumber, loadPetListings } from "@/lib/pets-listings";
import { petById, petCategory, type PetId } from "@/lib/pets";
import { shareMetadata } from "@/lib/seo/share-metadata";
import { filteredHubRobots, hubHasComparableProducts } from "@/lib/thin-pages";

export const revalidate = 3600;

const loadPetListingsForPage = cache(async (id: PetId, categoryId: string | null, page: number) => {
  const pet = petById(id);
  return loadPetListings(pet, undefined, undefined, petCategory(pet, categoryId), page);
});

export async function petPageMetadata(
  id: PetId,
  query: { category?: string | string[]; page?: string | string[] } = {},
): Promise<Metadata> {
  const pet = petById(id);
  const categoryParam = firstQuery(query.category)?.trim() ?? "";
  const page = listingPageNumber(firstQuery(query.page));
  const category = categoryParam === "" || categoryParam === "all" ? null : petCategory(pet, categoryParam);
  const unknownFilter = categoryParam !== "" && categoryParam !== "all" && category == null;
  const filtered = category != null || page > 1;
  const hasProducts = filtered && !unknownFilter ? hubHasComparableProducts(await loadPetListingsForPage(id, category?.id ?? null, page)) : false;
  return {
    ...shareMetadata({
      title: pet.title,
      description: pet.description,
      path: unknownFilter || (filtered && !hasProducts) ? pet.path : listingPageHref(pet.path, category?.id ?? null, page),
    }),
    robots: filteredHubRobots({ unknownFilter, filtered, hasProducts }),
  };
}

function firstQuery(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function PetKindRoute({
  id,
  searchParams,
}: {
  id: PetId;
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
}) {
  const query = await searchParams;
  const pet = petById(id);
  const selected = petCategory(pet, firstQuery(query.category));
  const page = listingPageNumber(firstQuery(query.page));
  const listings = await loadPetListingsForPage(id, selected?.id ?? null, page);
  return <PetKindPage pet={pet} listings={listings} categoryId={selected?.id ?? null} />;
}
