"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ProductCard } from "@/components/product-card";
import type { ProductCardModel } from "@/lib/types";

const storageKey = "petokaku.recentProductIds";
const pendingSnapshot = "__pending__";

function parseIds(raw: string): string[] {
  if (!raw || raw === pendingSnapshot) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === "string" && /^prd_[a-z0-9_]+$/.test(id)).slice(0, 6);
  } catch {
    return [];
  }
}

function readStoredValue(): string {
  try {
    return localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return "[]";
  }
}

export function rememberProductId(id: string) {
  if (!/^prd_[a-z0-9_]+$/.test(id)) {
    return;
  }
  try {
    const next = [id, ...parseIds(readStoredValue()).filter((item) => item !== id)].slice(0, 6);
    localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event("petokaku-recent"));
  } catch {
    // 保存できないブラウザでも、商品ページ自体は表示する。
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("petokaku-recent", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("petokaku-recent", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function RememberProduct({ id }: { id: string }) {
  useEffect(() => {
    rememberProductId(id);
  }, [id]);

  return null;
}

export function RecentlyViewed({ items }: { items: ProductCardModel[] }) {
  const snapshot = useSyncExternalStore(subscribe, readStoredValue, () => pendingSnapshot);
  const ready = snapshot !== pendingSnapshot;
  const cards = parseIds(snapshot)
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is ProductCardModel => item != null);

  return (
    <section aria-labelledby="recent-heading" className="mx-auto max-w-6xl px-4 py-12">
      <h2 id="recent-heading" className="text-2xl font-bold md:text-3xl">
        最近価格を確認した商品
      </h2>
      <p className="mt-2 max-w-2xl text-muted">このブラウザで開いた商品だけを表示します。サーバーには送りません。</p>
      {!ready ? (
        <p className="mt-6 text-muted" aria-live="polite">
          読み込み中です。
        </p>
      ) : cards.length === 0 ? (
        <p className="mt-6 rounded-[1.75rem] border border-dashed border-line bg-card px-5 py-8 text-muted">
          まだ確認した商品はありません。商品を開くと、ここに表示されます。
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} headingLevel="h3" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
