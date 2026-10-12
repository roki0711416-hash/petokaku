import Link from "next/link";
import catFood from "@/assets/topics/cat-food.jpg";
import catLitter from "@/assets/topics/cat-litter.jpg";
import dogFood from "@/assets/topics/dog-food.jpg";
import petSheets from "@/assets/topics/pet-sheets.jpg";
import toys from "@/assets/topics/toys.jpg";
import treats from "@/assets/topics/treats.jpg";
import { TopicArt } from "@/components/ui/topic-art";
import type { CatalogGlyph } from "@/components/ui/catalog-card";
import type { StaticImageData } from "next/image";

const topicCards: { label: string; query: string; image: StaticImageData; glyph: CatalogGlyph }[] = [
  { label: "ドッグフード", query: "ドッグフード", image: dogFood, glyph: "food" },
  { label: "キャットフード", query: "キャットフード", image: catFood, glyph: "food" },
  { label: "猫砂・トイレ用品", query: "猫砂", image: catLitter, glyph: "toilet" },
  { label: "ペットシーツ", query: "ペットシーツ", image: petSheets, glyph: "sheet" },
  { label: "おやつ", query: "おやつ", image: treats, glyph: "treat" },
  { label: "おもちゃ・グッズ", query: "おもちゃ", image: toys, glyph: "toy" },
];

const searchKeywords = ["ドッグフード", "キャットフード", "猫砂", "ペットシーツ", "ロイヤルカナン", "おやつ", "おもちゃ", "チモシー", "ネクトン"];

export function HomeTopics() {
  return (
    <>
      <section aria-labelledby="topic-heading" className="px-4 pt-8">
        <div className="mx-auto max-w-6xl">
          <h2 id="topic-heading" className="text-base font-medium text-ink md:text-lg">
            人気のカテゴリ
          </h2>
          <ul className="mt-3 grid grid-cols-2 items-stretch gap-3 md:grid-cols-3">
            {topicCards.map((topic) => (
              <li key={topic.label} className="min-w-0">
                <Link
                  href={`/search?q=${encodeURIComponent(topic.query)}`}
                  className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-card shadow-[0_8px_20px_rgba(32,77,56,0.06)] hover:ring-2 hover:ring-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  <TopicArt image={topic.image} glyph={topic.glyph} />
                  <span className="flex h-12 items-center px-3 text-sm leading-5 font-medium text-ink">{topic.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="keyword-heading" className="px-4 pt-8">
        <div className="mx-auto max-w-6xl">
          <h2 id="keyword-heading" className="text-base font-medium text-ink md:text-lg">
            人気の検索キーワード
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {searchKeywords.map((keyword) => (
              <li key={keyword}>
                <Link
                  href={`/search?q=${encodeURIComponent(keyword)}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-line bg-card px-3 text-sm text-ink hover:border-sage"
                >
                  {keyword}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
