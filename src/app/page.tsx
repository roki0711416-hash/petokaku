import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparableProducts } from "@/components/comparable-products";
import { CategoryCard } from "@/components/ui/category-card";
import { Hero } from "@/components/ui/hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories, categorySearchHref } from "@/lib/categories";
import { indexedJanProducts, selectIndexedJans } from "@/lib/site";
import type { CategoryId } from "@/lib/types";

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

const catalog = [
  { label: "ドッグフード", note: "犬のごはん", query: "犬 フード", icon: "dog" as CategoryId },
  { label: "キャットフード", note: "猫のごはん", query: "猫 フード", icon: "cat" as CategoryId },
  { label: "猫砂", note: "猫のトイレ", query: "猫砂", icon: "cat" as CategoryId },
  { label: "ペットシーツ", note: "トイレまわり", query: "ペットシーツ", icon: "dog" as CategoryId },
  { label: "おやつ", note: "犬と猫のおやつ", query: "ペット おやつ", icon: "other" as CategoryId },
  { label: "ケア用品", note: "日常のケア", query: "ペット ケア用品", icon: "other" as CategoryId },
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
      <section id="categories" aria-labelledby="categories-heading" className="scroll-mt-28 px-4 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="categories-heading" title="カテゴリー" lead="選ぶと、その品目の検索が開きます。" />
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {catalog.map((item) => (
              <li key={item.label}>
                <CategoryCard href={`/search?q=${encodeURIComponent(item.query)}`} label={item.label} note={item.note} icon={item.icon} />
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
      <section aria-labelledby="more-pets" className="px-4 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="more-pets" title="ほかのペット" lead="小動物、鳥、魚の用品も、同じ検索から探せます。" />
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories
              .filter((category) => category.id !== "dog" && category.id !== "cat")
              .map((category) => (
                <li key={category.id}>
                  <CategoryCard href={categorySearchHref(category.id)} label={category.label} note={category.description} icon={category.id} />
                </li>
              ))}
          </ul>
        </div>
      </section>
    </>
  );
}
