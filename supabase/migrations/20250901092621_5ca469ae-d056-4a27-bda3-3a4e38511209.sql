-- Correction: Les vues en PostgreSQL ne supportent pas directement les politiques RLS
-- On va recréer les vues avec SECURITY INVOKER pour corriger les warnings sécurité

drop view if exists public.v_investissements_par_investisseur;
drop view if exists public.v_investisseur_totaux;
drop view if exists public.v_investisseur_pivot;

-- Recréation des vues avec SECURITY INVOKER (utilise les permissions de l'utilisateur qui fait la requête)
create view public.v_investissements_par_investisseur 
with (security_invoker = on) as
select
  prf.email,
  i.user_id,
  i.projet_id,
  pr.nom as projet_nom,
  sum(i.nombre_parts) as nombre_parts,
  sum(i.prix_total) as montant_total
from public.investissements i
join public.profiles prf on prf.user_id = i.user_id
join public.projets pr on pr.id = i.projet_id
group by prf.email, i.user_id, i.projet_id, pr.nom;

create view public.v_investisseur_totaux 
with (security_invoker = on) as
select
  prf.email,
  i.user_id,
  sum(i.nombre_parts) as total_parts,
  sum(i.prix_total) as total_montant
from public.investissements i
join public.profiles prf on prf.user_id = i.user_id
group by prf.email, i.user_id;

create view public.v_investisseur_pivot 
with (security_invoker = on) as
select
  prf.email,
  agg.user_id,
  jsonb_object_agg(pr.nom, agg.parts) as parts_par_projet
from (
  select user_id, projet_id, sum(nombre_parts) as parts
  from public.investissements
  group by user_id, projet_id
) agg
join public.profiles prf on prf.user_id = agg.user_id
join public.projets pr on pr.id = agg.projet_id
group by prf.email, agg.user_id;