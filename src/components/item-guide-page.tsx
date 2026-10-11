import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SearchForm } from "@/components/search-form";
import { CatalogIcon } from "@/components/ui/catalog-card";
import { ProductCard } from "@/components/ui/product-card";
import { itemGuides, type ItemGuide } from "@/lib/item-guides";
import type { GuideListings } from "@/lib/item-guides-listings";

const listingMessage: Record<Exclude<GuideListings["status"], "ready">, string> = {
  empty: "この条件に合う掲載は、取得結果のなかにありませんでした。検索語を短くするか、品目の言葉だけで開き直してください。",
  "not-configured": "商品一覧はいま表示できません。検索と、下の選び方は使えます。",
  "request-failed": "商品一覧を取得できませんでした。時間をおいて、もう一度開いてください。",
};

export function ItemGuidePage({
  guide,
  userQuery,
  listings,
}: {
  guide: ItemGuide;
  userQuery: string;
  listings: GuideListings;
}) {
  const related = itemGuides.filter((item) => item.slug !== guide.slug);

  return (
    <article className="px-4 py-8 md:py-12">
      <div className="mx-auto min-w-0 max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "商品を検索", href: "/#home-search" },
            { label: guide.crumb, href: guide.path, current: true },
          ]}
        />
        <div className="mt-6 flex min-w-0 items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-moss text-forest">
            <CatalogIcon glyph={guide.glyph} />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight font-medium tracking-tight text-ink md:text-4xl">{guide.h1}</h1>
            <p className="mt-3 text-sm leading-7 text-muted md:text-base">{guide.lead}</p>
          </div>
        </div>

        <section aria-labelledby="guide-search-heading" className="mt-8">
          <h2 id="guide-search-heading" className="text-lg font-medium text-ink">
            この品目で探す
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">入力した言葉は「{guide.query}」と組み合わせて探します。空欄なら品目の言葉だけです。</p>
          <div className="mt-4 max-w-2xl">
            <SearchForm
              id={`${guide.slug}-search`}
              action={guide.path}
              defaultValue={userQuery}
              prominent
              label={`${guide.crumb}の検索`}
              buttonLabel="検索"
              placeholder={guide.searchPlaceholder}
            />
          </div>
        </section>

        <section aria-labelledby="guide-links-heading" className="mt-8">
          <h2 id="guide-links-heading" className="text-lg font-medium text-ink">
            ブランド・種類から探す
          </h2>
          <ul className="mt-4 flex min-w-0 flex-wrap gap-2">
            {guide.searches.map((item) => (
              <li key={item.label} className="min-w-0">
                <Link
                  href={`${guide.path}?q=${encodeURIComponent(item.query)}`}
                  className="inline-flex min-h-11 max-w-full items-center rounded-full border border-line bg-card px-4 text-sm text-ink hover:border-sage"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="guide-products-heading" className="mt-10">
          <h2 id="guide-products-heading" className="text-lg font-medium text-ink">
            取得できた掲載
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
            表示は取得時点のYahoo!ショッピングの掲載です。全店舗の最安ではありません。価格は取得できた在庫ありの商品価格で、送料を含みません。JANコードがある商品は、商品ページで楽天市場の参考価格も見られることがあります。
          </p>
          <p className="mt-2 text-sm text-ink">検索語: {listings.query}</p>
          {listings.status === "ready" ? (
            <ul className="mt-4 grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
              {listings.cards.map((card) => (
                <ProductCard key={card.id} card={card} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl bg-card px-4 py-4 text-sm leading-7 text-muted">{listingMessage[listings.status]}</p>
          )}
        </section>

        <section aria-labelledby="guide-points-heading" className="mt-12">
          <h2 id="guide-points-heading" className="text-lg font-medium text-ink">
            商品を選ぶときのポイント
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {guide.points.map((point) => (
              <li key={point.heading} className="min-w-0 rounded-2xl bg-card px-4 py-4">
                <h3 className="text-base font-medium text-ink">{point.heading}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{point.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="guide-caution-heading" className="mt-12">
          <h2 id="guide-caution-heading" className="text-lg font-medium text-ink">
            価格を見比べるときの注意
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{guide.caution}</p>
        </section>

        <section aria-labelledby="guide-faq-heading" className="mt-12">
          <h2 id="guide-faq-heading" className="text-lg font-medium text-ink">
            よくある質問
          </h2>
          <div className="mt-4 grid max-w-3xl gap-6">
            {guide.faqs.map((item) => (
              <article key={item.question} className="min-w-0 border-t border-line pt-6">
                <h3 className="text-base font-medium text-ink">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="guide-related-heading" className="mt-12">
          <h2 id="guide-related-heading" className="text-lg font-medium text-ink">
            関連する品目
          </h2>
          <ul className="mt-4 grid min-w-0 grid-cols-3 gap-2 md:max-w-xl">
            {related.map((item) => (
              <li key={item.slug} className="min-w-0">
                <Link
                  href={item.path}
                  className="flex h-full min-h-11 min-w-0 flex-col items-center justify-center rounded-2xl border border-line bg-card px-2 py-3 text-center text-sm text-ink hover:border-sage"
                >
                  <CatalogIcon glyph={item.glyph} />
                  <span className="mt-2 break-words">{item.crumb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
