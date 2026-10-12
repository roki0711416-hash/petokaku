import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import cat from "@/assets/pets/illustrations/cat.jpg";
import dog from "@/assets/pets/illustrations/dog.jpg";
import { CatalogIcon, type CatalogGlyph } from "@/components/ui/catalog-card";

type TopicCard = {
  label: string;
  query: string;
  image?: StaticImageData;
  alt?: string;
  glyph?: CatalogGlyph;
};

const topicCards: TopicCard[] = [
  { label: "ドッグフード", query: "ドッグフード", image: dog, alt: "犬のイラスト" },
  { label: "キャットフード", query: "キャットフード", image: cat, alt: "猫のイラスト" },
  { label: "猫砂・トイレ用品", query: "猫砂", image: cat, alt: "猫のイラスト" },
  { label: "ペットシーツ", query: "ペットシーツ", image: dog, alt: "犬のイラスト" },
  { label: "おやつ", query: "おやつ", glyph: "treat" },
  { label: "おもちゃ・グッズ", query: "おもちゃ", glyph: "toy" },
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
          <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {topicCards.map((topic) => (
              <li key={topic.label} className="min-w-0">
                <Link
                  href={`/search?q=${encodeURIComponent(topic.query)}`}
                  className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-card shadow-[0_8px_20px_rgba(32,77,56,0.06)] hover:ring-2 hover:ring-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  <TopicVisual topic={topic} />
                  <span className="px-3 py-3 text-sm leading-5 font-medium text-ink">{topic.label}</span>
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

function TopicVisual({ topic }: { topic: TopicCard }) {
  if (topic.image) {
    return (
      <span className="relative block aspect-[4/3] bg-sand">
        <Image src={topic.image} alt={topic.alt ?? ""} fill sizes="(max-width: 767px) 46vw, (max-width: 1023px) 30vw, 22vw" className="object-cover" />
      </span>
    );
  }
  return (
    <span className="grid aspect-[4/3] place-items-center bg-moss text-forest">
      <span className="scale-150">
        <CatalogIcon glyph={topic.glyph ?? "care"} />
      </span>
    </span>
  );
}
