import Link from "next/link";

export type CatalogGlyph = "dog-food" | "cat-food" | "litter" | "sheet" | "treat" | "care";

const washes: Record<CatalogGlyph, string> = {
  "dog-food": "bg-moss",
  "cat-food": "bg-sand",
  litter: "bg-honey",
  sheet: "bg-moss",
  treat: "bg-sand",
  care: "bg-honey",
};

const iconProps = {
  viewBox: "0 0 32 32",
  "aria-hidden": true as const,
  className: "h-7 w-7",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function CatalogIcon({ glyph }: { glyph: CatalogGlyph }) {
  switch (glyph) {
    case "dog-food":
      return (
        <svg {...iconProps}>
          <path d="M8 15h16c-.8 5-4.2 8-8 8s-7.2-3-8-8Z" />
          <path d="M7 15h18" />
          <circle cx="12.2" cy="12.2" r="1.15" fill="currentColor" stroke="none" />
          <circle cx="16" cy="11.1" r="1.15" fill="currentColor" stroke="none" />
          <circle cx="19.8" cy="12.2" r="1.15" fill="currentColor" stroke="none" />
        </svg>
      );
    case "cat-food":
      return (
        <svg {...iconProps}>
          <path d="M9.5 21c1.2 2.6 3.6 4.2 6.5 4.2s5.3-1.6 6.5-4.2" />
          <path d="M8 21h16" />
          <path d="M12.2 18.2c1.6-2.4 2.4-4.8 1.5-6.6 1.4 1 2.4 1 3.8 0-.9 1.8-.1 4.2 1.5 6.6" />
          <path d="M20.5 14.2 24 11v6.2l-3.5-3Z" />
        </svg>
      );
    case "litter":
      return (
        <svg {...iconProps}>
          <path d="M7 13.5h18l-1.7 8.4a2 2 0 0 1-2 1.6H10.7a2 2 0 0 1-2-1.6L7 13.5Z" />
          <path d="M9.5 13.5v-1.8A1.5 1.5 0 0 1 11 10.2h10a1.5 1.5 0 0 1 1.5 1.5v1.8" />
          <circle cx="13" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="16.4" cy="18.4" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="19.2" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
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
    case "treat":
      return (
        <svg {...iconProps}>
          <circle cx="16" cy="16" r="6.4" />
          <circle cx="13.4" cy="14.4" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="18.2" cy="14.8" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="15.6" cy="18.2" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "care":
      return (
        <svg {...iconProps}>
          <path d="M13 6.5h6" />
          <path d="M14.5 6.5V9h3V6.5" />
          <rect x="12" y="9" width="8" height="15.5" rx="2.4" />
          <path d="M14.2 14.5h3.6" />
        </svg>
      );
  }
}

export function CatalogCard({
  href,
  label,
  note,
  glyph,
}: {
  href: string;
  label: string;
  note?: string;
  glyph: CatalogGlyph;
}) {
  return (
    <Link
      href={href}
      className="lift flex h-full min-h-32 min-w-0 flex-col justify-between rounded-[1.35rem] border border-line bg-card px-3.5 py-3.5 text-forest shadow-[0_8px_22px_rgba(32,77,56,0.06)] hover:border-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:min-h-36 sm:px-4 sm:py-4"
    >
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${washes[glyph]}`}>
        <CatalogIcon glyph={glyph} />
      </span>
      <span className="mt-3 min-w-0">
        <span className="block break-words text-[15px] leading-5 font-medium text-ink">{label}</span>
        {note ? <span className="mt-0.5 block break-words text-[11px] leading-4 text-muted">{note}</span> : null}
      </span>
    </Link>
  );
}
