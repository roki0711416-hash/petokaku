import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "ペトカクが扱う情報と、扱っていない情報の説明です。",
};

export default function PrivacyPage() {
  return (
    <InfoArticle
      title="プライバシーポリシー"
      path="/privacy"
      lead="ペトカク運営事務局が、このサイトで扱う情報を説明します。"
    >
      <p>会員登録、ログイン、問い合わせフォームはありません。名前やメールアドレスを、このサイトの入力欄からサーバーへ送る機能はありません。</p>
      <p>
        お問い合わせは
        <a href="mailto:petokaku@outlook.jp" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
        へのメールです。リンクを開くと、お使いのメールソフトが起動します。
      </p>
      <p>商品を検索すると、検索語はページのURLに入り、販売店の掲載を取るためにサーバーへ送られます。サーバーは、その語でYahoo!ショッピングの商品検索を呼び出します。</p>
      <p>
        動作確認用の商品ページを開くと、その商品IDを、見ているブラウザの中だけに保存することがあります。ペトカクのサーバーへは送りません。ブラウザの保存データを消すと、この記録も消えます。
      </p>
      <p>
        販売店の商品ページを開くと、サーバーはそのJANコードと、表示した価格を価格の記録として残そうとします。データベースへ接続できないときは記録せず、価格の比較は表示したままにします。
      </p>
      <p>
        測定IDを設定しているときは、サイトの利用状況を知るためにGoogleアナリティクス4を読み込みます。GoogleアナリティクスはCookieなどを使い、閲覧したページの情報をGoogleへ送ります。送られた情報の扱いは、Googleの定めによります。測定IDが無い環境では、このタグは読み込みません。
      </p>
      <p>広告の成果を測るタグは入れていません。販売店へのリンクは、現在は各ショップの商品ページです。</p>
      <p>ショップのページへ移動したあとの情報の扱いは、その販売店の定めによります。</p>
    </InfoArticle>
  );
}
