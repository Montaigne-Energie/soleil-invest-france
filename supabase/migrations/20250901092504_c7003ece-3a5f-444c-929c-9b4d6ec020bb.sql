begin;

-- 1) Ajouter toutes les parts restantes du projet WATTS'ON B1 à antof85b@gmail.com
with p as (
  select id, parts_disponibles, prix_par_part
  from public.projets
  where id = 'b4787de3-d9dd-483f-a6c6-7af96678d31f'
)
, ins as (
  insert into public.investissements (user_id, projet_id, nombre_parts, prix_total)
  select '20e50f52-0536-4625-86db-e0d782022d69'::uuid, p.id, p.parts_disponibles, (p.parts_disponibles * p.prix_par_part)
  from p
  where p.parts_disponibles > 0
  returning 1
)
update public.projets pr
set parts_disponibles = 0, updated_at = now()
from p
where pr.id = p.id and p.parts_disponibles > 0;

-- 2) Vues de reporting par investisseur
create or replace view public.v_investissements_par_investisseur as
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

create or replace view public.v_investisseur_totaux as
select
  prf.email,
  i.user_id,
  sum(i.nombre_parts) as total_parts,
  sum(i.prix_total) as total_montant
from public.investissements i
join public.profiles prf on prf.user_id = i.user_id
group by prf.email, i.user_id;

create or replace view public.v_investisseur_pivot as
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

commit;