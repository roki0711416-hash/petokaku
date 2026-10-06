import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

export type Crumb = {
  label: string;
  href: string;
  current?: boolean;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.href, getSiteUrl()).toString(),
    })),
  };

  return (
    <>
      <nav aria-label="パンくずリスト" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.current ? (
                <span aria-current="page" className="text-ink">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
