import assert from "node:assert/strict";
import test from "node:test";
import { isPetSupplyHit, petSupplyGenreCategoryId, searchYahooItems } from "./search.ts";

const rice = {
  name: "令和7年産 米 15kg",
  price: 4980,
  genreCategory: { id: 1244, name: "うるち米、玄米" },
  parentGenreCategories: [
    { id: 2498, name: "食品" },
    { id: 1234, name: "米、雑穀、粉類" },
    { id: 1242, name: "米、ごはん" },
  ],
};

const sheets = {
  name: "ペットシーツ レギュラー",
  price: 1980,
  genreCategory: { id: 32698, name: "犬用ペットシーツ、トイレシート" },
  parentGenreCategories: [
    { id: petSupplyGenreCategoryId, name: "ペット用品、生き物" },
    { id: 4782, name: "犬用品" },
  ],
};

test("ペット用品ジャンルIDはYahooカテゴリ一覧のペット用品、生き物", () => {
  assert.equal(petSupplyGenreCategoryId, 2509);
  assert.equal(isPetSupplyHit(sheets), true);
  assert.equal(isPetSupplyHit(rice), false);
  assert.equal(isPetSupplyHit({ name: "カテゴリなし" }), false);
});

test("商品検索はリクエスト時点でペット用品ジャンルに絞り、それ以外を残さない", async () => {
  const previousAppId = process.env.YAHOO_CLIENT_ID;
  const previousFetch = globalThis.fetch;
  const requested: string[] = [];
  process.env.YAHOO_CLIENT_ID = "test-app";
  globalThis.fetch = (async (input: string | URL | Request) => {
    requested.push(String(input));
    return new Response(JSON.stringify({ hits: [rice, sheets] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const keyword = await searchYahooItems({ query: "アイリスオーヤマ", results: 20 });
    const jan = await searchYahooItems({ janCode: "3182550849647", results: 20 });
    assert.equal(keyword.ok, true);
    assert.equal(jan.ok, true);
    if (keyword.ok && jan.ok) {
      assert.deepEqual(keyword.items.map((item) => item.name), ["ペットシーツ レギュラー"]);
      assert.deepEqual(jan.items.map((item) => item.genreName), ["犬用ペットシーツ、トイレシート"]);
    }
    assert.equal(requested.length, 2);
    const keywordUrl = new URL(requested[0] ?? "");
    const janUrl = new URL(requested[1] ?? "");
    assert.equal(keywordUrl.searchParams.get("genre_category_id"), "2509");
    assert.equal(keywordUrl.searchParams.get("query"), "アイリスオーヤマ");
    assert.equal(janUrl.searchParams.get("genre_category_id"), "2509");
    assert.equal(janUrl.searchParams.get("jan_code"), "3182550849647");
    assert.equal(janUrl.searchParams.get("query"), null);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousAppId == null) {
      delete process.env.YAHOO_CLIENT_ID;
    } else {
      process.env.YAHOO_CLIENT_ID = previousAppId;
    }
  }
});
