import assert from "node:assert/strict";
import test from "node:test";
import { curatedJanProducts } from "../data/curated-jans.ts";
import { curatedJanPaths, curatedJansForPet, selectCuratedJans } from "./curated-jans.ts";

test("確認済みキュレーションJANは13桁とチェックデジットとペット種別だけ通す", () => {
  const selected = selectCuratedJans(curatedJanProducts);
  assert.ok(selected.length > 0);
  assert.ok(selected.every((item) => /^[0-9]{13}$/.test(item.janCode)));
  assert.equal(new Set(selected.map((item) => item.janCode)).size, selected.length);
  assert.deepEqual(
    selectCuratedJans([
      { janCode: "123", label: "桁不足", petId: "dog" },
      { janCode: "4580518141427", label: "重複前", petId: "dog" },
      { janCode: "4580518141427", label: "重複", petId: "dog" },
      { janCode: "4580518141428", label: "チェックデジット不正", petId: "dog" },
      { janCode: "4580518141427", label: "   ", petId: "dog" },
    ]),
    [{ janCode: "4580518141427", label: "重複前", petId: "dog" }],
  );
});

test("キュレーションが空でもパスとペット別抽出は空配列のまま", () => {
  assert.deepEqual(selectCuratedJans([]), []);
  assert.deepEqual(curatedJanPaths([]), []);
  assert.deepEqual(curatedJansForPet("cat", []), []);
});

test("ペット別に分け、サイトマップ用パスは /products/jan/ だけにする", () => {
  const dog = curatedJansForPet("dog");
  const cat = curatedJansForPet("cat");
  assert.ok(dog.every((item) => item.petId === "dog"));
  assert.ok(cat.every((item) => item.petId === "cat"));
  assert.ok(curatedJanPaths().every((path) => /^\/products\/jan\/[0-9]{13}$/.test(path)));
});
