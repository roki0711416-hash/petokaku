"use client";

import { useState } from "react";
import { OfferStack } from "@/components/offer-stack";
import { ShopTable } from "@/components/ui/shop-card";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { shopProductLink } from "@/lib/pricing/shop-link";
import type { Offer } from "@/lib/types";

export type CompareGroup = {
  key: string;
  tabLabel: string;
  note: string;
  initial: Offer[];
  rest: Offer[];
  lowestTotal: number | null;
};

export function OfferCompare({
  groups,
  quantity,
  quantityUnit,
  unitPriceType,
}: {
  groups: CompareGroup[];
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
}) {
  const usualIndex = groups.findIndex((group) => group.key === "unknown");
  const [index, setIndex] = useState(usualIndex >= 0 ? usualIndex : 0);
  const current = groups[index] ?? groups[0];
  if (!current) {
    return null;
  }
  const mainKey = usualIndex >= 0 ? "unknown" : groups[0]?.key;
  const markLowest = current.key === mainKey;
  const hasExternalLink = [...current.initial, ...current.rest].some((offer) => shopProductLink(offer).href);

  return (
    <div>
      {groups.length > 1 ? (
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="販売単位">
          {groups.map((group, groupIndex) => {
            const selected = groupIndex === index;
            return (
              <button
                key={group.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setIndex(groupIndex)}
                className={
                  selected
                    ? "inline-flex min-h-11 shrink-0 items-center border-b-2 border-ink px-3 text-sm font-medium text-ink"
                    : "inline-flex min-h-11 shrink-0 items-center border-b-2 border-transparent px-3 text-sm text-muted"
                }
              >
                {group.tabLabel}
              </button>
            );
          })}
        </div>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-muted">{current.note}</p>
      {hasExternalLink ? <p className="mt-1 text-xs leading-5 text-muted">商品を見ると販売サイトへ移動します。</p> : null}
      <div id={markLowest ? "lowest-shop" : undefined} className="mt-3 scroll-mt-24" role="tabpanel">
        <div className="lg:hidden">
          <OfferStack initial={current.initial} rest={current.rest} lowestTotal={current.lowestTotal} />
        </div>
        <div className="hidden lg:block">
          <DesktopOffers
            initial={current.initial}
            rest={current.rest}
            lowestTotal={current.lowestTotal}
            quantity={quantity}
            quantityUnit={quantityUnit}
            unitPriceType={unitPriceType}
          />
        </div>
      </div>
    </div>
  );
}

function DesktopOffers({
  initial,
  rest,
  lowestTotal,
  quantity,
  quantityUnit,
  unitPriceType,
}: {
  initial: Offer[];
  rest: Offer[];
  lowestTotal: number | null;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? [...initial, ...rest] : initial;
  if (shown.length === 0) {
    return <p className="py-6 text-sm leading-7 text-muted">在庫ありの掲載はありません。</p>;
  }

  return (
    <>
      <ShopTable
        offers={shown}
        lowestTotal={lowestTotal}
        quantity={quantity}
        quantityUnit={quantityUnit}
        unitPriceType={unitPriceType}
      />
      {rest.length > 0 ? (
        <button
          type="button"
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-card px-5 text-sm"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? (initial.length >= 5 ? "上位5件だけ表示" : "最初の表示に戻す") : "すべてのショップを見る"}
        </button>
      ) : null}
    </>
  );
}
