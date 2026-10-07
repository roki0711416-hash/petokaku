import { OfferCompare, type CompareGroup } from "@/components/offer-compare";
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

  const groups: CompareGroup[] = groupOffersBySalesUnit(offers).map((group) => {
    const split = splitOffersForDisplay(group.offers);
    return {
      key: group.packCount == null ? "unknown" : String(group.packCount),
      tabLabel: group.packCount == null ? "通常" : group.heading,
      note: group.note,
      initial: split.initial,
      rest: split.rest,
      lowestTotal: group.lowestTotal,
    };
  });

  return (
    <>
      <OfferCompare groups={groups} quantity={quantity} quantityUnit={quantityUnit} unitPriceType={unitPriceType} />
      <p className="mt-5 text-xs leading-5 text-muted">
        表示価格・送料・在庫状況は取得時点の情報です。最新の販売情報は各ショップでご確認ください。
      </p>
    </>
  );
}
