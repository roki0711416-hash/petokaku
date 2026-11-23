import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 3900;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return petPageMetadata("cat", await searchParams);
}

export default function CatPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="cat" searchParams={searchParams} />;
}
