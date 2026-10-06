-- db/price-history.sql との差分を見る読み取り専用SQL。
-- SELECT だけです。行の追加、更新、削除、テーブル定義の変更はしません。
-- 結果のうち status が ok 以外の行を確認してください。

WITH expected_tables AS (
  SELECT *
  FROM (
    VALUES
      ('products'),
      ('variants'),
      ('offers'),
      ('price_observations')
  ) AS t(table_name)
),
expected_columns AS (
  SELECT *
  FROM (
    VALUES
      ('products', 'id', 'uuid', 'NO', 'uuid'),
      ('products', 'name', 'text', 'NO', 'none'),
      ('products', 'brand', 'text', 'NO', 'empty'),
      ('products', 'category', 'text', 'NO', 'none'),
      ('products', 'unit_price_type', 'text', 'NO', 'none'),
      ('products', 'created_at', 'timestamp with time zone', 'NO', 'now'),
      ('products', 'updated_at', 'timestamp with time zone', 'NO', 'now'),
      ('variants', 'id', 'uuid', 'NO', 'uuid'),
      ('variants', 'product_id', 'uuid', 'NO', 'none'),
      ('variants', 'jan_code', 'text', 'YES', 'none'),
      ('variants', 'size_label', 'text', 'NO', 'none'),
      ('variants', 'stated_quantity', 'numeric', 'YES', 'none'),
      ('variants', 'stated_unit', 'text', 'YES', 'none'),
      ('variants', 'quantity', 'numeric', 'YES', 'none'),
      ('variants', 'quantity_unit', 'text', 'YES', 'none'),
      ('variants', 'quantity_confidence', 'text', 'NO', 'none'),
      ('variants', 'quantity_source', 'text', 'YES', 'none'),
      ('variants', 'model_number', 'text', 'YES', 'none'),
      ('variants', 'created_at', 'timestamp with time zone', 'NO', 'now'),
      ('variants', 'updated_at', 'timestamp with time zone', 'NO', 'now'),
      ('offers', 'id', 'uuid', 'NO', 'uuid'),
      ('offers', 'variant_id', 'uuid', 'NO', 'none'),
      ('offers', 'provider', 'text', 'NO', 'none'),
      ('offers', 'seller_id', 'text', 'YES', 'none'),
      ('offers', 'item_code', 'text', 'YES', 'none'),
      ('offers', 'shop_name', 'text', 'NO', 'none'),
      ('offers', 'product_url', 'text', 'YES', 'none'),
      ('offers', 'listing_title', 'text', 'YES', 'none'),
      ('offers', 'pack_count', 'integer', 'YES', 'none'),
      ('offers', 'pack_unit', 'text', 'YES', 'none'),
      ('offers', 'created_at', 'timestamp with time zone', 'NO', 'now'),
      ('offers', 'updated_at', 'timestamp with time zone', 'NO', 'now'),
      ('price_observations', 'id', 'uuid', 'NO', 'uuid'),
      ('price_observations', 'offer_id', 'uuid', 'NO', 'none'),
      ('price_observations', 'provider', 'text', 'NO', 'none'),
      ('price_observations', 'jan_code', 'text', 'YES', 'none'),
      ('price_observations', 'seller_id', 'text', 'YES', 'none'),
      ('price_observations', 'item_code', 'text', 'YES', 'none'),
      ('price_observations', 'price', 'integer', 'YES', 'none'),
      ('price_observations', 'shipping_fee', 'integer', 'YES', 'none'),
      ('price_observations', 'shipping_status', 'text', 'NO', 'none'),
      ('price_observations', 'stock_status', 'text', 'NO', 'none'),
      ('price_observations', 'observed_at', 'timestamp with time zone', 'NO', 'none'),
      ('price_observations', 'last_confirmed_at', 'timestamp with time zone', 'NO', 'none'),
      ('price_observations', 'observed_on', 'date', 'NO', 'none')
  ) AS t(table_name, column_name, data_type, is_nullable, default_kind)
),
actual_columns AS (
  SELECT table_name, column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name IN ('products', 'variants', 'offers', 'price_observations')
),
expected_checks AS (
  SELECT *
  FROM (
    VALUES
      ('products_category_check', 'products', 'small-animal'),
      ('products_unit_price_type_check', 'products', 'per_100g'),
      ('variants_jan_code_format_check', 'variants', '[0-9]{13}'),
      ('variants_stated_quantity_check', 'variants', 'stated_quantity'),
      ('variants_quantity_check', 'variants', 'quantity'),
      ('variants_stated_unit_check', 'variants', 'sheet'),
      ('variants_quantity_unit_check', 'variants', 'piece'),
      ('variants_quantity_confidence_check', 'variants', 'medium'),
      ('variants_quantity_source_check', 'variants', 'shop_titles'),
      ('offers_provider_check', 'offers', 'rakuten'),
      ('offers_pack_count_check', 'offers', 'pack_count'),
      ('offers_pack_unit_check', 'offers', 'パック'),
      ('price_observations_provider_check', 'price_observations', 'amazon'),
      ('price_observations_jan_code_format_check', 'price_observations', '[0-9]{13}'),
      ('price_observations_price_check', 'price_observations', 'price'),
      ('price_observations_shipping_fee_check', 'price_observations', 'shipping_fee'),
      ('price_observations_shipping_status_check', 'price_observations', 'conditional_free'),
      ('price_observations_stock_status_check', 'price_observations', 'out_of_stock'),
      ('price_observations_shipping_consistent_check', 'price_observations', 'conditional_free'),
      ('price_observations_confirmed_after_observed_check', 'price_observations', 'last_confirmed_at'),
      ('price_observations_observed_on_tokyo_check', 'price_observations', 'Asia/Tokyo')
  ) AS t(constraint_name, table_name, snippet)
),
actual_checks AS (
  SELECT con.conname AS constraint_name, rel.relname AS table_name, pg_get_constraintdef(con.oid) AS definition
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND con.contype = 'c'
    AND rel.relname IN ('products', 'variants', 'offers', 'price_observations')
),
expected_fks AS (
  SELECT *
  FROM (
    VALUES
      ('variants', 'product_id', 'products', 'r', 'r'),
      ('offers', 'variant_id', 'variants', 'r', 'r'),
      ('price_observations', 'offer_id', 'offers', 'r', 'r')
  ) AS t(table_name, column_name, referenced_table, delete_rule, update_rule)
),
actual_fks AS (
  SELECT
    src.relname AS table_name,
    att.attname AS column_name,
    tgt.relname AS referenced_table,
    con.confdeltype::text AS delete_rule,
    con.confupdtype::text AS update_rule
  FROM pg_constraint con
  JOIN pg_class src ON src.oid = con.conrelid
  JOIN pg_class tgt ON tgt.oid = con.confrelid
  JOIN pg_namespace nsp ON nsp.oid = src.relnamespace
  JOIN LATERAL unnest(con.conkey) AS ck(attnum) ON true
  JOIN pg_attribute att ON att.attrelid = src.oid AND att.attnum = ck.attnum
  WHERE nsp.nspname = 'public'
    AND con.contype = 'f'
    AND src.relname IN ('products', 'variants', 'offers', 'price_observations')
),
expected_indexes AS (
  SELECT *
  FROM (
    VALUES
      ('products_pkey', 'products', 'unique', '(id)', ''),
      ('variants_pkey', 'variants', 'unique', '(id)', ''),
      ('variants_jan_code_unique', 'variants', 'unique', '(jan_code)', 'jan_code IS NOT NULL'),
      ('variants_product_id_idx', 'variants', 'plain', '(product_id)', ''),
      ('offers_pkey', 'offers', 'unique', '(id)', ''),
      ('offers_provider_seller_item_unique', 'offers', 'unique', '(provider, seller_id, item_code)', 'item_code IS NOT NULL'),
      ('offers_provider_product_url_unique', 'offers', 'unique', '(provider, product_url)', 'product_url IS NOT NULL'),
      ('offers_variant_id_idx', 'offers', 'plain', '(variant_id)', ''),
      ('price_observations_pkey', 'price_observations', 'unique', '(id)', ''),
      ('price_observations_offer_observed_at_unique', 'price_observations', 'unique', '(offer_id, observed_at DESC)', ''),
      ('price_observations_offer_observed_on_idx', 'price_observations', 'plain', '(offer_id, observed_on DESC)', ''),
      ('price_observations_jan_observed_on_idx', 'price_observations', 'plain', '(jan_code, observed_on DESC)', 'jan_code IS NOT NULL')
  ) AS t(index_name, table_name, uniqueness, key_snippet, predicate_snippet)
),
actual_indexes AS (
  SELECT indexname AS index_name, tablename AS table_name, indexdef
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename IN ('products', 'variants', 'offers', 'price_observations')
),
expected_service_privileges AS (
  SELECT *
  FROM (
    VALUES
      ('products', 'SELECT'),
      ('products', 'INSERT'),
      ('products', 'UPDATE'),
      ('products', 'DELETE'),
      ('variants', 'SELECT'),
      ('variants', 'INSERT'),
      ('variants', 'UPDATE'),
      ('variants', 'DELETE'),
      ('offers', 'SELECT'),
      ('offers', 'INSERT'),
      ('offers', 'UPDATE'),
      ('offers', 'DELETE'),
      ('price_observations', 'SELECT'),
      ('price_observations', 'INSERT'),
      ('price_observations', 'UPDATE'),
      ('price_observations', 'DELETE')
  ) AS t(table_name, privilege_type)
),
checks AS (
  SELECT
    'table'::text AS section,
    expected_tables.table_name AS item,
    CASE WHEN actual.table_name IS NULL THEN 'missing' ELSE 'ok' END AS status,
    CASE WHEN actual.table_name IS NULL THEN 'public にテーブルがありません' ELSE 'あります' END AS detail
  FROM expected_tables
  LEFT JOIN (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  ) AS actual USING (table_name)

  UNION ALL

  SELECT
    'table',
    tables.table_name,
    'extra',
    '想定の4テーブル以外です'
  FROM information_schema.tables AS tables
  WHERE tables.table_schema = 'public'
    AND tables.table_type = 'BASE TABLE'
    AND tables.table_name NOT IN ('products', 'variants', 'offers', 'price_observations')

  UNION ALL

  SELECT
    'column',
    expected_columns.table_name || '.' || expected_columns.column_name,
    CASE
      WHEN actual_columns.column_name IS NULL THEN 'missing'
      WHEN actual_columns.data_type IS DISTINCT FROM expected_columns.data_type THEN 'mismatch'
      WHEN actual_columns.is_nullable IS DISTINCT FROM expected_columns.is_nullable THEN 'mismatch'
      WHEN expected_columns.default_kind = 'uuid'
        AND COALESCE(actual_columns.column_default, '') NOT ILIKE '%gen_random_uuid%' THEN 'mismatch'
      WHEN expected_columns.default_kind = 'empty'
        AND COALESCE(actual_columns.column_default, '') NOT LIKE '%''''%' THEN 'mismatch'
      WHEN expected_columns.default_kind = 'now'
        AND COALESCE(actual_columns.column_default, '') NOT ILIKE '%now()%'
        AND COALESCE(actual_columns.column_default, '') NOT ILIKE '%current_timestamp%' THEN 'mismatch'
      ELSE 'ok'
    END,
    'expected ' || expected_columns.data_type || ' null=' || expected_columns.is_nullable
      || ' default=' || expected_columns.default_kind
      || ' / actual ' || COALESCE(actual_columns.data_type, '-')
      || ' null=' || COALESCE(actual_columns.is_nullable, '-')
      || ' default=' || COALESCE(actual_columns.column_default, '-')
  FROM expected_columns
  LEFT JOIN actual_columns USING (table_name, column_name)

  UNION ALL

  SELECT
    'column',
    actual_columns.table_name || '.' || actual_columns.column_name,
    'extra',
    actual_columns.data_type || ' null=' || actual_columns.is_nullable
  FROM actual_columns
  LEFT JOIN expected_columns USING (table_name, column_name)
  WHERE expected_columns.column_name IS NULL

  UNION ALL

  SELECT
    'check',
    expected_checks.constraint_name,
    CASE
      WHEN actual_checks.constraint_name IS NULL THEN 'missing'
      WHEN actual_checks.table_name IS DISTINCT FROM expected_checks.table_name THEN 'mismatch'
      WHEN actual_checks.definition NOT ILIKE '%' || expected_checks.snippet || '%' THEN 'mismatch'
      ELSE 'ok'
    END,
    COALESCE(actual_checks.definition, '制約がありません')
  FROM expected_checks
  LEFT JOIN actual_checks USING (constraint_name)

  UNION ALL

  SELECT
    'check',
    actual_checks.constraint_name,
    'extra',
    actual_checks.table_name || ': ' || actual_checks.definition
  FROM actual_checks
  LEFT JOIN expected_checks USING (constraint_name)
  WHERE expected_checks.constraint_name IS NULL

  UNION ALL

  SELECT
    'foreign_key',
    expected_fks.table_name || '.' || expected_fks.column_name || ' -> ' || expected_fks.referenced_table,
    CASE
      WHEN actual_fks.column_name IS NULL THEN 'missing'
      WHEN actual_fks.delete_rule IS DISTINCT FROM expected_fks.delete_rule
        OR actual_fks.update_rule IS DISTINCT FROM expected_fks.update_rule THEN 'mismatch'
      ELSE 'ok'
    END,
    'expected restrict/restrict / actual delete='
      || COALESCE(actual_fks.delete_rule, '-')
      || ' update=' || COALESCE(actual_fks.update_rule, '-')
      || ' (r=restrict, a=no action, c=cascade, n=set null)'
  FROM expected_fks
  LEFT JOIN actual_fks USING (table_name, column_name, referenced_table)

  UNION ALL

  SELECT
    'foreign_key',
    actual_fks.table_name || '.' || actual_fks.column_name || ' -> ' || actual_fks.referenced_table,
    'extra',
    'delete=' || actual_fks.delete_rule || ' update=' || actual_fks.update_rule
  FROM actual_fks
  LEFT JOIN expected_fks USING (table_name, column_name, referenced_table)
  WHERE expected_fks.column_name IS NULL

  UNION ALL

  SELECT
    'index',
    expected_indexes.index_name,
    CASE
      WHEN actual_indexes.index_name IS NULL THEN 'missing'
      WHEN actual_indexes.table_name IS DISTINCT FROM expected_indexes.table_name THEN 'mismatch'
      WHEN expected_indexes.uniqueness = 'unique' AND actual_indexes.indexdef NOT ILIKE 'CREATE UNIQUE INDEX%' THEN 'mismatch'
      WHEN expected_indexes.uniqueness = 'plain' AND actual_indexes.indexdef ILIKE 'CREATE UNIQUE INDEX%' THEN 'mismatch'
      WHEN replace(actual_indexes.indexdef, ' ', '') NOT ILIKE '%' || replace(expected_indexes.key_snippet, ' ', '') || '%' THEN 'mismatch'
      WHEN expected_indexes.predicate_snippet <> ''
        AND actual_indexes.indexdef NOT ILIKE '%' || expected_indexes.predicate_snippet || '%' THEN 'mismatch'
      ELSE 'ok'
    END,
    COALESCE(actual_indexes.indexdef, '索引がありません')
  FROM expected_indexes
  LEFT JOIN actual_indexes USING (index_name)

  UNION ALL

  SELECT
    'index',
    actual_indexes.index_name,
    'extra',
    actual_indexes.indexdef
  FROM actual_indexes
  LEFT JOIN expected_indexes USING (index_name)
  WHERE expected_indexes.index_name IS NULL

  UNION ALL

  SELECT
    'rls',
    expected_tables.table_name,
    CASE
      WHEN cls.relname IS NULL THEN 'missing'
      WHEN cls.relrowsecurity THEN 'ok'
      ELSE 'mismatch'
    END,
    CASE
      WHEN cls.relname IS NULL THEN 'テーブルがありません'
      WHEN cls.relrowsecurity THEN 'RLS 有効'
      ELSE 'RLS 無効'
    END
  FROM expected_tables
  LEFT JOIN pg_class cls
    ON cls.relname = expected_tables.table_name
   AND cls.relkind = 'r'
   AND cls.relnamespace = 'public'::regnamespace

  UNION ALL

  SELECT
    'policy',
    pol.tablename || '.' || pol.policyname,
    'unexpected',
    pol.roles::text || ' ' || pol.cmd || ' ' || COALESCE(pol.qual, '') || ' ' || COALESCE(pol.with_check, '')
  FROM pg_policies pol
  WHERE pol.schemaname = 'public'
    AND pol.tablename IN ('products', 'variants', 'offers', 'price_observations')

  UNION ALL

  SELECT
    'grant',
    grants.table_name || ' ' || grants.grantee || ' ' || grants.privilege_type,
    'unexpected',
    'anon / authenticated / PUBLIC に権限が残っています'
  FROM information_schema.role_table_grants AS grants
  WHERE grants.table_schema = 'public'
    AND grants.table_name IN ('products', 'variants', 'offers', 'price_observations')
    AND grants.grantee IN ('anon', 'authenticated', 'PUBLIC')

  UNION ALL

  SELECT
    'service_role',
    expected_service_privileges.table_name || ' ' || expected_service_privileges.privilege_type,
    CASE WHEN grants.privilege_type IS NULL THEN 'missing' ELSE 'ok' END,
    CASE
      WHEN grants.privilege_type IS NULL THEN 'service_role にこの権限がありません'
      ELSE 'サーバー用ロールにあります'
    END
  FROM expected_service_privileges
  LEFT JOIN information_schema.role_table_grants AS grants
    ON grants.table_schema = 'public'
   AND grants.table_name = expected_service_privileges.table_name
   AND grants.privilege_type = expected_service_privileges.privilege_type
   AND grants.grantee = 'service_role'
)
SELECT section, item, status, detail
FROM checks
ORDER BY
  CASE status
    WHEN 'missing' THEN 1
    WHEN 'mismatch' THEN 2
    WHEN 'unexpected' THEN 3
    WHEN 'extra' THEN 4
    ELSE 5
  END,
  section,
  item;
