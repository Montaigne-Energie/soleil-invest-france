-- Mettre à jour la capacité du projet WATTS'ON B1 à 250 kWc (0,25 MW)
UPDATE projets 
SET 
  capacite_mw = 0.25,
  description = COALESCE(description, '') || CASE WHEN position('250 kWc' in COALESCE(description, '')) = 0 THEN ' | Capacité: 250 kWc' ELSE '' END,
  updated_at = now()
WHERE nom = 'WATTS''ON B1';