-- Export Schema Script for Supabase Migration
-- Run this in your current Supabase SQL editor to get the schema

-- 1. Export all tables structure
SELECT 
    schemaname,
    tablename,
    tableowner,
    pg_get_tabledef(schemaname||'.'||tablename) as table_definition
FROM pg_tables 
WHERE schemaname = 'public';

-- 2. Export all functions
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public';

-- 3. Export all policies (RLS)
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public';

-- 4. Export triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
