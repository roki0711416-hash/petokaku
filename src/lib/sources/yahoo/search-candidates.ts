import { adaptYahooGroup, validJanCode, type YahooItem } from "./adapter.ts";
import { readableListingTitle } from "./listing-title.ts";
import { classifyPetKind, type PetKind, type PetKindSource } from "./pet-kind.ts";
import { groupSizeFamilies, sizeFamilyHref, type SizeFamilyMember } from "./size-family.ts";
import { calculateUnitPrices, type QuantityUnit, type UnitPriceType } from "../../pricing/calculate.ts";
import { salesUnitLabel, hasUnresolvedPackNotation } from "../../pricing/pack-count.ts";
import { unitPriceQuantity } from "../../pricing/quantity-parse.ts";
import type { Offer } from "@/lib/types";

export const searchCandidateLimit = 20;

export type SearchCandidateCard = {
  id: string;
  janCode: string | null;
  href: string | null;
  productUrl: string | null;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  sizeLabel: string | null;
  shopCount: number;
  shopLabel: string | null;
  sellingPrice: number | null;
  priceFrom: boolean;
  salesUnitLabel: string | null;
  unitYen: number | null;
  unitExact: boolean;
  unitLabel: string | null;
  animal: PetKind;
  animalSource: PetKindSource;
  sizeChoices: string | null;
};

// フード、おやつ、ライフステージ、容量帯、価格帯は、animal と同じ位置に後から足す。

function shopCountOf(offers: Offer[]): number {
  return new Set(offers.map((offer) => (offer.sellerId ? offer.sellerId : offer.shopName))).size;
}

function inStockPriced(offers: Offer[]): Offer[] {
  return offers.filter((offer) => offer.stockStatus === "in_stock" && offer.price != null);
}

function lowestPrice(offers: Offer[]): Offer | null {
  const pool = inStockPriced(offers);
  if (pool.length === 0) {
    return null;
  }
  return pool.reduce((best, offer) => ((offer.price ?? Number.POSITIVE_INFINITY) < (best.price ?? Number.POSITIVE_INFINITY) ? offer : best));
}

function chooseRepresentative(offers: Offer[]): { offer: Offer | null; group: Offer[] } {
  const normal = offers.filter(
    (offer) =>
      (offer.packCount == null || offer.packCount === 1) && !hasUnresolvedPackNotation(offer.listingTitle ?? ""),
  );
  const normalOffer = lowestPrice(normal);
  if (normalOffer) {
    return { offer: normalOffer, group: normal };
  }
  const setCounts = [...new Set(offers.map((offer) => offer.packCount).filter((count): count is number => count != null && count > 1))].sort(
    (left, right) => left - right,
  );
  for (const count of setCounts) {
    const group = offers.filter((offer) => offer.packCount === count);
    const setOffer = lowestPrice(group);
    if (setOffer) {
      return { offer: setOffer, group };
    }
  }
  return { offer: null, group: [] };
}

function referenceUnit(offer: Offer, quantity: number | null, quantityUnit: QuantityUnit | null, unitPriceType: UnitPriceType) {
  if (!offer.unitPriceReady) {
    return { unitYen: null, unitExact: false, unitLabel: null };
  }
  const priced = calculateUnitPrices({
    price: offer.price,
    shipping: offer.shippingFee,
    quantity: unitPriceQuantity(quantity, offer.packCount, offer.totalQuantity),
    quantityUnit,
    unitPriceType,
  });
  if (!priced.itemUnit || !priced.unitLabel) {
    return { unitYen: null, unitExact: false, unitLabel: null };
  }
  return { unitYen: priced.itemUnit.yen, unitExact: priced.itemUnit.exact, unitLabel: priced.unitLabel };
}

function kindOf(items: YahooItem[], title: string, brandName: string | null) {
  return classifyPetKind({
    genreNames: items.flatMap((item) => [...item.parentGenreNames, item.genreName ?? ""]),
    brandName,
    title,
  });
}

function candidateFromJan(items: YahooItem[], observedAt: string): SearchCandidateCard | null {
  const adapted = adaptYahooGroup(items, observedAt);
  if (!adapted) {
    return null;
  }
  const detail = adapted.detail;
  const chosen = chooseRepresentative(detail.offers);
  const priced = chosen.offer ? inStockPriced(chosen.group) : [];
  const quote = chosen.offer ? referenceUnit(chosen.offer, detail.quantity, detail.quantityUnit, detail.unitPriceType) : null;
  const shops = shopCountOf(detail.offers);
  const setLabel =
    chosen.offer && chosen.offer.packCount != null && chosen.offer.packCount > 1
      ? salesUnitLabel(chosen.offer.packCount, chosen.offer.packUnit)
      : null;
  const sourceName = chosen.offer?.listingTitle || detail.name;
  const kind = kindOf(items, sourceName, detail.brand || null);
  return {
    id: `jan:${detail.janCode}`,
    janCode: detail.janCode,
    href: detail.janCode ? `/products/jan/${detail.janCode}` : null,
    productUrl: null,
    name: readableListingTitle(sourceName),
    brand: detail.brand || null,
    imageUrl: detail.imageUrl,
    sizeLabel: detail.quantity != null ? detail.sizeLabel : null,
    shopCount: shops,
    shopLabel: shops <= 1 ? "この検索では1ショップ" : `${shops}ショップを比較`,
    sellingPrice: chosen.offer?.price ?? null,
    priceFrom: priced.length > 1,
    salesUnitLabel: setLabel,
    unitYen: quote?.unitYen ?? null,
    unitExact: quote?.unitExact ?? false,
    unitLabel: quote?.unitLabel ?? null,
    animal: kind.kind,
    animalSource: kind.source,
    sizeChoices: null,
  };
}

function listingIdentity(item: YahooItem, index: number): string {
  if (item.sellerId && item.code) {
    return `${item.sellerId}:${item.code}`;
  }
  if (item.url) {
    return item.url;
  }
  return `row:${index}`;
}

function candidateWithoutJan(item: YahooItem, index: number): SearchCandidateCard {
  const inStock = item.inStock === true && item.price != null;
  const kind = kindOf([item], item.name, item.brandName);
  return {
    id: `listing:${listingIdentity(item, index)}`,
    janCode: null,
    href: null,
    productUrl: item.url,
    name: readableListingTitle(item.name),
    brand: item.brandName,
    imageUrl: item.imageUrl,
    sizeLabel: null,
    shopCount: 1,
    shopLabel: null,
    sellingPrice: inStock ? item.price : null,
    priceFrom: false,
    salesUnitLabel: null,
    unitYen: null,
    unitExact: false,
    unitLabel: null,
    animal: kind.kind,
    animalSource: kind.source,
    sizeChoices: null,
  };
}

export function buildSearchCandidates(items: YahooItem[], observedAt: string): SearchCandidateCard[] {
  const byJan = new Map<string, YahooItem[]>();
  const withoutJan: Array<{ item: YahooItem; index: number }> = [];
  const seenListing = new Set<string>();
  const order: string[] = [];
  items.forEach((item, index) => {
    const janCode = validJanCode(item.janCode);
    if (janCode) {
      const grouped = byJan.get(janCode) ?? [];
      if (grouped.length === 0) {
        order.push(`jan:${janCode}`);
      }
      grouped.push(item);
      byJan.set(janCode, grouped);
      return;
    }
    const identity = listingIdentity(item, index);
    if (item.sellerId && item.code) {
      if (seenListing.has(identity)) {
        return;
      }
      seenListing.add(identity);
    }
    withoutJan.push({ item, index });
    order.push(`listing:${identity}`);
  });

  const cards = new Map<string, SearchCandidateCard>();
  const familyMembers: SizeFamilyMember[] = [];
  for (const [janCode, grouped] of byJan) {
    const candidate = candidateFromJan(grouped, observedAt);
    if (candidate) {
      cards.set(`jan:${janCode}`, candidate);
      const brands = [...new Set(grouped.map((item) => item.brandName).filter((brand): brand is string => brand != null && brand !== ""))];
      const genres = [...new Set(grouped.map((item) => item.genreName).filter((genre): genre is string => genre != null && genre !== ""))];
      familyMembers.push({
        id: candidate.id,
        janCode,
        animal: candidate.animal,
        brand: brands.length === 1 ? brands[0] ?? null : null,
        genreName: genres.length === 1 ? genres[0] ?? null : null,
        titles: grouped.map((item) => item.name),
      });
    }
  }
  for (const family of groupSizeFamilies(familyMembers)) {
    const jans = family.members.map((member) => member.janCode);
    for (const member of family.members) {
      const card = cards.get(member.id);
      if (!card) {
        continue;
      }
      card.sizeChoices = family.label;
      card.href = sizeFamilyHref(member.janCode, jans);
    }
  }
  for (const entry of withoutJan) {
    const candidate = candidateWithoutJan(entry.item, entry.index);
    cards.set(candidate.id, candidate);
  }

  return order.flatMap((id) => {
    const card = cards.get(id);
    return card ? [card] : [];
  }).slice(0, searchCandidateLimit);
}
