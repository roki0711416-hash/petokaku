import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 3900;

export const metadata = petPageMetadata("cat");

export default function CatPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="cat" searchParams={searchParams} />;
}
