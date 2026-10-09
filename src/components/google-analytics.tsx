"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { googleAnalyticsId } from "@/lib/analytics";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function GoogleAnalytics() {
  const measurementId = googleAnalyticsId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const pagePath = query.length > 0 ? `${pathname}?${query}` : pathname;

  useEffect(() => {
    if (!measurementId) {
      return;
    }
    window.gtag?.("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
    });
  }, [measurementId, pagePath]);

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script id="ga4-init" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{send_page_view:false});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    </>
  );
}
