import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4800;

export const metadata = petPageMetadata("fish");

export default async function FishPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const category = await oneCategory(searchParams);
  return <PetKindRoute id="fish" category={category} />;
}

async function oneCategory(searchParams: Promise<{ category?: string | string[] }>): Promise<string | undefined> {
  const value = (await searchParams).category;
  return Array.isArray(value) ? value[0] : value;
}
