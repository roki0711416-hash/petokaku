import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PetListingBrowser } from "@/components/pet-listing-browser";
import { petPhotos } from "@/components/ui/pet-photos";
import type { PetListings } from "@/lib/pets-listings";
import type { PetPage } from "@/lib/pets";

export function PetKindPage({ pet, listings }: { pet: PetPage; listings: PetListings }) {
  const photo = petPhotos.find((item) => item.href === pet.path);

  return (
    <article className="px-4 py-8 md:py-12">
      <div className="mx-auto min-w-0 max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "ペットの種類", href: "/#categories" },
            { label: pet.label, href: pet.path, current: true },
          ]}
        />
        <div className="mt-6 grid min-w-0 items-center gap-6 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          {photo ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-line bg-sand">
              <Image src={photo.image} alt={photo.alt} fill priority sizes="(max-width: 767px) 100vw, 280px" className={`object-cover ${photo.position}`} />
            </div>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight font-medium tracking-tight text-ink md:text-4xl">{pet.h1}</h1>
            <p className="mt-3 text-sm leading-7 text-muted md:text-base">{pet.lead}</p>
          </div>
        </div>

        <section className="mt-10" aria-labelledby="pet-categories-heading">
          <h2 id="pet-categories-heading" className="text-lg font-medium text-ink">
            商品カテゴリ
          </h2>
          <ul className="mt-4 flex min-w-0 flex-wrap gap-2">
            {pet.categories.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm text-ink hover:border-sage">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <PetListingBrowser yahoo={listings.yahoo} rakuten={listings.rakuten} />

        <section className="mt-12" aria-labelledby="pet-points-heading">
          <h2 id="pet-points-heading" className="text-lg font-medium text-ink">
            商品選びのポイント
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {pet.points.map((point) => (
              <section key={point.heading} className="rounded-2xl border border-line bg-card p-4">
                <h3 className="text-sm font-medium text-ink">{point.heading}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{point.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="pet-related-heading">
          <h2 id="pet-related-heading" className="text-lg font-medium text-ink">
            関連ページ
          </h2>
          <ul className="mt-4 flex min-w-0 flex-wrap gap-2">
            {pet.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm text-forest-deep hover:border-sage">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby="pet-faq-heading">
          <h2 id="pet-faq-heading" className="text-lg font-medium text-ink">
            よくある質問
          </h2>
          <div className="mt-4 grid gap-4">
            {pet.faqs.map((faq) => (
              <section key={faq.question} className="rounded-2xl border border-line bg-card p-4">
                <h3 className="text-sm font-medium text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
              </section>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
