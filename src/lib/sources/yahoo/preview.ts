import { cache } from "react";
import { listingSkipReason, prepareComparableCards } from "@/lib/listing-eligibility";
import { adaptYahooGroup, validJanCode, type AdaptedYahooProduct, type YahooItem } from "@/lib/sources/yahoo/adapter";
import { buildSearchCandidates, searchCandidateLimit, type SearchCandidateCard } from "@/lib/sources/yahoo/search-candidates";
import { keywordItemMatchesQuery, keywordYahooRequests } from "@/lib/sources/yahoo/keyword-requests";
import { searchYahooItems, yahooJanSearchLimit, yahooRetrievalLimited, type YahooSearchResult } from "@/lib/sources/yahoo/search";

export type YahooPreviewResult =
  | { ok: true; adapted: AdaptedYahooProduct; retrievalLimited: boolean }
  | { ok: false; reason: "not-configured" | "request-failed" | "no-jan" };

export type YahooPreviewCase = "dog" | "litter" | "sheets";

const fixedPreviewJan: Record<Exclude<YahooPreviewCase, "dog">, string> = {
  litter: "2000019060475",
  sheets: "2250002766185",
};

export const loadYahooPreview = cache(async (): Promise<YahooPreviewResult> => {
  const observedAt = new Date().toISOString();
  const seed = await searchYahooItems({ query: "ロイヤルカナン", results: 1 });
  if (!seed.ok) {
    return seed;
  }

  const janCode = validJanCode(seed.items[0]?.janCode ?? null);
  if (!janCode) {
    return { ok: false, reason: "no-jan" };
  }

  const matched = await searchYahooItems({ janCode, results: yahooJanSearchLimit });
  if (!matched.ok) {
    return matched;
  }

  const adapted = adaptYahooGroup([...seed.items, ...matched.items], observedAt);
  if (!adapted) {
    return { ok: false, reason: "request-failed" };
  }
  return {
    ok: true,
    adapted,
    retrievalLimited: yahooRetrievalLimited({
      totalAvailable: matched.totalAvailable,
      returnedCount: matched.returnedCount,
      requested: yahooJanSearchLimit,
    }),
  };
});

export const loadYahooPreviewCase = cache(async (previewCase: YahooPreviewCase): Promise<YahooPreviewResult> => {
  if (previewCase === "dog") {
    return loadYahooPreview();
  }
  const observedAt = new Date().toISOString();
  const matched = await searchYahooItems({ janCode: fixedPreviewJan[previewCase], results: yahooJanSearchLimit });
  if (!matched.ok) {
    return matched;
  }
  const adapted = adaptYahooGroup(matched.items, observedAt);
  if (!adapted) {
    return { ok: false, reason: "request-failed" };
  }
  return {
    ok: true,
    adapted,
    retrievalLimited: yahooRetrievalLimited({
      totalAvailable: matched.totalAvailable,
      returnedCount: matched.returnedCount,
      requested: yahooJanSearchLimit,
    }),
  };
});

const janSearchRevalidateSeconds = 60;

export const loadYahooJan = cache(async (janCode: string): Promise<YahooPreviewResult> => {
  if (!validJanCode(janCode)) {
    return { ok: false, reason: "no-jan" };
  }
  const observedAt = new Date().toISOString();
  const matched = await searchYahooItems({ janCode, results: yahooJanSearchLimit, revalidate: janSearchRevalidateSeconds });
  if (!matched.ok) {
    return matched;
  }
  const adapted = adaptYahooGroup(matched.items, observedAt);
  if (!adapted) {
    return { ok: false, reason: "no-jan" };
  }
  return {
    ok: true,
    adapted,
    retrievalLimited: yahooRetrievalLimited({
      totalAvailable: matched.totalAvailable,
      returnedCount: matched.returnedCount,
      requested: yahooJanSearchLimit,
    }),
  };
});

export type YahooKeywordSearchResult =
  | { ok: true; cards: SearchCandidateCard[] }
  | { ok: false; reason: "not-configured" | "request-failed" };

function dedupeYahooKeywordItems(items: YahooItem[]): YahooItem[] {
  const seen = new Set<string>();
  const unique: YahooItem[] = [];
  for (const item of items) {
    const key = item.sellerId && item.code ? `${item.sellerId}:${item.code}` : `${item.url ?? ""}:${item.name}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function skipHistogram(cards: ReadonlyArray<{ name: string; janCode: string | null; href: string | null; price: number | null; shopCount: number; salesUnitKey: string | null; salesUnitConfirmed: boolean }>): Record<string, number> {
  const reasons: Record<string, number> = {};
  for (const card of cards) {
    const reason = listingSkipReason(card) ?? "ok";
    reasons[reason] = (reasons[reason] ?? 0) + 1;
  }
  return reasons;
}

const keywordSearchFillTarget = 4;
const keywordSearchMoreStarts = [101, 151];

function keywordCards(items: YahooItem[]): SearchCandidateCard[] {
  const candidates = buildSearchCandidates(items, new Date().toISOString(), Math.max(items.length, 1)).map((card) => ({
    ...card,
    price: card.sellingPrice,
    shopCount: card.comparableShopCount,
  }));
  const cards = prepareComparableCards(candidates)
    .slice(0, searchCandidateLimit)
    .map((card) => ({
      ...card,
      shopLabel: `${card.shopCount}ショップを比較`,
    }));
  return cards;
}

function matchingKeywordItems(query: string, items: YahooItem[]): YahooItem[] {
  if (validJanCode(query)) {
    return items;
  }
  return items.filter((item) => keywordItemMatchesQuery(item.name, [item.genreName ?? "", ...item.parentGenreNames], query));
}

async function fetchKeywordPages(query: string, starts: readonly number[]): Promise<
  { ok: true; items: YahooItem[] } | { ok: false; reason: "not-configured" | "request-failed" }
> {
  const requests = keywordYahooRequests(query, starts);
  const pages = await Promise.all(requests.map((request) => searchYahooItems(request)));
  const ready = pages.filter((page): page is Extract<YahooSearchResult, { ok: true }> => page.ok);
  if (ready.length === 0) {
    const reason = pages.some((page) => !page.ok && page.reason === "not-configured") ? "not-configured" : "request-failed";
    console.error("[petokaku] キーワード検索に失敗しました", { reason, requests: requests.length });
    return { ok: false, reason };
  }
  if (ready.length < pages.length) {
    console.error("[petokaku] キーワード検索の一部が失敗しました", { failed: pages.length - ready.length });
  }
  return { ok: true, items: ready.flatMap((page) => page.items) };
}

export const loadYahooKeywordSearch = cache(async (query: string): Promise<YahooKeywordSearchResult> => {
  const first = await fetchKeywordPages(query, [1, 51]);
  if (!first.ok) {
    return first;
  }
  let items = matchingKeywordItems(query, dedupeYahooKeywordItems(first.items));
  let cards = keywordCards(items);
  if (!validJanCode(query) && cards.length < keywordSearchFillTarget) {
    const more = await fetchKeywordPages(query, keywordSearchMoreStarts);
    if (more.ok) {
      items = matchingKeywordItems(query, dedupeYahooKeywordItems([...first.items, ...more.items]));
      cards = keywordCards(items);
    }
  }
  if (cards.length === 0) {
    const candidates = buildSearchCandidates(items, new Date().toISOString(), Math.max(items.length, 1)).map((card) => ({
      ...card,
      price: card.sellingPrice,
      shopCount: card.comparableShopCount,
    }));
    console.error("[petokaku] キーワード検索は取得できましたが掲載できる商品がありません", {
      query,
      hits: items.length,
      candidates: candidates.length,
      reasons: skipHistogram(candidates),
    });
  }
  return { ok: true, cards };
});
