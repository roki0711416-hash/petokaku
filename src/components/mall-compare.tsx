import { OfferList } from "@/components/offer-list";
import { AffiliateDisclosure, PrMark, ShopPriceCompare } from "@/components/shop-price-compare";
import { PriceSummary } from "@/components/ui/price-summary";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { groupOffersByMall } from "@/lib/pricing/malls";
import { shopProductLink } from "@/lib/pricing/shop-link";
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
        <h2 id="compare-heading" className="mt-5 flex min-w-0 items-center gap-2 text-lg font-medium tracking-tight text-ink">
          ショップ別価格比較
          {offers.some((offer) => shopProductLink(offer).affiliate) ? <PrMark /> : null}
        </h2>
        {offers.some((offer) => shopProductLink(offer).affiliate) ? <AffiliateDisclosure /> : null}
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
