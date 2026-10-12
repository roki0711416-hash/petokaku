import { guideListingQuery, listingMatchesGuide, type ItemGuide } from "@/lib/item-guides";
import { prepareComparableCards } from "@/lib/listing-eligibility";
import { buildSearchCandidates, type SearchCandidateCard } from "@/lib/sources/yahoo/search-candidates";
import { searchYahooItems } from "@/lib/sources/yahoo/search";

const guideYahooResults = 20;
const guideListingLimit = 8;
const guideRevalidateSeconds = 60 * 60;

export type GuideListings =
  | { status: "ready"; query: string; cards: SearchCandidateCard[] }
  | { status: "empty" | "not-configured" | "request-failed"; query: string; cards: [] };

export async function loadGuideListings(guide: ItemGuide, userQuery: string): Promise<GuideListings> {
  const query = guideListingQuery(guide, userQuery);
  const result = await searchYahooItems({
    query,
    results: guideYahooResults,
    revalidate: guideRevalidateSeconds,
  });
  if (!result.ok) {
    return { status: result.reason, query, cards: [] };
  }
  const matched = result.items.filter((item) =>
    listingMatchesGuide(guide.slug, item.name, [item.genreName ?? "", ...item.parentGenreNames]),
  );
  const cards = prepareComparableCards(
    buildSearchCandidates(matched, new Date().toISOString()).map((card) => ({
      ...card,
      price: card.sellingPrice,
      shopCount: card.comparableShopCount,
    })),
  ).slice(0, guideListingLimit);
  if (cards.length === 0) {
    return { status: "empty", query, cards: [] };
  }
  return { status: "ready", query, cards };
}
