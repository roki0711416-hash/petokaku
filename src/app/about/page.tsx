import type { Metadata } from "next";
import Link from "next/link";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "ペトカクについて",
  description: "ペトカクは、ペット用品の価格と送料を販売店ごとに見比べるサイトです。商品の販売は行いません。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoArticle
      title="ペトカクについて"
      path="/about"
      lead="ペット用品の価格を見比べてから、買う場所を選べるようにするためのサイトです。"
    >
      <h2>サイトの目的</h2>
      <p>
        ペトカクは、ドッグフード、キャットフード、猫砂などの価格を、販売店ごとに並べて見るための価格比較サービスです。商品そのものは販売しません。購入の契約は、利用者と各販売店のあいだで成立します。
      </p>
      <h2>価格の見方</h2>
      <p>
        商品名、ブランド名、JANコードで検索すると、Yahoo!ショッピングの商品検索APIから、ペット用品の掲載を取得します。同じJANコードの掲載は、ひとつの商品としてまとめます。JANコードがない掲載は、ほかのショップとまとめません。
      </p>
      <p>
        表示する商品価格、送料、在庫は、取得した時点の販売店の掲載です。送料が確認できた掲載だけ、商品価格と送料を合わせた金額を出します。確認できない項目は、0円や送料無料とは表示しません。
      </p>
      <h2>掲載情報の出典</h2>
      <p>
        販売店の商品名・価格・送料・在庫・商品画像は、各ショップがYahoo!ショッピングに出している掲載です。ペトカクが独自に値付けしたものではありません。取得後にショップ側で変わることがあります。購入前に、販売店のページで確認してください。
      </p>
      <h2>運営方針</h2>
      <p>表示した金額が必ず最安であることや、購入がお得であることは保証しません。成果報酬の有無で、取得できなかった金額を別の数字で埋めることはしません。</p>
      <p>
        現在の販売店へのリンクは、各ショップの商品ページです。アフィリエイトリンクではありません。報酬のあるリンクにするときは、そのリンクに「広告」と表示します。詳しくは
        <Link href="/affiliate" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          広告・アフィリエイト
        </Link>
        に書いています。
      </p>
      <h2>運営者</h2>
      <p>運営者は、ペトカク運営事務局です。</p>
      <p>
        連絡先は
        <a href="mailto:petokaku@outlook.jp" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
        です。入力フォームは置いていません。
      </p>
    </InfoArticle>
  );
}
