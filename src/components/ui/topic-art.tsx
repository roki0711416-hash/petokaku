"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { CatalogIcon, type CatalogGlyph } from "@/components/ui/catalog-card";

export function TopicArt({ image, glyph }: { image: StaticImageData; glyph: CatalogGlyph }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="relative block aspect-square bg-sand">
      {failed ? (
        <span className="grid h-full place-items-center text-forest">
          <span className="scale-150">
            <CatalogIcon glyph={glyph} />
          </span>
        </span>
      ) : (
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 767px) 46vw, 30vw"
          className="object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
