import type { Metadata } from "next";

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
  const source = process.env.PRICE_SOURCE?.trim() || "sample";
  return process.env.ALLOW_INDEXING === "true" && source !== "sample";
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
