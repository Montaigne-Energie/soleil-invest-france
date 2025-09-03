-- Secure investor data exposure via views by revoking direct access and providing scoped RPC functions

-- 1) Revoke all privileges on sensitive views from anon/authenticated roles
REVOKE ALL ON TABLE public.v_investissements_par_investisseur FROM anon, authenticated;
REVOKE ALL ON TABLE public.v_investisseur_totaux FROM anon, authenticated;
REVOKE ALL ON TABLE public.v_investisseur_pivot FROM anon, authenticated;

-- 2) Create SECURITY DEFINER functions that return only the current user's data
-- These functions explicitly filter by auth.uid() and avoid leaking other users' data

-- Function: get_my_investissements
CREATE OR REPLACE FUNCTION public.get_my_investissements()
RETURNS TABLE (
  user_id uuid,
  projet_id uuid,
  nombre_parts bigint,
  montant_total numeric,
  email text,
  projet_nom text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.user_id,
    i.projet_id,
    SUM(i.nombre_parts)::bigint AS nombre_parts,
    SUM(i.prix_total)::numeric AS montant_total,
    p.email,
    pr.nom AS projet_nom
  FROM public.investissements i
  JOIN public.projets pr ON pr.id = i.projet_id
  JOIN public.profiles p ON p.user_id = i.user_id
  WHERE i.user_id = auth.uid()
  GROUP BY i.user_id, i.projet_id, p.email, pr.nom
  ORDER BY pr.nom;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_investissements() TO authenticated;

-- Function: get_my_investisseur_totaux
CREATE OR REPLACE FUNCTION public.get_my_investisseur_totaux()
RETURNS TABLE (
  user_id uuid,
  total_parts bigint,
  total_montant numeric,
  email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.user_id,
    COALESCE(SUM(i.nombre_parts), 0)::bigint AS total_parts,
    COALESCE(SUM(i.prix_total), 0)::numeric AS total_montant,
    p.email
  FROM public.investissements i
  JOIN public.profiles p ON p.user_id = i.user_id
  WHERE i.user_id = auth.uid()
  GROUP BY i.user_id, p.email;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_investisseur_totaux() TO authenticated;

-- Function: get_my_investisseur_pivot
CREATE OR REPLACE FUNCTION public.get_my_investisseur_pivot()
RETURNS TABLE (
  user_id uuid,
  email text,
  parts_par_projet jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH agg AS (
    SELECT i.user_id, i.projet_id, SUM(i.nombre_parts)::bigint AS total_parts_by_project
    FROM public.investissements i
    WHERE i.user_id = auth.uid()
    GROUP BY i.user_id, i.projet_id
  )
  SELECT
    agg.user_id,
    p.email,
    COALESCE(jsonb_object_agg(pr.nom, agg.total_parts_by_project), '{}'::jsonb) AS parts_par_projet
  FROM agg
  JOIN public.projets pr ON pr.id = agg.projet_id
  JOIN public.profiles p ON p.user_id = agg.user_id
  GROUP BY agg.user_id, p.email;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_investisseur_pivot() TO authenticated;