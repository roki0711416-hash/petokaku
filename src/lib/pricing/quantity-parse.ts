import { detectPackCount } from "./pack-count.ts";
import type { QuantityUnit, UnitPriceType } from "./calculate.ts";
import type { PackUnit, QuantityConfidence, QuantitySource } from "../types.ts";

// 単価に使ってよいのは high だけ。
// high: 明確な容量表記で誤認要素がなく、同じ内容量が複数ショップの商品名で一致している。
// medium: 1ショップの商品名だけが容量らしい。表示も単価も確定しない。
// unknown: 曖昧、矛盾、判定できない。使わない。
// 情報源の優先順位: api > master > shop_titles > shop_title。上位の high が商品名の解析を置き換える。

export const unknownQuantityLabel = "容量情報なし";

const sourceRank: Record<QuantitySource, number> = {
  api: 1,
  master: 2,
  shop_titles: 3,
  shop_title: 4,
  sample: 5,
};

export type TitleQuantityReading = {
  statedQuantity: number | null;
  statedUnit: QuantityUnit | null;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
  packCount: number | null;
  packUnit: PackUnit | null;
  sizeConfidence: "high" | "unknown";
  packConfidence: "high" | "unknown";
};

export type AgreedQuantity = {
  statedQuantity: number | null;
  statedUnit: QuantityUnit | null;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
  sizeLabel: string;
  confidence: QuantityConfidence;
  source: QuantitySource | null;
};

type ParsedAmount = {
  start: number;
  end: number;
  statedQuantity: number;
  statedUnit: QuantityUnit;
  quantity: number;
  quantityUnit: QuantityUnit;
  unitPriceType: UnitPriceType;
};

export function canUseForUnitPrice(confidence: QuantityConfidence): boolean {
  return confidence === "high";
}

export function formatQuantityLabel(amount: number, unit: QuantityUnit): string {
  const text = Number.isInteger(amount) ? String(amount) : String(amount);
  if (unit === "l") {
    return `${text}L`;
  }
  if (unit === "sheet") {
    return `${text}枚`;
  }
  if (unit === "piece") {
    return `${text}本`;
  }
  return `${text}${unit}`;
}

// packCount が null のときは総内容量を作らない。
// 販売個数があるときだけ、1単位 × 個数を返す。
export function totalQuantityOf(unitQuantity: number | null, packCount: number | null): number | null {
  if (unitQuantity == null || packCount == null) {
    return null;
  }
  if (!Number.isInteger(packCount) || packCount < 1 || packCount > 99) {
    return null;
  }
  const total = unitQuantity * packCount;
  if (!Number.isSafeInteger(total) || total <= 0 || total > 1_000_000) {
    return null;
  }
  return total;
}

// 販売個数が不明な掲載は、1単位あたりの参考単価にだけ使う。
// 販売個数が分かる掲載は、セット全体の総内容量で参考単価を出す。
export function unitPriceQuantity(
  unitQuantity: number | null,
  packCount: number | null,
  totalQuantity: number | null,
): number | null {
  if (unitQuantity == null) {
    return null;
  }
  if (packCount == null) {
    return unitQuantity;
  }
  if (totalQuantity == null || totalQuantity <= 0) {
    return null;
  }
  return totalQuantity;
}

function emptyAgreed(): AgreedQuantity {
  return {
    statedQuantity: null,
    statedUnit: null,
    quantity: null,
    quantityUnit: null,
    unitPriceType: "none",
    sizeLabel: unknownQuantityLabel,
    confidence: "unknown",
    source: null,
  };
}

function normalizeTitle(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[×✕✖]/g, "x")
    .replace(/ミリリットル/g, "ml")
    .replace(/リットル/g, "l")
    .replace(/キログラム/g, "kg")
    .replace(/グラム/g, "g")
    .replace(/\s+/g, " ")
    .trim();
}

function withoutParentheticals(title: string): string {
  return title.replace(/\([^)]*\)/g, " ");
}

const compositionPattern = /(?<!\d)\d+(?:\.\d+)?(?!\d)\s*(?:kg|g|ml|l|枚)\s*\(\s*(?<!\d)\d+(?:\.\d+)?(?!\d)\s*(?:kg|g|ml|l|枚)\s*x\s*\d{1,3}(?!\d)\s*(?:袋|個|本|パック)(?:入り)?\s*\)/g;

function salesPack(
  title: string,
  mode: "keep-groups" | "drop-groups",
): { packCount: number | null; packUnit: PackUnit | null; packConfidence: "high" | "unknown" } {
  const stripped = mode === "drop-groups" ? withoutParentheticals(title) : title.replace(compositionPattern, " ");
  const detected = detectPackCount(stripped);
  if (detected.packCount == null) {
    return { packCount: null, packUnit: null, packConfidence: "unknown" };
  }
  const hasMeasuredContent = /(?<!\d)\d+(?:\.\d+)?(?!\d)\s*(?:kg|g|ml|l|枚)(?![a-wyz])/.test(stripped);
  const plainPiece = /(?<!\d)\d{1,3}(?!\d)\s*本(?!セット)/.test(stripped);
  const pieceIsSet = /本セット|x\s*\d{1,3}\s*本/.test(stripped);
  if (!hasMeasuredContent && plainPiece && !pieceIsSet && detected.packUnit === "本") {
    return { packCount: null, packUnit: null, packConfidence: "unknown" };
  }
  return { packCount: detected.packCount, packUnit: detected.packUnit, packConfidence: "high" };
}

function isRejectedAmount(text: string, start: number, end: number): boolean {
  const before = text.slice(Math.max(0, start - 12), start);
  const after = text.slice(end, end + 6);
  if (/体重\s*$/.test(before)) {
    return true;
  }
  if (/(?:約|およそ)\s*$/.test(before)) {
    return true;
  }
  if (/^\s*まで/.test(after)) {
    return true;
  }
  if (/^\s*(?:増量|おまけ)/.test(after)) {
    return true;
  }
  return false;
}

function toBase(amount: number, unit: string): Omit<ParsedAmount, "start" | "end"> | null {
  let statedUnit: QuantityUnit;
  let quantity = amount;
  let quantityUnit: QuantityUnit;
  let unitPriceType: UnitPriceType;
  if (unit === "kg") {
    statedUnit = "kg";
    quantity = amount * 1000;
    quantityUnit = "g";
    unitPriceType = "per_100g";
  } else if (unit === "g") {
    statedUnit = "g";
    quantityUnit = "g";
    unitPriceType = "per_100g";
  } else if (unit === "l") {
    statedUnit = "l";
    quantity = amount * 1000;
    quantityUnit = "ml";
    unitPriceType = "per_l";
  } else if (unit === "ml") {
    statedUnit = "ml";
    quantityUnit = "ml";
    unitPriceType = "per_l";
  } else if (unit === "枚") {
    statedUnit = "sheet";
    quantityUnit = "sheet";
    unitPriceType = "per_sheet";
  } else if (unit === "本") {
    statedUnit = "piece";
    quantityUnit = "piece";
    unitPriceType = "per_piece";
  } else {
    return null;
  }
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1_000_000) {
    return null;
  }
  const rounded = Math.round(quantity);
  if (Math.abs(quantity - rounded) > 0.001 || rounded <= 0) {
    return null;
  }
  return {
    statedQuantity: amount,
    statedUnit,
    quantity: rounded,
    quantityUnit,
    unitPriceType,
  };
}

function hasUnsummedPlus(text: string): boolean {
  return /(?<!\d)\d+(?:\.\d+)?(?!\d)\s*(?:kg|g|ml|l)\s*\+\s*(?<!\d)\d+(?:\.\d+)?(?!\d)\s*(?:kg|g|ml|l)/.test(text);
}

function parentheticalAmounts(text: string): {
  inconsistent: boolean;
  amounts: ParsedAmount[];
  spans: Array<{ start: number; end: number }>;
  packCount: number | null;
  packUnit: PackUnit | null;
} {
  const empty = { inconsistent: false, amounts: [] as ParsedAmount[], spans: [] as Array<{ start: number; end: number }>, packCount: null, packUnit: null };
  const pattern = /(?<!\d)(\d+(?:\.\d+)?)(?!\d)\s*(kg|g|ml|l|枚)\s*\(\s*(?<!\d)(\d+(?:\.\d+)?)(?!\d)\s*(kg|g|ml|l|枚)\s*x\s*(\d{1,3})(?!\d)\s*(袋|個|本|パック)(?:入り)?\s*\)/g;
  const amounts: ParsedAmount[] = [];
  const spans: Array<{ start: number; end: number }> = [];
  const packs: Array<{ count: number; unit: PackUnit }> = [];
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    spans.push({ start, end });
    const outer = toBase(Number(match[1]), match[2] ?? "");
    const inner = toBase(Number(match[3]), match[4] ?? "");
    const count = Number(match[5]);
    const packUnit = match[6];
    if (!outer || !inner || !Number.isInteger(count) || count < 1 || !isCompositionUnit(packUnit)) {
      return { inconsistent: true, amounts: [], spans, packCount: null, packUnit: null };
    }
    if (outer.quantityUnit !== inner.quantityUnit || outer.quantity !== inner.quantity * count) {
      return { inconsistent: true, amounts: [], spans, packCount: null, packUnit: null };
    }
    amounts.push({ ...inner, start, end });
    packs.push({ count, unit: packUnit });
  }
  const counts = new Set(packs.map((pack) => pack.count));
  const units = new Set(packs.map((pack) => pack.unit));
  if (counts.size > 1 || units.size > 1) {
    return { inconsistent: true, amounts: [], spans, packCount: null, packUnit: null };
  }
  if (amounts.length === 0) {
    return empty;
  }
  return {
    inconsistent: false,
    amounts,
    spans,
    packCount: packs[0]?.count ?? null,
    packUnit: packs[0]?.unit ?? null,
  };
}

function isCompositionUnit(value: string | undefined): value is PackUnit {
  return value === "袋" || value === "個" || value === "本" || value === "パック";
}

function overlaps(spans: Array<{ start: number; end: number }>, start: number, end: number): boolean {
  return spans.some((span) => start < span.end && end > span.start);
}

function measuredAmounts(text: string, spans: Array<{ start: number; end: number }>): ParsedAmount[] {
  const pattern = /(?<!\d)(\d+(?:\.\d+)?)(?!\d)\s*(kg|g|ml|l|枚)(?![a-wyz])/g;
  const amounts: ParsedAmount[] = [];
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (overlaps(spans, start, end) || isRejectedAmount(text, start, end)) {
      continue;
    }
    const parsed = toBase(Number(match[1]), match[2] ?? "");
    if (parsed) {
      amounts.push({ ...parsed, start, end });
    }
  }
  return amounts;
}

function plainPieceAmount(text: string): ParsedAmount | null {
  if (/(?<!\d)\d+(?:\.\d+)?(?!\d)\s*(?:kg|g|ml|l|枚)(?![a-wyz])/.test(text)) {
    return null;
  }
  if (/本セット|x\s*\d{1,3}\s*本/.test(text)) {
    return null;
  }
  const match = text.match(/(?<!\d)(\d{1,3})(?!\d)\s*本(?!セット)/);
  if (!match || match.index == null) {
    return null;
  }
  const start = match.index;
  const end = start + match[0].length;
  if (isRejectedAmount(text, start, end)) {
    return null;
  }
  const parsed = toBase(Number(match[1]), "本");
  if (!parsed) {
    return null;
  }
  return { ...parsed, start, end };
}

function sameAmount(left: ParsedAmount, right: ParsedAmount): boolean {
  return left.quantity === right.quantity && left.quantityUnit === right.quantityUnit;
}

function mergePack(
  detected: { packCount: number | null; packUnit: PackUnit | null; packConfidence: "high" | "unknown" },
  composition: { packCount: number; packUnit: PackUnit | null } | null,
): { packCount: number | null; packUnit: PackUnit | null; packConfidence: "high" | "unknown" } {
  if (!composition) {
    return detected;
  }
  if (detected.packCount == null) {
    return { packCount: composition.packCount, packUnit: composition.packUnit, packConfidence: "high" };
  }
  if (detected.packCount === composition.packCount) {
    return { packCount: composition.packCount, packUnit: composition.packUnit ?? detected.packUnit, packConfidence: "high" };
  }
  return { packCount: null, packUnit: null, packConfidence: "unknown" };
}

function readingFrom(
  amount: ParsedAmount | null,
  title: string,
  sizeConfidence: "high" | "unknown",
  compositionPack: { packCount: number; packUnit: PackUnit | null } | null = null,
): TitleQuantityReading {
  const pack = mergePack(salesPack(title, sizeConfidence === "high" ? "keep-groups" : "drop-groups"), sizeConfidence === "high" ? compositionPack : null);
  if (compositionPack && pack.packCount == null) {
    return {
      statedQuantity: null,
      statedUnit: null,
      quantity: null,
      quantityUnit: null,
      unitPriceType: "none",
      packCount: null,
      packUnit: null,
      sizeConfidence: "unknown",
      packConfidence: "unknown",
    };
  }
  if (!amount || sizeConfidence === "unknown") {
    return {
      statedQuantity: null,
      statedUnit: null,
      quantity: null,
      quantityUnit: null,
      unitPriceType: "none",
      packCount: pack.packCount,
      packUnit: pack.packUnit,
      sizeConfidence: "unknown",
      packConfidence: pack.packConfidence,
    };
  }
  return {
    statedQuantity: amount.statedQuantity,
    statedUnit: amount.statedUnit,
    quantity: amount.quantity,
    quantityUnit: amount.quantityUnit,
    unitPriceType: amount.unitPriceType,
    packCount: pack.packCount,
    packUnit: pack.packUnit,
    sizeConfidence: "high",
    packConfidence: pack.packConfidence,
  };
}

export function parseTitleQuantity(title: string): TitleQuantityReading {
  const text = normalizeTitle(title);
  const packOnly = () => readingFrom(null, text, "unknown");
  if (!text || hasUnsummedPlus(text)) {
    return packOnly();
  }
  const parenthetical = parentheticalAmounts(text);
  if (parenthetical.inconsistent) {
    return packOnly();
  }
  const measured = measuredAmounts(text, parenthetical.spans);
  const piece = measured.length === 0 && parenthetical.amounts.length === 0 ? plainPieceAmount(text) : null;
  const amounts = [...parenthetical.amounts, ...measured, ...(piece ? [piece] : [])];
  const unique = amounts.filter((amount, index) => amounts.findIndex((other) => sameAmount(amount, other)) === index);
  if (unique.length !== 1) {
    return packOnly();
  }
  const compositionPack =
    parenthetical.packCount != null
      ? { packCount: parenthetical.packCount, packUnit: parenthetical.packUnit }
      : null;
  return readingFrom(unique[0] ?? null, text, "high", compositionPack);
}

function preferredDisplay(readings: TitleQuantityReading[]): { statedQuantity: number; statedUnit: QuantityUnit } | null {
  const kilogram = readings.find((reading) => reading.statedUnit === "kg" && reading.statedQuantity != null);
  if (kilogram?.statedQuantity != null && kilogram.statedUnit) {
    return { statedQuantity: kilogram.statedQuantity, statedUnit: kilogram.statedUnit };
  }
  const liter = readings.find((reading) => reading.statedUnit === "l" && reading.statedQuantity != null);
  if (liter?.statedQuantity != null && liter.statedUnit) {
    return { statedQuantity: liter.statedQuantity, statedUnit: liter.statedUnit };
  }
  const first = readings[0];
  if (first?.statedQuantity == null || first.statedUnit == null) {
    return null;
  }
  return { statedQuantity: first.statedQuantity, statedUnit: first.statedUnit };
}

export function agreeShopQuantities(readings: TitleQuantityReading[]): AgreedQuantity {
  const clear = readings.filter(
    (reading) => reading.sizeConfidence === "high" && reading.quantity != null && reading.quantityUnit != null,
  );
  const keys = new Set(clear.map((reading) => `${reading.quantity}:${reading.quantityUnit}`));
  if (keys.size !== 1) {
    return emptyAgreed();
  }
  const display = preferredDisplay(clear);
  const sample = clear[0];
  if (!display || !sample) {
    return emptyAgreed();
  }
  if (clear.length === 1) {
    return {
      statedQuantity: display.statedQuantity,
      statedUnit: display.statedUnit,
      quantity: null,
      quantityUnit: null,
      unitPriceType: "none",
      sizeLabel: unknownQuantityLabel,
      confidence: "medium",
      source: "shop_title",
    };
  }
  return {
    statedQuantity: display.statedQuantity,
    statedUnit: display.statedUnit,
    quantity: sample.quantity,
    quantityUnit: sample.quantityUnit,
    unitPriceType: sample.unitPriceType,
    sizeLabel: formatQuantityLabel(display.statedQuantity, display.statedUnit),
    confidence: "high",
    source: "shop_titles",
  };
}

export function selectPreferredQuantity(candidates: AgreedQuantity[]): AgreedQuantity {
  const ranked = candidates
    .filter((item) => item.source != null && item.confidence !== "unknown")
    .sort((left, right) => sourceRank[left.source ?? "sample"] - sourceRank[right.source ?? "sample"]);
  const confirmed = ranked.find((item) => item.confidence === "high" && canUseForUnitPrice(item.confidence));
  if (confirmed) {
    return confirmed;
  }
  const tentative = ranked.find((item) => item.confidence === "medium");
  if (tentative) {
    return tentative;
  }
  return emptyAgreed();
}
