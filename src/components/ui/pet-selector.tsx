"use client";

import { useEffect, useState } from "react";
import { CategoryCard } from "@/components/ui/category-card";
import { SectionHeading } from "@/components/ui/section-heading";

const kinds = [
  { label: "フード", query: "フード" },
  { label: "おやつ", query: "おやつ" },
  { label: "トイレ", query: "トイレ" },
  { label: "ケア用品", query: "ケア用品" },
  { label: "その他", query: "用品" },
] as const;

const pets = [
  { id: "dog" as const, en: "DOG", label: "犬用品", wash: "bg-dog" },
  { id: "cat" as const, en: "CAT", label: "猫用品", wash: "bg-cat" },
];

export function PetSelector() {
  const [animal, setAnimal] = useState<"dog" | "cat" | null>(null);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#dog") {
        setAnimal("dog");
      }
      if (window.location.hash === "#cat") {
        setAnimal("cat");
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const selected = pets.find((pet) => pet.id === animal);

  return (
    <section id="pets" aria-labelledby="pets-heading" className="px-4 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading id="pets-heading" eyebrow="まずは仲間から" title="犬と猫で探す" lead="犬か猫を選ぶと、フードやトイレなどの検索へ進めます。" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {pets.map((pet) => {
            const pressed = animal === pet.id;
            return (
              <button
                key={pet.id}
                id={pet.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => setAnimal(pet.id)}
                className={`lift overflow-hidden rounded-[2rem] p-4 text-left md:p-6 ${pet.wash} ${pressed ? "ring-2 ring-forest" : ""}`}
              >
                <div className="relative h-36 overflow-hidden rounded-[1.6rem] bg-white/45" aria-hidden="true">
                  <span className="absolute top-5 left-6 h-16 w-16 rounded-[60%_40%_55%_45%] bg-white/80" />
                  <span className="absolute top-8 right-8 h-10 w-10 rounded-full bg-white/70" />
                  <span className="absolute bottom-5 left-8 h-3 w-16 rounded-full bg-ink/10" />
                </div>
                <p className="mt-4 text-xs tracking-[0.2em] text-muted">{pet.en}</p>
                <p className="mt-1 text-3xl font-medium text-ink">{pet.label}</p>
              </button>
            );
          })}
        </div>
        {selected ? (
          <div className="mt-6">
            <h3 className="text-sm text-muted">{selected.label}の種類</h3>
            <ul className="mt-3 flex min-w-0 max-w-full gap-3 overflow-x-auto pb-2 snap-x md:grid md:grid-cols-5 md:overflow-visible">
              {kinds.map((kind) => (
                <li key={kind.label} className="shrink-0 md:shrink">
                  <CategoryCard
                    href={`/search?q=${encodeURIComponent(`${selected.id === "dog" ? "犬" : "猫"} ${kind.query}`)}`}
                    label={kind.label}
                    icon={selected.id}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">犬か猫を選ぶと、フードやトイレなどの種類が出ます。</p>
        )}
      </div>
    </section>
  );
}
