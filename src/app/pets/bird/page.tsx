import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4500;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return petPageMetadata("bird", await searchParams);
}

export default function BirdPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="bird" searchParams={searchParams} />;
}
