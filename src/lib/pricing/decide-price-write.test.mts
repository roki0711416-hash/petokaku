import assert from "node:assert/strict";
import test from "node:test";
import { decidePriceWrite, tokyoObservationDate, type StoredPriceObservation } from "./decide-price-write.ts";

const base = {
  price: 9990,
  shippingFee: 0,
  shippingStatus: "free" as const,
  stockStatus: "in_stock" as const,
};

function observation(overrides: Partial<StoredPriceObservation> = {}): StoredPriceObservation {
  return {
    id: "obs_1",
    observedAt: "2026-10-05T01:00:00.000Z",
    ...base,
    ...overrides,
  };
}

function decide(now: string, observations: StoredPriceObservation[], next: Partial<StoredPriceObservation> = {}) {
  return decidePriceWrite({
    now,
    observations,
    next: { ...base, ...next },
  });
}

test("今日初めて取得した価格はinsert", () => {
  assert.deepEqual(decide("2026-10-05T03:00:00.000Z", []), {
    action: "insert",
    observedOn: "2026-10-05",
  });
});

test("同日で価格と送料と在庫が同じならconfirm only", () => {
  assert.deepEqual(decide("2026-10-05T06:00:00.000Z", [observation()]), {
    action: "confirm",
    observationId: "obs_1",
    observedOn: "2026-10-05",
  });
});

test("同日の値下がりはinsert", () => {
  assert.equal(decide("2026-10-05T06:00:00.000Z", [observation()], { price: 9780 }).action, "insert");
});

test("同日の値上がりはinsert", () => {
  assert.equal(decide("2026-10-05T06:00:00.000Z", [observation()], { price: 10200 }).action, "insert");
});

test("同日に在庫ありから在庫切れになったらinsert", () => {
  assert.equal(decide("2026-10-05T06:00:00.000Z", [observation()], { stockStatus: "out_of_stock" }).action, "insert");
});

test("同日に在庫切れから在庫ありに戻ったらinsert", () => {
  assert.equal(
    decide("2026-10-05T06:00:00.000Z", [observation({ stockStatus: "out_of_stock" })], { stockStatus: "in_stock" }).action,
    "insert",
  );
});

test("送料無料から送料不明になったらinsert", () => {
  assert.equal(
    decide("2026-10-05T06:00:00.000Z", [observation()], { shippingFee: null, shippingStatus: "unknown" }).action,
    "insert",
  );
});

test("送料不明から送料無料になったらinsert", () => {
  assert.equal(
    decide(
      "2026-10-05T06:00:00.000Z",
      [observation({ shippingFee: null, shippingStatus: "unknown" })],
      { shippingFee: 0, shippingStatus: "free" },
    ).action,
    "insert",
  );
});

test("shipping_feeのnullと0は別状態", () => {
  assert.equal(decide("2026-10-05T06:00:00.000Z", [observation({ shippingFee: null })], { shippingFee: 0 }).action, "insert");
  assert.equal(decide("2026-10-05T06:00:00.000Z", [observation({ shippingFee: 0 })], { shippingFee: null }).action, "insert");
  assert.equal(decide("2026-10-05T06:00:00.000Z", [observation({ shippingFee: null })], { shippingFee: null }).action, "confirm");
});

test("日付が変わって価格が同じならinsert", () => {
  const decision = decide("2026-10-06T03:00:00.000Z", [observation({ observedAt: "2026-10-05T03:00:00.000Z" })]);
  assert.deepEqual(decision, { action: "insert", observedOn: "2026-10-06" });
});

test("UTCでは同じ日でも日本時間で翌日ならinsert", () => {
  assert.equal(tokyoObservationDate("2026-10-05T14:30:00.000Z"), "2026-10-05");
  assert.equal(tokyoObservationDate("2026-10-05T15:30:00.000Z"), "2026-10-06");
  const decision = decide("2026-10-05T15:30:00.000Z", [observation({ observedAt: "2026-10-05T14:30:00.000Z" })]);
  assert.deepEqual(decision, { action: "insert", observedOn: "2026-10-06" });
});

test("日本時間では同じ日でUTCの日付が違ってもconfirm only", () => {
  const decision = decide("2026-10-06T02:00:00.000Z", [observation({ observedAt: "2026-10-05T16:00:00.000Z" })]);
  assert.equal(tokyoObservationDate("2026-10-05T16:00:00.000Z"), "2026-10-06");
  assert.equal(tokyoObservationDate("2026-10-06T02:00:00.000Z"), "2026-10-06");
  assert.deepEqual(decision, { action: "confirm", observationId: "obs_1", observedOn: "2026-10-06" });
});

test("同日に複数あるときは最新の状態と比べる", () => {
  const decision = decide(
    "2026-10-05T10:00:00.000Z",
    [
      observation({ id: "morning", observedAt: "2026-10-05T01:00:00.000Z", price: 9990 }),
      observation({ id: "noon", observedAt: "2026-10-05T05:00:00.000Z", price: 9780 }),
    ],
    { price: 9780 },
  );
  assert.deepEqual(decision, { action: "confirm", observationId: "noon", observedOn: "2026-10-05" });
});

test("在庫不明は在庫ありとも在庫切れとも別", () => {
  assert.equal(decide("2026-10-05T06:00:00.000Z", [observation()], { stockStatus: "unknown" }).action, "insert");
  assert.equal(
    decide("2026-10-05T06:00:00.000Z", [observation({ stockStatus: "unknown" })], { stockStatus: "out_of_stock" }).action,
    "insert",
  );
});
