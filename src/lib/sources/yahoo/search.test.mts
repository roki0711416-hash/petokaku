import assert from "node:assert/strict";
import test from "node:test";
import { isPetSupplyHit, petSupplyGenreCategoryId, preferDetailImageUrl, searchYahooItems, yahooDetailImageSize, yahooJanSearchLimit } from "./search.ts";

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

test("商品詳細の画像は300px以下のYahoo画像を600pxのURLへ替える", () => {
  assert.equal(
    preferDetailImageUrl("https://item-shopping.c.yimg.jp/i/j/sweet-pet_77687275"),
    "https://item-shopping.c.yimg.jp/i/l/sweet-pet_77687275",
  );
  assert.equal(
    preferDetailImageUrl("https://item-shopping.c.yimg.jp/i/l/sweet-pet_77687275"),
    "https://item-shopping.c.yimg.jp/i/l/sweet-pet_77687275",
  );
  assert.equal(preferDetailImageUrl("https://example.com/item.jpg"), "https://example.com/item.jpg");
});

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
    assert.equal(keywordUrl.searchParams.get("sort"), null);
    assert.equal(janUrl.searchParams.get("genre_category_id"), "2509");
    assert.equal(janUrl.searchParams.get("jan_code"), "3182550849647");
    assert.equal(janUrl.searchParams.get("query"), null);
    assert.equal(janUrl.searchParams.get("image_size"), yahooDetailImageSize);
    assert.equal(yahooDetailImageSize, "600");
    assert.equal(yahooJanSearchLimit, 50);
    const sorted = await searchYahooItems({ query: "犬 用品", results: 20, sort: "-review_count" });
    assert.equal(sorted.ok, true);
    const sortedUrl = new URL(requested.at(-1) ?? "");
    assert.equal(sortedUrl.searchParams.get("sort"), "-review_count");
    assert.equal(sortedUrl.searchParams.get("genre_category_id"), "2509");
    const dogGenre = await searchYahooItems({ query: "犬 用品", results: 20, sort: "-review_count", genreCategoryId: 4772 });
    assert.equal(dogGenre.ok, true);
    const dogGenreUrl = new URL(requested.at(-1) ?? "");
    assert.equal(dogGenreUrl.searchParams.get("genre_category_id"), "4772");
    assert.equal(dogGenreUrl.searchParams.get("query"), "犬 用品");
    assert.equal(dogGenreUrl.searchParams.get("start"), null);
    const offset = await searchYahooItems({ query: "犬 用品", results: 50, start: 51, sort: "-review_count", genreCategoryId: 4772 });
    assert.equal(offset.ok, true);
    const offsetUrl = new URL(requested.at(-1) ?? "");
    assert.equal(offsetUrl.searchParams.get("start"), "51");
    assert.equal(offsetUrl.searchParams.get("results"), "50");
    assert.equal(requested.length, 5);
    if (keyword.ok) {
      assert.equal(keyword.totalAvailable, null);
      assert.equal(keyword.returnedCount, 2);
    }
  } finally {
    globalThis.fetch = previousFetch;
    if (previousAppId == null) {
      delete process.env.YAHOO_CLIENT_ID;
    } else {
      process.env.YAHOO_CLIENT_ID = previousAppId;
    }
  }
});
