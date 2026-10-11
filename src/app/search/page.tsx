import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchForm } from "@/components/search-form";
import { YahooSearchResults } from "@/components/yahoo-search-results";
import Link from "next/link";
import { relatedCategoryLinks } from "@/lib/categories";
import { privateRobots } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "商品を探す",
  description: "商品名から、販売店の掲載を検索します。",
  robots: privateRobots(),
};

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = normalizeQuery((await searchParams).q);

  return (
    <article className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <h1 className="text-4xl font-medium tracking-tight md:text-5xl">商品を探す</h1>
      <p className="mt-3 leading-8 text-muted">商品名、ブランド名、JANコードで、販売店の掲載を検索します。</p>
      <p className="mt-2 text-sm leading-7 text-muted">販売店へのリンクは、現在アフィリエイトリンクではありません。価格、送料、在庫は取得後に変わることがあります。</p>
      <SearchForm
        id="yahoo-search"
        action="/search"
        defaultValue={query}
        placeholder="例：ロイヤルカナン、猫砂、ペットシーツ"
      />
      <RelatedCategoryLinks query={query} />
      {query ? (
        <Suspense fallback={<p className="mt-8 text-muted">商品を探しています</p>}>
          <YahooSearchResults query={query} />
        </Suspense>
      ) : (
        <p className="mt-8 text-muted">商品名を入力して検索してください。</p>
      )}
    </article>
  );
}

function RelatedCategoryLinks({ query }: { query: string }) {
  const links = relatedCategoryLinks(query);
  if (links.length === 0) {
    return null;
  }

  return (
    <nav aria-label="関連する品目" className="mt-6">
      <p className="text-sm text-muted">この種類の品目ページ</p>
      <ul className="mt-2 flex min-w-0 flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm text-ink hover:border-sage">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
