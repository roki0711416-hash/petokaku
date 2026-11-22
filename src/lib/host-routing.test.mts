import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalOrigin,
  hostRouting,
  hostnameFromHostHeader,
  noindexRobotsTag,
  nonAliasVercelNoindexHeader,
  productionAliasRedirect,
} from "./host-routing.ts";

test("本番エイリアスだけを https://petokaku.com の同じパスへ恒久リダイレクトする", () => {
  assert.equal(productionAliasRedirect.permanent, true);
  assert.equal(productionAliasRedirect.destination, `${canonicalOrigin}/:path*`);
  assert.deepEqual(productionAliasRedirect.has, [{ type: "host", value: "petokaku\\.vercel\\.app" }]);
  assert.equal(hostRouting("petokaku.vercel.app"), "redirect-alias");
  assert.equal(hostRouting("PETOKAKU.VERCEL.APP"), "redirect-alias");
  assert.equal(hostRouting("petokaku.vercel.app:443"), "redirect-alias");
  assert.equal(hostnameFromHostHeader("petokaku.vercel.app:443"), "petokaku.vercel.app");
});

test("本番エイリアス以外の *.vercel.app は noindex で、プレビューのパスはそのまま返す", () => {
  assert.equal(nonAliasVercelNoindexHeader.headers[0]?.value, noindexRobotsTag);
  assert.equal(nonAliasVercelNoindexHeader.missing?.[0]?.value, productionAliasRedirect.has[0]?.value);
  for (const host of [
    "petokaku-git-ogp-slokasus-projects.vercel.app",
    "petokaku-git-main-slokasus-projects.vercel.app",
    "petokaku-abc123-slokasus-projects.vercel.app",
    "petokaku-slokasus-projects.vercel.app",
    "notpetokaku.vercel.app",
  ]) {
    assert.equal(hostRouting(host), "noindex", host);
  }
});

test("petokaku.com と www、ローカルはアプリ側のホスト規則を変えない", () => {
  for (const host of ["petokaku.com", "petokaku.com:443", "www.petokaku.com", "localhost", "localhost:3000", "", "petokaku.vercel.app.evil.com"]) {
    assert.equal(hostRouting(host), "unchanged", host);
  }
});
