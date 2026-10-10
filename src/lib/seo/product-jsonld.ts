import type { StockStatus } from "@/lib/types";

export type ProductJsonOffer = {
  shopName: string;
  price: number | null;
  url: string | null;
  stockStatus: StockStatus;
};

export type ProductJsonInput = {
  name: string;
  brand: string;
  janCode: string | null;
  imageUrl: string | null;
  pageUrl: string;
  sizeLabel: string | null;
  offers: ProductJsonOffer[];
};

const availability: Partial<Record<StockStatus, string>> = {
  in_stock: "https://schema.org/InStock",
  out_of_stock: "https://schema.org/OutOfStock",
};

export function productStructuredData(input: ProductJsonInput): Record<string, unknown> | null {
  const name = input.name.trim();
  if (!name) {
    return null;
  }

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url: input.pageUrl,
  };

  const brand = input.brand.trim();
  if (brand) {
    product.brand = { "@type": "Brand", name: brand };
  }
  if (input.janCode && /^[0-9]{13}$/.test(input.janCode)) {
    product.sku = input.janCode;
    product.gtin13 = input.janCode;
  }
  if (input.imageUrl) {
    product.image = input.imageUrl;
  }
  if (input.sizeLabel) {
    product.additionalProperty = {
      "@type": "PropertyValue",
      name: "容量",
      value: input.sizeLabel,
    };
  }

  const offers = input.offers.flatMap((offer) => {
    if (offer.price == null || !Number.isInteger(offer.price) || offer.price < 0 || !offer.url) {
      return [];
    }
    const entry: Record<string, unknown> = {
      "@type": "Offer",
      price: offer.price,
      priceCurrency: "JPY",
      url: offer.url,
      seller: { "@type": "Organization", name: offer.shopName || "販売店" },
    };
    const stock = availability[offer.stockStatus];
    if (stock) {
      entry.availability = stock;
    }
    return [entry];
  });
  if (offers.length > 0) {
    product.offers = offers;
  }

  return product;
}
