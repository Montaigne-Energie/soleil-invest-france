-- Associer la production quotidienne au projet via une contrainte de clé étrangère
-- et optimiser les requêtes avec un index adapté

-- 1) Ajouter la clé étrangère (enforcement pour les nouvelles lignes; évite l’échec si des orphelines existent)
alter table public.productions_quotidiennes
  add constraint productions_quotidiennes_projet_id_fkey
  foreign key (projet_id)
  references public.projets(id)
  on delete cascade
  not valid;

-- 2) Index pour les requêtes par projet et date
create index if not exists idx_productions_quotidiennes_projet_date
  on public.productions_quotidiennes (projet_id, date_production);

-- 3) (Optionnel) Valider la contrainte une fois les données nettoyées
-- alter table public.productions_quotidiennes validate constraint productions_quotidiennes_projet_id_fkey;