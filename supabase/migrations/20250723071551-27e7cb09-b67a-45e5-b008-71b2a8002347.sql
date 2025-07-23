-- Créer une table de profils pour les investisseurs
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nom TEXT,
  prenom TEXT,
  entreprise TEXT,
  telephone TEXT,
  adresse TEXT,
  ville TEXT,
  code_postal TEXT,
  pays TEXT DEFAULT 'France',
  statut_investisseur TEXT DEFAULT 'actif' CHECK (statut_investisseur IN ('actif', 'inactif', 'suspendu')),
  date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  derniere_connexion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les profils
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leur propre profil" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Créer une fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise à jour automatique des timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, nom, prenom)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'nom',
    NEW.raw_user_meta_data->>'prenom'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer un profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Table pour les portefeuilles d'investissement
CREATE TABLE public.portefeuilles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_portefeuille TEXT NOT NULL,
  description TEXT,
  montant_total DECIMAL(15,2) DEFAULT 0,
  devise TEXT DEFAULT 'EUR',
  date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'cloture')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur portefeuilles
ALTER TABLE public.portefeuilles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les portefeuilles
CREATE POLICY "Les utilisateurs peuvent voir leurs propres portefeuilles" 
ON public.portefeuilles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres portefeuilles" 
ON public.portefeuilles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres portefeuilles" 
ON public.portefeuilles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres portefeuilles" 
ON public.portefeuilles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger pour mise à jour des timestamps sur portefeuilles
CREATE TRIGGER update_portefeuilles_updated_at
  BEFORE UPDATE ON public.portefeuilles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();