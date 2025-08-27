-- Mise à jour du projet WATTS'ON B1 avec les bonnes informations
UPDATE projets 
SET 
  parts_totales = 1340000,
  parts_disponibles = 1340000 - 250000, -- 1 090 000 parts disponibles
  capacite_mw = 60, -- 60 MWh/mois équivaut environ à 60 MW de capacité
  description = 'Projet solaire avec performance de 60 MWh par mois, prix électricité 11,11 c€/kWh'
WHERE nom = 'WATTS''ON B1';

-- Suppression de l'ancien petit investissement de 5 parts pour ne garder que le bon
DELETE FROM investissements 
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'anto332@hotmail.fr')
  AND nombre_parts = 5;

-- Mise à jour de l'investissement principal pour être sûr qu'il correspond
UPDATE investissements 
SET 
  nombre_parts = 250000,
  prix_total = 250000
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'anto332@hotmail.fr')
  AND projet_id = (SELECT id FROM projets WHERE nom = 'WATTS''ON B1');

-- Ajout de données de production pour WATTS'ON B1 (60 MWh par mois)
-- Calcul des revenus: 60 MWh = 60 000 kWh * 11,11 c€ = 6 666 € par mois
-- Répartition sur 30 jours = 2 000 kWh par jour * 0,1111 € = 222,20 € par jour

INSERT INTO productions_quotidiennes (projet_id, date_production, production_kwh, revenus_total)
SELECT 
  p.id as projet_id,
  CURRENT_DATE - interval '1 day' * generate_series(0, 29) as date_production,
  2000 as production_kwh, -- 60 000 kWh / 30 jours = 2000 kWh/jour
  222.20 as revenus_total -- 2000 kWh * 0,1111 € = 222,20 €/jour
FROM projets p 
WHERE p.nom = 'WATTS''ON B1'
ON CONFLICT (projet_id, date_production) DO NOTHING;