import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { articles } from "../data/articles.ts";
import { publishedArticles } from "./articles/catalog.ts";
import { adSlotMinHeightPx, adsensePublisherId, articleMidAdBeforeIndex, presentAdSlot } from "./adsense.ts";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("スロットIDが無い、空、数字でないときは枠を出さない", () => {
  assert.equal(presentAdSlot(undefined), null);
  assert.equal(presentAdSlot(null), null);
  assert.equal(presentAdSlot(""), null);
  assert.equal(presentAdSlot("   "), null);
  assert.equal(presentAdSlot("TODO"), null);
  assert.equal(presentAdSlot("12345"), null);
  assert.equal(presentAdSlot("123456789012345678901"), null);
  assert.equal(presentAdSlot(" 1234567890 "), "1234567890");
});

test("パブリッシャーIDは確認用の既存ID", () => {
  assert.equal(adsensePublisherId, "ca-pub-6861979311690077");
  assert.equal(adSlotMinHeightPx, 280);
});

test("記事の途中の枠は見出しの前で、商品カードと末尾には寄せない", () => {
  assert.equal(articleMidAdBeforeIndex([]), null);
  assert.equal(
    articleMidAdBeforeIndex([
      { type: "h2" },
      { type: "p" },
      { type: "p" },
      { type: "p" },
    ]),
    null,
  );
  const blocks = [
    { type: "p" },
    { type: "h2" },
    { type: "p" },
    { type: "p" },
    { type: "products" },
    { type: "h2" },
    { type: "p" },
    { type: "p" },
    { type: "h2" },
    { type: "p" },
    { type: "p" },
    { type: "p" },
  ];
  const mid = articleMidAdBeforeIndex(blocks);
  assert.equal(mid, 8);
  assert.equal(blocks[mid ?? -1]?.type, "h2");
  assert.notEqual(blocks[(mid ?? 1) - 1]?.type, "products");
});

test("公開記事は本文の途中に1枠入る位置がある", () => {
  const published = publishedArticles(articles);
  assert.ok(published.length > 0);
  for (const article of published) {
    const mid = articleMidAdBeforeIndex(article.blocks);
    assert.equal(typeof mid, "number", article.slug);
    assert.equal(article.blocks[mid ?? -1]?.type, "h2", article.slug);
    assert.notEqual(article.blocks[(mid ?? 1) - 1]?.type, "products", article.slug);
  }
});

test("広告ユニットは1回だけpushし、IDが無いときは要素を出さない", () => {
  const unit = source("../components/ad-unit.tsx");
  assert.match(unit, /\(window\.adsbygoogle = window\.adsbygoogle \|\| \[\]\)\.push\(\{\}\)/);
  assert.match(unit, /data-ad-format="auto"/);
  assert.match(unit, /data-full-width-responsive="true"/);
  assert.match(unit, /data-ad-client=\{adsensePublisherId\}/);
  assert.match(unit, /adSlotMinHeightPx/);
  assert.match(unit, /広告/);
  assert.match(unit, /スポンサーリンク/);
  assert.match(unit, /if \(!slot\)/);
  assert.match(unit, /clearTimeout/);
  assert.doesNotMatch(unit, /readClientAnalyticsChoice|AnalyticsChoice|consent/);
});

test("商品ページの枠はショップボタンとAmazonリンクより下", () => {
  const view = source("../components/yahoo-product-view.tsx");
  const ad = view.indexOf("<ProductAdUnit");
  assert.ok(ad > view.lastIndexOf("<AmazonAssociateLink"));
  assert.ok(ad > view.lastIndexOf("<MallCompare"));
  assert.equal(view.match(/<ProductAdUnit/g)?.length, 1);
  assert.doesNotMatch(source("../components/shop-price-compare.tsx"), /AdUnit|adsbygoogle|data-ad-slot/);
  assert.doesNotMatch(source("../components/mall-compare.tsx"), /AdUnit|adsbygoogle|data-ad-slot/);
});

test("一覧の枠は商品リストのあとで、1ページに1つ", () => {
  const home = source("../app/page.tsx");
  assert.ok(home.indexOf("<HomeCatalogSections") < home.indexOf("<ListAdUnit"));
  assert.equal(home.match(/<ListAdUnit/g)?.length, 1);

  const pet = source("../components/pet-kind-page.tsx");
  assert.ok(pet.indexOf("<PetListingBrowser") < pet.indexOf("<ListAdUnit"));
  assert.equal(pet.match(/<ListAdUnit/g)?.length, 1);

  const guide = source("../components/item-guide-page.tsx");
  assert.ok(guide.indexOf("<ComparableProductCards") < guide.indexOf("<ListAdUnit"));
  assert.equal(guide.match(/<ListAdUnit/g)?.length, 1);

  const search = source("../app/search/page.tsx");
  assert.ok(search.indexOf("<YahooSearchResults") < search.indexOf("<ListAdUnit"));
  assert.equal(search.match(/<ListAdUnit/g)?.length, 1);
});

test("記事は途中と末尾の2枠まで", () => {
  const page = source("../app/articles/[slug]/page.tsx");
  assert.equal(page.match(/<ArticleAdUnit/g)?.length, 2);
  assert.match(page, /articleMidAdBeforeIndex/);
});

test("規約・Cookie設定・エラーページには広告枠を置かない", () => {
  const files = [
    "../app/privacy/page.tsx",
    "../app/terms/page.tsx",
    "../app/cookies/page.tsx",
    "../app/affiliate/page.tsx",
    "../app/about/page.tsx",
    "../app/contact/page.tsx",
    "../app/guide/page.tsx",
    "../app/articles/page.tsx",
    "../app/error.tsx",
    "../app/not-found.tsx",
    "../components/cookie-consent.tsx",
  ];
  for (const file of files) {
    const text = source(file);
    assert.doesNotMatch(text, /AdUnit|adsbygoogle|data-ad-slot/, file);
  }
});
