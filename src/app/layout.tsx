import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
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
    default: "ペトカク | ペット用品の価格を、かんたん比較",
    template: "%s | ペトカク",
  },
  description:
    "犬・猫などの用品を、ショップごとの価格と送料で見比べるサイトです。表示は取得時点の掲載です。購入前にショップで確認してください。",
  applicationName: "ペトカク",
  robots: robotsMetadata(),
  openGraph: {
    siteName: "ペトカク",
    locale: "ja_JP",
    type: "website",
    title: "ペトカク | ペット用品の価格を、かんたん比較",
    description: "犬・猫などの用品を、ショップごとの価格と送料で見比べるサイトです。購入前にショップで確認してください。",
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
      </body>
    </html>
  );
}
