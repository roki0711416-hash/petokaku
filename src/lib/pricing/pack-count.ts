import type { PackUnit } from "@/lib/types";

const packUnitList = ["袋", "個", "本", "パック"];

export type PackDetection = {
  packCount: number | null;
  packUnit: PackUnit | null;
};

type PackHit = {
  count: number;
  unit: PackUnit | null;
};

function isPackUnit(value: string): value is PackUnit {
  return packUnitList.includes(value);
}

function normalizeTitle(title: string): string {
  return title.normalize("NFKC").replace(/[×✕✖]/g, "x").replace(/\s+/g, " ");
}

function withoutPurchaseLimits(title: string): string {
  return title
    .replace(/お一人様\s*\d+\s*(?:個|袋|本|パック|点)(?:まで|限り)?/g, " ")
    .replace(/\d+\s*(?:個|袋|本|パック|点)\s*(?:まで|限り)/g, " ");
}

function unitHits(title: string): PackHit[] {
  const hits: PackHit[] = [];
  const patterns = [
    /(?<!\d)(\d{1,2})(?!\d)\s*(袋|個|本|パック)\s*セット/g,
    /(?<!\d)(\d{1,2})(?!\d)\s*(袋|個|本|パック)(?!\s*セット)/g,
  ];
  for (const pattern of patterns) {
    for (const match of title.matchAll(pattern)) {
      const unit = match[2];
      const count = Number(match[1]);
      if (unit && isPackUnit(unit) && count >= 1) {
        hits.push({ count, unit });
      }
    }
  }
  return hits;
}

function multiplierHits(title: string): PackHit[] {
  const hits: PackHit[] = [];
  const pattern = /x\s*(\d{1,2})(?!\d)\s*(袋|個|本|パック)?/gi;
  for (const match of title.matchAll(pattern)) {
    const unitText = match[2];
    const unit = unitText && isPackUnit(unitText) ? unitText : null;
    const after = title.slice((match.index ?? 0) + match[0].length).trimStart();
    if (!unit && /^(?:cm|mm|kg|g|ml|l|歳|ヶ月|ヵ月|か月)/i.test(after)) {
      continue;
    }
    const count = Number(match[1]);
    if (count >= 1) {
      hits.push({ count, unit });
    }
  }
  return hits;
}

export function hasUnresolvedPackNotation(title: string): boolean {
  if (detectPackCount(title).packCount != null) {
    return false;
  }
  const normalized = withoutPurchaseLimits(normalizeTitle(title));
  return unitHits(normalized).length > 0 || multiplierHits(normalized).length > 0;
}

export function detectPackCount(title: string): PackDetection {
  const normalized = withoutPurchaseLimits(normalizeTitle(title));
  const hits = [...unitHits(normalized), ...multiplierHits(normalized)];
  const counts = [...new Set(hits.map((hit) => hit.count))];
  if (counts.length !== 1) {
    return { packCount: null, packUnit: null };
  }
  const count = counts[0];
  if (count == null || count < 1 || count > 99) {
    return { packCount: null, packUnit: null };
  }
  const units = [...new Set(hits.map((hit) => hit.unit).filter((unit): unit is PackUnit => unit != null))];
  return {
    packCount: count,
    packUnit: units.length === 1 ? units[0] : null,
  };
}

export function salesUnitLabel(packCount: number | null, packUnit: PackUnit | null): string {
  if (packCount == null) {
    return "販売単位はショップで確認";
  }
  if (packCount === 1) {
    return packUnit ? `1${packUnit}` : "1個販売";
  }
  if (packUnit) {
    return `${packCount}${packUnit}セット`;
  }
  return `${packCount}セット`;
}

export function salesUnitGroupHeading(packCount: number | null, units: Array<PackUnit | null>): string {
  if (packCount == null) {
    return "セット表記のない販売";
  }
  const unique = [...new Set(units.filter((unit): unit is PackUnit => unit != null))];
  if (packCount === 1) {
    return unique.length === 1 ? `1${unique[0]}の販売` : "1個販売";
  }
  if (unique.length === 1) {
    return `${packCount}${unique[0]}セット`;
  }
  return `${packCount}セット`;
}

export function salesUnitGroupNote(packCount: number | null): string {
  if (packCount == null) {
    return "セットと分かる表記がない掲載です。1袋とは断定していません。販売単位は各ショップで確認してください。";
  }
  if (packCount === 1) {
    return "1個販売とタイトルから分かる掲載だけを比べています。";
  }
  return `${packCount}セット同士だけを比べています。セット表記のない販売の価格とは別の最安です。`;
}

export function salesUnitSort(packCount: number | null): number {
  if (packCount === 1) {
    return 0;
  }
  if (packCount == null) {
    return 1;
  }
  return 10 + packCount;
}
