import type { ShippingStatus } from "../../types.ts";

export type RakutenSourceItem = {
  name: string | null;
  price: number | null;
  url: string | null;
  imageUrl: string | null;
  shopName: string | null;
  shopCode: string | null;
  itemCode: string | null;
  janCode: string | null;
  shippingFee: number | null;
  shippingStatus: ShippingStatus | null;
  inStock: boolean | null;
};
