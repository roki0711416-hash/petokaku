import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogIcon } from "@/components/ui/catalog-card";
import { guideListingQuery, itemGuides, type ItemGuide } from "@/lib/item-guides";

export function ItemGuidePage({ guide }: { guide: ItemGuide }) {
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

        <section aria-labelledby="guide-links-heading" className="mt-8">
          <h2 id="guide-links-heading" className="text-lg font-medium text-ink">
            ブランド・種類から探す
          </h2>
          <ul className="mt-4 flex min-w-0 flex-wrap gap-2">
            {guide.searches.map((item) => (
              <li key={item.label} className="min-w-0">
                <Link
                  href={`/search?q=${encodeURIComponent(guideListingQuery(guide, item.query))}`}
                  className="inline-flex min-h-11 max-w-full items-center rounded-full border border-line bg-card px-4 text-sm text-ink hover:border-sage"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="guide-points-heading" className="mt-8">
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

        {guide.relatedGuides && guide.relatedGuides.length > 0 ? (
          <section aria-labelledby="guide-article-heading" className="mt-12">
            <h2 id="guide-article-heading" className="text-lg font-medium text-ink">
              あわせて読む
            </h2>
            <ul className="mt-4 flex min-w-0 flex-wrap gap-2">
              {guide.relatedGuides.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm text-forest-deep hover:border-sage"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

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
