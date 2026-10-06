import { OfferStack } from "@/components/offer-stack";
import { groupOffersBySalesUnit } from "@/lib/catalog";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { splitOffersForDisplay } from "@/lib/pricing/visible-offers";
import type { Offer } from "@/lib/types";

export function OfferList({
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
  if (offers.length === 0) {
    return (
      <p className="rounded-[1.75rem] border border-dashed border-line bg-card px-5 py-8 text-muted">
        この商品のサンプル価格は、まだ登録されていません。
      </p>
    );
  }

  const groups = groupOffersBySalesUnit(offers);
  const separate = groups.length > 1 || groups.some((group) => group.packCount != null);

  return (
    <>
      {groups.map((group) => {
        const { initial, rest } = splitOffersForDisplay(group.offers);
        return (
          <section key={group.packCount ?? "unknown"} className="mt-8 first:mt-0" aria-label={group.heading}>
            {separate ? (
              <div className="mb-4">
                <h3 className="text-xl font-bold">{group.heading}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{group.note}</p>
              </div>
            ) : null}
            <OfferStack
              initial={initial}
              rest={rest}
              lowestTotal={group.lowestTotal}
              quantity={quantity}
              quantityUnit={quantityUnit}
              unitPriceType={unitPriceType}
            />
          </section>
        );
      })}
      <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">
        表示価格・送料・在庫状況は取得時点の情報です。最新の販売情報は各ショップでご確認ください。
      </p>
    </>
  );
}
