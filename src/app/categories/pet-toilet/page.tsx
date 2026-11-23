import { CategoryGuideScreen, categoryGuideMetadata } from "@/components/category-guide-route";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export function generateMetadata({ searchParams }: PageProps) {
  return categoryGuideMetadata("pet-toilet", searchParams);
}

export default function PetToiletCategoryPage({ searchParams }: PageProps) {
  return <CategoryGuideScreen slug="pet-toilet" searchParams={searchParams} />;
}
