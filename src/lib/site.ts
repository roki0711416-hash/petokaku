import type { Metadata, MetadataRoute } from "next";

const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return fallbackSiteUrl;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return fallbackSiteUrl;
    }
    return url.origin;
  } catch {
    return fallbackSiteUrl;
  }
}

export function indexingAllowed(): boolean {
  return process.env.ALLOW_INDEXING === "true";
}

export function robotsPolicy(): MetadataRoute.Robots {
  if (!indexingAllowed()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/search", "/products/yahoo-preview"] }],
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}

const publicPaths = ["/", "/about", "/guide", "/contact", "/privacy", "/terms", "/affiliate"];

export function sitemapEntries(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return publicPaths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.6,
  }));
}

export function privateRobots(): Metadata["robots"] {
  return { index: false, follow: false };
}

export function robotsMetadata(): Metadata["robots"] {
  if (indexingAllowed()) {
    return { index: true, follow: true };
  }
  return { index: false, follow: false };
}
