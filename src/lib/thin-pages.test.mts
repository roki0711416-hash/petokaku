import assert from "node:assert/strict";
import test from "node:test";
import { filteredHubRobots, hubHasComparableProducts } from "./thin-pages.ts";

test("比較できる掲載が無いカテゴリは索引せず、掲載があるときは親と同じ公開判定にする", () => {
  assert.equal(
    hubHasComparableProducts({
      yahoo: { status: "empty", cards: [] },
      rakuten: { status: "not-configured", cards: [] },
    }),
    false,
  );
  assert.equal(
    hubHasComparableProducts({
      yahoo: { status: "ready", cards: [{ href: "/products/jan/4562358781780" }] },
      rakuten: { status: "empty", cards: [] },
    }),
    true,
  );
  assert.deepEqual(filteredHubRobots({ unknownFilter: true, filtered: true, hasProducts: false }), { index: false, follow: false });
  assert.deepEqual(filteredHubRobots({ unknownFilter: false, filtered: true, hasProducts: false }), { index: false, follow: false });
});

test("ALLOW_INDEXING が真で、絞り込みに掲載があるときは索引する", () => {
  const previous = process.env.ALLOW_INDEXING;
  process.env.ALLOW_INDEXING = "true";
  try {
    assert.deepEqual(filteredHubRobots({ unknownFilter: false, filtered: true, hasProducts: true }), { index: true, follow: true });
    assert.deepEqual(filteredHubRobots({ unknownFilter: false, filtered: false, hasProducts: false }), { index: true, follow: true });
  } finally {
    if (previous === undefined) {
      delete process.env.ALLOW_INDEXING;
    } else {
      process.env.ALLOW_INDEXING = previous;
    }
  }
});
