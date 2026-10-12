import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 3600;

export const metadata = petPageMetadata("dog");

export default function DogPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="dog" searchParams={searchParams} />;
}
