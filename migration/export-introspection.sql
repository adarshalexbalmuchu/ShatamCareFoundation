-- export-introspection.sql
-- Purpose: Quickly extract human‑readable DDL snippets (tables, policies, functions, triggers, indexes)
-- for the current PUBLIC schema to assist in manual migration.
-- NOTE: For a lossless export (including constraints, sequences, defaults, ownership),
--       still prefer pg_dump:  pg_dump --schema-only --no-owner --no-privileges -n public > schema_export.sql
-- This script is meant for running inside the Supabase SQL editor or psql; it returns result sets.

-- =============================================================
-- 1. List RLS-enabled tables
-- =============================================================
SELECT 'rls_enabled_table' AS object_type, relname AS object_name
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relrowsecurity
ORDER BY relname;

-- =============================================================
-- 2. Generate simplified CREATE TABLE statements (columns only, no constraints)
--    (Constraints & indexes are shown separately.)
-- =============================================================
WITH cols AS (
  SELECT c.oid,
         n.nspname,
         c.relname,
         a.attnum,
         a.attname,
         pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
         a.attnotnull,
         pg_get_expr(ad.adbin, ad.adrelid) AS default_expr
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
  LEFT JOIN pg_attrdef ad ON ad.adrelid = c.oid AND ad.adnum = a.attnum
  WHERE c.relkind = 'r'
    AND n.nspname = 'public'
)
SELECT 'table_ddl' AS object_type,
       relname AS object_name,
       format(
         'CREATE TABLE IF NOT EXISTS %I.%I (\n%s\n);',
         nspname,
         relname,
         string_agg(format('  %I %s%s%s', attname, data_type,
             CASE WHEN default_expr IS NOT NULL THEN ' DEFAULT ' || default_expr ELSE '' END,
             CASE WHEN attnotnull THEN ' NOT NULL' ELSE '' END
           ), E',\n' ORDER BY attnum)
       ) AS ddl
FROM cols
GROUP BY nspname, relname
ORDER BY relname;

-- =============================================================
-- 3. Constraints (PK, FK, UNIQUE, CHECK)
-- =============================================================
SELECT 'constraint' AS object_type,
       c.conname AS object_name,
       format('%sALTER TABLE %I.%I ADD CONSTRAINT %I %s;',
              CASE WHEN c.convalidated THEN '' ELSE '-- NOT VALID ' END,
              n.nspname,
              t.relname,
              c.conname,
              pg_get_constraintdef(c.oid, true)) AS ddl
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
ORDER BY t.relname, c.conname;

-- =============================================================
-- 4. Indexes (excluding PK indexes already covered by constraints)
-- =============================================================
SELECT 'index' AS object_type,
       ci.relname AS object_name,
       pg_get_indexdef(i.indexrelid) AS ddl
FROM pg_index i
JOIN pg_class ct ON ct.oid = i.indrelid
JOIN pg_class ci ON ci.oid = i.indexrelid
JOIN pg_namespace n ON n.oid = ct.relnamespace
WHERE n.nspname = 'public'
  AND NOT i.indisprimary
ORDER BY ct.relname, ci.relname;

-- =============================================================
-- 5. Row Level Security Policies
-- =============================================================
SELECT 'policy' AS object_type,
       policyname AS object_name,
       format(
         'CREATE POLICY %I ON %I FOR %s TO %s%s%s;',
         policyname,
         tablename,
         cmd,
         roles,
         CASE WHEN qual IS NOT NULL THEN E' USING (' || qual || ')' ELSE '' END,
         CASE WHEN with_check IS NOT NULL THEN E' WITH CHECK (' || with_check || ')' ELSE '' END
       ) AS ddl
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================
-- 6. Functions (only user-defined in public schema)
-- =============================================================
SELECT 'function' AS object_type,
       p.proname AS object_name,
       pg_get_functiondef(p.oid) AS ddl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- =============================================================
-- 7. Triggers
-- =============================================================
SELECT 'trigger' AS object_type,
       tg.tgname AS object_name,
       pg_get_triggerdef(tg.oid, true) AS ddl
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND NOT tg.tgisinternal
ORDER BY c.relname, tg.tgname;

-- =============================================================
-- 8. Sequences (basic CREATE)
-- =============================================================
SELECT 'sequence' AS object_type,
       c.relname AS object_name,
       format('CREATE SEQUENCE IF NOT EXISTS %I.%I;', n.nspname, c.relname) AS ddl
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'S'
  AND n.nspname = 'public'
ORDER BY c.relname;

-- =============================================================
-- 9. Summary counts
-- =============================================================
SELECT 'summary' AS object_type, 'tables' AS metric, COUNT(*)::text AS value
FROM pg_class WHERE relkind='r' AND relnamespace='public'::regnamespace
UNION ALL
SELECT 'summary','policies', COUNT(*)::text FROM pg_policies WHERE schemaname='public'
UNION ALL
SELECT 'summary','functions', COUNT(*)::text FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f'
UNION ALL
SELECT 'summary','triggers', COUNT(*)::text FROM pg_trigger tg JOIN pg_class c ON c.oid=tg.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT tg.tgisinternal
UNION ALL
SELECT 'summary','sequences', COUNT(*)::text FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='S' AND n.nspname='public';

-- End of script
