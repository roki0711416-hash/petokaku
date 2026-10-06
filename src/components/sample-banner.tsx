"use client";

import { usePathname } from "next/navigation";
import { isLiveStorePath, isSampleCatalogPath } from "@/lib/live-path";

export function SampleBanner({ unexpected }: { unexpected: boolean }) {
  const pathname = usePathname();
  const liveProduct = isLiveStorePath(pathname);
  const sampleCatalog = isSampleCatalogPath(pathname);

  if (!liveProduct && !sampleCatalog) {
    return null;
  }

  return (
    <div className="bg-forest-deep text-card">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-1.5 text-xs leading-5">
        <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-bold tracking-wide text-forest-deep">
          {liveProduct ? "販売店" : "サンプルデータ"}
        </span>
        <span>
          {liveProduct
            ? "表示中の価格は、取得時点の販売店の掲載です。購入前にショップで価格・送料・在庫を確認してください。"
            : "表示中の商品名・ショップ名・価格は、動作確認用の架空データです。実在する通販サイトの販売価格ではありません。"}
          {sampleCatalog && unexpected ? " 一部の画面は、まだサンプルの商品のままです。" : ""}
        </span>
      </p>
    </div>
  );
}
