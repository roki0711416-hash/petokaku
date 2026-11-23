import assert from "node:assert/strict";
import test from "node:test";
import { operatorAddress, operatorName, operatorPerson } from "./operator.ts";

test("運営者はごぼうで、所在地は空のまま", () => {
  assert.equal(operatorName, "ごぼう");
  assert.equal(operatorAddress, "");
  assert.deepEqual(operatorPerson(), { "@type": "Person", name: "ごぼう" });
  assert.equal(JSON.stringify(operatorPerson()).includes("sameAs"), false);
  assert.equal(JSON.stringify(operatorPerson()).includes("http"), false);
});
