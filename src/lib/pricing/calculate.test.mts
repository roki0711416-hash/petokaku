import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateUnitPrices,
  compareSizes,
  mapExternalSale,
  normalizedAmount,
  shippingInclusiveTotal,
} from "./calculate.ts";

test("送料無料は商品価格と送料込み総額が同じ", () => {
  assert.equal(shippingInclusiveTotal(5780, 0), 5780);
  const result = calculateUnitPrices({
    price: 5780,
    shipping: 0,
    quantity: 3000,
    quantityUnit: "g",
    unitPriceType: "per_100g",
  });
  assert.equal(result.total, 5780);
  assert.deepEqual(result.effectiveUnit, { yen: 193, exact: false });
  assert.deepEqual(result.itemUnit, { yen: 193, exact: false });
});

test("有料送料は商品価格に送料を足してから単価にする", () => {
  assert.equal(shippingInclusiveTotal(5780, 550), 6330);
  const result = calculateUnitPrices({
    price: 5780,
    shipping: 550,
    quantity: 3,
    quantityUnit: "kg",
    unitPriceType: "per_100g",
  });
  assert.equal(result.total, 6330);
  assert.deepEqual(result.itemUnit, { yen: 193, exact: false });
  assert.deepEqual(result.effectiveUnit, { yen: 211, exact: true });
  assert.equal(result.unitLabel, "100g");
});

test("送料不明は0円にせず、送料込み単価を出さない", () => {
  assert.equal(shippingInclusiveTotal(5780, null), null);
  const result = calculateUnitPrices({
    price: 5780,
    shipping: null,
    quantity: 3,
    quantityUnit: "kg",
    unitPriceType: "per_100g",
  });
  assert.equal(result.total, null);
  assert.equal(result.effectiveUnit, null);
  assert.deepEqual(result.itemUnit, { yen: 193, exact: false });
});

test("kg を g に、L を ml にそろえる", () => {
  assert.equal(normalizedAmount(1, "kg"), 1000);
  assert.equal(normalizedAmount(3, "kg"), 3000);
  assert.equal(normalizedAmount(1.5, "kg"), 1500);
  assert.equal(normalizedAmount(500, "ml"), 500);
  assert.equal(normalizedAmount(0.5, "l"), 500);
});

test("円/L、円/枚、円/本を計算する", () => {
  const perLiter = calculateUnitPrices({
    price: 1280,
    shipping: 0,
    quantity: 5,
    quantityUnit: "l",
    unitPriceType: "per_l",
  });
  assert.deepEqual(perLiter.effectiveUnit, { yen: 256, exact: true });
  assert.equal(perLiter.unitLabel, "L");

  const perSheet = calculateUnitPrices({
    price: 1680,
    shipping: 0,
    quantity: 200,
    quantityUnit: "sheet",
    unitPriceType: "per_sheet",
  });
  assert.deepEqual(perSheet.effectiveUnit, { yen: 8, exact: false });
  assert.equal(perSheet.unitLabel, "枚");

  const perPiece = calculateUnitPrices({
    price: 980,
    shipping: 220,
    quantity: 20,
    quantityUnit: "piece",
    unitPriceType: "per_piece",
  });
  assert.equal(perPiece.total, 1200);
  assert.deepEqual(perPiece.itemUnit, { yen: 49, exact: true });
  assert.deepEqual(perPiece.effectiveUnit, { yen: 60, exact: true });
  assert.equal(perPiece.unitLabel, "本");
});

test("容量0と容量不明は単価を出さない", () => {
  assert.equal(
    calculateUnitPrices({
      price: 1000,
      shipping: 0,
      quantity: 0,
      quantityUnit: "g",
      unitPriceType: "per_100g",
    }).itemUnit,
    null,
  );
  assert.equal(
    calculateUnitPrices({
      price: 1000,
      shipping: 0,
      quantity: null,
      quantityUnit: null,
      unitPriceType: "per_100g",
    }).itemUnit,
    null,
  );
  assert.equal(
    calculateUnitPrices({
      price: 1000,
      shipping: 0,
      quantity: 100,
      quantityUnit: "sheet",
      unitPriceType: "per_100g",
    }).itemUnit,
    null,
  );
  assert.equal(
    calculateUnitPrices({
      price: 1000,
      shipping: 0,
      quantity: 100,
      quantityUnit: "g",
      unitPriceType: "none",
    }).unitLabel,
    null,
  );
});

test("容量違いのお得判定は送料込み単価で行い、総額では判定しない", () => {
  const rows = compareSizes([
    {
      id: "1kg",
      quantity: 1,
      quantityUnit: "kg",
      unitPriceType: "per_100g",
      offers: [{ price: 2480, shipping: 0 }],
    },
    {
      id: "3kg",
      quantity: 3,
      quantityUnit: "kg",
      unitPriceType: "per_100g",
      offers: [
        { price: 5980, shipping: 0 },
        { price: 5780, shipping: 550 },
      ],
    },
    {
      id: "8kg",
      quantity: 8,
      quantityUnit: "kg",
      unitPriceType: "per_100g",
      offers: [{ price: 13800, shipping: 0 }],
    },
    {
      id: "unknown",
      quantity: 2,
      quantityUnit: "kg",
      unitPriceType: "per_100g",
      offers: [{ price: 1000, shipping: null }],
    },
  ]);

  assert.equal(rows.find((row) => row.id === "3kg")?.total, 5980);
  assert.deepEqual(rows.find((row) => row.id === "3kg")?.effectiveUnit, { yen: 199, exact: false });
  assert.deepEqual(rows.find((row) => row.id === "1kg")?.effectiveUnit, { yen: 248, exact: true });
  assert.deepEqual(rows.find((row) => row.id === "8kg")?.effectiveUnit, { yen: 173, exact: false });
  assert.equal(rows.find((row) => row.id === "unknown")?.effectiveUnit, null);
  assert.deepEqual(
    rows.filter((row) => row.isBestUnitPrice).map((row) => row.id),
    ["8kg"],
  );
});

test("外部データに無い値は0や推測で埋めない", () => {
  const mapped = mapExternalSale({
    price: 5780,
    name: "3kgのごはん",
  });
  assert.equal(mapped.price, 5780);
  assert.equal(mapped.shipping, null);
  assert.equal(mapped.quantity, null);
  assert.equal(mapped.quantityUnit, null);
  assert.equal(mapped.stockStatus, "unknown");

  const freeShipping = mapExternalSale({ price: 2480, shipping: 0, quantity: 1000, quantityUnit: "g" });
  assert.equal(freeShipping.shipping, 0);
  assert.equal(freeShipping.quantity, 1000);
});
