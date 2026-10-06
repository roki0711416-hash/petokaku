-- service_role に、サーバーが価格履歴を読み書きするための表権限だけを足す。
-- anon / authenticated / PUBLIC には与えない。
-- RLS は変更しない。行もテーブルも消さない。
-- 実行後は db/price-history-check.sql を再実行する。

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE products, variants, offers, price_observations
  TO service_role;

COMMIT;
