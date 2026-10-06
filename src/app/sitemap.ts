import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const paths = ["/", "/about", "/guide", "/contact", "/privacy", "/terms", "/affiliate"];

  return paths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.6,
  }));
}
