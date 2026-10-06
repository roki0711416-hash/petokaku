import { SearchBar } from "@/components/ui/search-bar";

export function Hero() {
  return (
    <section className="rise relative overflow-hidden px-4 pt-4 pb-6 md:pt-16 md:pb-20">
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-[60%_40%_55%_45%] bg-honey/80" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-6 -left-10 h-28 w-28 rounded-[45%_55%_40%_60%] bg-cat" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl">
        <p className="text-sm font-medium text-forest">ペット用品の価格を、かんたん比較。</p>
        <h1 className="mt-1.5 text-[1.75rem] leading-tight font-medium tracking-tight text-ink md:mt-3 md:text-6xl">
          <span className="block whitespace-nowrap md:inline-block">ほしい用品の値段を、</span>
          <span className="block md:inline-block">ならべて見る。</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted md:mt-4 md:text-base md:leading-8">
          商品名で検索すると、ショップごとの価格をまとめて比較できます。
        </p>
        <SearchBar id="home-search" showExamples />
      </div>
    </section>
  );
}
