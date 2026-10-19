import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { Suspense } from "react";
import { AdSenseScript } from "@/components/adsense-script";
import { CookieBanner } from "@/components/cookie-consent";
import { GoogleAnalytics } from "@/components/google-analytics";
import { NoticeBar } from "@/components/notice-bar";
import { SampleBanner } from "@/components/sample-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, robotsMetadata } from "@/lib/site";
import { getPriceMode } from "@/lib/sources/status";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

const siteDescription =
  "ドッグフード・キャットフード・猫砂・ペットシーツ・キャットタワーなどの価格を比較。複数ショップからお得な商品を探せます。";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "ペット用品の価格比較",
    template: "%s | ペトカク",
  },
  description: siteDescription,
  applicationName: "ペトカク",
  robots: robotsMetadata(),
  // AdSenseサイト所有権確認用（広告ユニットの設定ではない）
  other: {
    "google-adsense-account": "ca-pub-6861979311690077",
  },
  openGraph: {
    siteName: "ペトカク",
    locale: "ja_JP",
    type: "website",
    title: "ペトカク｜ペット用品の価格比較サイト",
    description: siteDescription,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${fraunces.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className="flex min-h-full flex-col">
        <AdSenseScript />
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <NoticeBar />
        <SampleBanner unexpected={getPriceMode() === "unexpected"} />
        <SiteHeader />
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
        <SiteFooter />
        <CookieBanner />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
