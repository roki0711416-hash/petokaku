import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 3900;

export const metadata = petPageMetadata("cat");

export default async function CatPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const category = await oneCategory(searchParams);
  return <PetKindRoute id="cat" category={category} />;
}

async function oneCategory(searchParams: Promise<{ category?: string | string[] }>): Promise<string | undefined> {
  const value = (await searchParams).category;
  return Array.isArray(value) ? value[0] : value;
}
