import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { articles } from "@/data/articles";
import { publishedArticles } from "@/lib/articles/catalog";
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
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
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
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {list.map((article) => (
            <li key={article.slug} className="min-w-0">
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
