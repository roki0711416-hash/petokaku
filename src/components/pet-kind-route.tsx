import type { Metadata } from "next";
import { PetKindPage } from "@/components/pet-kind-page";
import { listingPageNumber, loadPetListings } from "@/lib/pets-listings";
import { petById, petCategory, type PetId } from "@/lib/pets";
import { robotsMetadata } from "@/lib/site";

export const revalidate = 3600;

export function petPageMetadata(id: PetId): Metadata {
  const pet = petById(id);
  return {
    title: pet.title,
    description: pet.description,
    alternates: { canonical: pet.path },
    robots: robotsMetadata(),
    openGraph: {
      title: `${pet.title} | ペトカク`,
      description: pet.description,
      url: pet.path,
    },
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
  const listings = await loadPetListings(pet, undefined, undefined, selected, page);
  return <PetKindPage pet={pet} listings={listings} categoryId={selected?.id ?? null} />;
}
