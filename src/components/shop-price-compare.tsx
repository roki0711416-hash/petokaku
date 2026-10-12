"use client";

import { useState, type ReactNode } from "react";
import { ShopCompareList } from "@/components/shop-compare-list";
import { formatYen } from "@/lib/format";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { comparisonMallOf, mallVisitLabel, type ComparisonMall } from "@/lib/pricing/malls";
import {
  cheapestPrices,
  compareWindow,
  type CompareSort,
  groupOtherSalesUnits,
  initialCompareCount,
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
  const overallLowest = cheapestPrices(partitionShopComparison(offers.filter((offer) => comparisonMallOf(offer))).ranked).itemPrice;

  return (
    <div className="grid min-w-0 gap-3">
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
          lowestItemPrice={overallLowest}
          emptyLabel="この条件で順位に入れられる掲載はありません。"
        />
        {reference.length > 0 ? <ReferencePrices offers={reference} /> : null}
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
                  lowestItemPrice={null}
                  showGap={false}
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
            lowestItemPrice={null}
            showGap={false}
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

function SideFrame({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="min-w-0 rounded-[1.5rem] border border-line bg-sand/50 p-3 sm:p-4">
      <h3 className="text-base font-medium text-ink">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted">{note}</p>
      {children}
    </section>
  );
}

function ReferencePrices({ offers }: { offers: Offer[] }) {
  return (
    <aside className="mt-4 rounded-xl border border-line bg-sand/70 px-4 py-3">
      <h3 className="text-sm font-medium text-ink">楽天の参考価格</h3>
      <p className="mt-1 text-xs leading-5 text-muted">商品価格ナビの参考です。店舗・送料・在庫は未確認のため、上の比較には入れていません。</p>
      <ul className="mt-3 grid gap-3">
        {offers.map((offer) => {
          const link = shopProductLink(offer);
          const label = mallVisitLabel(offer.provider);
          return (
            <li key={offer.id} className="flex flex-wrap items-center justify-between gap-3">
              <p className="price-num text-2xl text-ink">{offer.price == null ? "情報なし" : formatYen(offer.price)}</p>
              {link.href ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel={link.affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-line bg-card px-4 text-sm text-ink"
                >
                  {link.affiliate ? "広告 · " : ""}
                  {label}
                </a>
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
  lowestItemPrice,
  showGap = true,
  emptyLabel,
  resetKey,
}: {
  offers: Offer[];
  lowestItemPrice: number | null;
  showGap?: boolean;
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
      <ShopCompareList offers={shown} lowestItemPrice={lowestItemPrice} showGap={showGap} />
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
