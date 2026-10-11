import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { Hero } from "@/components/ui/hero";
import { PetPhotoGrid } from "@/components/ui/pet-photo-card";
import { getSiteUrl, indexedJanPath, indexedJanProducts, selectIndexedJans } from "@/lib/site";

const title = "ペット用品を、かしこく比較 | ペトカク";
const description = "ペット用品の本体価格と送料を、販売店の掲載から見比べるサイトです。商品名やJANコードで探し、購入は各ショップで行います。";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
  },
};

const steps = [
  { title: "探す", body: "ペットの種類か、商品名で探します。" },
  { title: "比べる", body: "ショップごとの価格を見ます。" },
  { title: "ショップで確認", body: "購入は各ショップのページで行います。" },
];

function homeStructuredData() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "ペトカク",
        url: siteUrl,
        email: "petokaku@outlook.jp",
        logo: new URL("/logo.png", siteUrl).toString(),
        sameAs: ["https://www.instagram.com/petokaku/", "https://x.com/petokaku"],
      },
      {
        "@type": "WebSite",
        name: "ペトカク",
        url: siteUrl,
        publisher: { "@type": "Organization", name: "ペトカク" },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export default function HomePage() {
  const structured = homeStructuredData();
  const comparable = selectIndexedJans(indexedJanProducts);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
      <Hero />
      <section id="categories" aria-labelledby="categories-heading" className="scroll-mt-28 px-4 pt-4 pb-2">
        <div className="mx-auto max-w-6xl">
          <h2 id="categories-heading" className="text-base font-medium text-ink md:text-lg">
            ペットの種類から探す
          </h2>
          <PetPhotoGrid />
        </div>
      </section>
      <section id="home-search" aria-labelledby="home-search-heading" className="scroll-mt-28 px-4 pt-4 pb-8">
        <div className="mx-auto max-w-6xl">
          <h2 id="home-search-heading" className="text-sm font-medium text-ink">
            商品名から探す
          </h2>
          <div className="mt-2 max-w-xl">
            <SearchForm
              id="home-search-input"
              compact
              action="/search"
              label="商品名・ブランド・JANコード"
              buttonLabel="検索"
              placeholder="商品名・ブランド・JANコード"
            />
          </div>
        </div>
      </section>
      {comparable.length > 0 ? (
        <section aria-labelledby="comparable-heading" className="px-4 pb-8">
          <div className="mx-auto max-w-6xl">
            <h2 id="comparable-heading" className="text-lg font-medium text-ink">
              価格比較できる商品
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">ショップごとの価格は、商品ページで見られます。</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {comparable.map((product) => (
                <li key={product.janCode} className="min-w-0">
                  <Link href={indexedJanPath(product.janCode)} className="flex h-full min-w-0 flex-col rounded-2xl border border-line bg-card px-4 py-4 hover:border-sage">
                    <span className="text-sm leading-6 font-medium text-ink">{product.label}</span>
                    <span className="mt-3 text-sm text-forest">価格を比較する</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <section aria-labelledby="howto-heading" className="bg-card px-4 py-8 md:py-10">
        <div className="mx-auto max-w-6xl">
          <h2 id="howto-heading" className="text-lg font-medium text-ink">
            使い方
          </h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="min-w-0 rounded-2xl bg-paper px-4 py-4">
                <p className="text-sm text-sage">0{index + 1}</p>
                <h3 className="mt-1 text-base font-medium text-ink">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-6 text-muted">
            詳しくは
            <Link href="/guide" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
              サイトの使い方
            </Link>
            にまとめています。
          </p>
        </div>
      </section>
    </>
  );
}
