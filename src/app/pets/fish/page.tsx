import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4800;

export const metadata = petPageMetadata("fish");

export default function FishPetPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  return <PetKindRoute id="fish" searchParams={searchParams} />;
}
