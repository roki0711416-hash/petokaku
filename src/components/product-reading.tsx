import Link from "next/link";
import { productReadingCopy } from "@/lib/product-reading";
import type { PriceHistorySufficiency } from "@/lib/pricing/price-history-summary";
import type { CategoryId } from "@/lib/types";

export function ProductReading({
  name,
  category,
  genreName,
  sizeLabel,
  recordedDays = null,
  sufficiency = null,
}: {
  name: string;
  category: CategoryId;
  genreName?: string | null;
  sizeLabel?: string | null;
  recordedDays?: number | null;
  sufficiency?: PriceHistorySufficiency | null;
}) {
  const copy = productReadingCopy({ name, category, genreName, sizeLabel, recordedDays, sufficiency });

  return (
    <section id="how-to-read" aria-labelledby="how-to-read-heading" className="mt-5 scroll-mt-[var(--product-section-offset,7rem)] md:mt-8 lg:scroll-mt-24">
      <h2 id="how-to-read-heading" className="text-lg font-bold tracking-tight text-ink">
        {copy.heading}
      </h2>
      <div className="mt-2 grid gap-2 text-sm leading-7 text-muted">
        {copy.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ul className="mt-3 grid gap-2">
        {copy.points.map((point) => (
          <li key={point.heading} className="rounded-2xl border border-line bg-card px-4 py-3">
            <p className="text-sm font-medium text-ink">{point.heading}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{point.body}</p>
          </li>
        ))}
      </ul>
      <h3 className="mt-4 text-sm font-medium text-ink">価格の記録の見方</h3>
      <p className="mt-1 text-sm leading-7 text-muted">{copy.history}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {copy.links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="inline-flex min-h-10 items-center text-sm font-medium text-forest-deep underline underline-offset-4 hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
