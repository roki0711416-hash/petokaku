"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatYen } from "@/lib/format";
import { homePreviewCount, type HomeCatalogCard, type HomeCatalogCategory } from "@/lib/home-catalog";

function allowedImage(src: string): boolean {
  try {
    const host = new URL(src).hostname.toLowerCase();
    return host === "item-shopping.c.yimg.jp" || host === "thumbnail.image.rakuten.co.jp";
  } catch {
    return false;
  }
}

function CatalogCard({ card }: { card: HomeCatalogCard }) {
  const image = card.imageUrl && allowedImage(card.imageUrl) ? card.imageUrl : null;
  return (
    <li className="min-w-0">
      <Link href={card.href} prefetch={false} className="lift flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_8px_20px_rgba(32,77,56,0.06)] hover:border-sage">
        <span className="relative block aspect-square bg-sand">
          {image ? (
            <Image src={image} alt="" fill sizes="(max-width: 767px) 46vw, (max-width: 1279px) 30vw, 18vw" className="object-contain p-2" />
          ) : (
            <span className="grid h-full place-items-center text-xs text-muted">画像なし</span>
          )}
        </span>
        <span className="flex flex-1 flex-col p-3">
          <span className="line-clamp-3 text-sm leading-5 font-medium text-ink">{card.name}</span>
          {card.price != null ? (
            <span className="price-num mt-3 text-xl leading-none text-ink">{formatYen(card.price)}</span>
          ) : (
            <span className="mt-3 text-xs leading-5 text-muted">価格は確認できませんでした。</span>
          )}
          <span className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-3 text-sm text-white">価格を比較する</span>
        </span>
      </Link>
    </li>
  );
}

function ProductGrid({ cards }: { cards: HomeCatalogCard[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <CatalogCard key={card.id} card={card} />
      ))}
    </ul>
  );
}

function ExpandButton({ open, closedLabel, onClick }: { open: boolean; closedLabel: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onClick}
      className="mt-3 inline-flex min-h-11 items-center rounded-full border border-forest bg-card px-4 text-sm font-medium text-forest-deep"
    >
      {open ? "閉じる" : closedLabel}
    </button>
  );
}

export function HomePopularBrowser({ cards }: { cards: HomeCatalogCard[] }) {
  const [open, setOpen] = useState(false);
  const visible = open ? cards : cards.slice(0, homePreviewCount);
  return (
    <div>
      <ProductGrid cards={visible} />
      {cards.length > homePreviewCount ? (
        <ExpandButton open={open} closedLabel="もっと商品を見る" onClick={() => setOpen((value) => !value)} />
      ) : null}
    </div>
  );
}

function CategoryPanel({ category }: { category: HomeCatalogCategory }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const panelId = `home-category-panel-${category.id}`;
  const visible = expanded ? category.cards : category.cards.slice(0, homePreviewCount);

  return (
    <section aria-labelledby={`home-category-${category.id}`} className="rounded-2xl bg-card px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <h3 id={`home-category-${category.id}`} className="min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
          >
            <span className="text-base font-medium text-ink">{category.label}</span>
            <span className="shrink-0 text-sm text-forest-deep">{open ? "閉じる" : "開く"}</span>
          </button>
        </h3>
        <Link href={category.href} className="shrink-0 text-sm text-forest-deep underline underline-offset-4">
          商品を見る
        </Link>
      </div>
      {open ? (
        <div id={panelId} className="pb-2">
          {category.cards.length > 0 ? (
            <>
              <ProductGrid cards={visible} />
              {category.cards.length > homePreviewCount ? (
                <ExpandButton open={expanded} closedLabel="もっと見る" onClick={() => setExpanded((value) => !value)} />
              ) : null}
            </>
          ) : (
            <p className="text-sm leading-6 text-muted">このカテゴリの商品は、商品を見るから一覧を開けます。</p>
          )}
        </div>
      ) : null}
    </section>
  );
}

export function HomeCategoryBrowser({ categories }: { categories: HomeCatalogCategory[] }) {
  return (
    <div className="mt-4 grid gap-2">
      {categories.map((category) => (
        <CategoryPanel key={category.id} category={category} />
      ))}
    </div>
  );
}
