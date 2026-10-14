import type { Metadata } from "next";
import Link from "next/link";
import { HomeTopics } from "@/components/home-topics";
import { SearchForm } from "@/components/search-form";
import { PetPhotoGrid } from "@/components/ui/pet-photo-card";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

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
  { title: "探す", body: "商品名か、ペットの種類から探します。" },
  { title: "比較する", body: "ショップごとの価格と送料を見ます。" },
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
      <section id="home-search" aria-labelledby="home-search-heading" className="scroll-mt-28 bg-card px-4 pt-6 pb-8 md:pt-10">
        <div className="mx-auto max-w-3xl">
          <h1 id="home-search-heading" className="text-[1.65rem] leading-snug font-medium tracking-tight text-ink min-[390px]:text-[1.8rem] md:text-4xl md:leading-tight">
            ペット用品を、<br className="sm:hidden" />
            もっとお得に。
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted md:text-base">いつものフードや日用品をかんたん価格比較</p>
          <div className="mt-4">
            <SearchForm
              id="home-search-input"
              prominent
              action="/search"
              label="商品名・ブランド名で検索"
              buttonLabel="検索"
              placeholder="商品名・ブランド名で検索"
            />
            <p className="mt-2 text-xs leading-5 text-muted">JANコードでの検索にも対応</p>
          </div>
        </div>
      </section>
      <section id="categories" aria-labelledby="categories-heading" className="scroll-mt-28 px-4 pt-8">
        <div className="mx-auto max-w-6xl">
          <h2 id="categories-heading" className="text-base font-medium text-ink md:text-lg">
            ペットの種類から探す
          </h2>
          <PetPhotoGrid />
        </div>
      </section>
      <HomeTopics />
      <section aria-labelledby="howto-heading" className="px-4 pt-8 pb-8 md:pt-10">
        <div className="mx-auto max-w-6xl">
          <h2 id="howto-heading" className="text-base font-medium text-ink md:text-lg">
            サイトの使い方
          </h2>
          <ol className="mt-3 grid gap-2 md:grid-cols-3 md:gap-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex min-w-0 items-start gap-3 rounded-2xl bg-card px-3 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest text-sm text-white">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{step.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-6 text-muted">
            詳しくは
            <Link href="/guide" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
              サイトの使い方
            </Link>
            と
            <Link href="/articles" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
              お役立ち記事
            </Link>
            にまとめています。
          </p>
        </div>
      </section>
    </>
  );
}
