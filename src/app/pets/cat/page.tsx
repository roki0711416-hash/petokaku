import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 3600;

export const metadata = petPageMetadata("cat");

export default function CatPetPage() {
  return <PetKindRoute id="cat" />;
}
