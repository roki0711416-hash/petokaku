import { SearchBar } from "@/components/ui/search-bar";

export function Hero() {
  return (
    <section className="px-4 pt-8 pb-12 md:pt-14 md:pb-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-16">
        <div>
          <p className="text-sm font-medium tracking-[0.14em] text-sage">PETOKAKU</p>
          <h1 className="mt-3 max-w-xl text-[1.85rem] leading-snug font-medium tracking-tight text-ink md:text-5xl md:leading-tight">
            ペット用品の価格比較なら、ペトカク。
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
            ドッグフード、キャットフード、猫砂などの価格をかんたん比較。商品名やJANコードから、購入先を探せます。
          </p>
          <SearchBar id="home-search" showExamples />
        </div>
        <HeroScene />
      </div>
    </section>
  );
}

function HeroScene() {
  return (
    <div className="relative mx-auto hidden aspect-[5/4] w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#e7eee4] md:block" aria-hidden="true">
      <svg viewBox="0 0 480 384" className="h-full w-full">
        <rect width="480" height="384" fill="#e7eee4" />
        <circle cx="330" cy="168" r="108" fill="#f7f3eb" />
        <circle cx="150" cy="210" r="86" fill="#d7e2d2" />
        <path d="M118 214c8-46 38-74 72-74 18 0 32 8 42 22 8-16 24-26 46-24 34 4 52 36 48 74-18 8-40 12-70 12-28 0-58-6-138-10Z" fill="#204d38" />
        <path d="M156 150c-16-28-8-48 8-52 10 16 18 28 16 46" fill="#204d38" />
        <path d="M214 142c2-22 16-36 30-32 4 18-2 32-12 46" fill="#204d38" />
        <circle cx="176" cy="176" r="4" fill="#f7f3eb" />
        <circle cx="214" cy="174" r="4" fill="#f7f3eb" />
        <path d="M286 196c18-34 48-52 82-48 28 4 48 28 50 58 2 22-8 40-28 50-34 8-70 6-104-8 6-20 6-36 0-52Z" fill="#6f8c64" />
        <path d="M318 156c-6-24 6-40 20-44 6 16 6 30 2 44" fill="#6f8c64" />
        <path d="M368 150c10-20 26-28 38-22-2 16-10 28-22 36" fill="#6f8c64" />
        <circle cx="332" cy="188" r="3.5" fill="#f7f3eb" />
        <circle cx="360" cy="186" r="3.5" fill="#f7f3eb" />
        <rect x="72" y="286" width="336" height="8" rx="4" fill="#204d38" opacity="0.18" />
      </svg>
    </div>
  );
}
