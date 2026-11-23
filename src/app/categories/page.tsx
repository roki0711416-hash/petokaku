import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogIcon } from "@/components/ui/catalog-card";
import { categoryProductGroups } from "@/lib/category-products";
import { hubPageCrumbs } from "@/lib/indexable-hubs";
import { itemGuides } from "@/lib/item-guides";
import { categoryItemListJsonLd, jsonLdHtml } from "@/lib/seo/category-jsonld";
import { shareMetadata } from "@/lib/seo/share-metadata";
import { getSiteUrl, robotsMetadata } from "@/lib/site";

const title = "ペット用品の品目一覧";
const description =
  "ドッグフード、キャットフード、猫砂、ペットシーツ、おやつ、キャットタワー、トイレ用品の品目ページです。確認できた商品だけを載せ、金額は商品ページで見比べます。";

export const metadata = {
  ...shareMetadata({ title, description, path: "/categories" }),
  robots: robotsMetadata(),
};

export default function CategoriesIndexPage() {
  const pageUrl = new URL("/categories", getSiteUrl()).toString();
  const listLd = categoryItemListJsonLd({
    pageUrl,
    items: itemGuides.map((guide) => ({ name: guide.crumb, href: guide.path })),
  });

  return (
    <article className="px-4 py-8 md:py-12">
      {listLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(listLd) }} /> : null}
      <div className="mx-auto min-w-0 max-w-6xl">
        <Breadcrumbs items={hubPageCrumbs({ label: "品目一覧", href: "/categories" })} />
        <h1 className="mt-6 text-2xl leading-tight font-medium tracking-tight text-ink md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          フード、猫砂、シーツ、おやつ、キャットタワー、トイレ用品を品目ごとに分けています。各ページの商品は、名前とJANを確認できたものだけです。金額は商品ページで見比べます。
        </p>
        <ul className="mt-8 grid gap-4">
          {itemGuides.map((guide) => {
            const products = categoryProductGroups(guide.slug).flatMap((group) => group.products).slice(0, 4);
            return (
              <li key={guide.slug} className="min-w-0 rounded-2xl border border-line bg-card px-4 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-moss text-forest">
                    <CatalogIcon glyph={guide.glyph} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-medium text-ink">
                      <Link href={guide.path} className="underline-offset-4 hover:underline">
                        {guide.crumb}
                      </Link>
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-muted">{guide.lead}</p>
                  </div>
                </div>
                {products.length > 0 ? (
                  <ul className="mt-3 grid gap-1">
                    {products.map((product) => (
                      <li key={product.href} className="min-w-0">
                        <Link href={product.href} className="text-sm text-forest-deep underline-offset-4 hover:underline">
                          {product.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-muted">確認できた商品は、まだこの一覧にありません。</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
