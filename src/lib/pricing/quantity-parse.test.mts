import assert from "node:assert/strict";
import test from "node:test";
import { calculateUnitPrices } from "./calculate.ts";
import {
  agreeShopQuantities,
  parseTitleQuantity,
  selectPreferredQuantity,
  totalQuantityOf,
  unitPriceQuantity,
  type AgreedQuantity,
} from "./quantity-parse.ts";

function sizeOf(title: string) {
  const reading = parseTitleQuantity(title);
  return {
    stated: reading.statedQuantity,
    statedUnit: reading.statedUnit,
    quantity: reading.quantity,
    quantityUnit: reading.quantityUnit,
    unitPriceType: reading.unitPriceType,
    packCount: reading.packCount,
    packUnit: reading.packUnit,
    sizeConfidence: reading.sizeConfidence,
    packConfidence: reading.packConfidence,
  };
}

test("8kgは内容量になり、販売個数は確定しない", () => {
  assert.deepEqual(sizeOf("ロイヤルカナン ミニ インドア アダルト 8kg"), {
    stated: 8,
    statedUnit: "kg",
    quantity: 8000,
    quantityUnit: "g",
    unitPriceType: "per_100g",
    packCount: null,
    packUnit: null,
    sizeConfidence: "high",
    packConfidence: "unknown",
  });
});

test("全角の容量表記も同じ内容量として読む", () => {
  const reading = sizeOf("ロイヤルカナン ８ｋｇ 成犬時体重１０ｋｇまで");
  assert.equal(reading.quantity, 8000);
  assert.equal(reading.statedUnit, "kg");
  assert.equal(reading.packCount, null);
});

test("成犬時体重10kgまでは商品容量にしない", () => {
  const reading = sizeOf("ロイヤルカナン インドア 成犬時体重10kgまで 8kg");
  assert.equal(reading.quantity, 8000);
  assert.equal(reading.stated, 8);
  assert.equal(reading.statedUnit, "kg");
  assert.equal(reading.packCount, null);
  assert.equal(reading.sizeConfidence, "high");
  assert.notEqual(reading.quantity, 10000);
});

test("体重10kgと年齢と月齢は容量にしない", () => {
  assert.equal(sizeOf("成犬時体重10kg").sizeConfidence, "unknown");
  assert.equal(sizeOf("体重10kgまで").quantity, null);
  assert.equal(sizeOf("1歳〜8歳").sizeConfidence, "unknown");
  assert.equal(sizeOf("12ヶ月").sizeConfidence, "unknown");
  assert.equal(sizeOf("生後10ヵ月").sizeConfidence, "unknown");
  assert.equal(sizeOf("小型犬用").sizeConfidence, "unknown");
});

test("増量と足し算は容量として確定しない", () => {
  assert.equal(sizeOf("100g増量").sizeConfidence, "unknown");
  assert.equal(sizeOf("2kg+200g").quantity, null);
  assert.equal(sizeOf("2kg+200g").sizeConfidence, "unknown");
  const bonus = sizeOf("ロイヤルカナン 8kg 100g増量");
  assert.equal(bonus.quantity, 8000);
  assert.equal(bonus.stated, 8);
});

test("1kg（500g×2袋）は500gの2袋にし、外側の1kgは合計の確認に使う", () => {
  const matched = sizeOf("1kg（500g×2袋）");
  assert.equal(matched.quantity, 500);
  assert.equal(matched.stated, 500);
  assert.equal(matched.statedUnit, "g");
  assert.equal(matched.packCount, 2);
  assert.equal(matched.packUnit, "袋");
  assert.equal(matched.packConfidence, "high");
  assert.equal(matched.sizeConfidence, "high");
  assert.equal(totalQuantityOf(matched.quantity, matched.packCount), 1000);

  const sheets = sizeOf("400枚（100枚×4袋）");
  assert.equal(sheets.quantity, 100);
  assert.equal(sheets.quantityUnit, "sheet");
  assert.equal(sheets.packCount, 4);
  assert.equal(sheets.packUnit, "袋");
  assert.equal(totalQuantityOf(sheets.quantity, sheets.packCount), 400);

  const mismatched = sizeOf("1kg（400g×2袋）");
  assert.equal(mismatched.quantity, null);
  assert.equal(mismatched.packCount, null);
  assert.equal(mismatched.sizeConfidence, "unknown");
  assert.equal(totalQuantityOf(mismatched.quantity, mismatched.packCount), null);
});

test("括弧内の販売個数は残し、合計が合わない内訳は個数にもしない", () => {
  const boxed = sizeOf("ケース(4L×4個)");
  assert.equal(boxed.quantity, 4000);
  assert.equal(boxed.stated, 4);
  assert.equal(boxed.statedUnit, "l");
  assert.equal(boxed.packCount, 4);
  assert.equal(boxed.packUnit, "個");

  const conflict = sizeOf("猫砂 8L(4L×2)");
  assert.equal(conflict.quantity, null);
  assert.equal(conflict.packCount, null);
  assert.equal(conflict.sizeConfidence, "unknown");
});

test("容量と販売個数を分けて読む", () => {
  assert.deepEqual(sizeOf("800g×2袋"), {
    stated: 800,
    statedUnit: "g",
    quantity: 800,
    quantityUnit: "g",
    unitPriceType: "per_100g",
    packCount: 2,
    packUnit: "袋",
    sizeConfidence: "high",
    packConfidence: "high",
  });
  const sticks = sizeOf("85g×12個");
  assert.equal(sticks.quantity, 85);
  assert.equal(sticks.packCount, 12);
  assert.equal(sticks.packUnit, "個");

  const treats = sizeOf("14g×80本");
  assert.equal(treats.quantity, 14);
  assert.equal(treats.unitPriceType, "per_100g");
  assert.equal(treats.packCount, 80);
  assert.equal(treats.packUnit, "本");

  const sheets = sizeOf("100枚×4袋");
  assert.equal(sheets.quantity, 100);
  assert.equal(sheets.quantityUnit, "sheet");
  assert.equal(sheets.unitPriceType, "per_sheet");
  assert.equal(sheets.packCount, 4);
  assert.equal(sheets.packUnit, "袋");

  const bottles = sizeOf("500ml×3本");
  assert.equal(bottles.quantity, 500);
  assert.equal(bottles.quantityUnit, "ml");
  assert.equal(bottles.unitPriceType, "per_l");
  assert.equal(bottles.packCount, 3);
  assert.equal(bottles.packUnit, "本");

  const litter = sizeOf("7L×2袋");
  assert.equal(litter.stated, 7);
  assert.equal(litter.statedUnit, "l");
  assert.equal(litter.quantity, 7000);
  assert.equal(litter.quantityUnit, "ml");
  assert.equal(litter.unitPriceType, "per_l");
  assert.equal(litter.packCount, 2);
});

test("枚と本とリットルを内容量として扱える", () => {
  const sheets = sizeOf("ペットシーツ 100枚");
  assert.equal(sheets.quantity, 100);
  assert.equal(sheets.unitPriceType, "per_sheet");
  assert.equal(sheets.packCount, null);

  const sticks = sizeOf("おやつ 80本");
  assert.equal(sticks.quantity, 80);
  assert.equal(sticks.quantityUnit, "piece");
  assert.equal(sticks.unitPriceType, "per_piece");
  assert.equal(sticks.packCount, null);

  const set = sizeOf("2本セット");
  assert.equal(set.sizeConfidence, "unknown");
  assert.equal(set.packCount, 2);
  assert.equal(set.packUnit, "本");

  const litter = sizeOf("猫砂 7L");
  assert.equal(litter.statedUnit, "l");
  assert.equal(litter.quantity, 7000);
  assert.equal(litter.unitPriceType, "per_l");
});

test("型番とJANと購入上限は容量にしない", () => {
  assert.equal(sizeOf("ロイヤルカナン (52901018)").sizeConfidence, "unknown");
  assert.equal(sizeOf("JAN 3182550849654").quantity, null);
  assert.equal(sizeOf("お一人様5個まで 8kg").quantity, 8000);
  assert.equal(sizeOf("お一人様5個まで 8kg").packCount, null);
});

test("1ショップだけではmediumになり、複数ショップが一致するとhighになる", () => {
  const one = agreeShopQuantities([parseTitleQuantity("ロイヤルカナン 8kg")]);
  assert.equal(one.confidence, "medium");
  assert.equal(one.source, "shop_title");
  assert.equal(one.quantity, null);
  assert.equal(one.statedQuantity, 8);
  assert.equal(one.sizeLabel, "容量情報なし");

  const agreed = agreeShopQuantities([
    parseTitleQuantity("成犬時体重10kgまで 8kg"),
    parseTitleQuantity("ロイヤルカナン 8kg"),
    parseTitleQuantity("【8kg×2袋】ロイヤルカナン"),
  ]);
  assert.equal(agreed.confidence, "high");
  assert.equal(agreed.source, "shop_titles");
  assert.equal(agreed.quantity, 8000);
  assert.equal(agreed.quantityUnit, "g");
  assert.equal(agreed.unitPriceType, "per_100g");
  assert.equal(agreed.sizeLabel, "8kg");
  assert.equal(agreed.statedUnit, "kg");
});

test("内容量が食い違う商品名は容量を確定しない", () => {
  const disagreed = agreeShopQuantities([
    parseTitleQuantity("ロイヤルカナン 8kg"),
    parseTitleQuantity("ロイヤルカナン 3kg"),
  ]);
  assert.equal(disagreed.confidence, "unknown");
  assert.equal(disagreed.quantity, null);
  assert.equal(disagreed.source, null);
});

test("構造化容量は商品名の解析より優先する", () => {
  const fromTitles = agreeShopQuantities([
    parseTitleQuantity("ロイヤルカナン 8kg"),
    parseTitleQuantity("ロイヤルカナン 8kg"),
  ]);
  const fromApi: AgreedQuantity = {
    statedQuantity: 3,
    statedUnit: "kg",
    quantity: 3000,
    quantityUnit: "g",
    unitPriceType: "per_100g",
    sizeLabel: "3kg",
    confidence: "high",
    source: "api",
  };
  const selected = selectPreferredQuantity([fromTitles, fromApi]);
  assert.equal(selected.source, "api");
  assert.equal(selected.quantity, 3000);
  assert.equal(selected.sizeLabel, "3kg");
});

test("総内容量は単位と販売個数の両方が明確なときだけ作る", () => {
  assert.equal(totalQuantityOf(8000, null), null);
  assert.equal(totalQuantityOf(null, 2), null);
  assert.equal(totalQuantityOf(8000, 2), 16000);
  assert.equal(unitPriceQuantity(8000, null, null), 8000);
  assert.equal(unitPriceQuantity(8000, 2, 16000), 16000);
  assert.equal(unitPriceQuantity(8000, 2, null), null);
});

test("9990円の8kgと19980円の2袋はどちらも約125円/100g", () => {
  const single = calculateUnitPrices({
    price: 9990,
    shipping: 0,
    quantity: unitPriceQuantity(8000, null, null),
    quantityUnit: "g",
    unitPriceType: "per_100g",
  });
  assert.equal(single.itemUnit?.yen, 125);
  assert.equal(single.itemUnit?.exact, false);
  assert.equal(single.unitLabel, "100g");

  const set = calculateUnitPrices({
    price: 19980,
    shipping: 0,
    quantity: unitPriceQuantity(8000, 2, totalQuantityOf(8000, 2)),
    quantityUnit: "g",
    unitPriceType: "per_100g",
  });
  assert.equal(set.itemUnit?.yen, 125);
  assert.equal(set.unitLabel, "100g");
});
