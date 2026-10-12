import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 5100;

export const metadata = petPageMetadata("reptile");

export default function ReptilePetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="reptile" searchParams={searchParams} />;
}
