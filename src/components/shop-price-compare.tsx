"use client";

import { useState, type ReactNode } from "react";
import { ShopCompareList } from "@/components/shop-compare-list";
import { PriceSummary } from "@/components/ui/price-summary";
import { formatYen } from "@/lib/format";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { comparisonMallOf, mallVisitLabel, type ComparisonMall } from "@/lib/pricing/malls";
import {
  compareWindow,
  competitionRanks,
  type CompareSort,
  cheapestPrices,
  groupOtherSalesUnits,
  initialCompareCount,
  listingShopCounts,
  partitionShopComparison,
  sortComparedOffers,
} from "@/lib/pricing/shop-compare";
import { shopProductLink } from "@/lib/pricing/shop-link";
import { payableTotal } from "@/lib/pricing/visible-offers";
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
  const [sort, setSort] = useState<CompareSort>("total");
  const selected = offers.filter((offer) => {
    const offerMall = comparisonMallOf(offer);
    if (!offerMall) {
      return false;
    }
    return mall === "all" || offerMall === mall;
  });
  const parts = partitionShopComparison(selected);
  const ranked = sortComparedOffers(parts.ranked, sort);
  const comparable = sort === "total" ? ranked.filter((offer) => payableTotal(offer) != null) : ranked;
  const shippingUnconfirmed = sort === "total" ? ranked.filter((offer) => payableTotal(offer) == null) : [];
  const reference = sortComparedOffers(parts.reference, "item");
  const otherUnits = groupOtherSalesUnits(parts.otherUnits, sort);
  const unavailable = sortComparedOffers(parts.unavailable, sort);
  const counts = listingShopCounts(ranked);
  const prices = cheapestPrices(parts.ranked);
  const viewKey = `${mall}:${sort}`;

  return (
    <div className="grid min-w-0 gap-3">
      <PriceSummary
        lowestPrice={sort === "total" ? prices.shippingTotal : prices.itemPrice}
        shopCount={counts.shopCount}
        basis={sort}
      />
      <p className="text-xs leading-5 text-muted">価格・送料・在庫は変更される場合があります。購入前にショップでご確認ください。</p>
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
        <FilterChip selected={sort === "total"} onClick={() => setSort("total")}>
          送料込み合計が安い順
        </FilterChip>
        <FilterChip selected={sort === "item"} onClick={() => setSort("item")}>
          本体価格が安い順
        </FilterChip>
      </div>
      <section aria-label="すべてのショップで価格を比較" className="min-w-0">
        <PagedOffers
          resetKey={`${viewKey}:ranked`}
          offers={comparable}
          sort={sort}
          showRank
          reveal="shops"
          emptyLabel="この条件で順位に入れられる掲載はありません。"
        />
        {shippingUnconfirmed.length > 0 ? (
          <FoldedSection
            resetKey={`${viewKey}:shipping`}
            label="送料別・合計未確認の商品を見る"
            note="送料が確認できないため、送料込みの順位には入れていません。"
            defaultOpen={comparable.length === 0}
          >
            <PagedOffers
              resetKey={`${viewKey}:shipping-list`}
              offers={shippingUnconfirmed}
              sort="item"
              reveal="more"
              emptyLabel="送料が確認できない掲載はありません。"
            />
          </FoldedSection>
        ) : null}
        {reference.length > 0 ? <ReferencePrices offers={reference} /> : null}
      </section>
      {otherUnits.length > 0 ? (
        <div className="grid min-w-0 gap-3">
          {otherUnits.map((group) => (
            <FoldedSection key={group.key} resetKey={`${viewKey}:unit:${group.key}`} label={`${group.heading}の商品を見る`} note={group.note}>
              <PagedOffers
                resetKey={`${viewKey}:unit-list:${group.key}`}
                offers={group.offers}
                sort={sort}
                reveal="more"
                emptyLabel="この販売単位の掲載はありません。"
              />
            </FoldedSection>
          ))}
        </div>
      ) : null}
      {unavailable.length > 0 ? (
        <FoldedSection
          resetKey={`${viewKey}:stock`}
          label="在庫なしの商品を見る"
          note="在庫ありと確認できないため、購入できる商品の最安値には入れていません。"
        >
          <PagedOffers
            resetKey={`${viewKey}:stock-list`}
            offers={unavailable}
            sort={sort}
            reveal="more"
            emptyLabel="在庫が確認できない掲載はありません。"
          />
        </FoldedSection>
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

function FoldedSection({
  label,
  note,
  resetKey,
  defaultOpen = false,
  children,
}: {
  label: string;
  note?: string;
  resetKey: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [seenKey, setSeenKey] = useState(resetKey);
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setOpen(defaultOpen);
  }

  const title = label.replace(/を見る$/, "");
  return (
    <section aria-label={title} className="mt-4 min-w-0 rounded-[1.5rem] border border-line bg-sand/50 p-3 sm:p-4">
      {open ? <h3 className="text-base font-medium text-ink">{title}</h3> : null}
      <button
        type="button"
        className={`${open ? "mt-3" : ""} inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-card px-5 text-sm`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "閉じる" : label}
      </button>
      {open ? (
        <div className="min-w-0">
          {note ? <p className="mt-3 text-xs leading-5 text-muted">{note}</p> : null}
          {children}
          <button
            type="button"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-card px-5 text-sm"
            onClick={() => setOpen(false)}
          >
            閉じる
          </button>
        </div>
      ) : null}
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
  reveal,
}: {
  offers: Offer[];
  sort: CompareSort;
  showRank?: boolean;
  emptyLabel: string;
  resetKey: string;
  reveal: "shops" | "more";
}) {
  const [visible, setVisible] = useState(initialCompareCount);
  const [seenKey, setSeenKey] = useState(resetKey);
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setVisible(initialCompareCount);
  }
  const page = compareWindow(offers.length, visible);
  const shown = offers.slice(0, page.shown);
  const ranks = showRank ? competitionRanks(offers, sort).slice(0, page.shown) : null;
  const hidden = offers.slice(page.shown);
  const hiddenShops = listingShopCounts(hidden).shopCount;
  const shopCount = hiddenShops > 0 ? hiddenShops : hidden.length;

  if (offers.length === 0) {
    return <p className="mt-3 text-sm leading-7 text-muted">{emptyLabel}</p>;
  }

  function closeList() {
    setVisible(initialCompareCount);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("compare")?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div className="mt-3 min-w-0">
      <ShopCompareList offers={shown} ranks={ranks} sort={sort} />
      {page.remaining > 0 ? (
        <button
          type="button"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-card px-5 text-sm sm:w-auto"
          onClick={() => setVisible(reveal === "shops" ? offers.length : page.next)}
        >
          {reveal === "shops" ? `残り${shopCount}ショップを見る` : `もっと見る（${page.next - page.shown}件）`}
        </button>
      ) : reveal === "shops" && visible > initialCompareCount ? (
        <button
          type="button"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-card px-5 text-sm sm:w-auto"
          onClick={closeList}
        >
          閉じる
        </button>
      ) : null}
    </div>
  );
}
