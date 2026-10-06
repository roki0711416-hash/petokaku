import assert from "node:assert/strict";
import test from "node:test";
import { detectPackCount, hasUnresolvedPackNotation, salesUnitLabel } from "./pack-count.ts";

test("明確な複数販売だけをpackCountにする", () => {
  assert.deepEqual(detectPackCount("ロイヤルカナン ミニ インドア アダルト 8kg"), { packCount: null, packUnit: null });
  assert.deepEqual(detectPackCount("【8kg×2袋】ロイヤルカナン"), { packCount: 2, packUnit: "袋" });
  assert.deepEqual(detectPackCount("8kg x 2袋"), { packCount: 2, packUnit: "袋" });
  assert.deepEqual(detectPackCount("８ｋｇ×２袋"), { packCount: 2, packUnit: "袋" });
  assert.deepEqual(detectPackCount("2袋セット"), { packCount: 2, packUnit: "袋" });
  assert.deepEqual(detectPackCount("お得な2個セット"), { packCount: 2, packUnit: "個" });
  assert.deepEqual(detectPackCount("2パック"), { packCount: 2, packUnit: "パック" });
  assert.deepEqual(detectPackCount("2本セット"), { packCount: 2, packUnit: "本" });
  assert.deepEqual(detectPackCount("まとめ買い ×2"), { packCount: 2, packUnit: null });
  assert.deepEqual(detectPackCount("まとめ買い x2"), { packCount: 2, packUnit: null });
});

test("容量や年齢の数字を販売個数にしない", () => {
  assert.equal(detectPackCount("12ヶ月").packCount, null);
  assert.equal(detectPackCount("成犬用 1歳〜8歳").packCount, null);
  assert.equal(detectPackCount("100g").packCount, null);
  assert.equal(detectPackCount("生後10ヵ月齢以上 8kg").packCount, null);
  assert.equal(detectPackCount("販売個数の表記がないロイヤルカナン").packCount, null);
  assert.equal(detectPackCount("8kg ※お一人様5個まで").packCount, null);
});

test("個数が矛盾するタイトルは断定しない", () => {
  assert.equal(detectPackCount("2袋と3個セット").packCount, null);
});

test("表記がない商品は1個と断定しない", () => {
  assert.equal(detectPackCount("ロイヤルカナン SHN ミニ インドア アダルト 8kg").packCount, null);
  assert.equal(salesUnitLabel(null, null), "販売単位はショップで確認");
  assert.equal(salesUnitLabel(2, "袋"), "2袋セット");
  assert.equal(salesUnitLabel(2, "個"), "2個セット");
  assert.equal(salesUnitLabel(1, "袋"), "1袋");
});

test("個数が矛盾する表記は未解決のセットとして扱う", () => {
  assert.equal(hasUnresolvedPackNotation("猫砂 ニオイをとる砂 国産 5L 8袋（4袋×2箱）"), true);
  assert.equal(hasUnresolvedPackNotation("LION ニオイをとる砂 5L×4個"), false);
  assert.equal(hasUnresolvedPackNotation("ロイヤルカナン ミニ インドア アダルト 8kg"), false);
  assert.equal(hasUnresolvedPackNotation("8kg ※お一人様5個まで"), false);
});
