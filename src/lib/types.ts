import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";

export const quantityConfidences = ["high", "medium", "unknown"] as const;

export type QuantityConfidence = (typeof quantityConfidences)[number];

export const quantitySources = ["api", "master", "shop_titles", "shop_title", "sample"] as const;

export type QuantitySource = (typeof quantitySources)[number];

export const categoryIds = [
  "dog",
  "cat",
  "small-animal",
  "bird",
  "fish",
  "other",
] as const;

export type CategoryId = (typeof categoryIds)[number];

export const stockStatuses = ["in_stock", "out_of_stock", "unknown"] as const;

export type StockStatus = (typeof stockStatuses)[number];

export const priceProviders = ["sample", "yahoo", "rakuten"] as const;

export type PriceProvider = (typeof priceProviders)[number];

export const shippingStatuses = ["free", "conditional_free", "unknown", "amount"] as const;

export type ShippingStatus = (typeof shippingStatuses)[number];

export const packUnits = ["袋", "個", "本", "パック"] as const;

export type PackUnit = (typeof packUnits)[number];

// 商品そのもの。容量違いは ProductVariant、ショップ違いは ShopOffer、
// 取得した価格は PriceSnapshot。同じ offer の価格は observedAt つきで複数持てる。
export type Product = {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  description: string;
  unitPriceType: UnitPriceType;
  createdAt: string;
  updatedAt: string;
  isSample: boolean;
};

export type ProductVariant = {
  id: string;
  productId: string;
  slug: string;
  sizeLabel: string;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  statedQuantity: number | null;
  statedUnit: QuantityUnit | null;
  quantityConfidence: QuantityConfidence;
  quantitySource: QuantitySource | null;
  janCode: string | null;
  modelNumber: string | null;
  artVariant: number;
  description: string;
  popular: boolean;
  recommended: boolean;
  createdAt: string;
  updatedAt: string;
  isSample: boolean;
};

export type ShopOffer = {
  id: string;
  variantId: string;
  shopName: string;
  productUrl: string | null;
  affiliateUrl: string | null;
  source: PriceProvider;
  provider: PriceProvider;
  sellerId: string | null;
  itemCode: string | null;
  isSample: boolean;
};

export type PriceSnapshot = {
  id: string;
  offerId: string;
  price: number | null;
  shippingFee: number | null;
  shippingStatus: ShippingStatus;
  stockStatus: StockStatus;
  observedAt: string;
};

export type Offer = {
  id: string;
  variantId: string;
  shopName: string;
  listingTitle: string | null;
  price: number | null;
  shippingFee: number | null;
  productUrl: string | null;
  affiliateUrl: string | null;
  priceCheckedAt: string | null;
  priceSnapshotId: string | null;
  shippingStatus: ShippingStatus;
  stockStatus: StockStatus;
  source: PriceProvider;
  provider: PriceProvider;
  sellerId: string | null;
  itemCode: string | null;
  packCount: number | null;
  packUnit: PackUnit | null;
  totalQuantity: number | null;
  unitPriceReady: boolean;
  isSample: boolean;
};

export type ProductDetail = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  variant: number;
  janCode: string | null;
  modelNumber: string | null;
  sizeLabel: string;
  description: string;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  statedQuantity: number | null;
  statedUnit: QuantityUnit | null;
  quantityConfidence: QuantityConfidence;
  quantitySource: QuantitySource | null;
  unitPriceType: UnitPriceType;
  createdAt: string;
  updatedAt: string;
  isSample: boolean;
  imageUrl: string | null;
  sourceCategoryName: string | null;
  popular: boolean;
  recommended: boolean;
  offers: Offer[];
  lowestPrice: number | null;
  highestPrice: number | null;
  latestCheckedAt: string | null;
};

export type ProductCardModel = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  sizeLabel: string;
  variant: number;
  lowestPrice: number | null;
  highestPrice: number | null;
  shopCount: number;
};
