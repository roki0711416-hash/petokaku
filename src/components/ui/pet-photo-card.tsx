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
      className="flex h-full min-w-0 flex-col items-center rounded-2xl bg-card px-2 py-3 text-center shadow-[0_8px_20px_rgba(32,77,56,0.06)] hover:bg-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
    >
      <span className="relative block size-14 overflow-hidden rounded-full bg-sand sm:size-16">
        {failed ? (
          <span className="grid h-full place-items-center text-forest">
            <CatalogIcon glyph={pet.glyph} />
          </span>
        ) : (
          <Image
            src={pet.image}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </span>
      <span className="mt-2 text-xs leading-4 font-medium text-ink sm:text-sm">{pet.label}</span>
    </Link>
  );
}

export function PetPhotoGrid() {
  return (
    <ul className="mt-3 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
      {petIllustrations.map((pet) => (
        <li key={pet.href} className="min-w-0">
          <PetPhotoCard pet={pet} />
        </li>
      ))}
    </ul>
  );
}
