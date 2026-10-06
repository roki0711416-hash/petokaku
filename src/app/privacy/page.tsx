import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "ペトカクが現時点で扱う情報の下書きです。公開前に内容の確認が必要です。",
};

export default function PrivacyPage() {
  return (
    <InfoArticle
      title="プライバシーポリシー"
      path="/privacy"
      lead="現時点のペトカクで、ブラウザに残る情報と、残さない情報をまとめた下書きです。"
      draft
    >
      <p>会員登録、ログイン、問い合わせフォームはありません。名前やメールアドレスをサーバーへ送る機能は、まだありません。</p>
      <p>
        動作確認用の商品ページを開くと、そのブラウザの中だけに商品IDを保存することがあります。ペトカクのサーバーへは送りません。ブラウザの保存データを消すと、この記録も消えます。
      </p>
      <p>アクセス解析や広告の計測は、まだ入れていません。計測を始めるときは、このページの内容も合わせて更新する必要があります。</p>
      <p>公開前に、個人情報保護法と、実際に使う外部サービスの規約を確認してください。</p>
    </InfoArticle>
  );
}
