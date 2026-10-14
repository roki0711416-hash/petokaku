import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles/catalog";
import { articlePath } from "@/lib/articles/catalog";

export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <Link
      href={articlePath(article.slug)}
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_8px_20px_rgba(32,77,56,0.06)] hover:border-sage"
    >
      <span className="relative block aspect-[4/3] bg-sand">
        {article.image ? (
          <Image src={article.image.src} alt={article.image.alt} fill sizes="(max-width: 767px) 46vw, 30vw" className="object-cover" />
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
        <span className="line-clamp-3 text-sm leading-6 font-medium text-ink md:text-base">{article.title}</span>
        {compact ? null : <span className="mt-1 line-clamp-3 text-sm leading-6 text-muted">{article.description}</span>}
      </span>
    </Link>
  );
}
