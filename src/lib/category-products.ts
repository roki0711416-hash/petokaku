import { articles } from "../data/articles.ts";
import { curatedJanProducts } from "../data/curated-jans.ts";
import { publishedArticles } from "./articles/catalog.ts";
import { itemGuideBySlug, itemGuideSlugs, itemGuides, listingMatchesGuide, type ItemGuideSlug } from "./item-guides.ts";
import { indexedJanProducts } from "./site.ts";
import { validJanCode } from "./sources/yahoo/adapter.ts";

export type CategoryProduct = {
  janCode: string;
  href: string;
  label: string;
  note?: string;
};

export type CategoryProductGroup = {
  slug: ItemGuideSlug;
  heading: string | null;
  href: string | null;
  products: CategoryProduct[];
};

export type LiveProductRow = {
  name: string;
  updatedAt: string;
  category: string;
  variants: { janCode: string | null; sizeLabel: string }[];
};

const categoryListLimit = 24;

const articleGuideSlugs: Partial<Record<string, ItemGuideSlug>> = {
  "cat-litter-types": "cat-litter",
  "how-to-choose-cat-food": "cat-food",
  "how-to-choose-dog-food": "dog-food",
  "how-to-choose-pet-sheets": "pet-sheets",
};

const genreByCategory: Record<string, readonly string[]> = {
  dog: ["犬用品"],
  cat: ["猫用品"],
  "small-animal": ["小動物用品"],
  bird: ["鳥用品"],
  fish: ["魚用品"],
  other: [],
};

type Draft = {
  janCode: string;
  label: string;
  note?: string;
  slug: ItemGuideSlug;
  rank: number;
  order: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isUnsafeCategoryLabel(label: string): boolean {
  return /架空|サンプル|動作確認|amazon\.|アマゾン|https?:\/\//i.test(label) || /[0-9][0-9,]*円/.test(label);
}

export function guideSlugForLabel(label: string): ItemGuideSlug | null {
  const text = label.replace(/\s+/g, "");
  if (text === "" || isUnsafeCategoryLabel(label)) {
    return null;
  }
  if (/キャットタワー|猫タワー/.test(text)) {
    return "cat-tower";
  }
  if (/ペットシーツ|ペットシート|デオシート|トイレシーツ/.test(text)) {
    return "pet-sheets";
  }
  if (/猫砂|ネコ砂|トイレ砂/.test(text)) {
    return "cat-litter";
  }
  if (/おやつ|ジャーキー|ちゅーる|チュール|トリーツ/.test(text)) {
    return "treats";
  }
  if (/トイレ/.test(text)) {
    return "pet-toilet";
  }
  if (/ドッグフード/.test(text) || (/犬|ドッグ/.test(text) && !/猫/.test(text) && /フード|ドライ|ウェット|総合栄養食|成犬|子犬|シニア/.test(text))) {
    return "dog-food";
  }
  if (/キャットフード|猫缶/.test(text) || (/猫|キャット/.test(text) && /フード|ドライ|ウェット|総合栄養食|成猫|子猫|キトン|パウチ/.test(text))) {
    return "cat-food";
  }
  return null;
}

export function classifyCategoryLabel(label: string, genres: readonly string[] = []): ItemGuideSlug | null {
  if (isUnsafeCategoryLabel(label)) {
    return null;
  }
  const matched = itemGuideSlugs.filter((slug) => listingMatchesGuide(slug, label, genres));
  const byLabel = guideSlugForLabel(label);
  if (matched.length === 1) {
    const only = matched[0];
    if (byLabel && byLabel !== only) {
      return null;
    }
    return only ?? null;
  }
  if (matched.length === 0) {
    return byLabel;
  }
  if (byLabel && matched.includes(byLabel)) {
    return byLabel;
  }
  return null;
}

function janHref(janCode: string): string {
  return `/products/jan/${janCode}`;
}

function pushDraft(drafts: Draft[], input: { janCode: string; label: string; note?: string; slug: ItemGuideSlug; rank: number }, order: number) {
  const janCode = validJanCode(input.janCode);
  const label = input.label.replace(/\s+/g, " ").trim();
  const note = input.note?.replace(/\s+/g, " ").trim();
  if (!janCode || label === "" || isUnsafeCategoryLabel(label)) {
    return;
  }
  drafts.push({
    janCode,
    label,
    ...(note ? { note } : {}),
    slug: input.slug,
    rank: input.rank,
    order,
  });
}

function collectDrafts(): Draft[] {
  const drafts: Draft[] = [];
  let order = 0;
  for (const guide of itemGuides) {
    for (const product of guide.relatedProducts ?? []) {
      const janCode = product.href.match(/^\/products\/jan\/([0-9]{13})$/)?.[1];
      if (!janCode) {
        continue;
      }
      pushDraft(drafts, { janCode, label: product.label, note: product.note, slug: guide.slug, rank: 0 }, order);
      order += 1;
    }
  }
  for (const article of publishedArticles(articles)) {
    const slug = articleGuideSlugs[article.slug];
    if (!slug) {
      continue;
    }
    for (const product of article.products) {
      const janCode = product.href.match(/^\/products\/jan\/([0-9]{13})$/)?.[1];
      if (!janCode) {
        continue;
      }
      pushDraft(drafts, { janCode, label: product.label, note: product.note, slug, rank: 1 }, order);
      order += 1;
    }
  }
  for (const product of curatedJanProducts) {
    const slug = guideSlugForLabel(product.label);
    if (!slug) {
      continue;
    }
    pushDraft(drafts, { janCode: product.janCode, label: product.label, slug, rank: 2 }, order);
    order += 1;
  }
  for (const product of indexedJanProducts) {
    const slug = guideSlugForLabel(product.label);
    if (!slug) {
      continue;
    }
    pushDraft(drafts, { janCode: product.janCode, label: product.label, slug, rank: 2 }, order);
    order += 1;
  }
  return drafts;
}

type CatalogEntry = CategoryProduct & { slug: ItemGuideSlug; order: number };

function catalogEntries(): CatalogEntry[] {
  const grouped = new Map<string, Draft[]>();
  for (const draft of collectDrafts()) {
    const list = grouped.get(draft.janCode) ?? [];
    list.push(draft);
    grouped.set(draft.janCode, list);
  }

  const entries: CatalogEntry[] = [];
  for (const [janCode, drafts] of grouped) {
    const bestRank = Math.min(...drafts.map((draft) => draft.rank));
    const best = drafts.filter((draft) => draft.rank === bestRank);
    const slugs = new Set(best.map((draft) => draft.slug));
    const slug = best[0]?.slug;
    if (!slug || slugs.size !== 1) {
      continue;
    }
    const label = best.slice().sort((a, b) => b.label.length - a.label.length || a.order - b.order)[0]?.label;
    if (!label) {
      continue;
    }
    const note = best.find((draft) => draft.note)?.note;
    entries.push({
      janCode,
      href: janHref(janCode),
      label,
      ...(note ? { note } : {}),
      slug,
      order: Math.min(...best.map((draft) => draft.order)),
    });
  }
  return entries.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "ja"));
}

export function productsForGuide(slug: ItemGuideSlug): CategoryProduct[] {
  return catalogEntries().flatMap((entry) => {
    if (entry.slug !== slug) {
      return [];
    }
    return [
      {
        janCode: entry.janCode,
        href: entry.href,
        label: entry.label,
        ...(entry.note ? { note: entry.note } : {}),
      },
    ];
  });
}

export function categoryProductGroups(slug: ItemGuideSlug): CategoryProductGroup[] {
  if (slug === "pet-toilet") {
    return [
      { slug: "pet-toilet", heading: "トイレ本体・専用シート", href: null, products: productsForGuide("pet-toilet") },
      { slug: "cat-litter", heading: "猫砂", href: "/categories/cat-litter", products: productsForGuide("cat-litter") },
      { slug: "pet-sheets", heading: "ペットシーツ", href: "/categories/pet-sheets", products: productsForGuide("pet-sheets") },
    ];
  }
  const guide = itemGuideBySlug(slug);
  return [{ slug, heading: null, href: guide?.path ?? null, products: productsForGuide(slug) }];
}

export function mergeCategoryProducts(
  primary: readonly CategoryProduct[],
  extra: readonly CategoryProduct[],
  limit = categoryListLimit,
): CategoryProduct[] {
  const seen = new Set<string>();
  const merged: CategoryProduct[] = [];
  for (const product of [...primary, ...extra]) {
    if (!/^\/products\/jan\/[0-9]{13}$/.test(product.href) || product.href !== janHref(product.janCode)) {
      continue;
    }
    if (isUnsafeCategoryLabel(product.label) || seen.has(product.janCode)) {
      continue;
    }
    seen.add(product.janCode);
    merged.push(product);
    if (merged.length >= limit) {
      break;
    }
  }
  return merged;
}

function liveLabel(name: string, sizeLabel: string): string {
  const base = name.replace(/\s+/g, " ").trim();
  const size = sizeLabel.replace(/\s+/g, " ").trim();
  if (base === "") {
    return size;
  }
  if (size === "" || base.includes(size)) {
    return base;
  }
  return `${base} ${size}`;
}

export function extraLiveProducts(slug: ItemGuideSlug, rows: readonly LiveProductRow[]): CategoryProduct[] {
  const seen = new Set(productsForGuide(slug).map((product) => product.janCode));
  const extra: CategoryProduct[] = [];
  for (const row of rows) {
    const genres = genreByCategory[row.category] ?? [];
    for (const variant of row.variants) {
      const janCode = variant.janCode ? validJanCode(variant.janCode) : null;
      if (!janCode || seen.has(janCode)) {
        continue;
      }
      const label = liveLabel(row.name, variant.sizeLabel);
      if (classifyCategoryLabel(label, genres) !== slug) {
        continue;
      }
      seen.add(janCode);
      extra.push({ janCode, href: janHref(janCode), label });
    }
  }
  return extra;
}

export function categoryUpdatedAtFromRows(rows: readonly LiveProductRow[]): Record<string, string> {
  const byJan = new Map(catalogEntries().map((entry) => [entry.janCode, entry.slug]));
  const best = new Map<ItemGuideSlug, number>();
  for (const row of rows) {
    const time = Date.parse(row.updatedAt);
    if (Number.isNaN(time)) {
      continue;
    }
    const genres = genreByCategory[row.category] ?? [];
    const slugs = new Set<ItemGuideSlug>();
    if (row.variants.length === 0) {
      const slug = classifyCategoryLabel(row.name, genres);
      if (slug) {
        slugs.add(slug);
      }
    }
    for (const variant of row.variants) {
      const janCode = variant.janCode ? validJanCode(variant.janCode) : null;
      const known = janCode ? byJan.get(janCode) : undefined;
      if (known) {
        slugs.add(known);
        continue;
      }
      const slug = classifyCategoryLabel(liveLabel(row.name, variant.sizeLabel), genres);
      if (slug) {
        slugs.add(slug);
      }
    }
    for (const slug of slugs) {
      best.set(slug, Math.max(best.get(slug) ?? 0, time));
    }
  }

  const updated: Record<string, string> = {};
  for (const [slug, time] of best) {
    const path = itemGuideBySlug(slug)?.path;
    if (path) {
      updated[path] = new Date(time).toISOString();
    }
  }
  return updated;
}

export function parseLiveProductRows(data: unknown): LiveProductRow[] {
  if (!Array.isArray(data)) {
    return [];
  }
  const rows: LiveProductRow[] = [];
  for (const row of data) {
    if (!isRecord(row) || typeof row.name !== "string" || typeof row.updated_at !== "string") {
      continue;
    }
    const name = row.name.replace(/\s+/g, " ").trim();
    if (name === "" || isUnsafeCategoryLabel(name)) {
      continue;
    }
    rows.push({
      name,
      updatedAt: row.updated_at,
      category: typeof row.category === "string" ? row.category : "",
      variants: parseVariants(row.variants),
    });
  }
  return rows;
}

function parseVariants(value: unknown): { janCode: string | null; sizeLabel: string }[] {
  const list = Array.isArray(value) ? value : isRecord(value) ? [value] : [];
  return list.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    const janCode = typeof item.jan_code === "string" ? validJanCode(item.jan_code) : null;
    const sizeLabel = typeof item.size_label === "string" ? item.size_label.replace(/\s+/g, " ").trim() : "";
    if (!janCode && sizeLabel === "") {
      return [];
    }
    return [{ janCode, sizeLabel }];
  });
}
