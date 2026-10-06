import assert from "node:assert/strict";
import test from "node:test";
import { readableListingTitle } from "./display-title.ts";

test("長い販売店タイトルは容量を残して表示用に短くする", () => {
  const title = "【とても長いショップ名の宣伝文です】ロイヤルカナン 室内犬 4kg お試し セットではない通常サイズ";
  const shown = readableListingTitle(title);
  assert.match(shown, /4kg/);
  assert.equal(shown.includes("とても長いショップ名"), false);
  assert.notEqual(shown, title);
});
