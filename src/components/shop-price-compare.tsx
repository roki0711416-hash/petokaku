"use client";

import { useState, type ReactNode } from "react";
import { ShopCard } from "@/components/ui/shop-card";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { comparisonMallOf, type ComparisonMall } from "@/lib/pricing/malls";
import {
  cheapestPrices,
  compareWindow,
  type CompareSort,
  groupOtherSalesUnits,
  initialCompareCount,
  partitionShopComparison,
  sortComparedOffers,
} from "@/lib/pricing/shop-compare";
import { payableTotal } from "@/lib/pricing/visible-offers";
import type { Offer } from "@/lib/types";

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
  const [sort, setSort] = useState<CompareSort>("item");
  const selected = offers.filter((offer) => {
    const offerMall = comparisonMallOf(offer);
    if (!offerMall) {
      return false;
    }
    return mall === "all" || offerMall === mall;
  });
  const parts = partitionShopComparison(selected);
  const ranked = sortComparedOffers(parts.ranked, sort);
  const reference = sortComparedOffers(parts.reference, "item");
  const otherUnits = groupOtherSalesUnits(parts.otherUnits, sort);
  const unavailable = sortComparedOffers(parts.unavailable, sort);
  const cheapest = cheapestPrices(ranked);
  const listProps = { quantity, quantityUnit, unitPriceType, cheapest };

  return (
    <div className="grid min-w-0 gap-6">
      {present.length > 1 ? (
        <div className="flex min-w-0 flex-wrap gap-2" role="group" aria-label="モールで絞り込み">
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
      <div className="flex min-w-0 flex-wrap gap-2" role="group" aria-label="並び順">
        <FilterChip selected={sort === "item"} onClick={() => setSort("item")}>
          本体価格が安い順
        </FilterChip>
        <FilterChip selected={sort === "total"} onClick={() => setSort("total")}>
          送料込み合計が安い順
        </FilterChip>
      </div>
      <section aria-label="価格比較" className="min-w-0">
        <PagedOffers
          resetKey={`${mall}:${sort}:ranked`}
          offers={ranked}
          emptyLabel="この条件で順位に入れられる掲載はありません。"
          {...listProps}
        />
        {reference.length > 0 ? (
          <div className="mt-4 min-w-0">
            <h4 className="text-sm font-medium text-ink">参考価格</h4>
            <p className="mt-1 text-xs leading-5 text-muted">
              楽天市場の商品価格ナビです。店舗ごとの個数と送料は未確認のため、単品の順位には入れていません。
            </p>
            <ol className="mt-3 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              {reference.map((offer) => (
                <ShopCard key={offer.id} offer={offer} rank={0} mallLabel={mallName(offer)} reference />
              ))}
            </ol>
          </div>
        ) : null}
      </section>
      {otherUnits.length > 0 ? (
        <SideFrame title="セット・販売単位が違う掲載" note="個数やセットが違うため、単品の順位には入れていません。">
          <div className="grid min-w-0 gap-5">
            {otherUnits.map((group) => (
              <div key={group.key} className="min-w-0">
                <h4 className="text-sm font-medium text-ink">{group.heading}</h4>
                <p className="mt-1 text-xs leading-5 text-muted">{group.note}</p>
                <PagedOffers
                  resetKey={`${mall}:${sort}:unit:${group.key}`}
                  offers={group.offers}
                  emptyLabel="この販売単位の掲載はありません。"
                  {...listProps}
                  cheapest={{ itemPrice: null, shippingTotal: null }}
                />
              </div>
            ))}
          </div>
        </SideFrame>
      ) : null}
      {unavailable.length > 0 ? (
        <SideFrame title="在庫なし" note="在庫ありと確認できないため、単品の順位には入れていません。">
          <PagedOffers
            resetKey={`${mall}:${sort}:stock`}
            offers={unavailable}
            emptyLabel="在庫が確認できない掲載はありません。"
            {...listProps}
            cheapest={{ itemPrice: null, shippingTotal: null }}
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
          ? "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card"
          : "inline-flex min-h-11 items-center rounded-full bg-card px-4 text-sm text-ink"
      }
    >
      {children}
    </button>
  );
}

function SideFrame({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="min-w-0 rounded-[1.5rem] border border-line bg-sand/50 p-3 sm:p-4">
      <h3 className="text-base font-medium text-ink">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted">{note}</p>
      {children}
    </section>
  );
}

function PagedOffers({
  offers,
  cheapest,
  quantity,
  quantityUnit,
  unitPriceType,
  emptyLabel,
  resetKey,
}: {
  offers: Offer[];
  cheapest: { itemPrice: number | null; shippingTotal: number | null };
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
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

  if (offers.length === 0) {
    return <p className="mt-3 text-sm leading-7 text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="mt-3 min-w-0">
      <p className="mb-2 text-xs text-muted">
        {shown.length} / {offers.length}件
      </p>
      <ol className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
        {shown.map((offer, index) => {
          const total = payableTotal(offer);
          return (
            <ShopCard
              key={offer.id}
              offer={offer}
              rank={index + 1}
              mallLabel={mallName(offer)}
              itemCheapest={cheapest.itemPrice != null && offer.price === cheapest.itemPrice}
              totalCheapest={cheapest.shippingTotal != null && total != null && total === cheapest.shippingTotal}
              quantity={quantity}
              quantityUnit={quantityUnit}
              unitPriceType={unitPriceType}
            />
          );
        })}
      </ol>
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
