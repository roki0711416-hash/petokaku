import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 4500;

export const metadata = petPageMetadata("bird");

export default function BirdPetPage() {
  return <PetKindRoute id="bird" />;
}
