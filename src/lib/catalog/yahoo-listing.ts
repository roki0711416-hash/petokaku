import type { PetokakuProduct } from "./petokaku-listing.ts";
import type { CategoryId, PackUnit, ShippingStatus, StockStatus } from "../types.ts";
import type { UnitPriceType } from "../pricing/calculate.ts";

export type YahooListingInput = {
  name: string;
  brand: string;
  category: CategoryId;
  unitPriceType: UnitPriceType;
  imageUrl: string | null;
  janCode: string | null;
  sizeLabel: string;
  offers: {
    shopName: string;
    productUrl: string | null;
    affiliateUrl: string | null;
    sellerId: string | null;
    itemCode: string | null;
    listingTitle: string | null;
    packCount: number | null;
    packUnit: PackUnit | null;
    price: number | null;
    shippingFee: number | null;
    shippingStatus: ShippingStatus;
    stockStatus: StockStatus;
    observedAt: string;
  }[];
};

export function yahooListingToPetokaku(input: YahooListingInput): PetokakuProduct {
  return {
    name: input.name,
    brand: input.brand,
    category: input.category,
    unitPriceType: input.unitPriceType,
    imageUrl: input.imageUrl,
    variant: {
      janCode: input.janCode,
      sizeLabel: input.sizeLabel,
      offers: input.offers.map((offer) => ({
        provider: "yahoo",
        sellerId: offer.sellerId,
        itemCode: offer.itemCode,
        shopName: offer.shopName,
        productUrl: offer.productUrl,
        affiliateUrl: offer.affiliateUrl,
        listingTitle: offer.listingTitle,
        packCount: offer.packCount,
        packUnit: offer.packUnit,
        observation: {
          price: offer.price,
          shippingFee: offer.shippingFee,
          shippingStatus: offer.shippingStatus,
          stockStatus: offer.stockStatus,
          observedAt: offer.observedAt,
        },
      })),
    },
  };
}
