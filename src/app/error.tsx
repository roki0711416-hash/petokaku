"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <h1 className="text-3xl font-bold">ページを表示できませんでした</h1>
      <p className="mt-3 text-muted">読み込みで問題が起きました。時間をおいて、もう一度開いてください。</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => reset()} className="h-12 rounded-full bg-forest px-5 font-bold text-card">
          もう一度試す
        </button>
        <Link href="/" className="inline-flex h-12 items-center rounded-full border border-line bg-card px-5 font-bold">
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
