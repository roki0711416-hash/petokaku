import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/articles/catalog";

export function HomeArticleCards({ articles }: { articles: readonly Article[] }) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="home-articles-heading" className="px-4 pb-8">
      <div className="mx-auto max-w-6xl">
        <h2 id="home-articles-heading" className="text-lg font-medium text-ink">
          ペット用品のお役立ち記事
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug} className="min-w-0">
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
        <p className="mt-3">
          <Link href="/articles" className="inline-flex min-h-11 items-center text-sm font-medium text-forest-deep underline underline-offset-4">
            すべての記事を見る
          </Link>
        </p>
      </div>
    </section>
  );
}
