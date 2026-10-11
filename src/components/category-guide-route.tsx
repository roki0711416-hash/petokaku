import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItemGuidePage } from "@/components/item-guide-page";
import { itemGuideBySlug, type ItemGuideSlug } from "@/lib/item-guides";
import { loadGuideListings } from "@/lib/item-guides-listings";
import { privateRobots, robotsMetadata } from "@/lib/site";

type SearchParams = Promise<{ q?: string | string[] }>;

function userQueryOf(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
}

export async function categoryGuideMetadata(slug: ItemGuideSlug, searchParams: SearchParams): Promise<Metadata> {
  const guide = itemGuideBySlug(slug);
  if (!guide) {
    return { title: "ページが見つかりません", robots: privateRobots() };
  }
  const userQuery = userQueryOf((await searchParams).q);
  const metadata: Metadata = {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: guide.path },
    openGraph: {
      title: `${guide.title} | ペトカク`,
      description: guide.description,
      url: guide.path,
    },
  };
  if (userQuery !== "") {
    return { ...metadata, robots: privateRobots() };
  }
  return { ...metadata, robots: robotsMetadata() };
}

export async function CategoryGuideScreen({ slug, searchParams }: { slug: ItemGuideSlug; searchParams: SearchParams }) {
  const guide = itemGuideBySlug(slug);
  if (!guide) {
    notFound();
  }
  const userQuery = userQueryOf((await searchParams).q);
  const listings = await loadGuideListings(guide, userQuery);
  return <ItemGuidePage guide={guide} userQuery={userQuery} listings={listings} />;
}
