import assert from "node:assert/strict";
import test from "node:test";
import { chartWindowValues, consecutiveChartSegments } from "./price-chart.ts";

test("欠測日は線でつながず、価格を作らない", () => {
  const segments = consecutiveChartSegments([
    { date: "2026-10-01", value: 5000 },
    { date: "2026-10-02", value: 5100 },
    { date: "2026-10-05", value: 4800 },
  ]);
  assert.equal(segments.length, 2);
  assert.deepEqual(segments[0], [
    { date: "2026-10-01", value: 5000 },
    { date: "2026-10-02", value: 5100 },
  ]);
  assert.deepEqual(segments[1], [{ date: "2026-10-05", value: 4800 }]);
  assert.equal(segments.flat().some((point) => point.date === "2026-10-03"), false);
});

test("送料込みと商品価格は別の点にする", () => {
  const points = [
    { date: "2026-10-05", sellingPrice: 5130, shippingTotal: 5720 },
    { date: "2026-10-04", sellingPrice: 5200, shippingTotal: null },
  ];
  assert.deepEqual(chartWindowValues({ points, today: "2026-10-05", days: 30, mode: "selling" }).map((point) => point.value), [5200, 5130]);
  assert.deepEqual(chartWindowValues({ points, today: "2026-10-05", days: 30, mode: "shipping" }), [{ date: "2026-10-05", value: 5720 }]);
});
