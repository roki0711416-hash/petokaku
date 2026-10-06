import assert from "node:assert/strict";
import test from "node:test";
import { classifyPetKind } from "./pet-kind.ts";

test("Yahooの犬用品カテゴリーは犬になり、タイトルの猫では上書きしない", () => {
  const result = classifyPetKind({
    genreNames: ["ペット用品、生き物", "犬用品", "犬用ペットシーツ、トイレシート"],
    brandName: "WEIMALL",
    title: "ペットシーツ トイレシート 犬 猫 多頭飼い",
  });
  assert.equal(result.kind, "dog");
  assert.equal(result.source, "genre");
});

test("Yahooの猫用品カテゴリーは猫になる", () => {
  const result = classifyPetKind({
    genreNames: ["ペット用品、生き物", "猫用品", "キャットフード"],
    brandName: "フィーライン ヘルス ニュートリション",
    title: "ロイヤルカナン インドア 4kg",
  });
  assert.equal(result.kind, "cat");
  assert.equal(result.source, "genre");
});

test("猫砂のカテゴリーは猫になる", () => {
  const result = classifyPetKind({
    genreNames: ["ペット用品、生き物", "猫用品", "猫用トイレ用品", "猫砂"],
    brandName: null,
    title: "ひのき猫砂 50L",
  });
  assert.equal(result.kind, "cat");
  assert.equal(result.source, "genre");
});

test("種類がカテゴリーに無いときは、明確な商品名だけを使う", () => {
  const result = classifyPetKind({
    genreNames: ["ペット用品、生き物"],
    brandName: "ロイヤルカナン",
    title: "インドア 成猫用 4kg",
  });
  assert.equal(result.kind, "cat");
  assert.equal(result.source, "title");
});

test("犬と猫が同時に書かれた商品名は分類しない", () => {
  const result = classifyPetKind({
    genreNames: ["ペット用品、生き物"],
    brandName: null,
    title: "成犬用と成猫用のフードセット",
  });
  assert.equal(result.kind, "other");
  assert.equal(result.source, "unknown");
});

test("カテゴリーが犬と猫で食い違うときは分類しない", () => {
  const result = classifyPetKind({
    genreNames: ["犬用品", "猫用品"],
    brandName: "フィーライン ヘルス ニュートリション",
    title: "成猫用 4kg",
  });
  assert.equal(result.kind, "other");
  assert.equal(result.source, "unknown");
});

test("ペット用品だけでは犬にも猫にもしない", () => {
  const result = classifyPetKind({
    genreNames: ["ペット用品、生き物"],
    brandName: "スタイルプラス",
    title: "ペットシーツ レギュラー 800枚",
  });
  assert.equal(result.kind, "other");
  assert.equal(result.source, "unknown");
});

test("フィーラインというブランド系列は猫にする", () => {
  const result = classifyPetKind({
    genreNames: ["ペット用品、生き物"],
    brandName: "フィーライン ヘルス ニュートリション",
    title: "インドア 4kg",
  });
  assert.equal(result.kind, "cat");
  assert.equal(result.source, "catalog");
});
