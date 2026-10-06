"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ui/product-card";
import type { SearchCandidateCard } from "@/lib/sources/yahoo/search-candidates";
import type { PetKind } from "@/lib/sources/yahoo/pet-kind";

const animalFilters: Array<{ id: "all" | PetKind; label: string }> = [
  { id: "all", label: "すべて" },
  { id: "dog", label: "犬" },
  { id: "cat", label: "猫" },
  { id: "small-animal", label: "小動物" },
  { id: "bird", label: "鳥" },
  { id: "fish", label: "魚" },
  { id: "other", label: "その他" },
];

export function SearchResultList({ query, cards }: { query: string; cards: SearchCandidateCard[] }) {
  const [animal, setAnimal] = useState<"all" | PetKind>("all");
  const counts = useMemo(() => {
    const tally = new Map<PetKind, number>();
    for (const card of cards) {
      tally.set(card.animal, (tally.get(card.animal) ?? 0) + 1);
    }
    return tally;
  }, [cards]);
  const visible = animal === "all" ? cards : cards.filter((card) => card.animal === animal);
  const filters = animalFilters.filter((filter) => filter.id === "all" || (counts.get(filter.id) ?? 0) > 0);

  return (
    <section aria-labelledby="search-results-heading" className="mt-8">
      <h2 id="search-results-heading" className="text-2xl font-medium tracking-tight md:text-3xl">
        「{query}」
      </h2>
      <p className="mt-1 text-sm text-muted">{cards.length}商品</p>
      <div className="mt-4 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" role="group" aria-label="ペットの種類">
        {filters.map((filter) => {
          const count = filter.id === "all" ? cards.length : (counts.get(filter.id) ?? 0);
          const selected = animal === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setAnimal(filter.id)}
              className={
                selected
                  ? "inline-flex min-h-11 shrink-0 items-center rounded-full bg-ink px-4 text-sm text-card"
                  : "inline-flex min-h-11 shrink-0 items-center rounded-full bg-card px-4 text-sm"
              }
            >
              {filter.label} {count}
            </button>
          );
        })}
      </div>
      <ul className="mt-5 grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 xl:grid-cols-4">
        {visible.map((card) => (
          <ProductCard key={card.id} card={card} />
        ))}
      </ul>
    </section>
  );
}
