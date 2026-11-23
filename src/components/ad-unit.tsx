"use client";

import { useEffect, useRef } from "react";
import { adSlotMinHeightPx, adsenseArticleSlot, adsenseListSlot, adsenseProductSlot, adsensePublisherId } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: Record<string, never>[];
  }
}

// 解析Cookieでは止めない。AdSenseのローダーと同じく、スロットIDがあるときだけ出す。
export function AdSenseUnit({ slot, className }: { slot: string | null; className?: string }) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const ins = insRef.current;
    if (!slot || !ins) {
      return;
    }
    if (ins.dataset.adPushed === "1" || ins.dataset.adsbygoogleStatus) {
      return;
    }

    // 画面遷移やStrict Modeで外れた要素にはpushしない。マウント中の1回だけ。
    const timer = window.setTimeout(() => {
      if (!ins.isConnected || ins.dataset.adPushed === "1" || ins.dataset.adsbygoogleStatus) {
        return;
      }
      ins.dataset.adPushed = "1";
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // 二重pushは後続の枠を止める。同じ要素ではやり直さない。
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [slot]);

  if (!slot) {
    return null;
  }

  return (
    <aside aria-label="広告" className={`mt-8 min-w-0 ${className ?? ""}`.trim()}>
      <p className="text-xs font-medium text-muted">広告</p>
      <div className="mt-1" style={{ minHeight: adSlotMinHeightPx }}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", minHeight: adSlotMinHeightPx }}
          data-ad-client={adsensePublisherId}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      <p className="mt-1 text-xs text-muted">スポンサーリンク</p>
    </aside>
  );
}

export function ProductAdUnit({ className }: { className?: string }) {
  return <AdSenseUnit slot={adsenseProductSlot()} className={className} />;
}

export function ListAdUnit({ className }: { className?: string }) {
  return <AdSenseUnit slot={adsenseListSlot()} className={className} />;
}

export function ArticleAdUnit({ className }: { className?: string }) {
  return <AdSenseUnit slot={adsenseArticleSlot()} className={className} />;
}
