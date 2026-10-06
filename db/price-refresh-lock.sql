-- 日次価格更新を同時に1本だけ走らせるためのロック。
-- このファイルは Supabase SQL Editor で人間が実行する。アプリからは実行しない。
-- 既存の行やテーブルは変更しない。新しい表の追加と、その1行の初期化だけを行う。

BEGIN;

CREATE TABLE price_refresh_lock (
  id integer PRIMARY KEY,
  owner text,
  locked_until timestamptz NOT NULL,
  CONSTRAINT price_refresh_lock_singleton CHECK (id = 1)
);

INSERT INTO price_refresh_lock (id, owner, locked_until)
VALUES (1, NULL, '-infinity');

COMMENT ON TABLE price_refresh_lock IS '日次更新の同時実行を防ぐ1行ロック。期限前の更新は0件になる。';

ALTER TABLE price_refresh_lock ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE price_refresh_lock FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE ON TABLE price_refresh_lock TO service_role;

COMMIT;
