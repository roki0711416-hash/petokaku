import { OfferList } from "@/components/offer-list";
import { ShopPriceCompare } from "@/components/shop-price-compare";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { groupOffersByMall } from "@/lib/pricing/malls";
import type { Offer } from "@/lib/types";

export function MallCompare({
  offers,
  quantity,
  quantityUnit,
  unitPriceType,
}: {
  offers: Offer[];
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
}) {
  const malls = groupOffersByMall(offers);
  if (malls.length === 0) {
    return <OfferList offers={offers} quantity={quantity} quantityUnit={quantityUnit} unitPriceType={unitPriceType} />;
  }

  return (
    <ShopPriceCompare offers={offers} quantity={quantity} quantityUnit={quantityUnit} unitPriceType={unitPriceType} />
  );
}
