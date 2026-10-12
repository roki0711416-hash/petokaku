import type { Metadata } from "next";
import { readableListingTitle as compactVisibleTitle } from "../pricing/display-title.ts";
import { janPageRobots } from "../site.ts";
import { readableListingTitle as cleanListingTitle } from "../sources/yahoo/listing-title.ts";

export function janProductMetadata(input: { jan: string; name: string; brand: string; imageUrl?: string | null }): Metadata {
  const visible = compactVisibleTitle(cleanListingTitle(input.name));
  const title = `${visible || "商品"}の価格比較`;
  const brand = input.brand.trim();
  const brandPrefix = brand !== "" && !title.includes(brand) ? `${brand}の` : "";
  const description = `${brandPrefix}${title}（JAN ${input.jan}）の販売価格と送料を、ショップごとに見比べられます。購入前にショップで確認してください。`;
  const canonical = `/products/jan/${input.jan}`;
  const image = input.imageUrl?.startsWith("https://") ? input.imageUrl : null;
  return {
    title,
    description,
    alternates: { canonical },
    robots: janPageRobots(true),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "ペトカク",
      locale: "ja_JP",
      type: "website",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
  };
}
