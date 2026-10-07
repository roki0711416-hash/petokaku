"use client";

import { useState } from "react";
import { ShopCard } from "@/components/ui/shop-card";
import type { Offer } from "@/lib/types";

export function OfferStack({
  initial,
  rest,
  lowestTotal,
}: {
  initial: Offer[];
  rest: Offer[];
  lowestTotal: number | null;
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? [...initial, ...rest] : initial;

  return (
    <>
      {shown.length === 0 ? (
        <p className="py-6 text-sm leading-7 text-muted">在庫ありの掲載はありません。</p>
      ) : (
        <ol className="grid gap-2">
          {shown.map((offer, index) => (
            <ShopCard key={offer.id} offer={offer} lowestTotal={lowestTotal} rank={index + 1} />
          ))}
        </ol>
      )}
      {rest.length > 0 ? (
        <button
          type="button"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-card px-5 text-sm"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? (initial.length >= 5 ? "上位5件だけ表示" : "最初の表示に戻す") : "すべてのショップを見る"}
        </button>
      ) : null}
    </>
  );
}
