"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatYen } from "@/lib/format";
import type { PetListingCard, PetListingGroup } from "@/lib/pets-listings";

const pageSize = 8;

function statusText(status: Exclude<PetListingGroup["status"], "ready">, categoryLabel: string | null): string {
  if (status === "empty") {
    return categoryLabel
      ? `「${categoryLabel}」の商品は見つかりませんでした。上のボタンから別のカテゴリを選べます。`
      : "この条件に合う商品は見つかりませんでした。上のボタンからカテゴリを選べます。";
  }
  const messages: Record<Exclude<PetListingGroup["status"], "ready" | "empty">, string> = {
    "not-configured": "このモールの商品はいま表示できません。上のボタンからカテゴリを選べます。",
    "rate-limited": "いま混み合っているため、この欄は空です。しばらくすると表示されます。",
    unauthorized: "このモールの商品はいま表示できません。",
    parameter: "この条件では商品を表示できませんでした。",
    timeout: "応答が間に合わなかったため、この欄はいま空です。",
    unavailable: "サービスが一時的に応答しなかったため、この欄はいま空です。",
    "request-failed": "このモールの商品を表示できませんでした。時間をおいて、もう一度開いてください。",
  };
  return messages[status];
}

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
        prefetch={false}
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
            価格を比較する
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
  categoryLabel,
}: {
  title: string;
  note: string;
  group: PetListingGroup;
  categoryLabel: string | null;
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
    <section className="mt-4">
      <h3 className="text-base font-medium text-ink">{title}</h3>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{note}</p>
      <p className="mt-1 text-xs text-muted">商品 {group.cards.length}件</p>
      {group.status !== "ready" ? <p className="mt-2 text-sm leading-6 text-muted">{statusText(group.status, categoryLabel)}</p> : null}
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
          {visible.length === 0 ? <p className="mt-4 text-sm leading-7 text-muted">この言葉に合う商品は、いまの一覧のなかにありません。</p> : null}
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

export function PetListingBrowser({
  yahoo,
  rakuten,
  categoryLabel,
  observedLabel,
  page,
  previousHref,
  nextHref,
}: {
  yahoo: PetListingGroup;
  rakuten: PetListingGroup;
  categoryLabel: string | null;
  observedLabel: string;
  page: number;
  previousHref: string | null;
  nextHref: string | null;
}) {
  const observed =
    observedLabel === "未確認"
      ? "価格・送料・在庫は、取得できた時点の掲載です。ショップで変わっていることがあるため、確定した金額としては扱っていません。"
      : `価格・送料・在庫は${observedLabel}時点の掲載です。ショップで変わっていることがあるため、確定した金額としては扱っていません。`;
  return (
    <div className="mt-5">
      <h2 className="text-lg font-medium text-ink">人気の商品一覧</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{observed}</p>
      <ListingGroup
        title="Yahoo!ショッピングの人気商品を探す"
        note="レビュー件数を参考に、気になるペット用品を探せます。売上順ではありません。"
        group={yahoo}
        categoryLabel={categoryLabel}
      />
      <ListingGroup
        title="楽天市場の人気商品を探す"
        note="レビュー件数を参考に、気になるペット用品を探せます。売上順ではありません。"
        group={rakuten}
        categoryLabel={categoryLabel}
      />
      {previousHref || nextHref ? (
        <nav aria-label="商品一覧のページ" className="mt-4 flex flex-wrap items-center gap-2">
          {previousHref ? (
            <Link href={previousHref} scroll={false} className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm text-ink hover:border-sage">
              前のページ
            </Link>
          ) : null}
          <span className="text-sm text-muted">{page}ページ目</span>
          {nextHref ? (
            <Link href={nextHref} scroll={false} className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm text-ink hover:border-sage">
              次のページ
            </Link>
          ) : null}
        </nav>
      ) : null}
      <details className="mt-8 rounded-2xl border border-line bg-sand/50 px-4 py-2">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-ink">掲載情報について</summary>
        <div className="grid gap-2 pb-2 text-xs leading-6 text-muted">
          <p>一覧に出しているのは、同じ商品・同じ容量・同じ販売単位で、別々の2ショップ以上の価格を比べられる商品だけです。</p>
          <p>Yahoo!ショッピングと楽天市場のレビュー件数は、別々に見ています。足した人気度ではありません。</p>
          <p>価格は、表示できた商品のものです。すべての販売店の最安値ではありません。購入前にショップで確認してください。</p>
        </div>
      </details>
    </div>
  );
}
