import Script from "next/script";

// AdSenseサイト確認用。広告ユニットや自動広告の設定はここでは行わない。
const adsenseClient = "ca-pub-6861979311690077";

export function AdSenseScript() {
  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
