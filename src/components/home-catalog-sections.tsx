import { HomeArticleCards } from "@/components/home-article-cards";
import { HomeCategoryBrowser, HomePopularBrowser } from "@/components/home-catalog-browser";
import type { Article } from "@/lib/articles/catalog";
import type { HomeCatalog } from "@/lib/home-catalog";

export function HomeCatalogSections({ catalog, articles }: { catalog: HomeCatalog; articles: readonly Article[] }) {
  const note =
    catalog.observedLabel === "未確認"
      ? "価格・送料・在庫は、取得できた時点の掲載です。ショップで変わっていることがあるため、確定した金額としては扱っていません。"
      : `価格・送料・在庫は${catalog.observedLabel}時点の掲載です。ショップで変わっていることがあるため、確定した金額としては扱っていません。`;

  return (
    <>
      <HomeArticleCards articles={articles} />
      <section aria-labelledby="popular-products-heading" className="px-4 pt-6 pb-2">
        <div className="mx-auto max-w-6xl">
          <h2 id="popular-products-heading" className="text-base font-medium text-ink md:text-lg">
            人気のペット用品
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">レビュー件数が多い順です。売上順ではありません。金額は商品価格で、送料込みではありません。{note}</p>
          {catalog.popular.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-muted">いま商品を表示できません。時間をおいて、もう一度開いてください。</p>
          ) : (
            <div className="mt-3">
              <HomePopularBrowser cards={catalog.popular} />
            </div>
          )}
        </div>
      </section>
      <section aria-labelledby="category-products-heading" className="px-4 pt-6 pb-2">
        <div className="mx-auto max-w-6xl">
          <h2 id="category-products-heading" className="text-base font-medium text-ink md:text-lg">
            カテゴリ別の商品
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">種類を開くと、このページで商品を最大4件から見られます。一覧は別ページです。</p>
          <HomeCategoryBrowser categories={catalog.categories} />
        </div>
      </section>
    </>
  );
}
