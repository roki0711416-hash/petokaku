"use client";

import { useState } from "react";
import { ShopCard } from "@/components/ui/shop-card";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import type { Offer } from "@/lib/types";

export function OfferStack({
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

  return (
    <>
      {shown.length === 0 ? (
        <p className="rounded-[1.8rem] bg-card px-5 py-6 text-sm leading-7 text-muted">在庫ありの掲載はありません。</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map((offer, index) => (
            <ShopCard
              key={offer.id}
              offer={offer}
              lowestTotal={lowestTotal}
              rank={index + 1}
              quantity={quantity}
              quantityUnit={quantityUnit}
              unitPriceType={unitPriceType}
            />
          ))}
        </ul>
      )}
      {rest.length > 0 ? (
        <button
          type="button"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-card px-5 text-sm"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? (initial.length >= 5 ? "上位5件だけ表示" : "最初の表示に戻す") : `ほかのショップを見る（残り${rest.length}件）`}
        </button>
      ) : null}
    </>
  );
}
