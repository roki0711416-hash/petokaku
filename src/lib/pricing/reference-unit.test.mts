import assert from "node:assert/strict";
import test from "node:test";
import { referenceLiterUnitLines } from "./reference-unit.ts";

function offer(patch: Partial<Parameters<typeof referenceLiterUnitLines>[0]> = {}) {
  return {
    price: 4000,
    shippingFee: 500,
    packCount: null as number | null,
    totalQuantity: null as number | null,
    unitPriceReady: true,
    ...patch,
  };
}

test("Lが確定した単品は本体と送料込みの参考単価を出す", () => {
  const lines = referenceLiterUnitLines(offer(), 5, "l", "per_l");
  assert.equal(lines.item, "参考：￥800 / L");
  assert.equal(lines.shippingTotal, "送料込み参考：￥900 / L");
});

test("セットは総容量で割り、セット全体と明示する", () => {
  const lines = referenceLiterUnitLines(offer({ packCount: 4, totalQuantity: 20 }), 5, "l", "per_l");
  assert.equal(lines.item, "参考：セット全体 ￥200 / L");
  assert.equal(lines.shippingTotal, "送料込み参考：セット全体 ￥225 / L");
});

test("送料不明のときは送料込み参考単価を出さない", () => {
  const lines = referenceLiterUnitLines(offer({ shippingFee: null }), 5, "l", "per_l");
  assert.equal(lines.item, "参考：￥800 / L");
  assert.equal(lines.shippingTotal, null);
});

test("kgや単位未確定、単価対象外の掲載は何も出さない", () => {
  assert.deepEqual(referenceLiterUnitLines(offer(), 5, "kg", "per_kg"), { item: null, shippingTotal: null });
  assert.deepEqual(referenceLiterUnitLines(offer(), 5, "l", "none"), { item: null, shippingTotal: null });
  assert.deepEqual(referenceLiterUnitLines(offer({ unitPriceReady: false }), 5, "l", "per_l"), {
    item: null,
    shippingTotal: null,
  });
  assert.deepEqual(referenceLiterUnitLines(offer({ packCount: 4, totalQuantity: null }), 5, "l", "per_l"), {
    item: null,
    shippingTotal: null,
  });
  assert.deepEqual(referenceLiterUnitLines(offer({ price: null }), 5, "l", "per_l"), {
    item: null,
    shippingTotal: null,
  });
});
