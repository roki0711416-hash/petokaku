import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/articles/catalog";

const homeArticlePreviewCount = 4;

export function HomeArticleCards({ articles }: { articles: readonly Article[] }) {
  const preview = articles.slice(0, homeArticlePreviewCount);
  if (preview.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="home-articles-heading" className="px-4 pt-6 pb-2">
      <div className="mx-auto max-w-6xl">
        <h2 id="home-articles-heading" className="text-base font-medium text-ink md:text-lg">
          ペット用品のお役立ち記事
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
          {preview.map((article) => (
            <li key={article.slug} className="min-w-0">
              <ArticleCard article={article} compact />
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
