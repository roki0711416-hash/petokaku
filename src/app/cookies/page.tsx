import Link from "next/link";
import { CookieSettings } from "@/components/cookie-consent";
import { InfoArticle } from "@/components/info-article";
import { shareMetadata } from "@/lib/seo/share-metadata";

export const metadata = shareMetadata({
  title: "Cookie設定",
  description: "ペトカクのCookie、アクセス解析、Google AdSenseの説明です。",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <InfoArticle
      title="Cookie設定"
      path="/cookies"
      lead="解析のCookieは、受け入れるまで読み込みません。AdSenseのスクリプトは全ページで読み込み、広告ユニットIDがあるページに表示広告を出します。2026年11月23日に更新しました。"
    >
      <h2>必須にあたるもの</h2>
      <p>
        このページで選んだ結果は、Cookie「petokaku.cookie-choice」と、ブラウザ内の保存領域に残します。サイトを表示するためだけに、これ以外のCookieをペトカクのプログラムが書き込むことはありません。
      </p>
      <h2>アクセス解析</h2>
      <p>
        受け入れると、Googleアナリティクス4がページのURLなどをGoogleへ送り、Cookieを使うことがあります。拒否すると、計測タグは読み込みません。拒否へ変えたときは、このブラウザに残っている解析用Cookieの削除も試み、ページを読み直します。すでにGoogle側へ送られた情報は、ペトカクから消しきれません。
      </p>
      <CookieSettings />
      <h2>広告</h2>
      <p>
        Google AdSenseのスクリプト（pagead2.googlesyndication.com）は、全ページで読み込みます。アクセス解析の受け入れ・拒否とは別に動き、このページに広告Cookieのオンとオフはありません。広告ユニットIDを設定しているとき、商品の価格比較の下、トップ・ペット・品目・検索の商品一覧のあと、記事の途中と末尾に表示広告を出します。IDがないときは枠を出しません。プライバシーポリシー、利用規約、広告・アフィリエイト、Cookie設定、ペトカクについて、お問い合わせ、サイトの使い方、記事一覧、エラーページには出しません。スクリプトと広告の読み込みに伴い、Google側がCookie等を使う場合があります。
      </p>
      <p>
        Googleなどの第三者配信事業者がCookieを使い、利用者がこのサイトや他のサイトに過去にアクセスした際の情報に基づいて広告を配信する場合があります。Googleの広告Cookieにより、Googleおよびそのパートナーが適切な広告を表示できるようになる場合もあります。パーソナライズを止めるときは
        <a href="https://adssettings.google.com/" className="mx-1 font-medium text-forest-deep underline underline-offset-4" target="_blank" rel="noopener noreferrer">
          Googleの広告設定
        </a>
        、または
        <a href="https://www.aboutads.info/" className="mx-1 font-medium text-forest-deep underline underline-offset-4" target="_blank" rel="noopener noreferrer">
          aboutads.info
        </a>
        を使ってください。Googleによる情報の利用は、
        <a
          href="https://policies.google.com/technologies/partner-sites"
          className="mx-1 font-medium text-forest-deep underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          Googleの説明
        </a>
        に書かれています。
      </p>
      <p>
        同じ説明は
        <Link href="/privacy" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          プライバシーポリシー
        </Link>
        にもあります。
      </p>
    </InfoArticle>
  );
}
