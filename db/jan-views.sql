-- 最近開かれたJAN商品詳細を、日次の価格更新対象として残す。
-- 価格履歴の4テーブルとは別にする。閲覧だけでは商品や掲載を作らない。
-- このファイルは Supabase SQL Editor で人間が実行する。アプリからは実行しない。
-- 新しい表の追加だけを行う。既存の行やテーブルは変更しない。

BEGIN;

CREATE TABLE jan_views (
  jan_code text PRIMARY KEY,
  last_viewed_at timestamptz NOT NULL,
  view_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT jan_views_jan_code_format_check CHECK (jan_code ~ '^[0-9]{13}$'),
  CONSTRAINT jan_views_view_count_check CHECK (view_count >= 1),
  CONSTRAINT jan_views_updated_after_created_check CHECK (updated_at >= created_at)
);

CREATE INDEX jan_views_last_viewed_at_idx
  ON jan_views (last_viewed_at DESC);

COMMENT ON TABLE jan_views IS '商品詳細を開いたJAN。同じJANは1行にまとめ、日次更新の対象にする。';
COMMENT ON COLUMN jan_views.last_viewed_at IS '最後に商品詳細を開いた時刻。';
COMMENT ON COLUMN jan_views.view_count IS '商品詳細を開いた回数。検索一覧の表示では増やさない。';

ALTER TABLE jan_views ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE jan_views FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE jan_views TO service_role;

COMMIT;
