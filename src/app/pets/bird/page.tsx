import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4500;

export const metadata = petPageMetadata("bird");

export default function BirdPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="bird" searchParams={searchParams} />;
}
