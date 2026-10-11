import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 5100;

export const metadata = petPageMetadata("reptile");

export default async function ReptilePetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const category = await oneCategory(searchParams);
  return <PetKindRoute id="reptile" category={category} />;
}

async function oneCategory(searchParams: Promise<{ category?: string | string[] }>): Promise<string | undefined> {
  const value = (await searchParams).category;
  return Array.isArray(value) ? value[0] : value;
}
