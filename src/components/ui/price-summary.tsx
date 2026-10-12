import { formatYen } from "@/lib/format";

export function PriceSummary({ lowestPrice, shopCount }: { lowestPrice: number | null; shopCount: number }) {
  return (
    <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 rounded-2xl bg-forest px-4 py-4 text-white sm:px-5">
      <div className="min-w-0">
        <p className="text-xs tracking-wide text-white/80">確認できた最安値</p>
        <p className="price-num mt-1 text-4xl leading-none sm:text-5xl">{lowestPrice == null ? "情報なし" : formatYen(lowestPrice)}</p>
      </div>
      <p className="text-sm text-white/90">
        <span className="price-num text-3xl text-white">{shopCount}</span>
        <span className="ml-1">ショップで比較</span>
      </p>
    </div>
  );
}
