import Link from "next/link";
import { CategoryCard } from "@/components/ui/category-card";
import { Hero } from "@/components/ui/hero";
import { PetSelector } from "@/components/ui/pet-selector";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories, categorySearchHref } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";

const popular = [
  { label: "ドッグフード", note: "犬のごはん", query: "犬 フード", icon: "dog" as CategoryId },
  { label: "キャットフード", note: "猫のごはん", query: "猫 フード", icon: "cat" as CategoryId },
  { label: "ペットシーツ", note: "トイレまわり", query: "ペットシーツ", icon: "dog" as CategoryId },
  { label: "猫砂", note: "猫のトイレ", query: "猫砂", icon: "cat" as CategoryId },
  { label: "デンタルケア", note: "歯みがき", query: "デンタルケア", icon: "other" as CategoryId },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <PetSelector />
      <section aria-labelledby="popular-heading" className="overflow-hidden bg-honey/40 px-4 py-14 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading id="popular-heading" eyebrow="こんなものを比較できます" title="人気の比較" lead="気になるものから、ショップの価格を見られます。" />
          <ul className="mt-8 flex min-w-0 max-w-full gap-3 overflow-x-auto pb-2 snap-x md:grid md:grid-cols-5 md:overflow-visible">
            {popular.map((item) => (
              <li key={item.label} className="shrink-0 md:shrink">
                <CategoryCard href={`/search?q=${encodeURIComponent(item.query)}`} label={item.label} note={item.note} icon={item.icon} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="more-pets" className="px-4 py-14 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading id="more-pets" title="ほかのペット" />
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
      <section aria-labelledby="together" className="px-4 pb-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.2rem] bg-forest px-6 py-12 text-white md:px-12">
          <div className="pointer-events-none absolute -right-8 -bottom-10 h-36 w-36 rounded-[55%_45%_60%_40%] bg-white/10" aria-hidden="true" />
          <h2 id="together" className="max-w-xl text-3xl leading-tight font-medium md:text-5xl">
            かしこく買って、
            <br />
            もっと一緒に。
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/85">
            ペトカクは商品を売りません。価格と送料を並べて、買う前にショップで確かめられるようにしています。
          </p>
          <Link href="/about" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-white px-5 text-sm text-forest">
            ペトカクについて
          </Link>
        </div>
      </section>
    </>
  );
}
