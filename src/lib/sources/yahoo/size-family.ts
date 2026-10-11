import type { QuantityUnit, UnitPriceType } from "../../pricing/calculate.ts";
import { calculateUnitPrices, lowestShippingTotal } from "../../pricing/calculate.ts";
import { hasUnresolvedPackNotation } from "../../pricing/pack-count.ts";
import { formatQuantityLabel, parseTitleQuantity } from "../../pricing/quantity-parse.ts";
import { readableListingTitle } from "./listing-title.ts";
import type { PetKind } from "./pet-kind.ts";

const stopwords = new Set([
  "ドライフード",
  "キャットフード",
  "ドッグフード",
  "フード",
  "ごはん",
  "ご飯",
  "ドライ",
  "ウェットフード",
  "ウエットフード",
  "ウェット",
  "ウエット",
  "犬",
  "猫",
  "犬用",
  "猫用",
  "shn",
  "fhn",
  "fcn",
  "bhn",
  "ドッグ",
  "キャット",
  "ロイヤルカナン",
  "royalcanin",
  "royal",
  "canin",
  "ロイカナ",
  "フランス",
  "ペット",
  "総合栄養食",
  "全猫種",
  "猫専用フード",
  "猫フード",
  "生後",
  "室内猫",
]);

const stageGroups: Array<{ id: string; words: string[] }> = [
  { id: "puppy", words: ["パピー", "子犬", "幼犬"] },
  { id: "kitten", words: ["キトン", "子猫", "幼猫"] },
  { id: "adult", words: ["アダルト", "成犬", "成猫"] },
  { id: "senior", words: ["シニア", "エイジング", "高齢", "+7"] },
  { id: "sterilised", words: ["ステアライズド", "避妊", "去勢"] },
];

const flavorWords = ["チキン", "ターキー", "フィッシュ", "サーモン", "ビーフ", "ラム"];

export type SizeFamilyMember = {
  id: string;
  janCode: string;
  animal: PetKind;
  brand: string | null;
  genreName: string | null;
  titles: string[];
};

export type SizeIdentity = {
  id: string;
  janCode: string;
  animal: PetKind;
  brandKey: string;
  genreKey: string;
  tokenKey: string;
  stage: string;
  flavors: string[];
  statedQuantity: number;
  statedUnit: QuantityUnit;
  sizeLabel: string;
};

export type SizeFamily = {
  label: string;
  members: SizeIdentity[];
};

export type SingleSizeQuote = {
  sellingPrice: number | null;
  lowestItemPrice: number | null;
  itemUnitYen: number | null;
  itemUnitExact: boolean;
  shippingUnitYen: number | null;
  shippingUnitExact: boolean;
  shippingTotal: number | null;
  sellingShippingKnown: boolean;
  sellingPriceWithheld: boolean;
  unitLabel: string | null;
};

type TitleReading = {
  tokens: string[];
  stages: string[];
  flavors: string[];
  statedQuantity: number;
  statedUnit: QuantityUnit;
};

function normalizeKey(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, "").trim().toLowerCase();
}

function stagesOf(tokens: string[]): string[] {
  const found = new Set<string>();
  for (const token of tokens) {
    for (const group of stageGroups) {
      if (group.words.some((word) => token.includes(word))) {
        found.add(group.id);
      }
    }
  }
  return [...found].sort();
}

function tokensOf(title: string): string[] {
  let text = readableListingTitle(title).normalize("NFKC").toLowerCase().replace(/[×✕✖]/g, "x");
  text = text.replace(/（[^）]*[歳ヵ月ヶカ][^）]*）/g, " ");
  text = text.replace(/\([^)]*[歳ヵ月ヶカ][^)]*\)/g, " ");
  text = text.replace(/生後[^/]{0,24}?(?:まで|以上)/g, " ");
  text = text.replace(/(?:生後)?\d+\s*(?:カ月|ヵ月|ヶ月)齢?(?:から|〜|~|－|-)?(?:\d+\s*(?:歳|才))?齢?(?:まで|以上)?/g, " ");
  text = text.replace(/[〜~]\s*\d+\s*(?:歳|才)まで/g, " ");
  text = text.replace(/[（）()【】[\]※]/g, " ");
  text = text.replace(/x\s*\d{1,2}\s*(?:袋|個|本|パック)?/g, " ");
  text = text.replace(/\d{1,2}\s*(?:袋|個|本|パック)\s*セット/g, " ");
  text = text.replace(/(?<!\d)\d{1,2}(?!\d)\s*(?:袋|個|本|パック)/g, " ");
  text = text.replace(/(?<!\d)\d+(?:\.\d+)?(?!\d)\s*(?:kg|g|ml|l|枚)(?![a-z])/g, " ");
  text = text.replace(/[+＋]\s*7/g, " +7 ");
  text = text.replace(/猫用(?=\S)/g, "猫用 ");
  text = text.replace(/犬用(?=\S)/g, "犬用 ");
  text = text.replace(/室内で生活する/g, " ");
  const raw = text
    .split(/[\s/／・,、.の]+/)
    .map((token) => token.replace(/用$/, ""))
    .filter((token) => token.length > 1 && !stopwords.has(token) && !/^[a-z0-9-]+$/.test(token) && !/^\d+$/.test(token));
  return [...new Set(raw)].sort();
}

function singleReadings(titles: string[]): TitleReading[] | null {
  const readings: TitleReading[] = [];
  for (const title of titles) {
    const parsed = parseTitleQuantity(title);
    if (parsed.sizeConfidence !== "high" || parsed.statedQuantity == null || parsed.statedUnit == null) {
      continue;
    }
    if (parsed.packCount != null && parsed.packCount > 1) {
      continue;
    }
    const tokens = tokensOf(title);
    readings.push({
      tokens,
      stages: stagesOf(tokens),
      flavors: flavorWords.filter((flavor) => tokens.includes(flavor)),
      statedQuantity: parsed.statedQuantity,
      statedUnit: parsed.statedUnit,
    });
  }
  if (readings.length === 0) {
    return null;
  }
  const quantities = new Set(readings.map((reading) => `${reading.statedQuantity}:${reading.statedUnit}`));
  if (quantities.size !== 1) {
    return null;
  }
  return readings;
}

export function readSizeIdentity(member: SizeFamilyMember): SizeIdentity | null {
  if (member.animal === "other" || !member.brand?.trim() || !member.genreName?.trim() || !member.janCode) {
    return null;
  }
  const readings = singleReadings(member.titles);
  if (!readings) {
    return null;
  }
  const staged = readings.filter((reading) => reading.stages.length > 0);
  if (staged.length === 0) {
    return null;
  }
  const stages = new Set(staged.map((reading) => reading.stages.join("+")));
  if (stages.size !== 1) {
    return null;
  }
  let tokens = staged[0]?.tokens ?? [];
  for (const reading of staged.slice(1)) {
    tokens = tokens.filter((token) => reading.tokens.includes(token));
  }
  const stage = staged[0]?.stages.join("+") ?? "";
  const sample = readings[0];
  if (!sample || tokens.length < 2 || !stage) {
    return null;
  }
  const flavors = [...new Set(readings.flatMap((reading) => reading.flavors))].sort();
  return {
    id: member.id,
    janCode: member.janCode,
    animal: member.animal,
    brandKey: normalizeKey(member.brand),
    genreKey: normalizeKey(member.genreName),
    tokenKey: tokens.join("|"),
    stage,
    flavors,
    statedQuantity: sample.statedQuantity,
    statedUnit: sample.statedUnit,
    sizeLabel: formatQuantityLabel(sample.statedQuantity, sample.statedUnit),
  };
}

function flavorsConflict(members: SizeIdentity[]): boolean {
  const present = members.map((member) => member.flavors);
  for (let left = 0; left < present.length; left += 1) {
    for (let right = left + 1; right < present.length; right += 1) {
      const a = present[left] ?? [];
      const b = present[right] ?? [];
      if (a.length === 0 || b.length === 0) {
        continue;
      }
      if (!a.some((flavor) => b.includes(flavor))) {
        return true;
      }
    }
  }
  return false;
}

export function groupSizeFamilies(members: SizeFamilyMember[]): SizeFamily[] {
  const identities = members.flatMap((member) => {
    const identity = readSizeIdentity(member);
    return identity ? [identity] : [];
  });
  const buckets = new Map<string, SizeIdentity[]>();
  for (const identity of identities) {
    const key = [identity.animal, identity.brandKey, identity.genreKey, identity.stage, identity.tokenKey, identity.statedUnit].join("\u0000");
    const bucket = buckets.get(key) ?? [];
    bucket.push(identity);
    buckets.set(key, bucket);
  }

  const families: SizeFamily[] = [];
  for (const bucket of buckets.values()) {
    const quantities = new Set(bucket.map((identity) => identity.statedQuantity));
    if (quantities.size < 2 || quantities.size !== bucket.length || flavorsConflict(bucket)) {
      continue;
    }
    const sorted = [...bucket].sort((left, right) => left.statedQuantity - right.statedQuantity || left.janCode.localeCompare(right.janCode));
    families.push({
      label: `${sorted.map((identity) => identity.sizeLabel).join("・")}あり`,
      members: sorted,
    });
  }
  return families;
}

export function sizeFamilyHref(janCode: string, familyJans: string[]): string {
  const others = familyJans.filter((jan) => jan !== janCode);
  if (others.length === 0) {
    return `/products/jan/${janCode}`;
  }
  return `/products/jan/${janCode}?with=${others.join(",")}`;
}

type QuoteOffer = {
  price: number | null;
  shippingFee: number | null;
  stockStatus: string;
  packCount: number | null;
  listingTitle: string | null;
};

export function quoteSingleSize(input: {
  offers: QuoteOffer[];
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  quantityConfidence: string;
  unitPriceType: UnitPriceType;
}): SingleSizeQuote {
  const empty: SingleSizeQuote = {
    sellingPrice: null,
    lowestItemPrice: null,
    itemUnitYen: null,
    itemUnitExact: false,
    shippingUnitYen: null,
    shippingUnitExact: false,
    shippingTotal: null,
    sellingShippingKnown: false,
    sellingPriceWithheld: false,
    unitLabel: null,
  };
  const singles = input.offers.filter(
    (offer) =>
      offer.stockStatus === "in_stock" &&
      offer.price != null &&
      (offer.packCount == null || offer.packCount === 1) &&
      !hasUnresolvedPackNotation(offer.listingTitle ?? ""),
  );
  const knownShipping = singles.filter((offer) => offer.shippingFee != null);
  const lowestItemPrice = singles.reduce<number | null>((lowest, offer) => {
    if (offer.price == null) {
      return lowest;
    }
    return lowest == null || offer.price < lowest ? offer.price : lowest;
  }, null);
  if (knownShipping.length === 0) {
    return { ...empty, lowestItemPrice, sellingPriceWithheld: singles.length > 0 };
  }
  const selling = knownShipping.reduce((best, offer) => {
    const total = (offer.price ?? 0) + (offer.shippingFee ?? 0);
    const bestTotal = (best.price ?? 0) + (best.shippingFee ?? 0);
    return total < bestTotal ? offer : best;
  });
  const confirmed = input.quantityConfidence === "high" && input.quantity != null && input.unitPriceType !== "none";
  const item = confirmed
    ? calculateUnitPrices({
        price: selling.price,
        shipping: null,
        quantity: input.quantity,
        quantityUnit: input.quantityUnit,
        unitPriceType: input.unitPriceType,
      })
    : null;
  const shipping = lowestShippingTotal(knownShipping.map((offer) => ({ price: offer.price, shipping: offer.shippingFee })));
  const shippingQuote =
    confirmed && shipping
      ? calculateUnitPrices({
          price: shipping.price,
          shipping: shipping.shipping,
          quantity: input.quantity,
          quantityUnit: input.quantityUnit,
          unitPriceType: input.unitPriceType,
        })
      : null;
  return {
    sellingPrice: selling.price,
    lowestItemPrice,
    itemUnitYen: item?.itemUnit?.yen ?? null,
    itemUnitExact: item?.itemUnit?.exact ?? false,
    shippingUnitYen: shippingQuote?.effectiveUnit?.yen ?? null,
    shippingUnitExact: shippingQuote?.effectiveUnit?.exact ?? false,
    shippingTotal: shipping?.total ?? null,
    sellingShippingKnown: true,
    sellingPriceWithheld: false,
    unitLabel: item?.unitLabel ?? shippingQuote?.unitLabel ?? null,
  };
}

export function bestItemUnitIds(rows: Array<{ id: string; itemUnitYen: number | null }>): string[] {
  if (rows.length < 2 || rows.some((row) => row.itemUnitYen == null)) {
    return [];
  }
  const lowest = Math.min(...rows.map((row) => row.itemUnitYen ?? Number.POSITIVE_INFINITY));
  return rows.filter((row) => row.itemUnitYen === lowest).map((row) => row.id);
}
