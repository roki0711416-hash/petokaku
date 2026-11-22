import { unknownQuantityLabel } from "../pricing/quantity-parse.ts";
import { readableListingTitle } from "../sources/yahoo/listing-title.ts";
import type { QuantityConfidence } from "../types.ts";

// 商品ページの表示名・title・H1・JSON-LD は、この関数の結果だけを使う。
// ブランド + 商品 + 確認できた容量。賞味期限、店舗の定型句、キーワードの盛り込み、
// 食い違う数量、省略記号は入れない。

export type ComparisonNameInput = {
  name: string;
  brand?: string;
  sizeLabel?: string | null;
  quantityConfidence?: QuantityConfidence | null;
};

const brandCatalog: ReadonlyArray<{ label: string; keys: readonly string[] }> = [
  { label: "アイリスオーヤマ", keys: ["アイリスオーヤマ", "アイリス", "irisohyama"] },
  { label: "ライオン", keys: ["ライオンペット", "ライオン", "lion"] },
  { label: "ユニ・チャーム", keys: ["ユニ・チャーム", "ユニチャーム", "unicharm"] },
  { label: "ロイヤルカナン", keys: ["ロイヤルカナン", "royalcanin"] },
  { label: "ニュートロ", keys: ["ニュートロ", "nutro"] },
  { label: "ネクトン", keys: ["ネクトン", "nekton"] },
];

const sizeGrades = ["ダブルワイド", "スーパーワイド", "エクストラワイド", "レギュラー", "ワイド"];

const stuffing = new Set([
  "ペット",
  "鳥",
  "インコ",
  "文鳥",
  "オカメ",
  "トイレ",
  "シート",
  "ペットシート",
  "脱臭",
  "消臭",
  "抗菌",
  "業務用",
  "厚手",
  "大容量",
  "まとめ買い",
  "多頭飼い",
  "固まる",
  "流せる",
  "燃やせる",
  "ペレット",
  "紙ペレット",
  "燃えるゴミ",
  "再生パルプ",
  "飛び散り防止",
  "国産",
  "ごはん",
  "ご飯",
  "ドッグフード",
  "キャットフード",
  "ドライフード",
  "サプリ",
  "サプリメント",
  "ビタミン",
  "ビタミン剤",
  "栄養剤",
  "総合栄養剤",
  "ジャンボパック",
  "猫トイレ",
  "公認店",
  "セール",
  "ケース販売",
  "日本語取説付",
]);

const keptWhenAlone = new Set(["犬", "猫", "鳥"]);

function keyOf(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function verifiedSize(input: ComparisonNameInput): string | null {
  if (input.quantityConfidence !== "high") {
    return null;
  }
  const label = input.sizeLabel?.trim() ?? "";
  if (label === "" || label === unknownQuantityLabel) {
    return null;
  }
  const size = contentSize(label);
  return size ?? label;
}

function contentSize(token: string): string | null {
  const match = token.match(/^(\d+(?:\.\d+)?)(kg|g|ml|l|枚)$/i);
  if (!match) {
    return null;
  }
  const unit = match[2] ?? "";
  const normalizedUnit = unit.toLowerCase() === "l" ? "L" : unit.toLowerCase();
  return `${Number(match[1])}${normalizedUnit}`;
}

function packSize(token: string): string | null {
  const match = token.match(/^(\d+)(袋|個|本|箱|缶|パック)$/);
  if (!match) {
    return null;
  }
  return `${Number(match[1])}${match[2]}`;
}

function gradeOf(token: string): string | null {
  return sizeGrades.find((grade) => token === grade) ?? null;
}

function stripWrappedNotes(text: string): string {
  return text
    .replace(/【[^】]*】/g, " ")
    .replace(/\[[^\]]{0,24}\]/g, " ")
    .replace(/[（(][^）)]*(?:セール|イチオシ|正規品|ケース販売|送料|公認店|保護犬|袋|箱|個|パック|本)[^）)]*[）)]/g, " ");
}

function stripExpiry(text: string): string {
  return text.replace(
    /(?:賞味|消費|使用)?期限\s*[:：]?\s*20\d{2}\s*(?:[./\-年]\s*)?\d{1,2}\s*(?:[./\-月]\s*)?\d{1,2}\s*日?/g,
    " ",
  );
}

function stripBoilerplate(text: string): string {
  return text
    .replace(/日本語(?:取扱)?(?:説明書|取説)(?:付き|付|あり)?/g, " ")
    .replace(/取扱説明書(?:付き|付)?/g, " ")
    .replace(/説明書(?:付き|付)/g, " ")
    .replace(/※[^。\s]{0,40}/g, " ")
    .replace(/全国送料無料|送料無料|送料込/g, " ")
    .replace(/ケース販売/g, " ")
    .replace(/(?:^|\s)(?:公認店|セール|再入荷|当日便)(?=\s|$)/g, " ");
}

function prepareTitle(name: string): string {
  const normalized = name.normalize("NFKC").replace(/[…‥]|\.{3}|．{3}/g, " ");
  const stripped = stripBoilerplate(stripExpiry(stripWrappedNotes(normalized)));
  return readableListingTitle(stripExpiry(stripped)).replace(/[…‥]/g, " ").replace(/\s+/g, " ").trim();
}

function looseToken(token: string): string {
  return token.replace(/^(\d+(?:\.\d+)?(?:kg|g|ml|l|枚|袋|個|本|箱|缶|パック))入り?$/i, "$1");
}

function splitQuantityToken(token: string): string[] {
  const packed = token.match(/^(\d+(?:\.\d+)?(?:kg|g|ml|l|枚))\s*[×x]\s*\d+\s*(?:袋|個|本|箱|缶|パック)(?:セット|入り)?$/i);
  if (packed?.[1]) {
    return [packed[1]];
  }
  return [token];
}

function isModelCode(token: string): boolean {
  return /^[A-Za-z]{1,8}[-－]?\d{2,}[A-Za-z0-9-]*$/.test(token);
}

function isLongAscii(token: string): boolean {
  return /^[A-Za-z][A-Za-z-]{3,}$/.test(token);
}

function isJapanese(token: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(token);
}

function brandMatch(token: string, entry: { keys: readonly string[] }): boolean {
  return entry.keys.includes(keyOf(token));
}

function resolveBrand(
  brandField: string,
  tokens: string[],
): { display: string; hide: (token: string) => boolean } | null {
  const field = brandField.trim();
  const fromToken = brandCatalog.find((entry) => tokens.some((token) => brandMatch(token, entry)));
  const fromField = field ? brandCatalog.find((entry) => brandMatch(field, entry)) : undefined;
  const entry = fromToken ?? fromField;
  if (entry) {
    const present = tokens.filter((token) => brandMatch(token, entry));
    const japanese = present.filter(isJapanese).sort((left, right) => right.length - left.length)[0];
    return {
      display: japanese ?? entry.label,
      hide: (token) => brandMatch(token, entry),
    };
  }
  if (field === "") {
    return null;
  }
  const present = tokens.find((token) => token === field);
  if (present) {
    return { display: present, hide: (token) => token === field };
  }
  return { display: field, hide: () => false };
}

function dropConflictingSizes(tokens: string[], verified: string | null): string[] {
  const verifiedKey = verified ? contentSize(verified) : null;
  const content = tokens.flatMap((token) => {
    const size = contentSize(token);
    return size ? [size] : [];
  });
  const distinctContent = new Set(content);
  const packs = tokens.flatMap((token) => {
    const pack = packSize(token);
    return pack ? [pack] : [];
  });
  const distinctPacks = new Set(packs);
  const grades = new Set(tokens.flatMap((token) => {
    const grade = gradeOf(token);
    return grade ? [grade] : [];
  }));
  const gradesConflict = grades.size > 1;
  return tokens.filter((token) => {
    const size = contentSize(token);
    if (size) {
      if (verifiedKey) {
        return size === verifiedKey;
      }
      return distinctContent.size < 2;
    }
    const pack = packSize(token);
    if (pack) {
      if (verifiedKey) {
        return false;
      }
      return distinctPacks.size < 2;
    }
    if (gradesConflict && gradeOf(token)) {
      return false;
    }
    return true;
  });
}

function peelStuffing(token: string): string {
  if (brandCatalog.some((entry) => brandMatch(token, entry))) {
    return token;
  }
  const words = [...stuffing].sort((left, right) => right.length - left.length);
  for (const word of words) {
    if (token.endsWith(word) && token.length > word.length + 1) {
      return token.slice(0, -word.length);
    }
  }
  return token;
}

function redundantTokens(tokens: string[]): Set<string> {
  const present = new Set(tokens);
  const drop = new Set<string>();
  for (const token of tokens) {
    if (token.includes("の")) {
      for (const other of tokens) {
        if (other !== token && other.length >= 1 && token.includes(other)) {
          drop.add(other);
        }
      }
    }
    for (const other of tokens) {
      if (token === other || other.length < 2 || !token.startsWith(other)) {
        continue;
      }
      const rest = token.slice(other.length);
      if (rest !== "" && present.has(rest)) {
        drop.add(token);
      }
      if (token.endsWith("用") || token.endsWith("向け")) {
        drop.add(other);
      }
    }
  }
  return drop;
}

function dropStuffing(tokens: string[]): string[] {
  const peeled = dedupe(tokens.map(peelStuffing).filter((token) => token !== ""));
  const redundant = redundantTokens(peeled);
  const withoutRedundant = peeled.filter((token) => !redundant.has(token));
  const core = withoutRedundant.filter((token) => {
    if (stuffing.has(token) || contentSize(token) || packSize(token) || gradeOf(token) || isLongAscii(token)) {
      return false;
    }
    return isJapanese(token) && token.length >= 2;
  });
  return withoutRedundant.filter((token) => {
    if (isLongAscii(token) || isModelCode(token) || /^\d{1,4}$/.test(token)) {
      return false;
    }
    if (token.length < 2 && !/^[A-Za-z]$/.test(token)) {
      const absorbed = withoutRedundant.some((other) => other !== token && other.includes(token));
      if (absorbed) {
        return false;
      }
    }
    if (!stuffing.has(token)) {
      return true;
    }
    return core.length === 0 && keptWhenAlone.has(token);
  });
}

function dedupe(tokens: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const token of tokens) {
    const key = keyOf(token);
    if (key === "" || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(token);
  }
  return result;
}

export function comparisonProductName(input: ComparisonNameInput): string {
  const verified = verifiedSize(input);
  const prepared = prepareTitle(input.name);
  const tokens = dedupe(
    prepared
      .split(" ")
      .flatMap(splitQuantityToken)
      .map(looseToken)
      .filter((token) => token !== "" && !isModelCode(token)),
  );
  const sized = dropConflictingSizes(tokens, verified);
  const cleaned = dropStuffing(sized);
  const brand = resolveBrand(input.brand ?? "", cleaned);
  const body = cleaned.filter((token) => (brand ? !brand.hide(token) : true));
  const parts = [...(brand ? [brand.display] : []), ...body];
  if (verified && !parts.some((token) => contentSize(looseToken(token)) === contentSize(verified))) {
    parts.push(verified);
  }
  const name = parts.join(" ").replace(/\s+/g, " ").trim();
  return name || prepared || input.name.normalize("NFKC").trim() || "商品";
}

export function brandMentioned(text: string, brand: string): boolean {
  const field = brand.trim();
  if (field === "") {
    return true;
  }
  if (text.includes(field)) {
    return true;
  }
  const entry = brandCatalog.find((item) => brandMatch(field, item) || item.keys.some((key) => text.toLowerCase().includes(key)));
  if (!entry) {
    return false;
  }
  return entry.keys.some((key) => keyOf(text).includes(key)) || text.includes(entry.label);
}
