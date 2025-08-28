-- Restrict public access to public.projets and allow only authenticated users to read
-- Ensure RLS is enabled
ALTER TABLE public.projets ENABLE ROW LEVEL SECURITY;

-- Drop the existing public-read policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'projets' AND policyname = 'Tout le monde peut voir les projets'
  ) THEN
    DROP POLICY "Tout le monde peut voir les projets" ON public.projets;
  END IF;
END $$;

-- Create an authenticated-only read policy (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'projets' AND policyname = 'Les utilisateurs authentifiés peuvent voir les projets'
  ) THEN
    CREATE POLICY "Les utilisateurs authentifiés peuvent voir les projets"
    ON public.projets
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;