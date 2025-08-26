-- Ajout d'un investissement de 250 000€ (250 000 parts) pour l'email spécifié
-- et association au projet "WATTS'ON B1" (créé si absent) avec MAJ des parts disponibles

-- Notes:
-- - On récupère l'utilisateur via auth.users (email exact)
-- - On crée le projet s'il n'existe pas avec prix_par_part = 1€, parts_totales = 750000 (1/3 = 250000 parts)
-- - On décrémente parts_disponibles de 250000 (sans passer en négatif)
-- - Si l'utilisateur n'existe pas, rien ne sera inséré

WITH investor AS (
  SELECT u.id AS user_id
  FROM auth.users u
  WHERE u.email = 'anto332@hotmail.fr'
), existing_project AS (
  SELECT p.id AS projet_id
  FROM public.projets p
  WHERE p.nom = 'WATTS''ON B1'
), created_project AS (
  INSERT INTO public.projets (
    nom, type_projet, prix_par_part, parts_totales, parts_disponibles, statut
  )
  SELECT 'WATTS''ON B1', 'solaire', 1, 750000, 750000, 'actif'
  WHERE NOT EXISTS (SELECT 1 FROM existing_project)
  RETURNING id
), final_project AS (
  SELECT projet_id AS id FROM existing_project
  UNION ALL
  SELECT id FROM created_project
), ins_invest AS (
  INSERT INTO public.investissements (
    user_id, projet_id, nombre_parts, prix_total
  )
  SELECT i.user_id, fp.id, 250000, 250000
  FROM investor i
  JOIN final_project fp ON TRUE
  -- Empêche l'insertion si l'utilisateur n'existe pas
  WHERE i.user_id IS NOT NULL
  RETURNING projet_id
), upd_project AS (
  UPDATE public.projets p
  SET parts_disponibles = GREATEST(0, p.parts_disponibles - 250000)
  WHERE p.id IN (SELECT id FROM final_project)
  RETURNING id
)
SELECT 'done' AS status;