import { formatYen } from "@/lib/format";
import { shippingChartLabel, shippingChartSegments, type ShippingHistoryPresentation } from "@/lib/pricing/shipping-history";
import type { ChartValue } from "@/lib/pricing/price-chart";

function dayIndex(start: string, date: string): number {
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${date}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

function shortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function ShippingChartSvg({ points }: { points: ChartValue[] }) {
  const width = 320;
  const height = 112;
  const padX = 12;
  const padY = 14;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const start = points[0]?.date ?? "";
  const end = points.at(-1)?.date ?? start;
  const daySpan = Math.max(dayIndex(start, end), 1);
  const xFor = (date: string) => padX + (dayIndex(start, date) / daySpan) * (width - padX * 2);
  const yFor = (value: number) => padY + (1 - (value - min) / span) * (height - padY * 2);
  const segments = shippingChartSegments(points);
  const label = shippingChartLabel(points);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="h-28 w-full">
      <title>{label}</title>
      {segments.map((segment) =>
        segment.length > 1 ? (
          <polyline
            key={segment[0]?.date}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={segment.map((point) => `${xFor(point.date)},${yFor(point.value)}`).join(" ")}
          />
        ) : null,
      )}
      {points.map((point) => (
        <circle key={point.date} cx={xFor(point.date)} cy={yFor(point.value)} r="3.5" fill="currentColor">
          <title>{`${shortDate(point.date)} ${formatYen(point.value)}`}</title>
        </circle>
      ))}
    </svg>
  );
}

export function ShippingPriceHistoryView({
  view,
  recordedDays,
}: {
  view: ShippingHistoryPresentation;
  recordedDays?: number | null;
}) {
  if (!view.headline && !view.showChart) {
    return null;
  }
  const points = view.points;
  const first = points[0];
  const last = points.at(-1);
  const chartLabel = view.showChart ? shippingChartLabel(points) : null;

  return (
    <section aria-labelledby="shipping-history-heading" className="mt-4 min-w-0">
      <h2 id="shipping-history-heading" className="text-sm font-bold text-forest-deep">
        送料込み最安の記録
      </h2>
      {view.headline ? (
        <p className="mt-1 text-sm leading-6 text-ink">
          {view.total != null ? (
            <>
              <span className="font-bold">最安（送料込み）</span>
              <span className="price-num mx-1 align-middle text-xl font-semibold text-ink">{formatYen(view.total)}</span>
            </>
          ) : (
            <span className="text-muted">送料込みの最安は、送料が分かる在庫のある掲載がありません。</span>
          )}
          {view.asOfLabel ? <span className="text-muted">{view.total != null ? "　" : " "}{view.asOfLabel}</span> : null}
        </p>
      ) : null}
      {view.showChart && chartLabel ? (
        <div className="mt-2 max-w-md text-forest-deep">
          <ShippingChartSvg points={points} />
          {first && last ? (
            <p className="mt-1 flex justify-between gap-3 text-xs text-muted">
              <span>{shortDate(first.date)}</span>
              <span>{shortDate(last.date)}</span>
            </p>
          ) : null}
          <table className="sr-only">
            <caption>{chartLabel}</caption>
            <thead>
              <tr>
                <th scope="col">日付</th>
                <th scope="col">送料込み最安</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.date}>
                  <th scope="row">{point.date}</th>
                  <td>{formatYen(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="sr-only">
          {recordedDays != null && recordedDays < 2
            ? `価格の記録は${recordedDays}日分です。グラフは2日分以上になってから表示します。`
            : "グラフは2日分以上になってから表示します。"}
        </p>
      )}
    </section>
  );
}
