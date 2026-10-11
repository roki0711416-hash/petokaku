"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CatalogIcon } from "@/components/ui/catalog-card";
import { petPhotos, type PetPhoto } from "@/components/ui/pet-photos";

export function PetPhotoCard({ pet }: { pet: PetPhoto }) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={pet.href}
      className="lift flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_8px_20px_rgba(32,77,56,0.06)] hover:border-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
    >
      <span className="relative block aspect-[4/3] bg-sand">
        {failed ? (
          <span className="grid h-full place-items-center text-forest">
            <CatalogIcon glyph={pet.glyph} />
          </span>
        ) : (
          <Image
            src={pet.image}
            alt={pet.alt}
            fill
            sizes="(max-width: 767px) 46vw, (max-width: 1279px) 30vw, 16vw"
            className={`object-cover ${pet.position}`}
            onError={() => setFailed(true)}
          />
        )}
      </span>
      <span className="flex min-h-12 items-center justify-center px-2 py-2 text-center text-sm leading-5 font-medium break-words text-ink">
        {pet.label}
      </span>
    </Link>
  );
}

export function PetPhotoGrid() {
  return (
    <ul className="mt-6 grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {petPhotos.map((pet) => (
        <li key={pet.label} className="min-w-0">
          <PetPhotoCard pet={pet} />
        </li>
      ))}
    </ul>
  );
}
