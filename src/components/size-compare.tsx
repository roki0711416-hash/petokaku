import Link from "next/link";
import { productPath } from "@/lib/catalog";
import { formatUnitAmount, formatYen } from "@/lib/format";
import type { MoneyQuote } from "@/lib/pricing/calculate";
import type { ProductDetail } from "@/lib/types";

export type SizeCard = {
  product: ProductDetail;
  total: number | null;
  effectiveUnit: MoneyQuote | null;
  unitLabel: string | null;
  isBestUnitPrice: boolean;
  isCurrent: boolean;
};

export function SizeCompare({ items }: { items: SizeCard[] }) {
  if (items.length < 2) {
    return null;
  }

  return (
    <section aria-labelledby="size-compare-heading" className="mt-12">
      <h2 id="size-compare-heading" className="text-2xl font-bold">
        容量・サイズ違いを比較
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
        各容量について、送料込みで最も安い金額から単価を出しています。総額が一番安い容量とは限りません。
      </p>
      <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.product.id}
            className={`flex h-full flex-col rounded-[1.75rem] border bg-card p-5 ${
              item.isCurrent ? "border-forest" : "border-line"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {item.isBestUnitPrice ? (
                <p className="rounded-full bg-clay px-3 py-1 text-xs font-bold text-card">容量単価がお得</p>
              ) : null}
              {item.isCurrent ? <p className="rounded-full bg-moss px-3 py-1 text-xs font-bold text-forest-deep">表示中</p> : null}
            </div>
            <h3 className="mt-3 text-lg font-bold">{item.product.sizeLabel}</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">最安の送料込み</dt>
                <dd className="price-num text-2xl leading-none">{item.total == null ? "算出不可" : formatYen(item.total)}</dd>
              </div>
              <div className="rounded-2xl bg-moss px-3 py-3">
                <dt className="text-xs font-bold text-forest-deep">実質単価</dt>
                <dd className="price-num mt-1 text-2xl leading-none">
                  {item.effectiveUnit && item.unitLabel
                    ? formatUnitAmount(item.effectiveUnit, item.unitLabel)
                    : item.unitLabel
                      ? "送料不明のため算出できません"
                      : "単価情報なし"}
                </dd>
              </div>
            </dl>
            {item.isCurrent ? (
              <p className="mt-4 text-sm font-bold text-forest-deep">この容量を表示しています</p>
            ) : (
              <Link
                href={productPath(item.product)}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-4 text-sm font-bold text-card hover:bg-forest-deep"
              >
                この容量を見る
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
