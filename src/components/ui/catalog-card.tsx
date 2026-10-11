import Link from "next/link";

export type CatalogGlyph =
  | "dog"
  | "cat"
  | "rabbit"
  | "bird"
  | "fish"
  | "reptile"
  | "food"
  | "treat"
  | "toilet"
  | "toy"
  | "care"
  | "habitat"
  | "sheet";

const washes: Record<CatalogGlyph, string> = {
  dog: "bg-moss",
  cat: "bg-sand",
  rabbit: "bg-honey",
  bird: "bg-moss",
  fish: "bg-sand",
  reptile: "bg-honey",
  food: "bg-moss",
  treat: "bg-sand",
  toilet: "bg-honey",
  toy: "bg-moss",
  care: "bg-sand",
  habitat: "bg-honey",
  sheet: "bg-moss",
};

const iconProps = {
  viewBox: "0 0 32 32",
  "aria-hidden": true as const,
  className: "h-5 w-5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CatalogIcon({ glyph }: { glyph: CatalogGlyph }) {
  switch (glyph) {
    case "dog":
      return (
        <svg {...iconProps}>
          <path d="M12 15c0-3.4 1.8-6 4-6s4 2.6 4 6v2c0 3.6-1.8 6-4 6s-4-2.4-4-6v-2Z" />
          <path d="M12.6 13.2c-1.8-2.2-4-2-5-.4M19.4 13.2c1.8-2.2 4-2 5-.4" />
        </svg>
      );
    case "cat":
      return (
        <svg {...iconProps}>
          <path d="M12.2 15.5 9.5 8.5l4.2 3.4 2.3-4.2 2.3 4.2 4.2-3.4-2.7 7v3.2c0 2.8-1.8 4.8-4.3 4.8s-4.3-2-4.3-4.8v-3.2Z" />
        </svg>
      );
    case "rabbit":
      return (
        <svg {...iconProps}>
          <path d="M12.2 15.5c-.2-5.2-1.4-8-2.6-8-1.1 0-1.2 2.4-.2 8" />
          <path d="M19.8 15.5c.2-5.2 1.4-8 2.6-8 1.1 0 1.2 2.4.2 8" />
          <ellipse cx="16" cy="20.5" rx="5.6" ry="4.4" />
        </svg>
      );
    case "bird":
      return (
        <svg {...iconProps}>
          <path d="M9 20c2.2-5.2 7-7.2 12.5-5.4-3.4 1-5.4 2.8-5.4 5.4 2.6.2 5.2 1.2 6.4 3-4.6 1.6-10.2.6-13.5-3Z" />
          <path d="M20.2 14.2 24 13" />
        </svg>
      );
    case "fish":
      return (
        <svg {...iconProps}>
          <path d="M8 16c4-4.6 10-4.6 14 0-4 4.6-10 4.6-14 0Z" />
          <path d="M22 16l5-3.6v7.2L22 16Z" />
          <circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "reptile":
      return (
        <svg {...iconProps}>
          <path d="M7 19.5c2.4-4.2 6.2-4.6 8.6-1.6 1.6-3 4.6-3.2 6.6-.8-1.6 1.2-2.2 3-1.2 4.6 2.6.4 5 1.4 6.2 3.2-3.6 1.6-7.2.6-10.4-.4-1.6 2-4.4 2.8-7.6.8.8-1.4.6-3.2-.2-4.2" />
          <circle cx="21.6" cy="15.6" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      );
    case "food":
      return (
        <svg {...iconProps}>
          <path d="M8 15.5h16c-.8 4.6-4 7.5-8 7.5s-7.2-2.9-8-7.5Z" />
          <path d="M7 15.5h18" />
          <circle cx="12.4" cy="12.6" r="1" fill="currentColor" stroke="none" />
          <circle cx="16" cy="11.6" r="1" fill="currentColor" stroke="none" />
          <circle cx="19.6" cy="12.6" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "treat":
      return (
        <svg {...iconProps}>
          <circle cx="16" cy="16" r="6.2" />
          <circle cx="13.6" cy="14.6" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="18" cy="15" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="15.6" cy="18" r="0.85" fill="currentColor" stroke="none" />
        </svg>
      );
    case "toilet":
      return (
        <svg {...iconProps}>
          <path d="M7.5 14h17l-1.6 7.6a2 2 0 0 1-2 1.6H11a2 2 0 0 1-2-1.6L7.5 14Z" />
          <path d="M10 14v-1.6A1.4 1.4 0 0 1 11.4 11h9.2a1.4 1.4 0 0 1 1.4 1.4V14" />
          <circle cx="13.2" cy="17.4" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="16.4" cy="18.4" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="19" cy="16.8" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "toy":
      return (
        <svg {...iconProps}>
          <circle cx="16" cy="16" r="6.4" />
          <path d="M10.6 13.6c2.2 1.4 4.4 1.8 9.2 1" />
          <path d="M11 18.6c2.4-1 5.2-.8 9.4.4" />
        </svg>
      );
    case "care":
      return (
        <svg {...iconProps}>
          <path d="M13 7h6" />
          <path d="M14.5 7V9.4h3V7" />
          <rect x="12" y="9.4" width="8" height="14.6" rx="2.2" />
          <path d="M14.2 14.6h3.6" />
        </svg>
      );
    case "habitat":
      return (
        <svg {...iconProps}>
          <rect x="8" y="10" width="16" height="13" rx="2" />
          <path d="M12.5 10v13M16 10v13M19.5 10v13M8 16.2h16" />
        </svg>
      );
    case "sheet":
      return (
        <svg {...iconProps}>
          <path d="M8 12h11.2L24 16.6V22a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2Z" />
          <path d="M19.2 12v4.6H24" />
          <path d="M11.2 19.2h7.2M11.2 22h4.6" />
        </svg>
      );
  }
}

export function CatalogCard({ href, label, glyph }: { href: string; label: string; glyph: CatalogGlyph }) {
  return (
    <Link
      href={href}
      className="lift flex h-full min-w-0 flex-col items-center rounded-2xl border border-line bg-card px-1.5 py-3 text-center text-forest shadow-[0_6px_16px_rgba(32,77,56,0.05)] hover:border-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${washes[glyph]}`}>
        <CatalogIcon glyph={glyph} />
      </span>
      <span className="mt-2 block w-full break-words text-xs leading-4 font-medium text-ink">{label}</span>
    </Link>
  );
}
