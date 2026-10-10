import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { Suspense } from "react";
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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "ペット用品の価格比較",
    template: "%s | ペトカク",
  },
  description: "ドッグフード、キャットフード、猫砂などの価格をかんたん比較。商品名やJANコードから、購入先を探せます。",
  applicationName: "ペトカク",
  robots: robotsMetadata(),
  openGraph: {
    siteName: "ペトカク",
    locale: "ja_JP",
    type: "website",
    title: "ペット用品の価格比較 | ペトカク",
    description: "ドッグフード、キャットフード、猫砂などの価格をかんたん比較。商品名やJANコードから、購入先を探せます。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${fraunces.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <NoticeBar />
        <SampleBanner unexpected={getPriceMode() === "unexpected"} />
        <SiteHeader />
        <main id="main" className="flex-1">
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
