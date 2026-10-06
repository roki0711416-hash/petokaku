import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./server.ts", import.meta.url), "utf8");

test("価格履歴の接続はサーバー専用で、公開用の環境変数を使わない", () => {
  assert.match(source, /import "server-only"/);
  assert.match(source, /SUPABASE_URL/);
  assert.match(source, /SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(source, /NEXT_PUBLIC_/);
  assert.doesNotMatch(source, /SUPABASE_ANON_KEY/);
  assert.doesNotMatch(source, /sb_publishable_/);
  assert.doesNotMatch(source, /sb_secret_/);
});
