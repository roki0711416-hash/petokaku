import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "ペトカク運営事務局への連絡先です。",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <InfoArticle
      title="お問い合わせ"
      path="/contact"
      lead="サイトについての連絡は、メールで受け付けています。入力フォームは置いていません。"
    >
      <p>運営者は、ペトカク運営事務局です。</p>
      <p>
        <a href="mailto:petokaku@outlook.jp" className="font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
      </p>
      <p>このリンクを開くと、お使いのメールソフトが起動します。ペトカクのサーバーが、このページからメッセージを受け取ることはありません。</p>
      <p>価格や在庫についての質問は、各販売店に確認してください。検索結果の金額は取得時点の掲載で、その後に変わることがあります。</p>
    </InfoArticle>
  );
}
