"use client";

import { useState, type ReactNode } from "react";
import { ShopCompareList } from "@/components/shop-compare-list";
import { formatYen } from "@/lib/format";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { comparisonMallOf, mallVisitLabel, type ComparisonMall } from "@/lib/pricing/malls";
import {
  compareWindow,
  competitionRanks,
  type CompareSort,
  groupOtherSalesUnits,
  initialCompareCount,
  listingShopCounts,
  partitionShopComparison,
  sortComparedOffers,
} from "@/lib/pricing/shop-compare";
import { shopProductLink } from "@/lib/pricing/shop-link";
import type { Offer } from "@/lib/types";

const mallLabels: Record<ComparisonMall, string> = {
  yahoo: "Yahoo!ショッピング",
  rakuten: "楽天市場",
};

type MallFilter = "all" | ComparisonMall;

export function ShopPriceCompare({
  offers,
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
  const counts = listingShopCounts(ranked);

  return (
    <div className="grid min-w-0 gap-3">
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="compare-heading" className="text-lg font-medium tracking-tight text-ink">
          すべてのショップで価格を比較
        </h2>
        <p className="text-sm text-ink">
          <span className="price-num text-lg">{counts.listingCount}</span>
          件 / <span className="price-num text-lg">{counts.shopCount}</span>
          店舗
        </p>
      </div>
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
      <section aria-label="すべてのショップで価格を比較" className="min-w-0">
        <PagedOffers
          resetKey={`${mall}:${sort}:ranked`}
          offers={ranked}
          sort={sort}
          showRank
          emptyLabel="この条件で順位に入れられる掲載はありません。"
        />
        {reference.length > 0 ? <ReferencePrices offers={reference} /> : null}
      </section>
      {otherUnits.length > 0 ? (
        <SideFrame title="セット・販売単位が違う掲載">
          <div className="grid min-w-0 gap-5">
            {otherUnits.map((group) => (
              <div key={group.key} className="min-w-0">
                <h4 className="text-sm font-medium text-ink">{group.heading}</h4>
                <p className="mt-1 text-xs leading-5 text-muted">{group.note}</p>
                <PagedOffers
                  resetKey={`${mall}:${sort}:unit:${group.key}`}
                  offers={group.offers}
                  sort={sort}
                  emptyLabel="この販売単位の掲載はありません。"
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
            sort={sort}
            emptyLabel="在庫が確認できない掲載はありません。"
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

function SideFrame({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="min-w-0 rounded-[1.5rem] border border-line bg-sand/50 p-3 sm:p-4">
      <h3 className="text-base font-medium text-ink">{title}</h3>
      {note ? <p className="mt-1 text-xs leading-5 text-muted">{note}</p> : null}
      {children}
    </section>
  );
}

function ReferencePrices({ offers }: { offers: Offer[] }) {
  return (
    <aside className="mt-4 rounded-xl border border-line bg-sand/70 px-4 py-3">
      <h3 className="text-sm font-medium text-ink">楽天の参考価格</h3>
      <ul className="mt-3 grid gap-3">
        {offers.map((offer) => {
          const link = shopProductLink(offer);
          const label = mallVisitLabel(offer.provider);
          return (
            <li key={offer.id} className="flex flex-wrap items-center justify-between gap-3">
              <p className="price-num text-2xl text-ink">{offer.price == null ? "情報なし" : formatYen(offer.price)}</p>
              {link.href ? (
                <div className="min-w-36">
                  <a
                    href={link.href}
                    target="_blank"
                    rel={link.affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-line bg-card px-4 text-sm text-ink"
                  >
                    {label}
                    <span aria-hidden="true" className="ml-1">
                      ↗
                    </span>
                  </a>
                  {link.affiliate ? <p className="mt-1 text-center text-xs text-muted">広告</p> : null}
                </div>
              ) : (
                <span className="text-sm text-muted">リンクなし</span>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function PagedOffers({
  offers,
  sort,
  showRank = false,
  emptyLabel,
  resetKey,
}: {
  offers: Offer[];
  sort: CompareSort;
  showRank?: boolean;
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
  const ranks = showRank ? competitionRanks(offers, sort).slice(0, window.shown) : null;

  if (offers.length === 0) {
    return <p className="mt-3 text-sm leading-7 text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="mt-3 min-w-0">
      <ShopCompareList offers={shown} ranks={ranks} />
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
