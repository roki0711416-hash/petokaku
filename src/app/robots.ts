import type { MetadataRoute } from "next";
import { getSiteUrl, indexingAllowed } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
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
