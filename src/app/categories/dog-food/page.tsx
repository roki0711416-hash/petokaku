import { CategoryGuideScreen, categoryGuideMetadata } from "@/components/category-guide-route";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export function generateMetadata({ searchParams }: PageProps) {
  return categoryGuideMetadata("dog-food", searchParams);
}

export default function DogFoodCategoryPage({ searchParams }: PageProps) {
  return <CategoryGuideScreen slug="dog-food" searchParams={searchParams} />;
}
