import { cache } from "react";
import { adaptYahooGroup, validJanCode, type AdaptedYahooProduct } from "@/lib/sources/yahoo/adapter";
import { searchYahooItems } from "@/lib/sources/yahoo/search";
import { buildSearchCandidates, type SearchCandidateCard } from "@/lib/sources/yahoo/search-candidates";

export type YahooPreviewResult =
  | { ok: true; adapted: AdaptedYahooProduct }
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

  const matched = await searchYahooItems({ janCode, results: 20 });
  if (!matched.ok) {
    return matched;
  }

  const adapted = adaptYahooGroup([...seed.items, ...matched.items], observedAt);
  if (!adapted) {
    return { ok: false, reason: "request-failed" };
  }
  return { ok: true, adapted };
});

export const loadYahooPreviewCase = cache(async (previewCase: YahooPreviewCase): Promise<YahooPreviewResult> => {
  if (previewCase === "dog") {
    return loadYahooPreview();
  }
  const observedAt = new Date().toISOString();
  const matched = await searchYahooItems({ janCode: fixedPreviewJan[previewCase], results: 20 });
  if (!matched.ok) {
    return matched;
  }
  const adapted = adaptYahooGroup(matched.items, observedAt);
  if (!adapted) {
    return { ok: false, reason: "request-failed" };
  }
  return { ok: true, adapted };
});

export const loadYahooJan = cache(async (janCode: string): Promise<YahooPreviewResult> => {
  if (!validJanCode(janCode)) {
    return { ok: false, reason: "no-jan" };
  }
  const observedAt = new Date().toISOString();
  const matched = await searchYahooItems({ janCode, results: 20 });
  if (!matched.ok) {
    return matched;
  }
  const adapted = adaptYahooGroup(matched.items, observedAt);
  if (!adapted) {
    return { ok: false, reason: "no-jan" };
  }
  return { ok: true, adapted };
});

export type YahooKeywordSearchResult =
  | { ok: true; cards: SearchCandidateCard[] }
  | { ok: false; reason: "not-configured" | "request-failed" };

export async function loadYahooKeywordSearch(query: string): Promise<YahooKeywordSearchResult> {
  const matched = await searchYahooItems({ query, results: 20 });
  if (!matched.ok) {
    return matched;
  }
  return { ok: true, cards: buildSearchCandidates(matched.items, new Date().toISOString()) };
}
