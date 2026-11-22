import type { BreadcrumbItem } from "./breadcrumb-list.ts";
import { getCategory, isCategoryId } from "./categories.ts";
import { itemGuides, listingMatchesGuide } from "./item-guides.ts";
import { listingFitsPet, petById, petPages, type PetId } from "./pets.ts";
import type { CategoryId } from "./types.ts";

// 品目ページがある語は /categories/* へ。専用ページがない種類は、既存のペットページへ。
// 犬にも猫にもまたがるブランド名だけ、検索のまま残す。
export const homeCategoryCards = [
  { label: "ドッグフード", href: "/categories/dog-food" },
  { label: "キャットフード", href: "/categories/cat-food" },
  { label: "猫砂・トイレ用品", href: "/categories/cat-litter" },
  { label: "ペットシーツ", href: "/categories/pet-sheets" },
  { label: "おやつ", href: "/pets/dog?category=treat" },
  { label: "おもちゃ・グッズ", href: "/pets/cat?category=toy" },
] as const;

function brandSearchHref(query: string): string {
  return `/search?q=${encodeURIComponent(query)}`;
}

export const homeKeywordLinks = [
  { label: "ドッグフード", href: "/categories/dog-food" },
  { label: "キャットフード", href: "/categories/cat-food" },
  { label: "猫砂", href: "/categories/cat-litter" },
  { label: "ペットシーツ", href: "/categories/pet-sheets" },
  { label: "ロイヤルカナン", href: brandSearchHref("ロイヤルカナン") },
  { label: "おやつ", href: "/pets/dog?category=treat" },
  { label: "おもちゃ", href: "/pets/cat?category=toy" },
  { label: "チモシー", href: "/pets/small-animal" },
  { label: "ネクトン", href: brandSearchHref("ネクトン") },
] as const;

const petByCategory: Partial<Record<CategoryId, PetId>> = {
  dog: "dog",
  cat: "cat",
  "small-animal": "small-animal",
  bird: "bird",
  fish: "fish",
};

export function productHubCrumb(input: {
  name: string;
  category: CategoryId;
  genreNames?: readonly string[];
}): { label: string; href: string } | null {
  const genres = input.genreNames ?? [];
  const guides = itemGuides.filter((guide) => listingMatchesGuide(guide.slug, input.name, genres));
  const guide = guides[0];
  if (guides.length === 1 && guide) {
    return { label: guide.crumb, href: guide.path };
  }

  const petId = petByCategory[input.category];
  if (petId) {
    return { label: getCategory(input.category).label, href: petById(petId).path };
  }

  const pets = petPages().filter((pet) => listingFitsPet(input.name, [...genres], pet));
  const pet = pets[0];
  if (pets.length === 1 && pet) {
    return {
      label: isCategoryId(pet.id) ? getCategory(pet.id).label : pet.label,
      href: pet.path,
    };
  }
  return null;
}

export function hubPageCrumbs(page: { label: string; href: string }): BreadcrumbItem[] {
  return [
    { label: "ホーム", href: "/" },
    { label: page.label, href: page.href, current: true },
  ];
}

export function productPageCrumbs(input: {
  name: string;
  category: CategoryId;
  genreNames?: readonly string[];
  productLabel: string;
  productHref: string;
}): BreadcrumbItem[] {
  const hub = productHubCrumb(input);
  return [
    { label: "ホーム", href: "/" },
    ...(hub ? [{ label: hub.label, href: hub.href }] : []),
    { label: input.productLabel, href: input.productHref, current: true },
  ];
}
