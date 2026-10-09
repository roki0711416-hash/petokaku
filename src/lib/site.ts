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

export const indexedJanLimit = 20;

export type IndexedJanProduct = {
  janCode: string;
  label: string;
};

export const indexedJanProducts: readonly IndexedJanProduct[] = [
  { janCode: "3182550706933", label: "ロイヤルカナンの猫用4kg商品" },
];

const indexedJanPattern = /^[0-9]{13}$/;

export function selectIndexedJans(items: readonly IndexedJanProduct[], limit = indexedJanLimit): IndexedJanProduct[] {
  const capped = Number.isInteger(limit) && limit > 0 ? Math.min(limit, indexedJanLimit) : 0;
  const seen = new Set<string>();
  const selected: IndexedJanProduct[] = [];
  for (const item of items) {
    if (!indexedJanPattern.test(item.janCode) || seen.has(item.janCode)) {
      continue;
    }
    seen.add(item.janCode);
    selected.push({ janCode: item.janCode, label: item.label });
    if (selected.length >= capped) {
      break;
    }
  }
  return selected;
}

export function indexedJanPath(janCode: string): string {
  return `/products/jan/${janCode}`;
}

export function sitemapEntries(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const pages = publicPaths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.6,
  }));
  const products = selectIndexedJans(indexedJanProducts).map((product) => ({
    url: new URL(indexedJanPath(product.janCode), siteUrl).toString(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  return [...pages, ...products];
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

export function janPageRobots(productLoaded: boolean): Metadata["robots"] {
  if (!productLoaded) {
    return privateRobots();
  }
  return robotsMetadata();
}
