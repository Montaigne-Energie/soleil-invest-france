-- Correction sécurité: ajout des politiques RLS pour les vues créées
alter view public.v_investissements_par_investisseur set (security_invoker = on);
alter view public.v_investisseur_totaux set (security_invoker = on);
alter view public.v_investisseur_pivot set (security_invoker = on);

-- Ajout des politiques RLS sur les vues (pour que les utilisateurs ne voient que leurs données)
create policy "Utilisateurs voient leurs investissements détaillés"
on public.v_investissements_par_investisseur
for select
using (user_id = auth.uid());

create policy "Utilisateurs voient leurs totaux"
on public.v_investisseur_totaux  
for select
using (user_id = auth.uid());

create policy "Utilisateurs voient leur pivot"
on public.v_investisseur_pivot
for select
using (user_id = auth.uid());