import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 3600;

export const metadata = petPageMetadata("small-animal");

export default function SmallAnimalPetPage() {
  return <PetKindRoute id="small-animal" />;
}
