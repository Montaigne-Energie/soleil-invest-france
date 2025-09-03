-- Nettoyer les anciens projets et insérer les 5 nouveaux
-- Approche simple par étapes

-- 1) D'abord supprimer toutes les données liées (productions et investissements)
DELETE FROM public.productions_quotidiennes;
DELETE FROM public.investissements;

-- 2) Supprimer tous les anciens projets
DELETE FROM public.projets;

-- 3) Insérer les 5 nouveaux projets
INSERT INTO public.projets (nom, type_projet, prix_par_part, parts_totales, parts_disponibles, statut)
VALUES 
  ('WATTS''ON b1', 'solaire', 1, 1340000, 1340000, 'actif'),
  ('WATTS''ON b2', 'solaire', 1, 1600000, 1600000, 'actif'),
  ('WATTS''ON a1', 'solaire', 1, 1540000, 1540000, 'actif'),
  ('WATS''ON MAX', 'solaire', 1, 5400000, 5400000, 'actif'),
  ('WATTS''ON b3', 'solaire', 1, 200000, 200000, 'actif');