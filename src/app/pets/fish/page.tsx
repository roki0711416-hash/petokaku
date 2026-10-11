import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4800;

export const metadata = petPageMetadata("fish");

export default function FishPetPage() {
  return <PetKindRoute id="fish" />;
}
