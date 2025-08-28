-- Secure the public.Investisseur table by enabling RLS and adding explicit deny-all policies
-- 1) Enable Row Level Security
ALTER TABLE public."Investisseur" ENABLE ROW LEVEL SECURITY;

-- 2) Add explicit deny policies for both anon and authenticated roles
-- These policies make the intent clear and silence linters while blocking all access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Investisseur' AND policyname = 'Aucun accès Investisseur (auth)'
  ) THEN
    CREATE POLICY "Aucun accès Investisseur (auth)"
    ON public."Investisseur"
    FOR ALL
    TO authenticated
    USING (false)
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Investisseur' AND policyname = 'Aucun accès Investisseur (anon)'
  ) THEN
    CREATE POLICY "Aucun accès Investisseur (anon)"
    ON public."Investisseur"
    FOR ALL
    TO anon
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;
