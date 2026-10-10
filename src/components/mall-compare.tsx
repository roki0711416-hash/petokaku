import { OfferList } from "@/components/offer-list";

const rakutenCreditHtml = `<!-- Rakuten Web Services Attribution Snippet FROM HERE -->
<a href="https://webservice.rakuten.co.jp/" target="_blank"><img src="https://webservice.rakuten.co.jp/img/credit/200709/credit_22121.gif" border="0" alt="Rakuten Web Service Center" title="Rakuten Web Service Center" width="221" height="21"/></a>
<!-- Rakuten Web Services Attribution Snippet TO HERE -->`;
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
            <div className="mt-2 px-1">
              <p className="text-xs leading-5 text-muted">
                同じJANコードの商品価格ナビです。店舗ごとの個数と送料は含まれていません。セット表記がある製品は別の販売単位に分け、この金額はページ上部の最安値には入れていません。
              </p>
              <div className="mt-2" dangerouslySetInnerHTML={{ __html: rakutenCreditHtml }} />
            </div>
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
