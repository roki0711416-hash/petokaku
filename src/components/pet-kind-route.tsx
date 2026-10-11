import type { Metadata } from "next";
import { PetKindPage } from "@/components/pet-kind-page";
import { loadPetListings } from "@/lib/pets-listings";
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

export async function PetKindRoute({ id, category }: { id: PetId; category?: string }) {
  const pet = petById(id);
  const selected = petCategory(pet, category);
  const listings = await loadPetListings(pet, undefined, undefined, selected);
  return <PetKindPage pet={pet} listings={listings} categoryId={selected?.id ?? null} />;
}
