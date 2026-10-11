"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CatalogIcon } from "@/components/ui/catalog-card";
import { petIllustrations, type PetIllustration } from "@/components/ui/pet-illustrations";

export function PetPhotoCard({ pet }: { pet: PetIllustration }) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={pet.href}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl bg-card shadow-[0_10px_24px_rgba(38,43,39,0.08)] transition-shadow duration-300 hover:shadow-[0_14px_28px_rgba(38,43,39,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none"
    >
      <span className="relative block aspect-square overflow-hidden bg-[#f6f1e6]">
        {failed ? (
          <span className="grid h-full place-items-center text-forest">
            <CatalogIcon glyph={pet.glyph} />
          </span>
        ) : (
          <Image
            src={pet.image}
            alt={pet.alt}
            fill
            sizes="(max-width: 767px) 46vw, (max-width: 1023px) 30vw, 16vw"
            className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none motion-safe:group-hover:scale-105"
            onError={() => setFailed(true)}
          />
        )}
      </span>
      <span className="flex min-h-12 items-center justify-between gap-2 border-t border-line bg-card px-3 py-2.5 text-[0.8125rem] leading-5 font-medium text-ink">
        <span className="min-w-0">{pet.label}</span>
        <CardArrow />
      </span>
    </Link>
  );
}

function CardArrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 shrink-0 text-forest">
      <path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PetPhotoGrid() {
  return (
    <ul className="mt-3 grid min-w-0 grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
      {petIllustrations.map((pet) => (
        <li key={pet.href} className="min-w-0">
          <PetPhotoCard pet={pet} />
        </li>
      ))}
    </ul>
  );
}
