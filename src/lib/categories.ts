import { categoryIds, type CategoryId } from "@/lib/types";

export type Category = {
  id: CategoryId;
  label: string;
  description: string;
};

export const categories: Category[] = [
  {
    id: "dog",
    label: "犬用品",
    description: "ごはん、おやつ、ケア用品",
  },
  {
    id: "cat",
    label: "猫用品",
    description: "カリカリ、ウェット、ケア用品",
  },
  {
    id: "small-animal",
    label: "小動物用品",
    description: "うさぎ、ハムスターなどの用品",
  },
  {
    id: "bird",
    label: "鳥用品",
    description: "フード、止まり木、ケア用品",
  },
  {
    id: "fish",
    label: "魚・水槽用品",
    description: "えさ、ろ過、水槽まわり",
  },
  {
    id: "other",
    label: "その他のペット用品",
    description: "種類をまたぐケア用品",
  },
];

const categoryMap = new Map(categories.map((category) => [category.id, category]));

export function isCategoryId(value: string): value is CategoryId {
  return categoryIds.some((id) => id === value);
}

export function getCategory(id: CategoryId): Category {
  const category = categoryMap.get(id);
  if (!category) {
    throw new Error(`不明なカテゴリーです: ${id}`);
  }
  return category;
}

export function categoryHref(id: CategoryId): string {
  return `/products?category=${id}`;
}

const categorySearchQuery: Record<CategoryId, string> = {
  dog: "犬 用品",
  cat: "猫 用品",
  "small-animal": "小動物 用品",
  bird: "鳥 用品",
  fish: "魚 用品",
  other: "ペット 用品",
};

export function categorySearchHref(id: CategoryId): string {
  return `/search?q=${encodeURIComponent(categorySearchQuery[id])}`;
}
