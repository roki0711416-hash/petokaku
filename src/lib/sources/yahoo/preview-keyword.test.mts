import assert from "node:assert/strict";
import test from "node:test";
import { keywordItemMatchesQuery, keywordYahooRequests } from "./keyword-requests.ts";

test("キーワード検索はJANなら1回、それ以外はレビュー順のページを並列に取る", () => {
  const jan = keywordYahooRequests("4905009714353", [101, 151]);
  assert.equal(jan.length, 1);
  assert.equal(jan[0]?.janCode, "4905009714353");
  assert.equal(jan[0]?.results, 50);
  assert.equal(jan[0]?.query, undefined);

  const keyword = keywordYahooRequests("ドッグフード");
  assert.deepEqual(
    keyword.map((request) => request.start),
    [1, 51],
  );
  assert.equal(keyword.every((request) => request.query === "ドッグフード" && request.results === 50 && request.sort === "-review_count"), true);
  assert.equal(keyword.every((request) => request.revalidate === 60), true);
  assert.deepEqual(
    keywordYahooRequests("おやつ", [101, 151]).map((request) => request.start),
    [101, 151],
  );
});

test("検索語は商品名かジャンルにあるものだけを残し、説明文だけの別商品は残さない", () => {
  assert.equal(keywordItemMatchesQuery("小型犬用 成犬用 6kg", ["ドッグフード", "犬用品"], "ドッグフード"), true);
  assert.equal(keywordItemMatchesQuery("ペットキャリー 窓付き", ["犬用キャリーバッグ"], "おやつ"), false);
  assert.equal(keywordItemMatchesQuery("犬 おやつ ささみ", ["犬用品"], "犬 おやつ"), true);
  assert.equal(keywordItemMatchesQuery("猫 おやつ", ["猫用品"], "犬 おやつ"), false);
});
