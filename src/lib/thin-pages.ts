import type { Metadata } from "next";
import { privateRobots, robotsMetadata } from "./site.ts";

export type ListingGroupSnapshot = {
  status: string;
  cards: readonly unknown[];
};

// 比較できる掲載が1件もないハブは、説明文が親ページと重なるため索引しない。
export function hubHasComparableProducts(listings: {
  yahoo: ListingGroupSnapshot;
  rakuten: ListingGroupSnapshot;
}): boolean {
  return [listings.yahoo, listings.rakuten].some((group) => group.status === "ready" && group.cards.length > 0);
}

export function filteredHubRobots(input: { unknownFilter: boolean; filtered: boolean; hasProducts: boolean }): Metadata["robots"] {
  if (input.unknownFilter || (input.filtered && !input.hasProducts)) {
    return privateRobots();
  }
  return robotsMetadata();
}
