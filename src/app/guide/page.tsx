import type { Metadata } from "next";
import Link from "next/link";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "サイトの使い方",
  description: "商品名、ブランド名、JANコードから販売店を探し、価格と送料を見比べて、外部ショップで購入する手順です。",
  alternates: { canonical: "/guide" },
};

const steps = [
  {
    title: "商品名・ブランド名・JANコードで検索",
    body: "トップまたはヘッダーの検索窓に、探したい言葉を入れてください。カテゴリーのカードからも、その品目の検索を開けます。",
  },
  {
    title: "商品詳細ページを開く",
    body: "JANコードでまとまった商品は「価格を見る」から詳細ページへ進みます。JANコードがない掲載は、その場で販売店のページを開きます。",
  },
  {
    title: "販売ショップの価格や送料を比較",
    body: "詳細ページでは、ショップ名、商品価格、確認できた送料、在庫を並べます。送料が確認できた掲載だけ合計額を出します。送料が未確認の合計は「情報なし」です。",
  },
  {
    title: "外部ショップで購入",
    body: "「商品を見る」を開くと、販売店のページへ移動します。ペトカクでは決済しません。移動後の価格、送料、在庫、内容量は、そのショップで確認してください。",
  },
];

export default function GuidePage() {
  return (
    <InfoArticle title="サイトの使い方" path="/guide" lead="検索して、見比べて、買う場所は販売店のページです。">
      <ol className="list-none pl-0">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-3xl bg-card px-5 py-5">
            <p className="text-sm text-sage">0{index + 1}</p>
            <h2 className="mt-1">{step.title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
      <h2>価格は変わることがあります</h2>
      <p>
        価格、送料、在庫は、取得した時点の掲載です。その後にショップ側で変わることがあります。ページに出している金額が、いまの販売価格と一致するとは限りません。
      </p>
      <h2>内容量が違う商品</h2>
      <p>名前が似ていても、4kgと10kgのように内容量が違う商品は別のJANコードとして扱います。同じ一覧の最安としては混ぜません。</p>
      <p>
        操作で分からないことは、
        <Link href="/contact" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          お問い合わせ
        </Link>
        からメールで連絡できます。
      </p>
    </InfoArticle>
  );
}
