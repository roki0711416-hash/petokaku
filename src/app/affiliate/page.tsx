import type { Metadata } from "next";
import Link from "next/link";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "広告・アフィリエイト",
  description: "ペトカクの販売店リンクは現在アフィリエイトではありません。報酬のあるリンクにするときの表示です。",
  alternates: { canonical: "/affiliate" },
};

export default function AffiliatePage() {
  return (
    <InfoArticle
      title="広告・アフィリエイト"
      path="/affiliate"
      lead="現在の販売店へのリンクは、各ショップの商品ページです。成果報酬のリンクではありません。"
    >
      <h2>広告・アフィリエイトの仕組み</h2>
      <p>
        アフィリエイトは、利用者があるリンクから販売店へ進み、その店で購入などが成立したときに、サイト運営者が報酬を受け取ることがある仕組みです。ペトカクは、そのリンクをまだ使っていません。バリューコマースを含む提携コード、成果リンク、広告の計測タグは、このサイトの実装にありません。提携済みとは表示しません。
      </p>
      <h2>成果報酬と価格の関係</h2>
      <p>報酬の有無で、取得できなかった金額を別の数字で埋めることはしません。比較に出す価格、送料、在庫は、取得できた販売店の掲載です。報酬のために順位を作り替える処理も、現在はありません。</p>
      <h2>広告リンクの識別</h2>
      <p>
        報酬のあるURLが商品データに入ったリンクだけを、アフィリエイトリンクとして開きます。そのリンクの近くには「広告」と出し、rel属性にsponsoredを付けます。報酬のないリンクは、販売店の商品ページをそのまま開き、「広告」とは出しません。商品詳細ページと検索ページにも、現在のリンクが広告ではないことを書いています。
      </p>
      <h2>外部ショップでの購入</h2>
      <p>ショップのページへ移動したあとの価格、送料、在庫、返品は、その販売店の条件です。ペトカクは代金を受け取らず、購入契約の当事者にはなりません。</p>
      <h2>掲載情報の更新と正確性</h2>
      <p>
        掲載は取得時点のものです。その後に変わることがあります。商品検索はYahoo!ショッピングの商品検索APIを使い、ページを無断で収集する方法は使っていません。表示にはYahoo! JAPANのクレジットを出しています。
      </p>
      <p>
        この表示についての連絡は
        <a href="mailto:petokaku@outlook.jp" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
        です。運営者は、ペトカク運営事務局です。関連する説明は
        <Link href="/privacy" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          プライバシーポリシー
        </Link>
        にもあります。
      </p>
    </InfoArticle>
  );
}
