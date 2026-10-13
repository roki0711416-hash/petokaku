import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { articles } from "@/data/articles";
import { articlePath, formatArticleDate, publishedArticles } from "@/lib/articles/catalog";
import { robotsMetadata } from "@/lib/site";

const title = "ペット用品お役立ち記事";
const description = "ペット用品の価格と送料の見方を説明する記事です。商品ページでは、ショップごとの掲載を見比べられます。";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/articles" },
  robots: robotsMetadata(),
  openGraph: {
    title,
    description,
    url: "/articles",
    type: "website",
  },
};

export default function ArticlesPage() {
  const list = publishedArticles(articles);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: "お役立ち記事", href: "/articles", current: true },
        ]}
      />
      <h1 className="mt-4 text-2xl leading-snug font-medium tracking-tight text-ink md:text-3xl">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {list.length === 0 ? (
        <p className="mt-6 text-sm leading-7 text-muted">公開中の記事はまだありません。</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {list.map((article) => (
            <li key={article.slug}>
              <Link href={articlePath(article.slug)} className="block rounded-2xl border border-line bg-card px-4 py-4 hover:border-sage">
                <p className="text-xs text-muted">
                  {formatArticleDate(article.publishedOn)}
                  {article.updatedOn !== article.publishedOn ? ` 更新 ${formatArticleDate(article.updatedOn)}` : ""}
                </p>
                <h2 className="mt-1 text-base leading-6 font-medium text-ink">{article.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{article.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
