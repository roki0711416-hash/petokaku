import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "広告・アフィリエイトに関する表示",
  description: "ペトカクの販売店リンクは、現在アフィリエイトリンクではありません。",
};

export default function AffiliatePage() {
  return (
    <InfoArticle
      title="広告・アフィリエイトに関する表示"
      path="/affiliate"
      lead="現在の販売店へのリンクは、各ショップの商品ページです。アフィリエイトリンクにはしていません。"
    >
      <p>
        広告の配信タグや、成果を測る計測タグは入れていません。サイトの利用状況は、測定IDを設定したときだけGoogleアナリティクス4で見ます。
      </p>
      <p>
        販売ページへのリンクをアフィリエイトリンクにする場合は、リンクの近くに「広告」と表示します。リンクであることを隠して、通常の記事のように見せる掲載はしません。
      </p>
      <p>報酬の有無で、取得できなかった金額を別の数字で埋めることはしません。表示は取得時点の掲載です。</p>
      <p>
        この表示についての連絡は
        <a href="mailto:petokaku@outlook.jp" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
        です。運営者は、ペトカク運営事務局です。
      </p>
    </InfoArticle>
  );
}
