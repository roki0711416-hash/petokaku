import type { Metadata } from "next";
import Link from "next/link";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "ペトカクが扱う情報、Googleアナリティクス、Cookie、お問い合わせの説明です。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoArticle
      title="プライバシーポリシー"
      path="/privacy"
      lead="ペトカク運営事務局が、このサイトで実際に扱う情報を説明します。2026年10月10日の実装に合わせています。"
    >
      <h2>取得する情報</h2>
      <p>会員登録、ログイン、問い合わせフォームはありません。氏名、住所、電話番号を、このサイトの入力欄からサーバーへ送る機能はありません。</p>
      <p>商品を検索すると、検索語はページのURLに入り、掲載を取得するためにペトカクのサーバーへ送られます。サーバーはその語でYahoo!ショッピングの商品検索を呼び出します。</p>
      <p>
        JANコードの商品ページを開くと、接続できる場合に限り、そのJANコード、表示した価格、送料、在庫、ショップ名、商品URLを価格の記録として残そうとします。閲覧回数も、JANコード単位で残そうとします。これらは利用者の氏名とは結びつけていません。データベースへ接続できないときは記録せず、価格の比較は表示したままにします。
      </p>
      <p>
        動作確認用の商品ページを開くと、その商品IDを、見ているブラウザのlocalStorage（petokaku.recentProductIds）に保存することがあります。ペトカクのサーバーへは送りません。この一覧をページに出す機能は、現在は表示していません。
      </p>
      <h2>利用目的</h2>
      <p>検索語は、販売店の掲載を表示するために使います。JANコードと価格の記録は、同じ商品の価格の経過を見るために使います。アクセス解析は、どのページが開かれたかを知るために、利用者が許可したときだけ使います。</p>
      <h2>お問い合わせ情報</h2>
      <p>
        連絡は
        <a href="mailto:petokaku@outlook.jp" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
        へのメールです。リンクを開くと、お使いのメールソフトが起動します。ペトカクのサーバーが、このページからメッセージを受け取ることはありません。メールの本文は、利用者が送った範囲で、返信とサイト運営のために使います。
      </p>
      <h2>Googleアナリティクス4</h2>
      <p>
        測定IDが設定され、かつ利用者がアクセス解析を受け入れたときだけ、Googleアナリティクス4を読み込みます。拒否しているとき、および測定IDがない環境では、タグは読み込みません。読み込む場合、閲覧したページのURLなどをGoogleへ送ります。詳しい切り替えは
        <Link href="/cookies" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          Cookie設定
        </Link>
        です。
      </p>
      <h2>Cookie等の識別子</h2>
      <p>
        アクセス解析の選択は、ブラウザのlocalStorageと、Cookie「petokaku.cookie-choice」に保存します。このCookieは設定を覚えるためのもので、解析そのものではありません。解析を受け入れたあとは、GoogleアナリティクスがCookieを使うことがあります。広告の成果を測るCookieは、現在使っていません。
      </p>
      <h2>外部サービスへの情報送信</h2>
      <p>検索語は、掲載取得のためにYahoo!ショッピングの商品検索APIへ送られます。解析を受け入れたときのページ情報はGoogleへ送られます。ショップのリンクを開いたあとの情報は、その販売店が扱います。</p>
      <h2>保存期間と管理方法</h2>
      <p>
        Cookieの選択は、保存から最長1年です。ブラウザの保存データを消せば、localStorageの商品IDと選択も消えます。価格の記録に、自動で消す期限は設けていません。データベースの接続情報はサーバー側に置き、ブラウザへは渡しません。
      </p>
      <h2>利用者の権利とお問い合わせ先</h2>
      <p>
        ご自身に関する情報の開示、訂正、削除を求めるときは、ペトカク運営事務局（
        <a href="mailto:petokaku@outlook.jp" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
        ）へメールしてください。JANコード単位の価格記録は、利用者個人のアカウントとは結びついていないため、メールの内容から対象を特定できないことがあります。
      </p>
    </InfoArticle>
  );
}
