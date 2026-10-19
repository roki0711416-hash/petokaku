import type { Metadata } from "next";
import Link from "next/link";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "ペトカクが扱う情報、Googleアナリティクス、Cookie、予定している広告配信、お問い合わせの説明です。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoArticle
      title="プライバシーポリシー"
      path="/privacy"
      lead="ペトカク運営事務局が、このサイトで実際に扱う情報と、広告配信の準備状況を説明します。2026年10月19日に更新しました。"
    >
      <h2>取得する情報</h2>
      <p>会員登録、ログイン、問い合わせフォームはありません。氏名、住所、電話番号を、このサイトの入力欄からサーバーへ送る機能はありません。</p>
      <p>商品を検索すると、検索語はページのURLに入り、掲載を取得するためにペトカクのサーバーへ送られます。サーバーはその語でYahoo!ショッピングの商品検索を呼び出します。</p>
      <p>
        JANコードの商品ページを開くと、接続できる場合に限り、そのJANコード、表示した価格、送料、在庫、ショップ名、商品URLを価格の記録として残そうとします。閲覧回数も、JANコード単位で残そうとします。これらは利用者の氏名とは結びつけていません。データベースへ接続できないときは記録せず、価格の比較は表示したままにします。
      </p>
      <p>動作確認用の架空商品の一覧と商品ページは、公開していません。公開中のページでは、その商品IDをブラウザへ保存する処理は動きません。</p>
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
        アクセス解析の選択は、ブラウザのlocalStorageと、Cookie「petokaku.cookie-choice」に保存します。このCookieは設定を覚えるためのもので、解析そのものではありません。解析を受け入れたあとは、GoogleアナリティクスがCookieを使うことがあります。
      </p>
      <h2>広告配信（Google AdSense）</h2>
      <p>
        サイト所有権の確認のため、Google AdSenseのローダースクリプト（pagead2.googlesyndication.com）を全ページで読み込みます。現時点では広告ユニットや自動広告の表示設定は入れておらず、画面上に広告枠は出していません。スクリプト読み込みに伴い、Google側がCookie等を使う場合があります。
      </p>
      <p>広告の配信やパーソナライズについては、次のとおりです。</p>
      <ul>
        <li>Googleなどの第三者配信事業者がCookieを使用して、利用者がこのサイトや他のサイトに過去にアクセスした際の情報に基づいて広告を配信することがあります。</li>
        <li>Googleが広告Cookieを使用することにより、利用者がこのサイトや他のサイトにアクセスした際の情報に基づいて、Googleおよびそのパートナーが適切な広告を表示できるようになる場合があります。</li>
        <li>
          パーソナライズド広告を無効にするときは、
          <a href="https://adssettings.google.com/" className="mx-1 font-medium text-forest-deep underline underline-offset-4" target="_blank" rel="noopener noreferrer">
            Googleの広告設定
          </a>
          を開いてください。第三者配信事業者のCookieによるパーソナライズド広告を無効にする案内は、
          <a href="https://www.aboutads.info/" className="mx-1 font-medium text-forest-deep underline underline-offset-4" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
          にもあります。
        </li>
      </ul>
      <p>
        Googleが、Googleのサービスを使うサイトから得た情報をどのように扱うかは、
        <a
          href="https://policies.google.com/technologies/partner-sites"
          className="mx-1 font-medium text-forest-deep underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          Googleの説明
        </a>
        に書かれています。第三者の広告ネットワークを追加で使う場合は、その事業者名と案内へのリンクを、このポリシーに追記します。
      </p>
      <p>
        楽天市場、Yahoo!ショッピング、Amazonの購入リンクのうち、確認できたアフィリエイトリンクだけを広告として表示します。報酬の有無で、表示する価格を作り替えることはしません。詳しくは
        <Link href="/affiliate" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          広告・アフィリエイト
        </Link>
        です。
      </p>
      <h2>外部サービスへの情報送信</h2>
      <p>
        検索語は、掲載取得のためにYahoo!ショッピングの商品検索APIへ送られます。解析を受け入れたときのページ情報はGoogleへ送られます。AdSenseのローダースクリプト読み込みに伴い、広告の配信や測定のためにGoogleなどの第三者へ情報が送られる場合があります。ショップのリンクを開いたあとの情報は、その販売店が扱います。
      </p>
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
