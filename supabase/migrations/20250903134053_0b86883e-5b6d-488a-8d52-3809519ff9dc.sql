-- Limiter les projets à la liste fournie et nettoyer les données liées
-- Approche minimale sans modifier le schéma (pas de contrainte supplémentaire)

begin;

-- Liste autorisée et paramètres associés
with allowed(nom, parts_totales) as (
  values 
    ('WATTS''ON b1', 1340000),
    ('WATTS''ON b2', 1600000),
    ('WATTS''ON a1', 1540000),
    ('WATS''ON MAX', 5400000),
    ('WATTS''ON b3', 200000)
)

-- 1) Supprimer les données dépendantes pour les projets non autorisés
-- (sécurise même si aucune contrainte FK n'est présente)
, del_prod as (
  delete from public.productions_quotidiennes pq
  using public.projets p
  where pq.projet_id = p.id
    and p.nom not in (select nom from allowed)
  returning pq.id
)
, del_inv as (
  delete from public.investissements i
  using public.projets p
  where i.projet_id = p.id
    and p.nom not in (select nom from allowed)
  returning i.id
)

-- 2) Supprimer les projets non autorisés
, del_proj as (
  delete from public.projets p
  where p.nom not in (select nom from allowed)
  returning p.id
)

-- 3) Mettre à jour les projets autorisés existants
update public.projets p
set 
  parts_totales = a.parts_totales,
  parts_disponibles = a.parts_totales,
  type_projet = 'solaire',
  prix_par_part = 1,
  statut = coalesce(p.statut, 'actif'),
  updated_at = now()
from allowed a
where p.nom = a.nom;

-- 4) Insérer les projets autorisés manquants
insert into public.projets (nom, type_projet, prix_par_part, parts_totales, parts_disponibles, statut)
select a.nom, 'solaire', 1, a.parts_totales, a.parts_totales, 'actif'
from allowed a
left join public.projets p on p.nom = a.nom
where p.id is null;

commit;