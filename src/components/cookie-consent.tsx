"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { googleAnalyticsId } from "@/lib/analytics";
import { applyAnalyticsChoice, readClientAnalyticsChoice, type AnalyticsChoice } from "@/lib/consent-client";

export function CookieBanner() {
  const titleId = useId();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!googleAnalyticsId()) {
      return;
    }
    setVisible(readClientAnalyticsChoice() == null);
  }, []);

  if (!visible) {
    return null;
  }

  function choose(choice: AnalyticsChoice) {
    applyAnalyticsChoice(choice);
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card px-4 py-4 shadow-[0_-8px_24px_rgba(38,43,39,0.06)]" role="dialog" aria-labelledby={titleId}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p id={titleId} className="text-sm font-medium text-ink">
            アクセス解析のCookie
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            サイトの利用状況を知るため、許可したときだけGoogleアナリティクス4を読み込みます。拒否しても、価格比較は使えます。
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/cookies" className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm text-ink underline-offset-4 hover:underline">
            設定を見る
          </Link>
          <button type="button" className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-paper px-4 text-sm text-ink" onClick={() => choose("denied")}>
            拒否する
          </button>
          <button type="button" className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-4 text-sm text-white hover:bg-forest-deep" onClick={() => choose("granted")}>
            受け入れる
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettings() {
  const analyticsReady = googleAnalyticsId() != null;
  const [choice, setChoice] = useState<AnalyticsChoice>("denied");
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setChoice(readClientAnalyticsChoice() ?? "denied");
    setReady(true);
  }, []);

  function save() {
    applyAnalyticsChoice(choice);
    setSaved(true);
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <fieldset className="rounded-3xl border border-line bg-card px-5 py-5" disabled={!ready}>
        <legend className="text-base font-medium text-ink">アクセス解析</legend>
        <p className="mt-2 text-sm leading-7 text-muted">
          {analyticsReady
            ? "受け入れると、このブラウザでGoogleアナリティクス4を読み込みます。拒否すると、タグは読み込みません。"
            : "この環境には測定IDがないため、どちらを選んでも解析タグは読み込みません。選択だけ保存します。"}
        </p>
        <div className="mt-4 grid gap-2">
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="radio" name="analytics" value="granted" checked={choice === "granted"} onChange={() => setChoice("granted")} />
            受け入れる
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="radio" name="analytics" value="denied" checked={choice === "denied"} onChange={() => setChoice("denied")} />
            拒否する
          </label>
        </div>
      </fieldset>
      <p className="text-sm leading-7 text-muted">広告の成果を測るCookieは、現在使っていません。切り替える項目はありません。</p>
      <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-sm text-white hover:bg-forest-deep sm:w-auto">
        設定を保存する
      </button>
      {saved ? <p className="text-sm text-forest">保存しました。</p> : null}
    </form>
  );
}
