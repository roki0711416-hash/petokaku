import assert from "node:assert/strict";
import test from "node:test";
import { historyReading, productReadingCopy, readingTopicOf } from "./product-reading.ts";

test("商品名とカテゴリで読み方の種類を分ける", () => {
  assert.equal(readingTopicOf({ name: "LION ニオイをとる砂 5L×4個", category: "cat" }), "litter");
  assert.equal(readingTopicOf({ name: "ニュートロ シュプレモ 小型犬 成犬用 3kg", category: "dog" }), "dog-food");
  assert.equal(readingTopicOf({ name: "ロイヤルカナン インドア 成猫用 4kg キャットフード", category: "cat" }), "cat-food");
  assert.equal(readingTopicOf({ name: "デオシート レギュラー 112枚", category: "dog" }), "sheets");
  assert.equal(readingTopicOf({ name: "デオトイレ ハーフカバー 本体セット", category: "cat" }), "cat-toilet");
  assert.equal(readingTopicOf({ name: "キャットタワー スリム 据え置き 高さ142cm", category: "cat" }), "tower");
  assert.equal(readingTopicOf({ name: "犬 おやつ ジャーキー", category: "dog" }), "treat");
  assert.equal(readingTopicOf({ name: "猫じゃらし", category: "cat" }), "toy");
  assert.equal(readingTopicOf({ name: "犬用 首輪", category: "dog", genreName: "犬用品" }), "other");
});

test("カテゴリごとに本文が違い、金額や効果は作らない", () => {
  const samples = [
    productReadingCopy({ name: "ニュートロ シュプレモ 小型犬 成犬用 3kg", category: "dog", sizeLabel: "3kg" }),
    productReadingCopy({ name: "ロイヤルカナン インドア 成猫用 4kg キャットフード", category: "cat", sizeLabel: "4kg" }),
    productReadingCopy({ name: "LION ニオイをとる砂 5L×4個", category: "cat", sizeLabel: "5L×4個" }),
    productReadingCopy({ name: "デオシート レギュラー", category: "dog" }),
    productReadingCopy({ name: "デオトイレ 本体セット", category: "cat" }),
    productReadingCopy({ name: "キャットタワー 据え置き", category: "cat", sizeLabel: "高さ142cm" }),
    productReadingCopy({ name: "犬 おやつ ジャーキー", category: "dog" }),
    productReadingCopy({ name: "猫じゃらし", category: "cat" }),
    productReadingCopy({ name: "チモシー", category: "small-animal" }),
    productReadingCopy({ name: "鳥 ペレット", category: "bird" }),
    productReadingCopy({ name: "金魚のえさ", category: "fish" }),
  ];
  const openings = samples.map((copy) => copy.paragraphs[0]);
  assert.equal(new Set(openings).size, openings.length);
  const headings = samples.map((copy) => copy.heading);
  assert.equal(new Set(headings).size, new Set(samples.map((copy) => copy.topic)).size);
  for (const copy of samples) {
    const text = [copy.heading, ...copy.paragraphs, ...copy.points.flatMap((point) => [point.heading, point.body]), copy.history].join("\n");
    assert.doesNotMatch(text, /\d[\d,]*円/);
    assert.equal(text.includes("治る"), false);
    assert.equal(text.includes("体験談"), false);
    assert.equal(copy.points.length >= 3, true);
    assert.equal(copy.links.length >= 1, true);
  }
  const dog = samples[0];
  assert.match(dog?.paragraphs.join("\n") ?? "", /3kg/);
  assert.match(dog?.paragraphs.join("\n") ?? "", /獣医師/);
  const unknown = productReadingCopy({ name: "犬用 首輪", category: "dog", sizeLabel: "容量情報なし" });
  assert.equal(unknown.paragraphs.some((paragraph) => paragraph.includes("容量情報なし")), false);
});

test("価格の記録は日数の段階で読み方が変わる", () => {
  assert.match(historyReading({ recordedDays: null, sufficiency: null }), /2日分以上/);
  assert.match(historyReading({ recordedDays: 1, sufficiency: "accumulating" }), /1日分/);
  assert.match(historyReading({ recordedDays: 4, sufficiency: "reference" }), /4日分/);
  assert.match(historyReading({ recordedDays: 9, sufficiency: "comparable" }), /9日分/);
  assert.match(historyReading({ recordedDays: 9, sufficiency: "comparable" }), /未取得/);
});
