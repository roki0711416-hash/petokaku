// サイト所有権確認と同じパブリッシャーID。広告ユニットもこれを data-ad-client に使う。
export const adsensePublisherId = "ca-pub-6861979311690077";

// 表示前に高さを確保し、広告の読み込みで本文が下がらないようにする。
export const adSlotMinHeightPx = 280;

const slotPattern = /^\d{6,20}$/;

export function presentAdSlot(raw: string | null | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!slotPattern.test(value)) {
    return null;
  }
  return value;
}

export function adsenseProductSlot(raw = process.env.NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT): string | null {
  return presentAdSlot(raw);
}

export function adsenseListSlot(raw = process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIST): string | null {
  return presentAdSlot(raw);
}

export function adsenseArticleSlot(raw = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE): string | null {
  return presentAdSlot(raw);
}

// 見出しの直前に置く。短すぎる記事、商品カードの直前、末尾にくっつく位置は避ける。
export function articleMidAdBeforeIndex(blocks: readonly { type: string }[]): number | null {
  if (blocks.length < 6) {
    return null;
  }
  const headings = blocks.flatMap((block, index) => (block.type === "h2" ? [index] : []));
  const lower = Math.floor(blocks.length * 0.35);
  const upper = Math.ceil(blocks.length * 0.7);
  const inBand = headings.filter((index) => index >= lower && index <= upper);
  const pool = (inBand.length > 0 ? inBand : headings).filter((index) => {
    if (index < 2 || index > blocks.length - 3) {
      return false;
    }
    return blocks[index - 1]?.type !== "products" && blocks[index]?.type !== "products";
  });
  const target = Math.floor(blocks.length / 2);
  return pool.reduce<number | null>((best, index) => {
    if (best == null || Math.abs(index - target) < Math.abs(best - target)) {
      return index;
    }
    return best;
  }, null);
}
