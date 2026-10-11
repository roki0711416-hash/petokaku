import { PetKindRoute, petPageMetadata } from "@/components/pet-kind-route";

export const revalidate = 3600;

export const metadata = petPageMetadata("reptile");

export default function ReptilePetPage() {
  return <PetKindRoute id="reptile" />;
}
