import type { StockStatus } from "@/lib/types";

export type LiveOfferDraft = {
  id: string;
  variantId: string;
  shopName: string;
  price: number | null;
  shippingFee: number | null;
  productUrl: string | null;
  affiliateUrl: string | null;
  observedAt: string;
  stockStatus: StockStatus;
  source: string;
  isSample: false;
};

export type PriceFetchFailure = {
  ok: false;
  source: string;
  message: string;
  at: string;
};

export type PriceFetchSuccess = {
  ok: true;
  source: string;
  offers: LiveOfferDraft[];
};

export type PriceFetchResult = PriceFetchSuccess | PriceFetchFailure;

export type PriceTarget = {
  id: string;
  name: string;
  janCode: string | null;
};

export type PriceSource = {
  id: string;
  label: string;
  isConfigured: () => boolean;
  fetchOffers: (target: PriceTarget) => Promise<PriceFetchResult>;
};

export type PriceUpdateError = {
  source: string;
  variantId: string;
  message: string;
  at: string;
};
