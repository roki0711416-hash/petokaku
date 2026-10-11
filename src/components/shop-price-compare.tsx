"use client";

import { useState, type ReactNode } from "react";
import { ShopCard, ShopTable } from "@/components/ui/shop-card";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { comparisonMallOf, type ComparisonMall } from "@/lib/pricing/malls";
import {
  compareWindow,
  groupOtherSalesUnits,
  initialCompareCount,
  partitionShopComparison,
} from "@/lib/pricing/shop-compare";
import { payableTotal } from "@/lib/pricing/visible-offers";
import type { Offer } from "@/lib/types";

const rakutenCreditHtml = `<!-- Rakuten Web Services Attribution Snippet FROM HERE -->
<a href="https://webservice.rakuten.co.jp/" target="_blank"><img src="https://webservice.rakuten.co.jp/img/credit/200709/credit_22121.gif" border="0" alt="Rakuten Web Service Center" title="Rakuten Web Service Center" width="221" height="21"/></a>
<!-- Rakuten Web Services Attribution Snippet TO HERE -->`;

const mallLabels: Record<ComparisonMall, string> = {
  yahoo: "Yahoo!ショッピング",
  rakuten: "楽天市場",
};

type MallFilter = "all" | ComparisonMall;

function mallName(offer: Offer): string | null {
  const mall = comparisonMallOf(offer);
  return mall ? mallLabels[mall] : null;
}

export function ShopPriceCompare({
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
  const present = (["yahoo", "rakuten"] as const).filter((mall) => offers.some((offer) => comparisonMallOf(offer) === mall));
  const [mall, setMall] = useState<MallFilter>("all");
  const selected = offers.filter((offer) => {
    const offerMall = comparisonMallOf(offer);
    if (!offerMall) {
      return false;
    }
    return mall === "all" || offerMall === mall;
  });
  const parts = partitionShopComparison(selected);
  const otherUnits = groupOtherSalesUnits(parts.otherUnits);
  const lowestTotal = payableTotal(parts.confirmed[0] ?? { price: null, shippingFee: null });
  const showMall = mall === "all" && present.length > 1;
  const listProps = { quantity, quantityUnit, unitPriceType, showMall };

  return (
    <div className="grid gap-6">
      {present.length > 1 ? (
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="モールで絞り込み">
          <FilterChip selected={mall === "all"} onClick={() => setMall("all")}>
            すべて
          </FilterChip>
          {present.map((item) => (
            <FilterChip key={item} selected={mall === item} onClick={() => setMall(item)}>
              {mallLabels[item]}
            </FilterChip>
          ))}
        </div>
      ) : null}
      {selected.some((offer) => offer.provider === "rakuten") ? (
        <div className="px-1">
          <p className="text-xs leading-5 text-muted">
            楽天市場は同じJANコードの商品価格ナビです。店舗ごとの個数と送料は含まれていません。この金額はページ上部の最安値には入れていません。
          </p>
          <div className="mt-2" dangerouslySetInnerHTML={{ __html: rakutenCreditHtml }} />
        </div>
      ) : null}
      <section aria-label="送料込みで比べられる掲載">
        <h3 className="text-base font-medium text-ink">送料込みで比べられる掲載</h3>
        <p className="mt-1 text-xs leading-5 text-muted">
          在庫があり、送料が確認できた同じ販売単位です。送料込み合計の安い順に、最初は5件まで表示します。
        </p>
        <PagedOffers
          resetKey={`${mall}:confirmed`}
          offers={parts.confirmed}
          lowestTotal={lowestTotal}
          emptyLabel="送料が確認できた同じ販売単位の掲載はありません。"
          {...listProps}
        />
      </section>
      {parts.unknownShipping.length > 0 ? (
        <SideFrame title="送料未確認" note="送料が確認できないため、最安値の判定には入れていません。">
          <PagedOffers
            resetKey={`${mall}:unknown`}
            offers={parts.unknownShipping}
            lowestTotal={null}
            emptyLabel="送料未確認の掲載はありません。"
            {...listProps}
          />
        </SideFrame>
      ) : null}
      {otherUnits.length > 0 ? (
        <SideFrame title="セット・販売単位が違う掲載" note="個数やセットが違うため、単品の最安値には入れていません。">
          <div className="grid gap-5">
            {otherUnits.map((group) => (
              <div key={group.key}>
                <h4 className="text-sm font-medium text-ink">{group.heading}</h4>
                <p className="mt-1 text-xs leading-5 text-muted">{group.note}</p>
                <PagedOffers
                  resetKey={`${mall}:unit:${group.key}`}
                  offers={group.offers}
                  lowestTotal={null}
                  emptyLabel="この販売単位の掲載はありません。"
                  {...listProps}
                />
              </div>
            ))}
          </div>
        </SideFrame>
      ) : null}
      {parts.unavailable.length > 0 ? (
        <SideFrame title="在庫が確認できない掲載" note="在庫ありと確認できないため、最安値の判定には入れていません。">
          <PagedOffers
            resetKey={`${mall}:stock`}
            offers={parts.unavailable}
            lowestTotal={null}
            emptyLabel="在庫が確認できない掲載はありません。"
            {...listProps}
          />
        </SideFrame>
      ) : null}
    </div>
  );
}

function FilterChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={
        selected
          ? "inline-flex min-h-11 shrink-0 items-center rounded-full bg-ink px-4 text-sm text-card"
          : "inline-flex min-h-11 shrink-0 items-center rounded-full bg-card px-4 text-sm text-ink"
      }
    >
      {children}
    </button>
  );
}

function SideFrame({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="rounded-[1.5rem] border border-line bg-sand/50 p-3 sm:p-4">
      <h3 className="px-1 text-base font-medium text-ink">{title}</h3>
      <p className="mt-1 px-1 text-xs leading-5 text-muted">{note}</p>
      {children}
    </section>
  );
}

function PagedOffers({
  offers,
  lowestTotal,
  quantity,
  quantityUnit,
  unitPriceType,
  showMall,
  emptyLabel,
  resetKey,
}: {
  offers: Offer[];
  lowestTotal: number | null;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
  showMall: boolean;
  emptyLabel: string;
  resetKey: string;
}) {
  const [visible, setVisible] = useState(initialCompareCount);
  const [seenKey, setSeenKey] = useState(resetKey);
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setVisible(initialCompareCount);
  }
  const window = compareWindow(offers.length, visible);
  const shown = offers.slice(0, window.shown);
  const label = showMall ? mallName : undefined;

  if (offers.length === 0) {
    return <p className="mt-3 text-sm leading-7 text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs text-muted">
        {shown.length} / {offers.length}件
      </p>
      <div className="lg:hidden">
        <ol className="grid gap-2">
          {shown.map((offer, index) => (
            <ShopCard
              key={offer.id}
              offer={offer}
              lowestTotal={lowestTotal}
              rank={index + 1}
              mallLabel={label?.(offer) ?? null}
            />
          ))}
        </ol>
      </div>
      <div className="hidden lg:block">
        <ShopTable
          offers={shown}
          lowestTotal={lowestTotal}
          quantity={quantity}
          quantityUnit={quantityUnit}
          unitPriceType={unitPriceType}
          mallLabel={label}
        />
      </div>
      {window.remaining > 0 ? (
        <button
          type="button"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-card px-5 text-sm sm:w-auto"
          onClick={() => setVisible(window.next)}
        >
          もっと見る（{window.next - window.shown}件）
        </button>
      ) : null}
    </div>
  );
}
