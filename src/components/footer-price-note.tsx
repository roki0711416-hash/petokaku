"use client";

import { usePathname } from "next/navigation";
import { isLiveStorePath, isSampleCatalogPath } from "@/lib/live-path";

export function FooterPriceNote() {
  const pathname = usePathname();
  const liveProduct = isLiveStorePath(pathname);
  const sampleCatalog = isSampleCatalogPath(pathname);
  const note = sampleCatalog
    ? "いま表示している価格はサンプルです。"
    : liveProduct
      ? "このページは、販売店の掲載情報です。"
      : "販売店の検索結果は、取得時点の掲載です。";

  return (
    <p className="mt-3 text-sm leading-7 text-muted">
      ペット用品の価格を、かんたん比較。{note}{" "}
      <a href="https://developer.yahoo.co.jp/sitemap/" className="underline underline-offset-4">
        Webサービス by Yahoo! JAPAN
      </a>
    </p>
  );
}
