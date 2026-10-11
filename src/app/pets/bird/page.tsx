import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4500;

export const metadata = petPageMetadata("bird");

export default async function BirdPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const category = await oneCategory(searchParams);
  return <PetKindRoute id="bird" category={category} />;
}

async function oneCategory(searchParams: Promise<{ category?: string | string[] }>): Promise<string | undefined> {
  const value = (await searchParams).category;
  return Array.isArray(value) ? value[0] : value;
}
