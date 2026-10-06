import Link from "next/link";
import { SearchResultList } from "@/components/search-result-list";
import { loadYahooKeywordSearch } from "@/lib/sources/yahoo/preview";

const fetchError = "商品情報を取得できませんでした。時間をおいてもう一度お試しください。";

export async function YahooSearchResults({ query }: { query: string }) {
  const result = await loadYahooKeywordSearch(query);

  if (!result.ok) {
    return (
      <div className="mt-8" role="alert">
        <p className="leading-8">{fetchError}</p>
        <p className="mt-3">
          <Link href="/search" className="font-bold text-forest-deep underline-offset-4 hover:underline">
            検索し直す
          </Link>
        </p>
      </div>
    );
  }

  if (result.cards.length === 0) {
    return (
      <div className="mt-8 rounded-[1.75rem] bg-card px-5 py-6">
        <h2 className="text-xl font-bold">ペット用品では商品が見つかりませんでした</h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-7 text-muted">
          <li>商品名を短くして検索してみてください。</li>
          <li>ブランド名だけで検索してみてください。</li>
          <li>ひらがな、カタカナ、漢字の表記を変えて検索してみてください。</li>
        </ul>
      </div>
    );
  }

  return <SearchResultList query={query} cards={result.cards} />;
}
