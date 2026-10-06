import type { CategoryId } from "@/lib/types";

const palettes: Record<CategoryId, { bg: string; ink: string; accent: string }> = {
  dog: { bg: "#f3e2d4", ink: "#6a3b28", accent: "#c56a45" },
  cat: { bg: "#f6ead8", ink: "#6d4c2c", accent: "#24584a" },
  "small-animal": { bg: "#e7f0dc", ink: "#3c5330", accent: "#6d8f45" },
  bird: { bg: "#f8e7cf", ink: "#7a4e20", accent: "#d08a3c" },
  fish: { bg: "#dcebe7", ink: "#1d4a46", accent: "#2f7d78" },
  other: { bg: "#f0e6f2", ink: "#5b3e64", accent: "#8d5d86" },
};

export function ProductArt({
  category,
  variant,
  name,
  large = false,
}: {
  category: CategoryId;
  variant: number;
  name: string;
  large?: boolean;
}) {
  const palette = palettes[category];
  const shift = (variant % 3) * 18;

  return (
    <svg
      viewBox="0 0 320 220"
      role="img"
      aria-label={`${name}のサンプル画像`}
      className={large ? "h-auto w-full" : "h-44 w-full sm:h-48"}
    >
      <rect width="320" height="220" rx="28" fill={palette.bg} />
      <circle cx={210 - shift} cy="78" r="46" fill={palette.accent} opacity="0.9" />
      <rect x={48 + shift / 4} y="96" width="150" height="78" rx="22" fill={palette.ink} opacity="0.9" />
      <path d="M78 96h46l14-22h28l10 22" fill={palette.accent} />
      <circle cx="168" cy="58" r="8" fill={palette.ink} />
      <text x="24" y="196" fill={palette.ink} fontSize="15" fontFamily="sans-serif">
        サンプル画像
      </text>
    </svg>
  );
}

export function CategoryIcon({ category }: { category: CategoryId }) {
  const common = {
    viewBox: "0 0 48 48",
    "aria-hidden": true,
    className: "h-8 w-8 text-forest",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (category) {
    case "dog":
      return (
        <svg {...common}>
          <path d="M14 20c0-6 4-10 10-10s10 4 10 10v4c0 7-4 12-10 12s-10-5-10-12v-4Z" />
          <path d="M16 16c-3-4-7-4-9-2m25 2c3-4 7-4 9-2" />
        </svg>
      );
    case "cat":
      return (
        <svg {...common}>
          <path d="M16 20 12 10l8 6 4-8 4 8 8-6-4 10v6c0 6-4 10-10 10s-10-4-10-10v-6Z" />
        </svg>
      );
    case "small-animal":
      return (
        <svg {...common}>
          <ellipse cx="24" cy="26" rx="10" ry="8" />
          <path d="M16 22c-4-1-7-5-6-8m22 8c4-1 7-5 6-8" />
          <path d="M20 30h.1M28 30h.1" />
        </svg>
      );
    case "bird":
      return (
        <svg {...common}>
          <path d="M18 30c-6 0-10-4-10-8 6-1 10 1 12 4 2-6 8-12 16-12-4 4-4 8-2 12 4 0 8 2 8 6-6 2-14 0-24-2Z" />
        </svg>
      );
    case "fish":
      return (
        <svg {...common}>
          <path d="M14 24c6-8 16-8 22 0-6 8-16 8-22 0Z" />
          <path d="M36 24l6-6v12l-6-6ZM20 24h.1" />
        </svg>
      );
    case "other":
      return (
        <svg {...common}>
          <rect x="12" y="14" width="24" height="20" rx="4" />
          <path d="M12 20h24M20 14v-2a4 4 0 0 1 8 0v2" />
        </svg>
      );
  }
}
