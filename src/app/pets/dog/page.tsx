import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 3600;

export const metadata = petPageMetadata("dog");

export default async function DogPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const category = await oneCategory(searchParams);
  return <PetKindRoute id="dog" category={category} />;
}

async function oneCategory(searchParams: Promise<{ category?: string | string[] }>): Promise<string | undefined> {
  const value = (await searchParams).category;
  return Array.isArray(value) ? value[0] : value;
}
