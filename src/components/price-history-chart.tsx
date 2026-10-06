"use client";

import { useState } from "react";
import { formatYen } from "@/lib/format";
import {
  chartHasOlderThan30Days,
  chartToday,
  chartWindowValues,
  consecutiveChartSegments,
  type ChartSourcePoint,
  type ChartValue,
} from "@/lib/pricing/price-chart";

function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dayIndex(start: string, date: string): number {
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${date}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

function ChartSvg({ points, start, days }: { points: ChartValue[]; start: string; days: number }) {
  const width = 320;
  const height = 120;
  const pad = 8;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const xFor = (date: string) => pad + (dayIndex(start, date) / Math.max(days - 1, 1)) * (width - pad * 2);
  const yFor = (value: number) => pad + (1 - (value - min) / span) * (height - pad * 2);
  const segments = consecutiveChartSegments(points);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="記録のある日の価格" className="mt-3 h-32 w-full">
      {segments.map((segment) =>
        segment.length > 1 ? (
          <polyline
            key={segment[0]?.date}
            fill="none"
            stroke="#24584a"
            strokeWidth="2"
            points={segment.map((point) => `${xFor(point.date)},${yFor(point.value)}`).join(" ")}
          />
        ) : null,
      )}
      {points.map((point) => (
        <circle key={point.date} cx={xFor(point.date)} cy={yFor(point.value)} r="3" fill="#17382f">
          <title>
            {point.date} {formatYen(point.value)}
          </title>
        </circle>
      ))}
    </svg>
  );
}

export function PriceHistoryChart({ points, now }: { points: ChartSourcePoint[]; now: string }) {
  const today = chartToday(now);
  const selling30 = chartWindowValues({ points, today, days: 30, mode: "selling" });
  const selling90 = chartWindowValues({ points, today, days: 90, mode: "selling" });
  const [days, setDays] = useState<30 | 90>(selling30.length >= 2 ? 30 : 90);
  const [mode, setMode] = useState<"selling" | "shipping">("selling");
  const selling = days === 30 ? selling30 : selling90;
  const shipping = chartWindowValues({ points, today, days, mode: "shipping" });
  const shown = mode === "shipping" && shipping.length >= 2 ? shipping : selling;
  if (selling90.length < 2 || shown.length < 2) {
    return null;
  }
  const start = addCalendarDays(today, -(days - 1));
  const older = chartHasOlderThan30Days(points, today);

  return (
    <section aria-labelledby="price-chart-heading" className="mt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 id="price-chart-heading" className="text-base font-bold">
          最近の価格
        </h3>
        <div className="flex flex-wrap gap-2">
          {shipping.length >= 2 ? (
            <button
              type="button"
              aria-pressed={mode === "shipping"}
              onClick={() => setMode(mode === "shipping" ? "selling" : "shipping")}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-3 text-sm font-bold"
            >
              {mode === "shipping" ? "商品価格を見る" : "送料込みを見る"}
            </button>
          ) : null}
          {older ? (
            <button
              type="button"
              aria-pressed={days === 90}
              onClick={() => setDays(days === 30 ? 90 : 30)}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-3 text-sm font-bold"
            >
              {days === 30 ? "90日を見る" : "30日を見る"}
            </button>
          ) : null}
        </div>
      </div>
      <p className="mt-1 text-xs text-muted">{mode === "shipping" && shipping.length >= 2 ? "送料込みの記録" : "商品価格の記録"}</p>
      <ChartSvg points={shown} start={start} days={days} />
      <p className="mt-1 flex justify-between text-xs text-muted">
        <span>{shown[0]?.date}</span>
        <span className="price-num">{formatYen(shown.at(-1)?.value ?? 0)}</span>
      </p>
    </section>
  );
}
