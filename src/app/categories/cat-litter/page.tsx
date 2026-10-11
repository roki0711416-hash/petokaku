import { CategoryGuideScreen, categoryGuideMetadata } from "@/components/category-guide-route";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export function generateMetadata({ searchParams }: PageProps) {
  return categoryGuideMetadata("cat-litter", searchParams);
}

export default function CatLitterCategoryPage({ searchParams }: PageProps) {
  return <CategoryGuideScreen slug="cat-litter" searchParams={searchParams} />;
}
