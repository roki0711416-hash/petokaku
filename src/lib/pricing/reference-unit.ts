import { formatUnitAmount } from "../format.ts";
import { calculateUnitPrices, type QuantityUnit, type UnitPriceType } from "./calculate.ts";
import { unitPriceQuantity } from "./quantity-parse.ts";
import type { Offer } from "../types.ts";

export type ReferenceUnitLines = {
  item: string | null;
  shippingTotal: string | null;
};

// 容量が体積として確定し、単価種別が per_l のときだけ参考単価を返す。
// 内部表現は l または ml（例: 5L → 5000ml）どちらでもよい。kgや容量不明は出さない。
// セット総量が読めない場合も出さない。送料込みは送料確定時のみ。
export function referenceLiterUnitLines(
  offer: Pick<Offer, "price" | "shippingFee" | "packCount" | "totalQuantity" | "unitPriceReady">,
  quantity: number | null,
  quantityUnit: QuantityUnit | null,
  unitPriceType: UnitPriceType,
): ReferenceUnitLines {
  const empty: ReferenceUnitLines = { item: null, shippingTotal: null };
  if (unitPriceType !== "per_l" || !offer.unitPriceReady) {
    return empty;
  }
  if (quantityUnit !== "l" && quantityUnit !== "ml") {
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
