import { OfferList } from "@/components/offer-list";
import { ShopPriceCompare } from "@/components/shop-price-compare";
import { PriceSummary } from "@/components/ui/price-summary";
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
    return (
      <div>
        <PriceSummary lowestPrice={null} shopCount={0} basis="total" />
        <h2 id="compare-heading" className="mt-5 text-lg font-medium tracking-tight text-ink">
          ショップ別価格比較
        </h2>
        <div className="mt-3">
          <OfferList offers={offers} quantity={quantity} quantityUnit={quantityUnit} unitPriceType={unitPriceType} />
        </div>
      </div>
    );
  }

  return (
    <ShopPriceCompare offers={offers} quantity={quantity} quantityUnit={quantityUnit} unitPriceType={unitPriceType} />
  );
}
