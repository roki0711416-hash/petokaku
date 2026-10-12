import Image from "next/image";
import Link from "next/link";
import { formatYen } from "@/lib/format";
import type { HomeCatalog, HomeCatalogCard } from "@/lib/home-catalog";

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
      <Link href={card.href} className="lift flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_8px_20px_rgba(32,77,56,0.06)] hover:border-sage">
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
          <span className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-3 text-sm text-white">
            価格を比較する
          </span>
        </span>
      </Link>
    </li>
  );
}

export function HomeCatalogSections({ catalog }: { catalog: HomeCatalog }) {
  const note =
    catalog.observedLabel === "未確認"
      ? "価格・送料・在庫は、取得できた時点の掲載です。ショップで変わっていることがあるため、確定した金額としては扱っていません。"
      : `価格・送料・在庫は${catalog.observedLabel}時点の掲載です。ショップで変わっていることがあるため、確定した金額としては扱っていません。`;

  return (
    <>
      <section aria-labelledby="popular-products-heading" className="px-4 pb-8">
        <div className="mx-auto max-w-6xl">
          <h2 id="popular-products-heading" className="text-lg font-medium text-ink">
            人気のペット用品
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">レビュー件数が多い順です。売上順ではありません。{note}</p>
          {catalog.popular.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-muted">いま商品を表示できません。時間をおいて、もう一度開いてください。</p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {catalog.popular.map((card) => (
                <CatalogCard key={card.id} card={card} />
              ))}
            </ul>
          )}
        </div>
      </section>
      <section aria-labelledby="category-products-heading" className="px-4 pb-8">
        <div className="mx-auto max-w-6xl">
          <h2 id="category-products-heading" className="text-lg font-medium text-ink">
            カテゴリ別の商品
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">ペットの種類ごとに、価格を比較できる商品を先に並べています。</p>
          <div className="mt-4 grid gap-6">
            {catalog.categories.map((category) => (
              <section key={category.id} aria-labelledby={`home-category-${category.id}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 id={`home-category-${category.id}`} className="text-base font-medium text-ink">
                    {category.label}
                  </h3>
                  <Link href={category.href} className="text-sm text-forest-deep underline underline-offset-4">
                    {category.label}の商品を見る
                  </Link>
                </div>
                {category.cards.length > 0 ? (
                  <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {category.cards.map((card) => (
                      <CatalogCard key={`${category.id}:${card.id}`} card={card} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted">このカテゴリの商品は、上のリンクから一覧を開けます。</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
