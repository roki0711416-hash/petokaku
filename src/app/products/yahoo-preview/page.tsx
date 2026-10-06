import type { Metadata } from "next";
import Link from "next/link";
import { YahooProductView } from "@/components/yahoo-product-view";
import { loadYahooPreviewCase, type YahooPreviewCase } from "@/lib/sources/yahoo/preview";
import { privateRobots } from "@/lib/site";

export const dynamic = "force-dynamic";

type YahooPreviewPageProps = {
  searchParams: Promise<{ case?: string }>;
};

function previewCaseFrom(value: string | undefined): YahooPreviewCase {
  if (value === "litter" || value === "sheets") {
    return value;
  }
  return "dog";
}

export const metadata: Metadata = {
  title: "販売店の商品",
  description: "販売店から取得した1商品の価格です。サンプル商品ではありません。",
  robots: privateRobots(),
};

export default async function YahooPreviewPage({ searchParams }: YahooPreviewPageProps) {
  const query = await searchParams;
  const result = await loadYahooPreviewCase(previewCaseFrom(query.case));

  if (!result.ok) {
    return (
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">商品を表示できません</h1>
        <p className="mt-4 leading-8 text-muted">
          {result.reason === "not-configured"
            ? "販売店への接続情報が、サーバーに設定されていません。"
            : result.reason === "no-jan"
              ? "この商品のJANコードを取得できなかったため、ショップをまとめて比較できません。"
              : "販売店の商品を取得できませんでした。しばらくしてから、もう一度開いてください。"}
        </p>
        <p className="mt-6">
          <Link href="/products" className="font-bold text-forest-deep underline-offset-4 hover:underline">
            サンプルの商品一覧へ
          </Link>
        </p>
      </article>
    );
  }

  return <YahooProductView product={result.adapted.detail} pageHref="/products/yahoo-preview" />;
}
