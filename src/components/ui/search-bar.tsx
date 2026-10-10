import Link from "next/link";
import { SearchForm } from "@/components/search-form";

const examples = ["ロイヤルカナン", "ニュートロ", "猫砂", "ペットシーツ"];

export function SearchBar({ id, showExamples = false }: { id: string; showExamples?: boolean }) {
  return (
    <div className="mt-4 md:mt-8">
      <SearchForm
        id={id}
        prominent
        action="/search"
        label="商品名・ブランド・JANコード"
        buttonLabel="検索"
        placeholder="商品名・ブランド・JANコード"
      />
      {showExamples ? (
        <ul className="mt-3 flex flex-wrap gap-2 md:mt-4" aria-label="検索例">
          {examples.map((example) => (
            <li key={example}>
              <Link
                href={`/search?q=${encodeURIComponent(example)}`}
                className="inline-flex min-h-10 items-center rounded-full bg-card px-3 text-sm text-ink/80"
              >
                {example}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
