import "server-only";

import {
  categoryProductGroups,
  categoryUpdatedAtFromRows,
  extraLiveProducts,
  mergeCategoryProducts,
  parseLiveProductRows,
  type CategoryProductGroup,
  type LiveProductRow,
} from "@/lib/category-products";
import type { ItemGuideSlug } from "@/lib/item-guides";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

const liveProductLimit = 1000;

let rowsPromise: Promise<LiveProductRow[]> | null = null;

async function readLiveProductRows(): Promise<LiveProductRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("name, updated_at, category, variants(jan_code, size_label)")
      .limit(liveProductLimit);
    if (error) {
      return [];
    }
    return parseLiveProductRows(data);
  } catch {
    return [];
  }
}

export function fetchLiveProductRows(): Promise<LiveProductRow[]> {
  if (!rowsPromise) {
    rowsPromise = readLiveProductRows().catch(() => []);
  }
  return rowsPromise;
}

export async function categoryContentUpdatedAt(): Promise<Record<string, string>> {
  return categoryUpdatedAtFromRows(await fetchLiveProductRows());
}

export async function loadCategoryProductGroups(slug: ItemGuideSlug): Promise<CategoryProductGroup[]> {
  const rows = await fetchLiveProductRows();
  return categoryProductGroups(slug).map((group) => ({
    ...group,
    products: mergeCategoryProducts(group.products, extraLiveProducts(group.slug, rows)),
  }));
}
