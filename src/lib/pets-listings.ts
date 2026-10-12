import { comparableShopKey, detailHrefForJan, prepareComparableCards, salesUnitKeyOf, type ShopCountedListing } from "./listing-eligibility.ts";
import { mentionsExactJan, rakutenReviewSearchRequest } from "./sources/rakuten/item-search.ts";
import { buildSearchCandidates, preferComparableCards } from "./sources/yahoo/search-candidates.ts";
import { validJanCode, type YahooItem } from "./sources/yahoo/adapter.ts";
import { searchYahooItems } from "./sources/yahoo/search.ts";
import { listingFitsCategory, listingFitsPet, rakutenPetGenreIds, yahooPetGenreCategoryIds, type PetCategory, type PetId, type PetPage } from "./pets.ts";

export const yahooListingResults = 50;
export const rakutenListingHits = 30;
export const listingPageMax = 4;
export const comparablePageLimit = 40;

export type ListingDiscoveryRequest = { query: string; start?: number };

// 公式ジャンルの中で、同じJANが複数ショップに出やすい検索だけを足す。1ペットあたりの件数は固定。
export const petDiscoveryRequests: Record<PetId, readonly ListingDiscoveryRequest[]> = {
  dog: [{ query: "犬 用品" }, { query: "ドッグフード" }, { query: "ペットシーツ" }, { query: "ロイヤルカナン" }],
  cat: [
    { query: "猫 用品" },
    { query: "キャットフード" },
    { query: "キャットフード", start: 51 },
    { query: "猫砂" },
    { query: "猫砂", start: 51 },
  ],
  "small-animal": [{ query: "チモシー" }, { query: "牧草" }, { query: "小動物 ペレット" }, { query: "うさぎ フード" }],
  bird: [{ query: "鳥 用品" }, { query: "鳥 フード" }, { query: "ネクトン" }, { query: "ネクトン", start: 51 }, { query: "セキセイインコ 餌" }],
  fish: [{ query: "テトラ フレーク" }, { query: "キョーリン" }, { query: "グッピー フード" }, { query: "熱帯魚 フード" }],
  reptile: [{ query: "爬虫類 用品" }, { query: "爬虫類 保温" }, { query: "爬虫類 保温", start: 51 }, { query: "レオパ フード" }],
};

export function listingDiscoveryRequests(pet: PetPage, category: PetCategory | null, page: number): ListingDiscoveryRequest[] {
  if (category != null || page > 1) {
    const start = page > 1 ? (page - 1) * yahooListingResults + 1 : undefined;
    return [{ query: category?.query ?? pet.query, ...(start ? { start } : {}) }];
  }
  return [...petDiscoveryRequests[pet.id]];
}
const rakutenGapMs = 1100;
const rakutenTimeoutMs = 12_000;
const failureRevalidateSeconds = 120;

// ビルド直後に6ページが同時に再取得しないよう、ペットごとに5分ずつずらす。
export const petPageRevalidateSeconds = {
  dog: 3600,
  cat: 3900,
  "small-animal": 4200,
  bird: 4500,
  fish: 4800,
  reptile: 5100,
} as const;

export type PetListingStatus =
  | "ready"
  | "empty"
  | "not-configured"
  | "rate-limited"
  | "unauthorized"
  | "parameter"
  | "timeout"
  | "unavailable"
  | "request-failed";

export type PetListingCard = {
  id: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  janCode: string | null;
  sizeLabel: string | null;
  salesUnitLabel: string | null;
  price: number | null;
  priceNote: string;
  reviewCount: number | null;
  href: string;
  compare: boolean;
};

type CountedListingCard = PetListingCard &
  ShopCountedListing & {
    shopKeys: string[];
  };

export type PetListingGroup = {
  status: PetListingStatus;
  cards: PetListingCard[];
  hasNext: boolean;
};

export type PetListings = {
  yahoo: PetListingGroup;
  rakuten: PetListingGroup;
  observedAt: string;
  page: number;
};

export function listingPageNumber(value: string | undefined): number {
  if (value == null || !/^[1-9]\d*$/.test(value)) {
    return 1;
  }
  const page = Number(value);
  if (page > listingPageMax) {
    return 1;
  }
  return page;
}

export function listingPageHref(path: string, categoryId: string | null, page: number): string {
  const params = new URLSearchParams();
  if (categoryId) {
    params.set("category", categoryId);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query === "" ? path : `${path}?${query}`;
}

function listingGroup(status: PetListingStatus, cards: PetListingCard[] = [], hasNext = false): PetListingGroup {
  return { status, cards, hasNext };
}

function itemGenres(item: YahooItem): string[] {
  return [item.genreName ?? "", ...item.parentGenreNames];
}

function yahooCards(pet: PetPage, items: YahooItem[], category: PetCategory | null, observedAt: string): CountedListingCard[] {
  const fitting = items.filter((item) => {
    const genres = itemGenres(item);
    return listingFitsPet(item.name, genres, pet) && (category == null || listingFitsCategory(item.name, genres, category));
  });
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
  const cards = preferComparableCards(buildSearchCandidates(fitting, observedAt, Math.max(fitting.length, 1)))
    .map((card) => {
      const href = card.href ?? detailHrefForJan(card.janCode ?? "");
      return {
        id: `yahoo:${card.id}`,
        name: card.name,
        brand: card.brand,
        imageUrl: card.imageUrl,
        janCode: card.janCode,
        sizeLabel: card.sizeLabel,
        salesUnitLabel: card.salesUnitLabel,
        price: card.sellingPrice,
        priceNote: "Yahoo!ショッピングで見られた、在庫ありの価格です。すべての店舗の最安値ではありません。",
        reviewCount: card.janCode ? (reviewByJan.get(card.janCode) ?? null) : (reviewByName.get(card.name) ?? null),
        href: href ?? "",
        compare: false,
        shopCount: card.comparableShopCount,
        salesUnitKey: card.salesUnitKey,
        salesUnitConfirmed: card.salesUnitConfirmed,
        shopKeys: card.shopKeys,
      };
    });
  return cards;
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

function rakutenGenreLabels(item: Record<string, unknown>): string[] {
  const labels: string[] = [];
  const direct = text(item.genreName);
  if (direct) {
    labels.push(direct);
  }
  const genre = asRecord(item.genre);
  const nested = text(genre?.name);
  if (nested) {
    labels.push(nested);
  }
  return labels;
}

function publicListingCard(card: CountedListingCard): PetListingCard {
  return {
    id: card.id,
    name: card.name,
    brand: card.brand,
    imageUrl: card.imageUrl,
    janCode: card.janCode,
    sizeLabel: card.sizeLabel,
    salesUnitLabel: card.salesUnitLabel,
    price: card.price,
    priceNote: card.priceNote,
    reviewCount: card.reviewCount,
    href: card.href,
    compare: true,
  };
}

function bothMallNote(card: CountedListingCard): string {
  const yahoo = card.shopKeys.some((key) => key.startsWith("yahoo:"));
  const rakuten = card.shopKeys.some((key) => key.startsWith("rakuten:"));
  if (yahoo && rakuten) {
    return "Yahoo!ショッピングと楽天市場で見られた、在庫ありの価格です。すべての店舗の最安値ではありません。";
  }
  return card.priceNote;
}

export function publishComparableListings(yahoo: PetListingGroup, rakuten: PetListingGroup): { yahoo: PetListingGroup; rakuten: PetListingGroup } {
  const yahooCards = yahoo.status === "ready" ? (yahoo.cards as CountedListingCard[]) : [];
  const rakutenCards = rakuten.status === "ready" ? (rakuten.cards as CountedListingCard[]) : [];
  const listed = prepareComparableCards([...yahooCards, ...rakutenCards]).map((card) => ({ ...card, priceNote: bothMallNote(card) }));
  const yahooKept = listed.filter((card) => card.id.startsWith("yahoo:")).slice(0, comparablePageLimit).map(publicListingCard);
  const rakutenKept = listed.filter((card) => card.id.startsWith("rakuten:")).slice(0, comparablePageLimit).map(publicListingCard);
  return {
    yahoo: {
      ...yahoo,
      cards: yahooKept,
      status: yahoo.status === "ready" && yahooKept.length === 0 ? "empty" : yahoo.status,
    },
    rakuten: {
      ...rakuten,
      cards: rakutenKept,
      status: rakuten.status === "ready" && rakutenKept.length === 0 ? "empty" : rakuten.status,
    },
  };
}

export function rakutenListingCandidates(payload: unknown, pet: PetPage, category: PetCategory | null = null): CountedListingCard[] {
  const body = asRecord(payload);
  const raw = body?.items ?? body?.Items;
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set<string>();
  const cards: CountedListingCard[] = [];
  for (const entry of raw) {
    const record = asRecord(entry);
    const item = asRecord(record?.item) ?? record;
    if (!item) {
      continue;
    }
    const name = text(item.itemName);
    const shopName = text(item.shopName);
    const genres = rakutenGenreLabels(item);
    if (!name || !shopName || !listingFitsPet(name, genres, pet, true) || (category != null && !listingFitsCategory(name, genres, category))) {
      continue;
    }
    const itemCode = text(item.itemCode) ?? `${shopName}:${name}`;
    if (seen.has(itemCode)) {
      continue;
    }
    seen.add(itemCode);
    const janCode = janInText(`${name}\n${text(item.catchcopy) ?? ""}\n${text(item.itemCaption) ?? ""}`);
    const price = yen(item.itemPrice);
    const href = detailHrefForJan(janCode ?? "");
    const unitKey = salesUnitKeyOf(name);
    const shopKey = comparableShopKey("rakuten", text(item.shopCode), shopName);
    if (price == null || href == null || shopKey == null) {
      continue;
    }
    const review = typeof item.reviewCount === "number" && Number.isInteger(item.reviewCount) && item.reviewCount >= 0 ? item.reviewCount : null;
    cards.push({
      id: `rakuten:${itemCode}`,
      name,
      brand: null,
      imageUrl: imageUrl(item),
      janCode,
      sizeLabel: null,
      salesUnitLabel: null,
      price,
      priceNote: "楽天市場で見られた、在庫ありの価格です。すべての店舗の最安値ではありません。",
      reviewCount: review,
      href,
      compare: false,
      shopCount: 1,
      salesUnitKey: unitKey,
      salesUnitConfirmed: unitKey != null,
      shopKeys: [shopKey],
    });
  }
  return groupRakutenCandidates(cards);
}

function groupRakutenCandidates(cards: CountedListingCard[]): CountedListingCard[] {
  const grouped = new Map<string, CountedListingCard>();
  for (const card of cards) {
    const key = card.janCode && card.salesUnitConfirmed && card.salesUnitKey ? `${card.janCode}|${card.salesUnitKey}` : card.id;
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, { ...card, shopKeys: [...card.shopKeys] });
      continue;
    }
    const shopKeys = [...new Set([...current.shopKeys, ...card.shopKeys])];
    const cheaper = card.price != null && current.price != null && card.price < current.price;
    const base = cheaper ? { ...card, reviewCount: current.reviewCount, id: current.id } : current;
    grouped.set(key, { ...base, shopKeys, shopCount: shopKeys.length });
  }
  return [...grouped.values()];
}

export function rakutenDiscoveryCards(payload: unknown, pet: PetPage, category: PetCategory | null = null): PetListingCard[] {
  return prepareComparableCards(rakutenListingCandidates(payload, pet, category))
    .slice(0, rakutenListingHits)
    .map(publicListingCard);
}

export type RakutenTransportResponse = { status: number; text: string; retryAfter?: string | null };

export type RakutenTransport = (url: URL, headers: Record<string, string>, revalidate: number | null) => Promise<RakutenTransportResponse>;

export function rakutenStatus(status: number): Exclude<PetListingStatus, "ready" | "empty" | "not-configured" | "timeout"> {
  if (status === 429) return "rate-limited";
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 400) return "parameter";
  if (status === 408 || status === 504 || status >= 500) return "unavailable";
  return "request-failed";
}

export function retryAfterMs(value: string | null | undefined): number {
  if (value && /^\d+$/.test(value)) {
    const seconds = Number(value);
    if (seconds >= 0 && seconds <= 5) {
      return Math.max(rakutenGapMs, seconds * 1000);
    }
  }
  return rakutenGapMs;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let rakutenQueue: Promise<void> = Promise.resolve();

function enqueueRakuten<T>(task: () => Promise<T>): Promise<T> {
  const run = rakutenQueue.then(task, task);
  rakutenQueue = run.then(
    () => sleep(rakutenGapMs),
    () => sleep(rakutenGapMs),
  );
  return run;
}

async function fetchRakuten(url: URL, headers: Record<string, string>, revalidate: number | null): Promise<RakutenTransportResponse> {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(rakutenTimeoutMs),
    ...(revalidate == null ? { cache: "no-store" as const } : { next: { revalidate } }),
  });
  return { status: response.status, text: await response.text(), retryAfter: response.headers.get("retry-after") };
}

function payloadCount(payload: unknown): number | null {
  const body = asRecord(payload);
  const count = body?.count;
  if (typeof count === "number" && Number.isInteger(count) && count >= 0 && count <= 10_000_000) {
    return count;
  }
  return null;
}

function cardsFromResponse(response: RakutenTransportResponse, pet: PetPage, category: PetCategory | null, page: number): PetListingGroup {
  if (response.status === 404) {
    return listingGroup("empty");
  }
  if (response.status < 200 || response.status >= 300) {
    return listingGroup(rakutenStatus(response.status));
  }
  let payload: unknown;
  try {
    payload = JSON.parse(response.text);
  } catch {
    return listingGroup("request-failed");
  }
  const cards = rakutenListingCandidates(payload, pet, category);
  const total = payloadCount(payload);
  const hasNext = page < listingPageMax && (total != null ? page * rakutenListingHits < total : cards.length >= rakutenListingHits);
  return listingGroup(cards.length === 0 ? "empty" : "ready", cards, hasNext);
}

function failureStatus(error: unknown): PetListingStatus {
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return "timeout";
  }
  return "request-failed";
}

async function shortenFailureCache(): Promise<void> {
  try {
    await fetch("https://petokaku.com/robots.txt", { next: { revalidate: failureRevalidateSeconds } });
  } catch {
    // 失敗ページの再取得間隔を縮められない場合でも、Yahoo!の一覧は返す。
  }
}

let discoveryPace: Promise<void> = Promise.resolve();

function paceDiscovery<T>(task: () => Promise<T>): Promise<T> {
  const run = discoveryPace.then(async () => {
    const started = Date.now();
    const value = await task();
    if (Date.now() - started >= 80) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    return value;
  });
  discoveryPace = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function dedupeYahooItems(items: YahooItem[]): YahooItem[] {
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

export async function loadPetDiscoveryItems(
  pet: PetPage,
): Promise<{ ok: true; items: YahooItem[]; hasNext: boolean } | { ok: false; reason: "not-configured" | "request-failed" }> {
  const items: YahooItem[] = [];
  let sawReady = false;
  let hasNext = false;
  let failure: "not-configured" | "request-failed" = "request-failed";
  const requests = petDiscoveryRequests[pet.id];
  for (let index = 0; index < requests.length; index += 1) {
    const request = requests[index];
    const result = await paceDiscovery(() =>
      searchYahooItems({
        query: request?.query ?? pet.query,
        genreCategoryId: yahooPetGenreCategoryIds[pet.id],
        results: yahooListingResults,
        start: request?.start,
        revalidate: petPageRevalidateSeconds[pet.id],
        sort: "-review_count",
      }),
    );
    if (!result.ok) {
      failure = result.reason;
      continue;
    }
    sawReady = true;
    if (index === 0) {
      hasNext =
        listingPageMax > 1 &&
        (result.totalAvailable != null ? yahooListingResults < result.totalAvailable : result.returnedCount >= yahooListingResults);
    }
    items.push(...result.items);
  }
  if (!sawReady) {
    return { ok: false, reason: failure };
  }
  return { ok: true, items: dedupeYahooItems(items), hasNext };
}

async function loadYahoo(pet: PetPage, category: PetCategory | null, page: number, observedAt: string): Promise<PetListingGroup> {
  if (category == null && page === 1) {
    const discovered = await loadPetDiscoveryItems(pet);
    if (!discovered.ok) {
      return listingGroup(discovered.reason);
    }
    const cards = yahooCards(pet, discovered.items, null, observedAt);
    return listingGroup(cards.length === 0 ? "empty" : "ready", cards, discovered.hasNext);
  }
  const request = listingDiscoveryRequests(pet, category, page)[0];
  const result = await searchYahooItems({
    query: request?.query ?? pet.query,
    genreCategoryId: yahooPetGenreCategoryIds[pet.id],
    results: yahooListingResults,
    start: request?.start,
    revalidate: petPageRevalidateSeconds[pet.id],
    sort: "-review_count",
  });
  if (!result.ok) {
    return listingGroup(result.reason);
  }
  const cards = yahooCards(pet, result.items, category, observedAt);
  const hasNext =
    page < listingPageMax &&
    (result.totalAvailable != null ? page * yahooListingResults < result.totalAvailable : result.returnedCount >= yahooListingResults);
  return listingGroup(cards.length === 0 ? "empty" : "ready", cards, hasNext);
}

async function loadRakuten(
  pet: PetPage,
  transport: RakutenTransport,
  pause: (ms: number) => Promise<void>,
  category: PetCategory | null,
  page: number,
): Promise<PetListingGroup> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim() ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim() ?? "";
  if (applicationId === "" || accessKey === "") {
    return listingGroup("not-configured");
  }
  const { url, headers } = rakutenReviewSearchRequest(
    applicationId,
    accessKey,
    category?.query ?? pet.query,
    rakutenPetGenreIds[pet.id],
    page,
    rakutenListingHits,
  );
  const revalidate = petPageRevalidateSeconds[pet.id];
  const once = async (cacheSeconds: number | null) => {
    try {
      const response = await transport(url, headers, cacheSeconds);
      return { group: cardsFromResponse(response, pet, category, page), retryAfter: response.retryAfter ?? null };
    } catch (error) {
      return { group: listingGroup(failureStatus(error)), retryAfter: null };
    }
  };
  const run = async () => {
    const first = await once(revalidate);
    if (first.group.status !== "rate-limited") {
      return first.group;
    }
    await pause(retryAfterMs(first.retryAfter));
    const second = await once(revalidate);
    return second.group;
  };
  return transport === fetchRakuten ? enqueueRakuten(run) : run();
}

function keepsHourlyCache(status: PetListingStatus): boolean {
  return status === "ready" || status === "empty" || status === "not-configured";
}

export async function loadPetListings(
  pet: PetPage,
  transport: RakutenTransport = fetchRakuten,
  pause: (ms: number) => Promise<void> = sleep,
  category: PetCategory | null = null,
  page = 1,
): Promise<PetListings> {
  const safePage = listingPageNumber(String(page));
  const observedAt = new Date().toISOString();
  const [yahoo, rakuten] = await Promise.all([
    loadYahoo(pet, category, safePage, observedAt).catch(() => listingGroup("request-failed")),
    loadRakuten(pet, transport, pause, category, safePage).catch(() => listingGroup("request-failed")),
  ]);
  if (transport === fetchRakuten && (!keepsHourlyCache(yahoo.status) || !keepsHourlyCache(rakuten.status))) {
    await shortenFailureCache();
  }
  const published = publishComparableListings(yahoo, rakuten);
  return { yahoo: published.yahoo, rakuten: published.rakuten, observedAt, page: safePage };
}
