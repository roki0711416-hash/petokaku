"use client";

import { useState } from "react";

// 商品詳細と同じくYahoo画像は next/image を使わない。
// Vercelの画像最適化は Content-Disposition: attachment を付けることがあり、
// iPhone Safari ではインライン表示に失敗して空欄になる。
export function ArticleProductThumb({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = src != null && !failed;

  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-card sm:h-[4.5rem] sm:w-[4.5rem]">
      {showImage ? (
        // Yahooの画像は商品詳細と同様に素のimgを使う（next/image最適化のattachment応答がSafariで失敗するため）
        <img
          src={src}
          alt={alt}
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="px-1 text-center text-[10px] leading-3 text-muted">画像なし</span>
      )}
    </div>
  );
}
