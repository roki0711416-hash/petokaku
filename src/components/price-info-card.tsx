import { formatYen } from "@/lib/format";
import { priceInfoView, type PriceInfoOffer, type PriceInfoView } from "@/lib/pricing/price-info-view";
import type { PriceHistorySummary } from "@/lib/pricing/price-history-summary";

function PriceFigure({ label, value, note, primary }: { label: string; value: number | null; note?: string | null; primary?: boolean }) {
  return (
    <div>
      <p className={primary ? "text-sm font-bold text-forest-deep" : "text-xs font-bold text-muted"}>{label}</p>
      {value != null ? (
        <p className={`price-num mt-1 leading-none ${primary ? "text-4xl" : "text-2xl"}`}>{formatYen(value)}</p>
      ) : (
        <p className="mt-1 text-sm text-muted">送料が分かるショップがありません</p>
      )}
      {value != null && note ? <p className="mt-1 text-xs leading-5 font-bold">{note}</p> : null}
    </div>
  );
}

function HistoryBlock({ history, framed }: { history: PriceInfoView["history"]; framed: boolean }) {
  if (history.kind === "hidden") {
    return null;
  }
  return (
    <div className={framed ? "mt-3 border-t border-line pt-3" : ""}>
      <p className="text-sm font-bold text-forest-deep">{history.title}</p>
      {history.kind === "accumulating"
        ? history.lines.map((line) => (
            <p key={line} className="text-sm leading-6 text-muted">
              {line}
            </p>
          ))
        : null}
      {history.kind === "reference" ? <p className="text-sm leading-6 text-muted">{history.note}</p> : null}
      {history.kind !== "accumulating" && history.stats.length > 0 ? (
        <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {history.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-muted">{stat.label}</dt>
              <dd className="font-bold">{formatYen(stat.value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {history.kind === "comparable"
        ? history.lines.map((line) => (
            <p key={line} className="text-sm leading-6">
              {line}
            </p>
          ))
        : null}
    </div>
  );
}

export function PriceInfoCard({
  summary,
  offers,
  placement = "all",
}: {
  summary: PriceHistorySummary | null;
  offers: PriceInfoOffer[];
  placement?: "all" | "prices" | "history";
}) {
  const view = priceInfoView({ summary, offers });
  const showPrices = placement !== "history";
  const showHistory = placement !== "prices";
  if (showPrices && view.shippingTotal == null && view.sellingPrice == null && (!showHistory || view.history.kind === "hidden")) {
    return null;
  }
  if (!showPrices && view.history.kind === "hidden") {
    return null;
  }
  const shippingReady = view.shippingTotal != null;
  return (
    <section aria-labelledby={placement === "history" ? "price-history-heading" : "price-info-heading"} className="mt-8">
      <h2 id={placement === "history" ? "price-history-heading" : "price-info-heading"} className="text-lg font-bold">
        {placement === "history" ? "価格の記録" : "いまの価格"}
      </h2>
      <div className="mt-2 rounded-2xl border border-line bg-card px-4 py-4">
        {showPrices ? (
          <div className={`grid gap-4 ${shippingReady ? "md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-end" : ""}`}>
            {shippingReady ? (
              <PriceFigure label="送料込み最安" value={view.shippingTotal} note="送料が分かるショップの支払総額" primary />
            ) : null}
            {view.sellingPrice != null ? (
              <PriceFigure label="商品価格" value={view.sellingPrice} note={view.sellingNote} primary={!shippingReady} />
            ) : null}
            {shippingReady ? null : <p className="text-sm text-muted">送料が分かるショップがないため、送料込み最安は出していません。</p>}
          </div>
        ) : null}
        {showHistory ? <HistoryBlock history={view.history} framed={showPrices} /> : null}
      </div>
    </section>
  );
}
