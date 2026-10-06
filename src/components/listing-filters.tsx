"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { categories } from "@/lib/categories";
import {
  activeFilterCount,
  clearFiltersHref,
  priceBands,
  type ParsedProductQuery,
} from "@/lib/query";

const fieldClass = "h-14 w-full rounded-full border border-line bg-paper px-4 font-normal";

function FilterFields({
  idPrefix,
  query,
  brands,
}: {
  idPrefix: string;
  query: ParsedProductQuery;
  brands: string[];
}) {
  return (
    <>
      {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
      {query.sort !== "recommended" ? <input type="hidden" name="sort" value={query.sort} /> : null}
      <label className="grid gap-2 text-sm font-bold" htmlFor={`${idPrefix}-category`}>
        カテゴリー
        <select id={`${idPrefix}-category`} name="category" defaultValue={query.category ?? ""} className={fieldClass}>
          <option value="">指定なし</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold" htmlFor={`${idPrefix}-brand`}>
        ブランド
        <select id={`${idPrefix}-brand`} name="brand" defaultValue={query.brand ?? ""} className={fieldClass}>
          <option value="">指定なし</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold" htmlFor={`${idPrefix}-price`}>
        価格帯
        <select id={`${idPrefix}-price`} name="price" defaultValue={query.priceBand ?? ""} className={fieldClass}>
          <option value="">指定なし</option>
          {priceBands.map((band) => (
            <option key={band.id} value={band.id}>
              {band.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export function ListingFilters({ query, brands }: { query: ParsedProductQuery; brands: string[] }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(query);
  const clearHref = clearFiltersHref(query);
  const buttonLabel = count > 0 ? `絞り込み（${count}）` : "絞り込み";

  useEffect(() => {
    if (!open) {
      return;
    }
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="listing-filter">
            <button type="button" className="listing-filter-overlay" aria-label="絞り込みを閉じる" onClick={() => setOpen(false)} />
            <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="listing-filter-panel">
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
                <p id={titleId} className="text-base font-bold">
                  絞り込み
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  className="grid h-12 w-12 place-items-center rounded-full border border-line bg-paper text-ink"
                  aria-label="絞り込みを閉じる"
                  onClick={() => setOpen(false)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <form action="/products" method="get" className="flex min-h-0 flex-1 flex-col" onSubmit={() => setOpen(false)}>
                <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-4 py-4">
                  <FilterFields idPrefix="sheet" query={query} brands={brands} />
                </div>
                <div className="grid gap-3 border-t border-line px-4 py-4">
                  <button type="submit" className="min-h-12 rounded-full bg-forest px-5 font-bold text-card">
                    この条件で表示
                  </button>
                  <Link
                    href={clearHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-card px-5 text-sm font-bold"
                    onClick={() => setOpen(false)}
                  >
                    条件をクリア
                  </Link>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="mt-6 md:hidden">
        <button
          type="button"
          className="min-h-12 w-full rounded-full border border-line bg-card px-5 text-sm font-bold"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          {buttonLabel}
        </button>
        {count > 0 ? (
          <p className="mt-3 text-center">
            <Link href={clearHref} className="text-sm font-bold text-forest-deep underline-offset-4 hover:underline">
              条件をクリア
            </Link>
          </p>
        ) : null}
      </div>
      <form action="/products" method="get" className="mt-6 hidden rounded-[1.75rem] border border-line bg-card p-4 md:block">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FilterFields idPrefix="desk" query={query} brands={brands} />
          <div className="flex items-end">
            <button type="submit" className="h-14 w-full rounded-full bg-forest px-5 font-bold text-card">
              この条件で表示
            </button>
          </div>
        </div>
        {count > 0 ? (
          <p className="mt-4">
            <Link href={clearHref} className="text-sm font-bold text-forest-deep underline-offset-4 hover:underline">
              条件をクリア
            </Link>
          </p>
        ) : null}
      </form>
      {panel}
    </>
  );
}
