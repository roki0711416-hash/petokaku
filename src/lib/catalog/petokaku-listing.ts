import type { UnitPriceType } from "../pricing/calculate.ts";
import type { CategoryId, PackUnit, ShippingStatus, StockStatus } from "../types.ts";

export const catalogProviders = ["yahoo", "rakuten"] as const;

export type CatalogProvider = (typeof catalogProviders)[number];

export type PetokakuObservation = {
  price: number | null;
  shippingFee: number | null;
  shippingStatus: ShippingStatus;
  stockStatus: StockStatus;
  observedAt: string;
};

export type PetokakuOffer = {
  provider: CatalogProvider;
  sellerId: string | null;
  itemCode: string | null;
  shopName: string;
  productUrl: string | null;
  affiliateUrl: string | null;
  listingTitle: string | null;
  packCount: number | null;
  packUnit: PackUnit | null;
  observation: PetokakuObservation;
};

export type PetokakuVariant = {
  janCode: string | null;
  sizeLabel: string | null;
  offers: PetokakuOffer[];
};

export type PetokakuProduct = {
  name: string;
  brand: string | null;
  category: CategoryId | null;
  unitPriceType: UnitPriceType | null;
  imageUrl: string | null;
  variant: PetokakuVariant;
};

export function sameCatalogOffer(left: PetokakuOffer, right: PetokakuOffer): boolean {
  return (
    left.provider === right.provider &&
    left.sellerId != null &&
    left.sellerId === right.sellerId &&
    left.itemCode != null &&
    left.itemCode === right.itemCode
  );
}
