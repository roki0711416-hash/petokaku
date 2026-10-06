import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchForm } from "@/components/search-form";
import { YahooSearchResults } from "@/components/yahoo-search-results";
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
      <p className="mt-3 leading-8 text-muted">商品名やブランド名で、販売店の掲載を検索します。</p>
      <SearchForm
        id="yahoo-search"
        action="/search"
        defaultValue={query}
        placeholder="例：ロイヤルカナン、猫砂、ペットシーツ"
      />
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
