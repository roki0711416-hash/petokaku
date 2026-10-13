import type { MetadataRoute } from "next";
import { articles } from "@/data/articles";
import { articleSitemapPaths } from "@/lib/articles/catalog";
import { publishedProductPaths } from "@/lib/sitemap-products";
import { getSiteUrl, sitemapEntries } from "@/lib/site";

export const revalidate = 3600;
export const maxDuration = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const staticEntries = sitemapEntries().filter((entry) => !entry.url.includes("/products/jan/"));
  const seen = new Set(staticEntries.map((entry) => entry.url));
  const products = (await publishedProductPaths())
    .map((path) => ({
      url: new URL(path, siteUrl).toString(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }))
    .filter((entry) => !seen.has(entry.url));
  const articleEntries = articleSitemapPaths(articles)
    .map((path) => ({
      url: new URL(path, siteUrl).toString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
    .filter((entry) => !seen.has(entry.url));
  return [...staticEntries, ...articleEntries, ...products];
}
