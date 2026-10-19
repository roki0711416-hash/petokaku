import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettings } from "@/components/cookie-consent";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "Cookie設定",
  description: "ペトカクのCookie、アクセス解析の設定、導入を予定している広告Cookieの説明です。",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <InfoArticle
      title="Cookie設定"
      path="/cookies"
      lead="解析のCookieは、受け入れるまで読み込みません。広告の配信は、現在は開始していません。2026年10月19日に更新しました。"
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
      <p>現時点では、Google AdSenseの広告は配信していません。広告配信のタグは読み込んでおらず、広告用のCookieも置いていません。広告Cookieのオンとオフの設定もありません。</p>
      <p>
        Google AdSenseの導入を予定しています。導入後は、Googleなどの第三者配信事業者がCookieを使い、利用者がこのサイトや他のサイトに過去にアクセスした際の情報に基づいて広告を配信する場合があります。Googleの広告Cookieにより、Googleおよびそのパートナーが適切な広告を表示できるようになる場合もあります。パーソナライズを止めるときは
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
