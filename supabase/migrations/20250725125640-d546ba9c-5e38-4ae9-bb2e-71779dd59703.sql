-- Créer la table des projets
CREATE TABLE public.projets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  type_projet TEXT NOT NULL, -- 'solaire', 'eolien', etc.
  localisation TEXT,
  capacite_mw NUMERIC,
  prix_par_part NUMERIC NOT NULL,
  parts_totales INTEGER NOT NULL,
  parts_disponibles INTEGER NOT NULL,
  statut TEXT DEFAULT 'actif',
  date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des investissements
CREATE TABLE public.investissements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  nombre_parts INTEGER NOT NULL,
  prix_total NUMERIC NOT NULL,
  date_investissement TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des données de production
CREATE TABLE public.productions_quotidiennes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  date_production DATE NOT NULL,
  production_kwh NUMERIC NOT NULL,
  revenus_total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(projet_id, date_production)
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productions_quotidiennes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour projets (accessibles à tous pour visualisation)
CREATE POLICY "Tout le monde peut voir les projets" 
ON public.projets 
FOR SELECT 
USING (true);

-- Politiques RLS pour investissements
CREATE POLICY "Les utilisateurs peuvent voir leurs propres investissements" 
ON public.investissements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres investissements" 
ON public.investissements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour productions (accessible si l'utilisateur a investi dans le projet)
CREATE POLICY "Les investisseurs peuvent voir la production de leurs projets" 
ON public.productions_quotidiennes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.investissements 
    WHERE investissements.projet_id = productions_quotidiennes.projet_id 
    AND investissements.user_id = auth.uid()
  )
);

-- Triggers pour updated_at
CREATE TRIGGER update_projets_updated_at
BEFORE UPDATE ON public.projets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investissements_updated_at
BEFORE UPDATE ON public.investissements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques projets d'exemple
INSERT INTO public.projets (nom, description, type_projet, localisation, capacite_mw, prix_par_part, parts_totales, parts_disponibles) VALUES
('Centrale Solaire Provence', 'Parc photovoltaïque de 50 MW en Provence', 'solaire', 'Provence, France', 50, 1000, 1000, 800),
('Parc Éolien Bretagne', 'Parc éolien offshore de 100 MW', 'eolien', 'Bretagne, France', 100, 2500, 500, 300),
('Centrale Solaire Loire', 'Installation solaire communautaire de 25 MW', 'solaire', 'Loire, France', 25, 500, 2000, 1500);

-- Insérer quelques données de production d'exemple pour hier
INSERT INTO public.productions_quotidiennes (projet_id, date_production, production_kwh, revenus_total)
SELECT 
  id,
  CURRENT_DATE - INTERVAL '1 day',
  CASE 
    WHEN type_projet = 'solaire' THEN capacite_mw * 1000 * 6 -- 6h de production moyenne
    WHEN type_projet = 'eolien' THEN capacite_mw * 1000 * 12 -- 12h de production moyenne
  END,
  CASE 
    WHEN type_projet = 'solaire' THEN capacite_mw * 1000 * 6 * 0.08 -- 0.08€/kWh
    WHEN type_projet = 'eolien' THEN capacite_mw * 1000 * 12 * 0.09 -- 0.09€/kWh
  END
FROM public.projets;