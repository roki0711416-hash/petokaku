import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "広告・アフィリエイトに関する表示",
  description: "ペトカクの広告表示に関する下書きです。現在、アフィリエイトリンクは置いていません。",
};

export default function AffiliatePage() {
  return (
    <InfoArticle
      title="広告・アフィリエイトに関する表示"
      path="/affiliate"
      lead="商品紹介によって報酬を受け取る予定です。現在の販売店へのリンクは、アフィリエイトリンクにしていません。"
      draft
    >
      <p>
        将来、販売ページへのリンクをアフィリエイトリンクにする場合は、リンクの近くに「広告」と表示します。リンクであることを隠して、通常の記事のように見せる掲載はしません。
      </p>
      <p>報酬の有無で、取得できなかった金額を別の数字で埋めることはしません。表示は取得時点の掲載です。</p>
      <p>公開前に、景品表示法、ステルスマーケティングに関するルール、利用するアフィリエイトサービスの規約を確認してください。このページは、その確認が終わった文章ではありません。</p>
    </InfoArticle>
  );
}
