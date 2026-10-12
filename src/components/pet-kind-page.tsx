import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PetListingBrowser } from "@/components/pet-listing-browser";
import { formatCheckedAt } from "@/lib/format";
import { listingPageHref, type PetListings } from "@/lib/pets-listings";
import type { PetPage } from "@/lib/pets";

export function PetKindPage({ pet, listings, categoryId }: { pet: PetPage; listings: PetListings; categoryId: string | null }) {
  const selected = pet.categories.find((item) => item.id === categoryId) ?? null;

  return (
    <article className="px-4 pt-3 pb-8 md:pt-5 md:pb-10">
      <div className="mx-auto min-w-0 max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "ペットの種類", href: "/#categories" },
            { label: pet.label, href: pet.path, current: true },
          ]}
        />
        <h1 className="mt-3 text-xl leading-tight font-medium tracking-tight text-ink md:text-3xl">{pet.h1}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{pet.lead}</p>

        <section className="mt-4" aria-labelledby="pet-categories-heading">
          <h2 id="pet-categories-heading" className="text-sm font-medium text-ink">
            商品カテゴリ
          </h2>
          <ul className="mt-2 flex min-w-0 flex-wrap gap-2">
            <li>
              <Link
                href={pet.path}
                scroll={false}
                aria-current={selected == null ? "page" : undefined}
                className={categoryClass(selected == null)}
              >
                すべて
              </Link>
            </li>
            {pet.categories.map((item) => (
              <li key={item.id}>
                <Link
                  href={`${pet.path}?category=${item.id}`}
                  scroll={false}
                  aria-current={selected?.id === item.id ? "page" : undefined}
                  className={categoryClass(selected?.id === item.id)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <PetListingBrowser
          yahoo={listings.yahoo}
          rakuten={listings.rakuten}
          categoryLabel={selected?.label ?? null}
          observedLabel={formatCheckedAt(listings.observedAt)}
          page={listings.page}
          previousHref={listings.page > 1 ? listingPageHref(pet.path, selected?.id ?? null, listings.page - 1) : null}
          nextHref={
            listings.yahoo.hasNext || listings.rakuten.hasNext ? listingPageHref(pet.path, selected?.id ?? null, listings.page + 1) : null
          }
        />

        <section className="mt-8" aria-labelledby="pet-points-heading">
          <h2 id="pet-points-heading" className="text-lg font-medium text-ink">
            商品選びのポイント
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {pet.points.map((point) => (
              <section key={point.heading} className="rounded-2xl border border-line bg-card p-4">
                <h3 className="text-sm font-medium text-ink">{point.heading}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{point.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="pet-related-heading">
          <h2 id="pet-related-heading" className="text-lg font-medium text-ink">
            関連ページ
          </h2>
          <ul className="mt-3 flex min-w-0 flex-wrap gap-2">
            {pet.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-10 items-center rounded-full border border-line bg-card px-3 text-sm text-forest-deep hover:border-sage">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8" aria-labelledby="pet-faq-heading">
          <h2 id="pet-faq-heading" className="text-lg font-medium text-ink">
            よくある質問
          </h2>
          <div className="mt-3 grid gap-3">
            {pet.faqs.map((faq) => (
              <section key={faq.question} className="rounded-2xl border border-line bg-card p-4">
                <h3 className="text-sm font-medium text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
              </section>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

function categoryClass(active: boolean): string {
  const base = "inline-flex min-h-10 items-center rounded-full border px-3 text-sm";
  return active ? `${base} border-accent bg-accent text-white` : `${base} border-line bg-card text-ink hover:border-sage`;
}
