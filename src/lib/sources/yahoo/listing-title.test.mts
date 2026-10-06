import assert from "node:assert/strict";
import test from "node:test";
import { readableListingTitle } from "./listing-title.ts";

test("容量と成犬用を残し、JANと購入上限と付属表記を除く", () => {
  const title = readableListingTitle(
    "ロイヤルカナン　ミニ　インドア　アダルト　成犬用　８ｋｇ　３１８２５５０８４９６５４　ジップ付　小型犬　お一人様５点限り",
  );
  assert.match(title, /成犬用/);
  assert.match(title, /8kg/);
  assert.match(title, /小型犬/);
  assert.equal(title.includes("3182550849654"), false);
  assert.equal(title.includes("ジップ付"), false);
  assert.equal(title.includes("お一人様"), false);
});

test("年齢と猫用を残し、正規品とジッパー表記を除く", () => {
  const title = readableListingTitle(
    "ロイヤルカナン インドア 4kg / 室内で生活する成猫用(生後12ヵ月齢から7歳まで) / ドライフード ジッパー有り[正規品]",
  );
  assert.match(title, /4kg/);
  assert.match(title, /成猫用/);
  assert.match(title, /生後12ヵ月齢から7歳まで/);
  assert.equal(title.includes("正規品"), false);
  assert.equal(title.includes("ジッパー"), false);
});

test("体重の上限は商品容量として残さない", () => {
  const title = readableListingTitle("ミニ インドア パピー 4kg（成犬時体重10kgまで）子犬用");
  assert.match(title, /4kg/);
  assert.match(title, /子犬用/);
  assert.equal(title.includes("10kg"), false);
  assert.equal(title.includes("()"), false);
  assert.equal(title.includes("（）"), false);
});
