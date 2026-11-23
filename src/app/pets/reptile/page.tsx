import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 5100;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return petPageMetadata("reptile", await searchParams);
}

export default function ReptilePetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="reptile" searchParams={searchParams} />;
}
