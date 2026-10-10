import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettings } from "@/components/cookie-consent";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "Cookie設定",
  description: "ペトカクのCookieと、アクセス解析を受け入れるか拒否するかの設定です。",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <InfoArticle title="Cookie設定" path="/cookies" lead="解析のCookieは、受け入れるまで読み込みません。設定はこのブラウザに保存します。">
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
      <p>広告の成果を測るCookieや、広告配信のタグは、現在入れていません。そのため、広告Cookieのオンとオフはありません。</p>
      <p>
        取扱いの説明は
        <Link href="/privacy" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          プライバシーポリシー
        </Link>
        にもあります。
      </p>
    </InfoArticle>
  );
}
