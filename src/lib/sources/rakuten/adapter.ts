import type { PetokakuOffer, PetokakuProduct } from "../../catalog/petokaku-listing.ts";
import type { ShippingStatus, StockStatus } from "../../types.ts";
import type { RakutenSourceItem } from "./types.ts";

function validJan(value: string | null): string | null {
  return value && /^[0-9]{13}$/.test(value) ? value : null;
}

function httpUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function priceOf(value: number | null): number | null {
  if (value == null || !Number.isInteger(value) || value < 0) {
    return null;
  }
  return value;
}

function shippingOf(status: ShippingStatus | null, fee: number | null): { shippingStatus: ShippingStatus; shippingFee: number | null } {
  if (status === "free" && fee === 0) {
    return { shippingStatus: "free", shippingFee: 0 };
  }
  if (status === "conditional_free") {
    return { shippingStatus: "conditional_free", shippingFee: null };
  }
  if (status === "amount" && fee != null && fee > 0) {
    return { shippingStatus: "amount", shippingFee: fee };
  }
  return { shippingStatus: "unknown", shippingFee: null };
}

function stockOf(value: boolean | null): StockStatus {
  if (value === true) {
    return "in_stock";
  }
  if (value === false) {
    return "out_of_stock";
  }
  return "unknown";
}

function offerFrom(item: RakutenSourceItem, observedAt: string): PetokakuOffer | null {
  const name = item.name?.trim() ?? "";
  const shopName = item.shopName?.trim() ?? "";
  if (name === "" || shopName === "") {
    return null;
  }
  const shipping = shippingOf(item.shippingStatus, item.shippingFee);
  return {
    provider: "rakuten",
    sellerId: item.shopCode?.trim() || null,
    itemCode: item.itemCode?.trim() || null,
    shopName,
    productUrl: httpUrl(item.url),
    affiliateUrl: null,
    listingTitle: name,
    packCount: null,
    packUnit: null,
    observation: {
      price: priceOf(item.price),
      shippingFee: shipping.shippingFee,
      shippingStatus: shipping.shippingStatus,
      stockStatus: stockOf(item.inStock),
      observedAt,
    },
  };
}

export function adaptRakutenItems(items: RakutenSourceItem[], observedAt: string): PetokakuProduct[] {
  const grouped = new Map<string, PetokakuProduct>();
  const separate: PetokakuProduct[] = [];
  for (const item of items) {
    const offer = offerFrom(item, observedAt);
    if (!offer) {
      continue;
    }
    const janCode = validJan(item.janCode);
    const product: PetokakuProduct = {
      name: offer.listingTitle ?? "",
      brand: null,
      category: null,
      unitPriceType: null,
      imageUrl: httpUrl(item.imageUrl),
      variant: {
        janCode,
        sizeLabel: null,
        offers: [offer],
      },
    };
    if (!janCode) {
      separate.push(product);
      continue;
    }
    const current = grouped.get(janCode);
    if (!current) {
      grouped.set(janCode, product);
      continue;
    }
    current.variant.offers.push(offer);
    if (!current.imageUrl && product.imageUrl) {
      current.imageUrl = product.imageUrl;
    }
  }
  return [...grouped.values(), ...separate];
}
