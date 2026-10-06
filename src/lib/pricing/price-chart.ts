import { tokyoObservationDate } from "./decide-price-write.ts";

export type ChartValue = {
  date: string;
  value: number;
};

export type ChartSourcePoint = {
  date: string;
  sellingPrice: number;
  shippingTotal: number | null;
};

function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function consecutiveChartSegments(points: ChartValue[]): ChartValue[][] {
  const ordered = [...points].sort((left, right) => left.date.localeCompare(right.date));
  const segments: ChartValue[][] = [];
  for (const point of ordered) {
    const current = segments.at(-1);
    const previous = current?.at(-1);
    if (!current || !previous || addCalendarDays(previous.date, 1) !== point.date) {
      segments.push([point]);
      continue;
    }
    current.push(point);
  }
  return segments;
}

export function chartWindowValues(input: {
  points: ChartSourcePoint[];
  today: string;
  days: 30 | 90;
  mode: "selling" | "shipping";
}): ChartValue[] {
  const start = addCalendarDays(input.today, -(input.days - 1));
  return input.points
    .flatMap((point) => {
      if (point.date < start || point.date > input.today) {
        return [];
      }
      if (input.mode === "shipping") {
        return point.shippingTotal == null ? [] : [{ date: point.date, value: point.shippingTotal }];
      }
      return [{ date: point.date, value: point.sellingPrice }];
    })
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function chartToday(now: string): string {
  return tokyoObservationDate(now);
}

export function chartCanShow(points: ChartSourcePoint[], today: string): boolean {
  return chartWindowValues({ points, today, days: 90, mode: "selling" }).length >= 2;
}

export function chartHasOlderThan30Days(points: ChartSourcePoint[], today: string): boolean {
  const start = addCalendarDays(today, -29);
  return points.some((point) => point.date < start);
}
