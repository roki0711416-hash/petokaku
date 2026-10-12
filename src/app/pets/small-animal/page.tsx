import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4200;

export const metadata = petPageMetadata("small-animal");

export default function SmallAnimalPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="small-animal" searchParams={searchParams} />;
}
