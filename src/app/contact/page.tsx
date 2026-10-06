import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "ペトカクへの連絡先は、まだ設定していません。",
};

export default function ContactPage() {
  return (
    <InfoArticle
      title="お問い合わせ"
      path="/contact"
      lead="連絡先は、まだ用意していません。送れない入力欄は置いていません。"
    >
      <p>運営に使うメールアドレスが決まったら、このページに案内を出します。決まるまでは、このページからメッセージを送ることはできません。</p>
      <p>価格や在庫についての質問は、各販売店に確認してください。検索結果の金額は取得時点の掲載で、その後に変わることがあります。</p>
    </InfoArticle>
  );
}
