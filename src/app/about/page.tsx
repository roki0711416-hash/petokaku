import Link from "next/link";
import { InfoArticle } from "@/components/info-article";
import { shareMetadata } from "@/lib/seo/share-metadata";

// 運営責任者の氏名、または法人の正式名称。未記入のあいだは行を出さない。
const operatorName = "";
// 掲載できる所在地。未記入のあいだは行を出さない。
const operatorAddress = "";

export const metadata = shareMetadata({
  title: "ペトカクについて",
  description: "ペトカクの目的、価格の集め方と更新、広告の扱い、運営者と連絡先の説明です。",
  path: "/about",
});

export default function AboutPage() {
  return (
    <InfoArticle
      title="ペトカクについて"
      path="/about"
      lead="ペット用品の価格と送料を見比べてから、買う場所を選べるようにするためのサイトです。商品の販売は行いません。"
    >
      <h2>サイトの目的</h2>
      <p>
        ペトカクは、ドッグフード、キャットフード、猫砂、ペットシーツなどの価格を、販売店ごとに並べて見るための価格比較サービスです。同じ商品でも、本体価格と送料の組み合わせは店によって違います。その違いを、購入の前に確認できるようにしています。
      </p>
      <p>購入の契約は、利用者と各販売店のあいだで成立します。ペトカクは代金を受け取らず、在庫の確保や配送もしません。</p>
      <h2>サイトの仕組み</h2>
      <p>
        商品名、ブランド名、JANコードで検索すると、Yahoo!ショッピングの商品検索APIから、ペット用品の掲載を取得します。JANコードが同じ掲載は、一つの商品としてまとめます。JANコードがない掲載は、ほかのショップとまとめません。名前が似ていても、内容量やセット数が違うものは別の商品です。
      </p>
      <p>
        商品ページでは、確認できたショップの商品価格、送料、在庫を並べます。送料が確認できた掲載だけ、商品価格と送料を合わせた金額を出します。確認できない項目は、0円や送料無料とは表示しません。操作の流れは
        <Link href="/guide" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          サイトの使い方
        </Link>
        、品目ごとの見方は
        <Link href="/articles" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          ペット用品の選び方
        </Link>
        にまとめています。
      </p>
      <h2>価格の集め方と更新</h2>
      <p>
        価格は、商品ページを開いたときに各APIから取得します。データベースへ接続できるときは、その掲載を記録し、開いたJANコードも残します。加えて、毎日1回、直近30日に開かれたJANコードのうち、その日まだ更新していないものを最大5件まで取り直します。見ていない商品を、毎日すべて更新しているわけではありません。
      </p>
      <p>
        取得元、定期実行の時刻、合計に入っていないポイントやクーポン、記録の限界は
        <Link href="/price-data" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          価格データについて
        </Link>
        に書いています。表示した金額が必ず最安であることや、購入がお得であることは保証しません。
      </p>
      <h2>広告・アフィリエイト</h2>
      <p>
        Yahoo!ショッピングと楽天市場は、確認できたアフィリエイトURLの購入リンクだけ「広告」と表示します。確認できないときは通常の商品ページを開き、広告とは表示しません。Amazonは、商品の一致を確認して登録したリンクだけを商品詳細に出し、「広告」と表示します。報酬の有無で、取得できなかった金額を別の数字で埋めることはしません。比較の順番も、報酬では決めていません。
      </p>
      <p>
        詳しくは
        <Link href="/affiliate" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          広告・アフィリエイト
        </Link>
        です。Amazonのアソシエイトとして、ペトカク運営事務局は適格販売により収入を得ています。
      </p>
      <h2 id="operator">運営者</h2>
      <p>運営者は、ペトカク運営事務局です。会員登録や、このサイト上の注文機能はありません。</p>
      <p>
        連絡先は
        <a href="mailto:petokaku@outlook.jp" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
        です。入力フォームは置いていません。リンクを開くと、お使いのメールソフトが起動します。同じ案内は
        <Link href="/contact" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          お問い合わせ
        </Link>
        にもあります。
      </p>
      {operatorName ? <p>運営責任者は{operatorName}です。</p> : null}
      {operatorAddress ? <p>所在地は{operatorAddress}です。</p> : null}
      <h2>関連する説明</h2>
      <ul>
        <li>
          <Link href="/privacy" className="font-medium text-forest-deep underline underline-offset-4">
            プライバシーポリシー
          </Link>
        </li>
        <li>
          <Link href="/price-data" className="font-medium text-forest-deep underline underline-offset-4">
            価格データについて
          </Link>
        </li>
        <li>
          <Link href="/terms" className="font-medium text-forest-deep underline underline-offset-4">
            利用規約
          </Link>
        </li>
      </ul>
    </InfoArticle>
  );
}
