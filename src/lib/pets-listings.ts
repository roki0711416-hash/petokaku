import { readableListingTitle } from "./pricing/display-title.ts";
import { mentionsExactJan, rakutenReviewSearchRequest } from "./sources/rakuten/item-search.ts";
import { buildSearchCandidates } from "./sources/yahoo/search-candidates.ts";
import { validJanCode, type YahooItem } from "./sources/yahoo/adapter.ts";
import { searchYahooItems } from "./sources/yahoo/search.ts";
import { listingFitsPet, type PetPage } from "./pets.ts";

const listingRevalidateSeconds = 60 * 60;
const listingLimit = 20;

export type PetListingStatus = "ready" | "empty" | "not-configured" | "request-failed";

export type PetListingCard = {
  id: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  sizeLabel: string | null;
  salesUnitLabel: string | null;
  price: number | null;
  priceNote: string;
  reviewCount: number | null;
  href: string;
  compare: boolean;
};

export type PetListingGroup = {
  status: PetListingStatus;
  cards: PetListingCard[];
};

export type PetListings = {
  yahoo: PetListingGroup;
  rakuten: PetListingGroup;
};

function searchHref(name: string): string {
  const query = readableListingTitle(name).slice(0, 40).trim();
  return `/search?q=${encodeURIComponent(query === "" ? name.slice(0, 40) : query)}`;
}

function yahooCards(pet: PetPage, items: YahooItem[]): PetListingCard[] {
  const fitting = items.filter((item) => listingFitsPet(item.name, [item.genreName ?? "", ...item.parentGenreNames], pet));
  const reviewByJan = new Map<string, number | null>();
  const reviewByName = new Map<string, number | null>();
  for (const item of fitting) {
    const janCode = validJanCode(item.janCode);
    if (janCode) {
      if (!reviewByJan.has(janCode)) {
        reviewByJan.set(janCode, item.reviewCount ?? null);
      }
      continue;
    }
    if (!reviewByName.has(item.name)) {
      reviewByName.set(item.name, item.reviewCount ?? null);
    }
  }
  return buildSearchCandidates(fitting, new Date().toISOString())
    .slice(0, listingLimit)
    .map((card) => {
      const compare = card.janCode != null && card.href != null;
      const several = card.shopCount > 1;
      return {
        id: `yahoo:${card.id}`,
        name: card.name,
        brand: card.brand,
        imageUrl: card.imageUrl,
        sizeLabel: card.sizeLabel,
        salesUnitLabel: card.salesUnitLabel,
        price: card.sellingPrice,
        priceNote: several ? "取得したYahoo!ショッピングの掲載のうち、在庫がある安い価格です。全店舗の最安値ではありません。" : "Yahoo!ショッピングの掲載価格です。全店舗の最安値ではありません。",
        reviewCount: card.janCode ? (reviewByJan.get(card.janCode) ?? null) : (reviewByName.get(card.name) ?? null),
        href: compare ? card.href! : searchHref(card.name),
        compare,
      };
    });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function text(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function yen(value: unknown): number | null {
  const amount = typeof value === "number" ? value : typeof value === "string" && /^[0-9]+$/.test(value) ? Number(value) : null;
  if (amount == null || !Number.isInteger(amount) || amount <= 0 || amount >= 1_000_000_000) {
    return null;
  }
  return amount;
}

function imageUrl(record: Record<string, unknown>): string | null {
  const images = record.mediumImageUrls ?? record.smallImageUrls;
  if (!Array.isArray(images)) {
    return null;
  }
  for (const image of images) {
    const candidate = typeof image === "string" ? image : text(asRecord(image)?.imageUrl);
    if (!candidate || !candidate.startsWith("https://")) {
      continue;
    }
    try {
      const url = new URL(candidate);
      if (url.hostname.toLowerCase().endsWith("rakuten.co.jp")) {
        return url.toString();
      }
    } catch {
      continue;
    }
  }
  return null;
}

function janInText(value: string): string | null {
  const match = value.match(/(?:^|\D)(\d{13})(?!\d)/);
  const janCode = match?.[1];
  if (!janCode || !mentionsExactJan(value, janCode)) {
    return null;
  }
  return janCode;
}

export function rakutenDiscoveryCards(payload: unknown, pet: PetPage): PetListingCard[] {
  const body = asRecord(payload);
  const raw = body?.items ?? body?.Items;
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set<string>();
  const cards: PetListingCard[] = [];
  for (const entry of raw) {
    const record = asRecord(entry);
    const item = asRecord(record?.item) ?? record;
    if (!item) {
      continue;
    }
    const name = text(item.itemName);
    const shopName = text(item.shopName);
    if (!name || !shopName || !listingFitsPet(name, [], pet)) {
      continue;
    }
    const itemCode = text(item.itemCode) ?? `${shopName}:${name}`;
    if (seen.has(itemCode)) {
      continue;
    }
    seen.add(itemCode);
    const janCode = janInText(`${name}\n${text(item.catchcopy) ?? ""}\n${text(item.itemCaption) ?? ""}`);
    const review = typeof item.reviewCount === "number" && Number.isInteger(item.reviewCount) && item.reviewCount >= 0 ? item.reviewCount : null;
    cards.push({
      id: `rakuten:${itemCode}`,
      name,
      brand: null,
      imageUrl: imageUrl(item),
      sizeLabel: null,
      salesUnitLabel: null,
      price: yen(item.itemPrice),
      priceNote: `${shopName}の楽天市場掲載価格です。全店舗の最安値ではありません。`,
      reviewCount: review,
      href: janCode ? `/products/jan/${janCode}` : searchHref(name),
      compare: janCode != null,
    });
    if (cards.length >= listingLimit) {
      break;
    }
  }
  return cards;
}

async function fetchRakuten(url: URL, headers: Record<string, string>): Promise<{ status: number; text: string }> {
  const response = await fetch(url, {
    headers,
    next: { revalidate: listingRevalidateSeconds },
  });
  return { status: response.status, text: await response.text() };
}

async function loadYahoo(pet: PetPage): Promise<PetListingGroup> {
  const result = await searchYahooItems({
    query: pet.query,
    results: listingLimit,
    revalidate: listingRevalidateSeconds,
    sort: "-review_count",
  });
  if (!result.ok) {
    return { status: result.reason, cards: [] };
  }
  const cards = yahooCards(pet, result.items);
  return { status: cards.length === 0 ? "empty" : "ready", cards };
}

async function loadRakuten(pet: PetPage, transport: typeof fetchRakuten): Promise<PetListingGroup> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim() ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim() ?? "";
  if (applicationId === "" || accessKey === "") {
    return { status: "not-configured", cards: [] };
  }
  const { url, headers } = rakutenReviewSearchRequest(applicationId, accessKey, pet.query);
  try {
    const response = await transport(url, headers);
    if (response.status === 404) {
      return { status: "empty", cards: [] };
    }
    if (response.status < 200 || response.status >= 300) {
      return { status: "request-failed", cards: [] };
    }
    const cards = rakutenDiscoveryCards(JSON.parse(response.text) as unknown, pet);
    return { status: cards.length === 0 ? "empty" : "ready", cards };
  } catch {
    return { status: "request-failed", cards: [] };
  }
}

export async function loadPetListings(pet: PetPage, transport: typeof fetchRakuten = fetchRakuten): Promise<PetListings> {
  const [yahoo, rakuten] = await Promise.all([
    loadYahoo(pet).catch(() => ({ status: "request-failed" as const, cards: [] })),
    loadRakuten(pet, transport).catch(() => ({ status: "request-failed" as const, cards: [] })),
  ]);
  return { yahoo, rakuten };
}
