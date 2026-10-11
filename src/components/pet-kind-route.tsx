import type { Metadata } from "next";
import { PetKindPage } from "@/components/pet-kind-page";
import { loadPetListings } from "@/lib/pets-listings";
import { petById, type PetId } from "@/lib/pets";
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

export async function PetKindRoute({ id }: { id: PetId }) {
  const pet = petById(id);
  const listings = await loadPetListings(pet);
  return <PetKindPage pet={pet} listings={listings} />;
}
