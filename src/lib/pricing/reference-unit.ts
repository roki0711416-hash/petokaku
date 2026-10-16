import { formatUnitAmount } from "../format.ts";
import { calculateUnitPrices, type QuantityUnit, type UnitPriceType } from "./calculate.ts";
import { unitPriceQuantity } from "./quantity-parse.ts";
import type { Offer } from "../types.ts";

export type ReferenceUnitLines = {
  item: string | null;
  shippingTotal: string | null;
};

// L単位で容量が確定し、掲載側も同じ単位で単価計算できるときだけ参考単価を返す。
// kgや容量不明、セット総量が読めない場合は出さない。送料込みは送料確定時のみ。
export function referenceLiterUnitLines(
  offer: Pick<Offer, "price" | "shippingFee" | "packCount" | "totalQuantity" | "unitPriceReady">,
  quantity: number | null,
  quantityUnit: QuantityUnit | null,
  unitPriceType: UnitPriceType,
): ReferenceUnitLines {
  const empty: ReferenceUnitLines = { item: null, shippingTotal: null };
  if (unitPriceType !== "per_l" || quantityUnit !== "l" || !offer.unitPriceReady) {
    return empty;
  }
  const pricedQuantity = unitPriceQuantity(quantity, offer.packCount, offer.totalQuantity);
  if (pricedQuantity == null) {
    return empty;
  }
  const unitPrice = calculateUnitPrices({
    price: offer.price,
    shipping: offer.shippingFee,
    quantity: pricedQuantity,
    quantityUnit,
    unitPriceType,
  });
  if (!unitPrice.itemUnit || unitPrice.unitLabel !== "L") {
    return empty;
  }
  const packPrefix = offer.packCount != null && offer.packCount > 1 ? "セット全体 " : "";
  return {
    item: `参考：${packPrefix}${formatUnitAmount(unitPrice.itemUnit, "L")}`,
    shippingTotal:
      unitPrice.effectiveUnit == null ? null : `送料込み参考：${packPrefix}${formatUnitAmount(unitPrice.effectiveUnit, "L")}`,
  };
}
