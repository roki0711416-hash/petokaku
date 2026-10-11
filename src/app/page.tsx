import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/ui/hero";
import { PetPhotoGrid } from "@/components/ui/pet-photo-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSiteUrl } from "@/lib/site";

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

const keywords: { label: string; href: string }[] = [
  { label: "ドッグフード", href: "/categories/dog-food" },
  { label: "キャットフード", href: "/categories/cat-food" },
  { label: "猫砂", href: "/categories/cat-litter" },
  { label: "ペットシーツ", href: "/categories/pet-sheets" },
  { label: "ロイヤルカナン", href: `/search?q=${encodeURIComponent("ロイヤルカナン")}` },
  { label: "ニュートロ", href: `/search?q=${encodeURIComponent("ニュートロ")}` },
  { label: "チモシー", href: `/search?q=${encodeURIComponent("チモシー")}` },
  { label: "金魚のえさ", href: `/search?q=${encodeURIComponent("金魚のえさ")}` },
];

const steps = [
  { title: "探す", body: "商品名、ブランド名、JANコード、または種類とジャンルから掲載を探します。" },
  { title: "比較する", body: "本体価格、確認できた送料、容量、セット数、在庫を並べて見ます。" },
  { title: "ショップで確認する", body: "購入は各ショップのページで行います。表示後に条件が変わることがあります。" },
];

const checks = [
  { term: "本体価格", body: "商品そのものの価格です。送料は含みません。" },
  { term: "送料", body: "確認できた金額だけを合計に使います。不明な送料は0円にしません。" },
  { term: "容量", body: "同じ容量の掲載を見比べます。" },
  { term: "セット数", body: "複数個のセットは、単品とは別にして見ます。" },
  { term: "在庫", body: "在庫ありと確認できた掲載を、比較の中心にします。" },
];

const faqs = [
  {
    question: "ペトカクとは何ですか？",
    answer: "ペット用品の価格を、販売店の掲載ごとに見比べるサイトです。商品の販売や、在庫の保有はしていません。",
  },
  {
    question: "ペトカクで購入できますか？",
    answer: "購入はできません。掲載から販売店のページへ移動し、そこで注文します。",
  },
  {
    question: "表示価格に送料は含まれますか？",
    answer: "本体価格と送料は分けて示します。送料が確認できた掲載だけ合計を出します。確認できない場合は送料未確認とし、0円や送料無料にはしません。",
  },
  {
    question: "どんな商品を比較できますか？",
    answer: "商品名、ブランド名、JANコードで検索できます。犬、猫、小動物、鳥、魚、爬虫類などの用品が対象です。並ぶのは取得できた掲載で、すべての販売店や商品を含むわけではありません。",
  },
  {
    question: "表示された価格で必ず買えますか？",
    answer: "表示は取得した時点の掲載です。その後にショップ側で変わることがあります。購入前に、販売店のページで本体価格、送料、在庫、セット数を確認してください。全店舗の最安であることは保証しません。",
  },
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
      <Hero />
      <section id="item-guides" aria-labelledby="keywords-heading" className="scroll-mt-28 px-4 pb-8 md:pb-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="keywords-heading" title="人気検索キーワード" lead="品目のページと、キーワード検索を開けます。" />
          <ul className="mt-6 flex min-w-0 flex-wrap gap-2" aria-label="検索キーワード">
            {keywords.map((keyword) => (
              <li key={keyword.label} className="min-w-0">
                <Link
                  href={keyword.href}
                  className="inline-flex min-h-11 max-w-full items-center rounded-full border border-line bg-card px-4 text-sm text-ink hover:border-sage"
                >
                  {keyword.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="categories" aria-labelledby="categories-heading" className="scroll-mt-28 px-4 pt-2 pb-12 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="categories-heading" title="ペットの種類から探す" lead="種類を選ぶと、その用品の検索が開きます。" />
          <PetPhotoGrid />
        </div>
      </section>
      <section aria-labelledby="howto-heading" className="bg-card px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="howto-heading" title="ペトカクの使い方" lead="価格を見比べてから、販売店のページで確認します。" />
          <ol className="mt-8 grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="min-w-0 rounded-2xl bg-paper px-4 py-5">
                <p className="text-sm text-sage">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-medium text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm leading-7 text-muted">
            手順の詳細は
            <Link href="/guide" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
              サイトの使い方
            </Link>
            にまとめています。
          </p>
        </div>
      </section>
      <section aria-labelledby="about-heading" className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="about-heading" title="ペトカクとは" />
          <div className="mt-6 max-w-3xl text-sm leading-7 text-muted md:text-base">
            <p>販売店が掲載している商品価格、送料、在庫を、取得できた範囲で並べる価格比較サイトです。</p>
            <p className="mt-4">同じJANコードの掲載は、一つの商品として扱います。JANコードがない掲載は、ほかのショップとまとめません。</p>
            <p className="mt-4">ペトカクは注文を受けません。成果報酬の有無で、取得できなかった金額を別の数字で埋めることもありません。</p>
            <p className="mt-4">
              運営者と掲載の出典は
              <Link href="/about" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
                ペトカクについて
              </Link>
              に書いています。
            </p>
          </div>
        </div>
      </section>
      <section aria-labelledby="checks-heading" className="bg-card px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="checks-heading" title="ペット用品の価格比較で確認したいこと" lead="金額だけでなく、同じ条件かどうかも見ます。" />
          <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((item) => (
              <div key={item.term} className="min-w-0 rounded-2xl bg-paper px-4 py-4">
                <dt className="text-base font-medium text-ink">{item.term}</dt>
                <dd className="mt-2 text-sm leading-7 text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section aria-labelledby="faq-heading" className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="faq-heading" title="よくある質問" />
          <div className="mt-8 grid max-w-3xl gap-6">
            {faqs.map((item) => (
              <article key={item.question} className="min-w-0 border-t border-line pt-6">
                <h3 className="text-base font-medium text-ink">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
