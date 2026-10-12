import { validJanCode } from "./adapter.ts";
import { yahooJanSearchLimit } from "./search.ts";

const keywordSearchResults = 50;
// 検索一覧だけ短く再利用する。商品詳細の価格取得はここを通らない。
const keywordSearchRevalidateSeconds = 60;

export function keywordYahooRequests(
  query: string,
  starts: readonly number[] = [1, 51],
): Array<{
  query?: string;
  janCode?: string;
  results: number;
  start?: number;
  sort?: "-review_count";
  revalidate: number;
}> {
  const janCode = validJanCode(query);
  if (janCode) {
    return [{ janCode, results: yahooJanSearchLimit, revalidate: keywordSearchRevalidateSeconds }];
  }
  return starts.map((start) => ({
    query,
    results: keywordSearchResults,
    start,
    sort: "-review_count" as const,
    revalidate: keywordSearchRevalidateSeconds,
  }));
}

export function keywordItemMatchesQuery(name: string, genres: readonly string[], query: string): boolean {
  const tokens = query.split(" ").filter((token) => token !== "");
  if (tokens.length === 0) {
    return false;
  }
  const haystack = `${name}\n${genres.join("\n")}`;
  return tokens.every((token) => haystack.includes(token));
}
