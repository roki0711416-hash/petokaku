"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { googleAnalyticsId, pageViewToSend } from "@/lib/analytics";
import { readClientAnalyticsChoice, type AnalyticsChoice } from "@/lib/consent-client";

let installedMeasurementId: string | null = null;
let lastReportedPagePath: string | null = null;

// config は同意後に1回だけ。自動 page_view は出さず、パスが変わったときだけ手で送る。
function installGoogleAnalytics(measurementId: string) {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // gtag の公式スニペットと同じく、配列ではなく arguments を積む。
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  if (installedMeasurementId === measurementId) {
    return;
  }
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view:false });
  if (!document.getElementById("ga4-src")) {
    const script = document.createElement("script");
    script.id = "ga4-src";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }
  installedMeasurementId = measurementId;
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
    installGoogleAnalytics(measurementId);
    const id = measurementId;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled || !window.gtag) {
        return;
      }
      const nextPath = pageViewToSend(lastReportedPagePath, pagePath);
      if (!nextPath) {
        return;
      }
      lastReportedPagePath = nextPath;
      const title = document.title.trim();
      window.gtag("event", "page_view", {
        page_path: nextPath,
        page_location: window.location.href,
        ...(title ? { page_title: title } : {}),
        send_to: id,
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [choice, measurementId, pagePath]);

  return null;
}
