-- Run after schema.sql on the new Supabase project, before publishing the app.
-- The Express backend connects directly to Postgres. Browser Data API access is unnecessary.
BEGIN;
DO $$
DECLARE item record;
BEGIN
  FOR item IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', item.tablename);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', item.tablename);
  END LOOP;
END;
$$;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
COMMIT;
