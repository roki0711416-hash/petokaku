import Script from "next/script";
import { adsensePublisherId } from "@/lib/adsense";

// ローダーだけを置く。広告ユニットの push は各ページの AdSenseUnit が行う。
export function AdSenseScript() {
  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisherId}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
