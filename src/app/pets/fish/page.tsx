import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4800;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return petPageMetadata("fish", await searchParams);
}

export default function FishPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="fish" searchParams={searchParams} />;
}
