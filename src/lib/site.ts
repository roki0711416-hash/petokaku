import type { Metadata, MetadataRoute } from "next";
import { categoryGuidePaths } from "./item-guides.ts";
import { petPages } from "./pets.ts";

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

const publicPaths = ["/", "/about", "/price-data", "/guide", "/articles", "/contact", "/privacy", "/cookies", "/terms", "/affiliate"];

export const indexedJanLimit = 20;

export type IndexedJanProduct = {
  janCode: string;
  label: string;
};

// 重点商品。TOPでは使わず、使い方ページなどから容量が分かる文言でつなぐ。
export const indexedJanProducts: readonly IndexedJanProduct[] = [
  { janCode: "4903351011250", label: "LION ニオイをとる砂 5L×4個" },
  { janCode: "4520699667989", label: "デオシート レギュラー 112枚×4袋" },
  { janCode: "3182550706933", label: "ロイヤルカナン インドア 成猫用 4kg" },
  { janCode: "4562358781780", label: "ニュートロ シュプレモ 小型犬 成犬用 3kg" },
  { janCode: "4905009714353", label: "アイリスオーヤマ 紙の猫砂 7L" },
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

export type SitemapBuildInput = {
  now?: Date;
  categoryUpdatedAt?: Readonly<Record<string, string>>;
};

function modifiedAt(value: string | undefined, now: Date): Date {
  if (!value) {
    return now;
  }
  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    return now;
  }
  return new Date(time);
}

export function sitemapEntries(input: SitemapBuildInput = {}): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = input.now ?? new Date();
  const updated = input.categoryUpdatedAt ?? {};
  const pages = publicPaths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.6,
  }));
  const guides = categoryGuidePaths().map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: modifiedAt(updated[path], now),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const categoryIndexModified = guides.reduce((latest, entry) => {
    return entry.lastModified.getTime() > latest.getTime() ? entry.lastModified : latest;
  }, guides[0]?.lastModified ?? now);
  const categoriesIndex = {
    url: new URL("/categories", siteUrl).toString(),
    lastModified: categoryIndexModified,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  };
  const petEntries = petPages().map((pet) => ({
    url: new URL(pet.path, siteUrl).toString(),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  return [...pages, ...guides, categoriesIndex, ...petEntries];
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
