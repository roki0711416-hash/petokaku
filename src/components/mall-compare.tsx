import { OfferList } from "@/components/offer-list";
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
    <div className="grid gap-4">
      {malls.map((group) => (
        <section key={group.mall} aria-label={group.label} className="rounded-[1.5rem] border border-line bg-sand/50 p-3 sm:p-4">
          <div className="flex items-baseline justify-between gap-3 px-1">
            <h3 className="text-base font-medium text-forest">{group.label}</h3>
            <p className="text-xs text-muted">{group.shopCount}ショップ</p>
          </div>
          {group.mall === "rakuten" ? (
            <p className="mt-1 px-1 text-xs text-muted">
              <a href="https://webservice.rakuten.co.jp/" target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                Supported by Rakuten Developers
              </a>
            </p>
          ) : null}
          <div className="mt-3">
            <OfferList
              offers={group.offers}
              quantity={quantity}
              quantityUnit={quantityUnit}
              unitPriceType={unitPriceType}
              emptyLabel="このモールの掲載はありません。"
            />
          </div>
        </section>
      ))}
    </div>
  );
}
