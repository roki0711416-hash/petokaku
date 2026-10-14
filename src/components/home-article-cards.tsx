import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles/catalog";
import { articlePath } from "@/lib/articles/catalog";

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
              <Link
                href={articlePath(article.slug)}
                className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_8px_20px_rgba(32,77,56,0.06)] hover:border-sage"
              >
                <span className="relative block aspect-[4/3] bg-sand">
                  {article.image ? (
                    <Image
                      src={article.image.src}
                      alt={article.image.alt}
                      fill
                      sizes="(max-width: 767px) 46vw, 30vw"
                      className="object-cover"
                    />
                  ) : (
                    <span aria-hidden="true" className="grid h-full place-items-center bg-moss text-forest">
                      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M8 6.5h11.5L24 11v14.5H8z" />
                        <path d="M19.5 6.5V11H24" />
                        <path d="M11 16h10M11 20h7" />
                      </svg>
                    </span>
                  )}
                </span>
                <span className="flex flex-1 flex-col p-3">
                  <span className="line-clamp-2 text-sm leading-5 font-medium text-ink">{article.title}</span>
                  <span className="mt-1 line-clamp-3 text-xs leading-5 text-muted">{article.description}</span>
                </span>
              </Link>
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
