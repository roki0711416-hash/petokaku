import { CategoryGuideScreen, categoryGuideMetadata } from "@/components/category-guide-route";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export function generateMetadata({ searchParams }: PageProps) {
  return categoryGuideMetadata("pet-sheets", searchParams);
}

export default function PetSheetsCategoryPage({ searchParams }: PageProps) {
  return <CategoryGuideScreen slug="pet-sheets" searchParams={searchParams} />;
}
