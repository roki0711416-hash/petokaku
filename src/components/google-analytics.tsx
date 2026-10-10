"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { googleAnalyticsId } from "@/lib/analytics";
import { readClientAnalyticsChoice, type AnalyticsChoice } from "@/lib/consent-client";

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
  const [choice, setChoice] = useState<AnalyticsChoice | null>(null);

  useEffect(() => {
    const sync = () => setChoice(readClientAnalyticsChoice());
    sync();
    window.addEventListener("petokaku-consent", sync);
    return () => window.removeEventListener("petokaku-consent", sync);
  }, []);

  useEffect(() => {
    if (choice !== "granted" || !measurementId) {
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer?.push(arguments);
      };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view:false });
    if (!document.getElementById("ga4-src")) {
      const script = document.createElement("script");
      script.id = "ga4-src";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
    });
  }, [choice, measurementId, pagePath]);

  return null;
}
