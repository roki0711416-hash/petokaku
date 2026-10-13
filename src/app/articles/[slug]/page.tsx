import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { articles } from "@/data/articles";
import {
  articlePath,
  articleStructuredData,
  formatArticleDate,
  publishedArticle,
  publishedArticles,
  relatedArticles,
} from "@/lib/articles/catalog";
import { getSiteUrl, privateRobots, robotsMetadata } from "@/lib/site";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return publishedArticles(articles).map((article) => ({ slug: article.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = publishedArticle(slug, articles);
  if (!article) {
    return { title: "記事が見つかりません", robots: privateRobots() };
  }
  const canonical = articlePath(article.slug);
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical },
    robots: robotsMetadata(),
    openGraph: {
      title: article.title,
      description: article.description,
      url: canonical,
      type: "article",
      publishedTime: article.publishedOn,
      modifiedTime: article.updatedOn,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = publishedArticle(slug, articles);
  if (!article) {
    notFound();
  }
  const pageUrl = new URL(articlePath(article.slug), getSiteUrl()).toString();
  const related = relatedArticles(article, articles);

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: "お役立ち記事", href: "/articles" },
          { label: article.title, href: articlePath(article.slug), current: true },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData(article, pageUrl)) }} />
      <h1 className="mt-4 text-2xl leading-snug font-medium tracking-tight text-ink md:text-3xl">{article.title}</h1>
      <p className="mt-2 text-xs leading-5 text-muted">
        公開 {formatArticleDate(article.publishedOn)}
        <span className="px-1.5 text-line">/</span>
        更新 {formatArticleDate(article.updatedOn)}
      </p>
      <div className="mt-6 grid gap-4 text-sm leading-7 text-ink">
        {article.blocks.map((block, index) => {
          if (block.type === "h2") {
            return (
              <h2 key={`${block.text}-${index}`} className="mt-2 text-lg font-medium tracking-tight text-ink">
                {block.text}
              </h2>
            );
          }
          if (block.type === "ul") {
            return (
              <ul key={index} className="grid list-disc gap-2 pl-5 text-muted">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={index} className="text-muted">
              {block.text}
            </p>
          );
        })}
      </div>
      {article.products.length > 0 ? (
        <section aria-labelledby="article-products" className="mt-8">
          <h2 id="article-products" className="text-base font-medium text-ink">
            価格比較を見る
          </h2>
          <ul className="mt-3 grid gap-3">
            {article.products.map((product) => (
              <li key={product.href}>
                <Link href={product.href} className="block rounded-2xl border border-line bg-card px-4 py-4 text-sm font-medium text-ink hover:border-sage">
                  {product.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {related.length > 0 ? (
        <section aria-labelledby="related-articles" className="mt-8">
          <h2 id="related-articles" className="text-base font-medium text-ink">
            関連記事
          </h2>
          <ul className="mt-3 grid gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={articlePath(item.slug)} className="text-sm font-medium text-forest-deep underline-offset-4 hover:underline">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
