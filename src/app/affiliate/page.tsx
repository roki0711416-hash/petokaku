import type { Metadata } from "next";
import Link from "next/link";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "広告・アフィリエイト",
  description: "楽天市場の購入リンクは、APIのアフィリエイトURLがあるときだけ広告です。無いときは通常の商品ページを開きます。",
  alternates: { canonical: "/affiliate" },
};

export default function AffiliatePage() {
  return (
    <InfoArticle
      title="広告・アフィリエイト"
      path="/affiliate"
      lead="楽天市場の購入リンクは、楽天のAPIがアフィリエイトURLを返したときだけ成果報酬のリンクです。返らないときは通常の商品ページを開きます。"
    >
      <h2>広告・アフィリエイトの仕組み</h2>
      <p>
        アフィリエイトは、利用者があるリンクから販売店へ進み、その店で購入などが成立したときに、サイト運営者が報酬を受け取ることがある仕組みです。楽天市場では、楽天ウェブサービスが返す正規のアフィリエイトURLだけを購入ボタンに使います。Yahoo!ショッピングの販売店リンクは、各ショップの商品ページです。バリューコマースの提携コードは使っていません。
      </p>
      <h2>成果報酬と価格の関係</h2>
      <p>報酬の有無で、取得できなかった金額を別の数字で埋めることはしません。比較に出す価格、送料、在庫は、取得できた販売店の掲載です。報酬のために順位を作り替える処理も、現在はありません。</p>
      <h2>広告リンクの識別</h2>
      <p>
        楽天の正規アフィリエイトURLが入ったリンクだけを、アフィリエイトリンクとして開きます。そのリンクの近くには「広告」と出し、rel属性にsponsoredを付けます。URLが無いときや、楽天のアフィリエイトURLでないときは、通常の商品ページを開き、「広告」とは出しません。Yahoo!ショッピングの検索結果も、現在はアフィリエイトリンクではありません。
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
