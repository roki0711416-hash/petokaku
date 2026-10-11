import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4200;

export const metadata = petPageMetadata("small-animal");

export default async function SmallAnimalPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const category = await oneCategory(searchParams);
  return <PetKindRoute id="small-animal" category={category} />;
}

async function oneCategory(searchParams: Promise<{ category?: string | string[] }>): Promise<string | undefined> {
  const value = (await searchParams).category;
  return Array.isArray(value) ? value[0] : value;
}
