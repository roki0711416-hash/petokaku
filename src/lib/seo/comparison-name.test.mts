import assert from "node:assert/strict";
import test from "node:test";
import { comparisonProductName } from "./comparison-name.ts";
import { janComparisonName, janProductMetadata } from "./jan-metadata.ts";

const sheetTitle =
  "ペットシーツ ワイド レギュラー 厚型 アイリスオーヤマ 業務用 400枚 200枚 厚手 ペットシート 脱臭 ペット トイレ PNS-400 PNS-200W";

test("ペットシーツのモール見出しは相反する枚数と省略を除き、確認できた枚数だけ残す", () => {
  const name = comparisonProductName({
    name: sheetTitle,
    brand: "IRIS OHYAMA",
    sizeLabel: "400枚",
    quantityConfidence: "high",
  });
  assert.equal(name, "アイリスオーヤマ ペットシーツ 厚型 400枚");
  assert.equal(name.includes("200枚"), false);
  assert.equal(name.includes("200"), false);
  assert.equal(name.includes("ワイド"), false);
  assert.equal(name.includes("レギュラー"), false);
  assert.equal(name.includes("…"), false);
  assert.equal(name.includes("PNS"), false);
});

test("賞味期限と取説と英語の繰り返しを除き、商品と確認できた容量を残す", () => {
  const cases = [
    "ネクトン S 35g 賞味期限 2028/10/6 nekton 日本語取説付 インコ 鳥 ビタミン",
    "ネクトン S 35g 賞味期限 2028 10 6 nekton 日本語取説付 インコ 鳥 ビタミン…",
  ];
  for (const name of cases) {
    const cleaned = comparisonProductName({
      name,
      brand: "",
      sizeLabel: "35g",
      quantityConfidence: "high",
    });
    assert.equal(cleaned, "ネクトン S 35g");
    assert.equal(cleaned.includes("賞味期限"), false);
    assert.equal(cleaned.includes("2028"), false);
    assert.equal(cleaned.includes("日本語取説"), false);
    assert.equal(cleaned.includes("nekton"), false);
    assert.equal(cleaned.includes("…"), false);
  }
});

test("確認できた容量と食い違うセット数は商品名に残さない", () => {
  const name = comparisonProductName({
    name: "猫砂 紙 固まる 流せる 燃やせる 多頭飼い ペレット 燃えるゴミ 紙ペレット 大容量 猫トイレ アイリスオーヤマ 紙の猫砂 7L×6袋 KMN-70N",
    brand: "IRIS OHYAMA",
    sizeLabel: "7L",
    quantityConfidence: "high",
  });
  assert.equal(name, "アイリスオーヤマ 紙の猫砂 7L");
  assert.equal(name.includes("6袋"), false);
  assert.equal(name.includes("…"), false);
});

test("重点商品のキュレート名はモール見出しより優先し、H1とtitleの商品名になる", () => {
  const raw = "猫砂 紙 固まる 流せる 燃やせる 多頭飼い ペレット 燃えるゴミ 紙ペレット 大容量 猫トイレ アイリスオーヤマ 紙の猫砂 7L×6袋 KMN-70N";
  const name = janComparisonName({
    jan: "4905009714353",
    name: raw,
    brand: "IRIS OHYAMA",
    sizeLabel: "7L",
    quantityConfidence: "high",
  });
  assert.equal(name, "アイリスオーヤマ 紙の猫砂 7L");
  const metadata = janProductMetadata({
    jan: "4905009714353",
    name: raw,
    brand: "IRIS OHYAMA",
    sizeLabel: "7L",
    quantityConfidence: "high",
  });
  assert.equal(metadata.title, "アイリスオーヤマ 紙の猫砂 7Lの価格比較");
});

test("キュレートがない商品のtitleも同じ正規化名を使う", () => {
  const metadata = janProductMetadata({
    jan: "4967576499620",
    name: sheetTitle,
    brand: "IRIS OHYAMA",
    sizeLabel: "400枚",
    quantityConfidence: "high",
  });
  assert.equal(metadata.title, "アイリスオーヤマ ペットシーツ 厚型 400枚の価格比較");
  assert.equal(String(metadata.title).includes("200枚"), false);
  assert.equal(String(metadata.title).includes("…"), false);
  assert.equal(String(metadata.description).includes("4967576499620"), true);
});
