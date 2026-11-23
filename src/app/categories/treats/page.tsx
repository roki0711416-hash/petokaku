import { CategoryGuideScreen, categoryGuideMetadata } from "@/components/category-guide-route";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export function generateMetadata({ searchParams }: PageProps) {
  return categoryGuideMetadata("treats", searchParams);
}

export default function TreatsCategoryPage({ searchParams }: PageProps) {
  return <CategoryGuideScreen slug="treats" searchParams={searchParams} />;
}
