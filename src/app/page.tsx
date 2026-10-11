import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparableProducts } from "@/components/comparable-products";
import { CatalogCard, type CatalogGlyph } from "@/components/ui/catalog-card";
import { Hero } from "@/components/ui/hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { categorySearchHref } from "@/lib/categories";
import { indexedJanProducts, selectIndexedJans } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "ペット用品の価格比較 | ペトカク" },
  description: "ドッグフード、キャットフード、猫砂などの価格をかんたん比較。商品名やJANコードから、購入先を探せます。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ペット用品の価格比較 | ペトカク",
    description: "ドッグフード、キャットフード、猫砂などの価格をかんたん比較。商品名やJANコードから、購入先を探せます。",
    url: "/",
  },
};

const cardGrid = "mt-6 grid min-w-0 grid-cols-3 gap-2 md:grid-cols-4 md:gap-3 xl:grid-cols-6";

const pets: { label: string; href: string; glyph: CatalogGlyph }[] = [
  { label: "犬", href: categorySearchHref("dog"), glyph: "dog" },
  { label: "猫", href: categorySearchHref("cat"), glyph: "cat" },
  { label: "うさぎ・小動物", href: categorySearchHref("small-animal"), glyph: "rabbit" },
  { label: "鳥", href: categorySearchHref("bird"), glyph: "bird" },
  { label: "魚・アクアリウム", href: categorySearchHref("fish"), glyph: "fish" },
  { label: "爬虫類・両生類", href: `/search?q=${encodeURIComponent("爬虫類 用品")}`, glyph: "reptile" },
];

const genres: { label: string; query: string; glyph: CatalogGlyph }[] = [
  { label: "フード", query: "ペット フード", glyph: "food" },
  { label: "おやつ", query: "ペット おやつ", glyph: "treat" },
  { label: "トイレ用品", query: "ペット トイレ", glyph: "toilet" },
  { label: "おもちゃ", query: "ペット おもちゃ", glyph: "toy" },
  { label: "ケア用品", query: "ペット ケア用品", glyph: "care" },
  { label: "飼育用品", query: "ペット 飼育用品", glyph: "habitat" },
];

const steps = [
  { title: "商品を検索", body: "商品名、ブランド名、JANコードで、販売店の掲載を探します。" },
  { title: "価格・送料を比較", body: "ショップごとの商品価格と、確認できた送料を並べます。" },
  { title: "販売ショップで購入", body: "ペトカクは販売しません。購入は各ショップのページで行います。" },
];

export default function HomePage() {
  const comparableProducts = selectIndexedJans(indexedJanProducts);

  return (
    <>
      <Hero />
      <section id="categories" aria-labelledby="categories-heading" className="scroll-mt-28 px-4 pt-14 pb-4 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="categories-heading" title="ペットの種類から探す" lead="種類を選ぶと、その用品の検索が開きます。" />
          <ul className={cardGrid}>
            {pets.map((item) => (
              <li key={item.label} className="min-w-0">
                <CatalogCard href={item.href} label={item.label} glyph={item.glyph} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="genres-heading" className="px-4 pt-8 pb-14 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="genres-heading" title="商品ジャンルから探す" lead="品目を選ぶと、その検索が開きます。" />
          <ul className={cardGrid}>
            {genres.map((item) => (
              <li key={item.label} className="min-w-0">
                <CatalogCard href={`/search?q=${encodeURIComponent(item.query)}`} label={item.label} glyph={item.glyph} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Suspense fallback={null}>
        <ComparableProducts products={comparableProducts} />
      </Suspense>
      <section aria-labelledby="howto-heading" className="bg-white px-4 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="howto-heading" title="使い方" lead="価格を見比べてから、販売店のページで購入します。" />
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-3xl bg-paper px-5 py-6">
                <p className="text-sm text-sage">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-medium text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
