"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatYen } from "@/lib/format";
import type { PetListingCard, PetListingGroup } from "@/lib/pets-listings";

const pageSize = 8;

const statusText: Record<Exclude<PetListingGroup["status"], "ready">, string> = {
  empty: "この条件に合う掲載は、取得結果のなかにありませんでした。下のカテゴリから検索できます。",
  "not-configured": "このモールの一覧はいま表示できません。カテゴリの検索は使えます。",
  "request-failed": "このモールの一覧を取得できませんでした。時間をおいて、もう一度開いてください。",
};

function allowedImage(src: string): boolean {
  try {
    const host = new URL(src).hostname.toLowerCase();
    return host === "item-shopping.c.yimg.jp" || host === "thumbnail.image.rakuten.co.jp";
  } catch {
    return false;
  }
}

function ListingCard({ card }: { card: PetListingCard }) {
  const image = card.imageUrl && allowedImage(card.imageUrl) ? card.imageUrl : null;
  return (
    <li className="min-w-0">
      <Link
        href={card.href}
        className="lift flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_8px_20px_rgba(32,77,56,0.06)] hover:border-sage"
      >
        <span className="relative block aspect-square bg-sand">
          {image ? (
            <Image src={image} alt="" fill sizes="(max-width: 767px) 46vw, (max-width: 1279px) 30vw, 18vw" className="object-contain p-2" />
          ) : (
            <span className="grid h-full place-items-center text-xs text-muted">画像なし</span>
          )}
        </span>
        <span className="flex flex-1 flex-col p-3">
          {card.brand ? <span className="line-clamp-1 text-xs text-forest">{card.brand}</span> : null}
          <span className="mt-1 line-clamp-3 text-sm leading-5 font-medium text-ink">{card.name}</span>
          {card.sizeLabel ? <span className="mt-2 text-xs text-ink">{card.sizeLabel}</span> : null}
          {card.salesUnitLabel ? <span className="mt-1 text-xs text-muted">{card.salesUnitLabel}</span> : null}
          {card.price != null ? (
            <span className="price-num mt-3 text-xl leading-none text-ink">{formatYen(card.price)}</span>
          ) : (
            <span className="mt-3 text-xs leading-5 text-muted">価格は確認できませんでした。</span>
          )}
          <span className="mt-1 text-xs leading-5 text-muted">{card.priceNote}</span>
          {card.reviewCount != null ? <span className="mt-1 text-xs text-muted">レビュー {card.reviewCount.toLocaleString("ja-JP")}件</span> : null}
          <span className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-3 text-sm text-white">
            {card.compare ? "価格を比較する" : "この名前で探す"}
          </span>
        </span>
      </Link>
    </li>
  );
}

function ListingGroup({
  title,
  note,
  group,
}: {
  title: string;
  note: string;
  group: PetListingGroup;
}) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(pageSize);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ja-JP");
    if (needle === "") {
      return group.cards;
    }
    return group.cards.filter((card) => `${card.name}\n${card.brand ?? ""}`.toLocaleLowerCase("ja-JP").includes(needle));
  }, [group.cards, query]);
  const visible = filtered.slice(0, shown);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{note}</p>
      {group.status !== "ready" ? <p className="mt-4 text-sm leading-7 text-muted">{statusText[group.status]}</p> : null}
      {group.cards.length > 0 ? (
        <>
          <label className="mt-4 block max-w-md text-sm text-ink">
            商品名・ブランドで絞り込み
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShown(pageSize);
              }}
              className="mt-2 min-h-12 w-full rounded-full border border-line bg-card px-4 text-sm text-ink"
            />
          </label>
          <p className="mt-3 text-xs text-muted">
            {visible.length} / {filtered.length}件
          </p>
          {visible.length === 0 ? <p className="mt-4 text-sm leading-7 text-muted">この言葉に合う商品は、取得済みの一覧のなかにありません。</p> : null}
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((card) => (
              <ListingCard key={card.id} card={card} />
            ))}
          </ul>
          {shown < filtered.length ? (
            <button
              type="button"
              onClick={() => setShown((current) => current + pageSize)}
              className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm text-ink hover:border-sage"
            >
              もっと見る
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export function PetListingBrowser({ yahoo, rakuten }: { yahoo: PetListingGroup; rakuten: PetListingGroup }) {
  return (
    <>
      <ListingGroup
        title="Yahoo!ショッピングでレビュー件数が多い商品"
        note="商品検索APIの並び順は、レビュー件数が多い順です。売上件数ではありません。楽天市場のレビュー件数とは合算していません。JANコードがある商品だけ、価格比較へ進めます。"
        group={yahoo}
      />
      <ListingGroup
        title="楽天市場でレビュー件数が多い掲載"
        note="商品検索APIの並び順は、レビュー件数が多い順です。売上件数ではありません。商品名か説明にJANコードがある掲載だけ、価格比較へ進めます。"
        group={rakuten}
      />
    </>
  );
}
