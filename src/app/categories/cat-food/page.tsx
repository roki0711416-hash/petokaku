import { CategoryGuideScreen, categoryGuideMetadata } from "@/components/category-guide-route";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export function generateMetadata({ searchParams }: PageProps) {
  return categoryGuideMetadata("cat-food", searchParams);
}

export default function CatFoodCategoryPage({ searchParams }: PageProps) {
  return <CategoryGuideScreen slug="cat-food" searchParams={searchParams} />;
}
