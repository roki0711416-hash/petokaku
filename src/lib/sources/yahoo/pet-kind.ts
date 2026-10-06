export const petKinds = ["dog", "cat", "small-animal", "bird", "fish", "other"] as const;

export type PetKind = (typeof petKinds)[number];

export type PetKindSource = "genre" | "catalog" | "title" | "unknown";

export type PetKindResult = {
  kind: PetKind;
  source: PetKindSource;
};

const genreRules: Array<{ kind: Exclude<PetKind, "other">; pattern: RegExp }> = [
  { kind: "dog", pattern: /犬|ドッグ/ },
  { kind: "cat", pattern: /猫|キャット|ネコ/ },
  { kind: "small-animal", pattern: /小動物|うさぎ|ウサギ|ハムスター/ },
  { kind: "bird", pattern: /鳥|バード/ },
  { kind: "fish", pattern: /魚|水槽|アクアリウム/ },
];

const titleRules: Array<{ kind: Exclude<PetKind, "other">; pattern: RegExp }> = [
  { kind: "dog", pattern: /犬用|成犬|子犬|幼犬|ドッグフード|ドッグ/ },
  { kind: "cat", pattern: /猫用|成猫|子猫|幼猫|キャットフード|キャット|猫砂|ネコ砂/ },
  { kind: "small-animal", pattern: /小動物|うさぎ用|ウサギ用|ハムスター用/ },
  { kind: "bird", pattern: /鳥用|バードフード/ },
  { kind: "fish", pattern: /魚用|観賞魚|水槽用/ },
];

function matchedKinds(text: string, rules: Array<{ kind: Exclude<PetKind, "other">; pattern: RegExp }>): Set<Exclude<PetKind, "other">> {
  const found = new Set<Exclude<PetKind, "other">>();
  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      found.add(rule.kind);
    }
  }
  return found;
}

function singleKind(found: Set<Exclude<PetKind, "other">>): Exclude<PetKind, "other"> | "none" | "conflict" {
  if (found.size === 0) {
    return "none";
  }
  if (found.size === 1) {
    return [...found][0] ?? "none";
  }
  return "conflict";
}

export function classifyPetKind(input: { genreNames: string[]; brandName: string | null; title: string }): PetKindResult {
  const genres = input.genreNames.map((name) => name.normalize("NFKC").trim()).filter((name) => name !== "");
  const genreKind = singleKind(matchedKinds(genres.join(" "), genreRules));
  if (genreKind === "conflict") {
    return { kind: "other", source: "unknown" };
  }
  if (genreKind !== "none") {
    return { kind: genreKind, source: "genre" };
  }

  const brand = input.brandName?.normalize("NFKC") ?? "";
  if (/フィーライン|フェライン/.test(brand)) {
    return { kind: "cat", source: "catalog" };
  }

  const titleKind = singleKind(matchedKinds(input.title.normalize("NFKC"), titleRules));
  if (titleKind !== "none" && titleKind !== "conflict") {
    return { kind: titleKind, source: "title" };
  }
  return { kind: "other", source: "unknown" };
}
