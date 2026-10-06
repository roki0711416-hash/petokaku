-- 価格履歴のスキーマ。まだ実行しない。
-- Supabase への接続、このファイルの適用、本番DBの作成は別の段で行う。
--
-- 関係: products → variants → offers → price_observations
-- 価格行は offer に紐づく。シリーズや容量を消しても履歴が連動して消えないよう、
-- 外部キーはすべて ON DELETE RESTRICT にする。
-- updated_at はアプリが更新する。トリガーは置かない。
-- observed_on は Asia/Tokyo の日付と一致することを CHECK で保証する。
-- timestamptz を時間帯つきで日付にする式は STABLE のため、生成列にはできない。

BEGIN;

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  category text NOT NULL,
  unit_price_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_category_check CHECK (
    category IN ('dog', 'cat', 'small-animal', 'bird', 'fish', 'other')
  ),
  CONSTRAINT products_unit_price_type_check CHECK (
    unit_price_type IN ('per_100g', 'per_kg', 'per_l', 'per_sheet', 'per_piece', 'none')
  )
);

CREATE TABLE variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  jan_code text,
  size_label text NOT NULL,
  stated_quantity numeric,
  stated_unit text,
  quantity numeric,
  quantity_unit text,
  quantity_confidence text NOT NULL,
  quantity_source text,
  model_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT variants_jan_code_format_check CHECK (
    jan_code IS NULL OR jan_code ~ '^[0-9]{13}$'
  ),
  CONSTRAINT variants_stated_quantity_check CHECK (
    stated_quantity IS NULL OR stated_quantity > 0
  ),
  CONSTRAINT variants_quantity_check CHECK (
    quantity IS NULL OR quantity > 0
  ),
  CONSTRAINT variants_stated_unit_check CHECK (
    stated_unit IS NULL OR stated_unit IN ('g', 'kg', 'ml', 'l', 'sheet', 'piece')
  ),
  CONSTRAINT variants_quantity_unit_check CHECK (
    quantity_unit IS NULL OR quantity_unit IN ('g', 'kg', 'ml', 'l', 'sheet', 'piece')
  ),
  CONSTRAINT variants_quantity_confidence_check CHECK (
    quantity_confidence IN ('high', 'medium', 'unknown')
  ),
  CONSTRAINT variants_quantity_source_check CHECK (
    quantity_source IS NULL OR quantity_source IN ('api', 'master', 'shop_titles', 'shop_title', 'sample')
  )
);

-- 通常の UNIQUE でも NULL は複数行に置ける。
-- 意図を明示し、NULL を索引に載せないため、有効な JAN だけを部分ユニークにする。
-- 13桁でない値は CHECK で拒否する。空文字も NULL ではないので、CHECK がないと1件だけ入ってしまう。
CREATE UNIQUE INDEX variants_jan_code_unique
  ON variants (jan_code)
  WHERE jan_code IS NOT NULL;

CREATE INDEX variants_product_id_idx
  ON variants (product_id);

CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES variants (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  provider text NOT NULL,
  seller_id text,
  item_code text,
  shop_name text NOT NULL,
  product_url text,
  listing_title text,
  pack_count integer,
  pack_unit text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offers_provider_check CHECK (
    provider IN ('yahoo', 'rakuten', 'amazon', 'sample')
  ),
  CONSTRAINT offers_pack_count_check CHECK (
    pack_count IS NULL OR pack_count >= 1
  ),
  CONSTRAINT offers_pack_unit_check CHECK (
    pack_unit IS NULL OR pack_unit IN ('袋', '個', '本', 'パック')
  )
);

-- Yahoo の同一掲載は provider + seller_id + item_code。
-- どちらかが NULL の行は、この索引では同一とみなさない。
CREATE UNIQUE INDEX offers_provider_seller_item_unique
  ON offers (provider, seller_id, item_code)
  WHERE seller_id IS NOT NULL AND item_code IS NOT NULL;

-- 商品コードが取れない掲載は、同じ URL を二重に作らない。
CREATE UNIQUE INDEX offers_provider_product_url_unique
  ON offers (provider, product_url)
  WHERE (seller_id IS NULL OR item_code IS NULL)
    AND product_url IS NOT NULL;

CREATE INDEX offers_variant_id_idx
  ON offers (variant_id);

CREATE TABLE price_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES offers (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  provider text NOT NULL,
  jan_code text,
  seller_id text,
  item_code text,
  price integer,
  shipping_fee integer,
  shipping_status text NOT NULL,
  stock_status text NOT NULL,
  observed_at timestamptz NOT NULL,
  last_confirmed_at timestamptz NOT NULL,
  observed_on date NOT NULL,
  CONSTRAINT price_observations_provider_check CHECK (
    provider IN ('yahoo', 'rakuten', 'amazon', 'sample')
  ),
  CONSTRAINT price_observations_jan_code_format_check CHECK (
    jan_code IS NULL OR jan_code ~ '^[0-9]{13}$'
  ),
  CONSTRAINT price_observations_price_check CHECK (
    price IS NULL OR price >= 0
  ),
  CONSTRAINT price_observations_shipping_fee_check CHECK (
    shipping_fee IS NULL OR shipping_fee >= 0
  ),
  CONSTRAINT price_observations_shipping_status_check CHECK (
    shipping_status IN ('free', 'conditional_free', 'unknown', 'amount')
  ),
  CONSTRAINT price_observations_stock_status_check CHECK (
    stock_status IN ('in_stock', 'out_of_stock', 'unknown')
  ),
  -- NULL は金額不明、0 は送料0円。状態と金額が食い違った行は入れない。
  CONSTRAINT price_observations_shipping_consistent_check CHECK (
    (shipping_status = 'free' AND shipping_fee = 0)
    OR (shipping_status = 'conditional_free' AND shipping_fee IS NULL)
    OR (shipping_status = 'unknown' AND shipping_fee IS NULL)
    OR (shipping_status = 'amount' AND shipping_fee > 0)
  ),
  CONSTRAINT price_observations_confirmed_after_observed_check CHECK (
    last_confirmed_at >= observed_at
  ),
  -- セッションの TimeZone ではなく、名前つきの Asia/Tokyo で日付を決める。
  CONSTRAINT price_observations_observed_on_tokyo_check CHECK (
    observed_on = (observed_at AT TIME ZONE 'Asia/Tokyo')::date
  )
);

-- 同じ瞬間の二重挿入を防ぎ、offer ごとの新しい順の参照にも使う。
CREATE UNIQUE INDEX price_observations_offer_observed_at_unique
  ON price_observations (offer_id, observed_at DESC);

CREATE INDEX price_observations_offer_observed_on_idx
  ON price_observations (offer_id, observed_on DESC);

CREATE INDEX price_observations_jan_observed_on_idx
  ON price_observations (jan_code, observed_on DESC)
  WHERE jan_code IS NOT NULL;

COMMENT ON TABLE products IS '商品シリーズ。容量違いは variants。名前では一意にしない。';
COMMENT ON TABLE variants IS '容量。主キーは id。JAN は検証済みの13桁だけを部分ユニークにする。';
COMMENT ON TABLE offers IS 'ショップごとの販売情報。provider + seller_id + item_code で同一掲載を識別する。';
COMMENT ON TABLE price_observations IS 'offer の価格観測。参考単価や安値判定は保存しない。';
COMMENT ON COLUMN price_observations.shipping_fee IS 'NULL は金額不明。0 は送料無料または送料0円。';
COMMENT ON COLUMN price_observations.observed_on IS 'observed_at を Asia/Tokyo で切った日付。サーバーの TimeZone には依存しない。';
COMMENT ON COLUMN price_observations.jan_code IS '記録時点の JAN。正の紐づけは offer_id から variant へ戻る。';

-- anon と authenticated は Supabase のロール。ブラウザからは読ませも書かせもしない。
-- ポリシーを足さないので、RLS 有効化だけでこの2ロールは全操作が拒否される。
-- GRANT が残っていると将来ポリシーを足した瞬間に書き込めてしまうため、権限も外す。
-- service_role は RLS を迂回する。Next.js のサーバーだけが使う。
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_observations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE products, variants, offers, price_observations FROM PUBLIC, anon, authenticated;

COMMIT;
