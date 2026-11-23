import { CategoryGuideScreen, categoryGuideMetadata } from "@/components/category-guide-route";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export function generateMetadata({ searchParams }: PageProps) {
  return categoryGuideMetadata("cat-tower", searchParams);
}

export default function CatTowerCategoryPage({ searchParams }: PageProps) {
  return <CategoryGuideScreen slug="cat-tower" searchParams={searchParams} />;
}
