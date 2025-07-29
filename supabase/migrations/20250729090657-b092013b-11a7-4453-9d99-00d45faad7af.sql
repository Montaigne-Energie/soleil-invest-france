-- Supprimer les données existantes pour les remplacer par les vraies sociétés WATTS'ON
DELETE FROM investissements;
DELETE FROM productions_quotidiennes; 
DELETE FROM projets;

-- Insérer les sociétés d'investissement WATTS'ON avec leurs projets individuels

-- WATTS'ON B1 (6 projets) - Opérationnel
INSERT INTO projets (nom, description, type_projet, localisation, capacite_mw, parts_totales, parts_disponibles, prix_par_part, statut) VALUES
('EPINASSE - WATTS''ON B1', 'Centrale photovoltaïque EPINASSE, partie de la société d''investissement WATTS''ON B1', 'Photovoltaïque', 'Occitanie, France', 0.3439, 100, 45, 1000, 'operationnel'),
('REPUTE 1 - WATTS''ON B1', 'Première centrale REPUTE (250 kWc), partie de WATTS''ON B1', 'Photovoltaïque', 'Nouvelle-Aquitaine, France', 0.25, 80, 30, 950, 'operationnel'),
('REPUTE 2 - WATTS''ON B1', 'Deuxième centrale REPUTE (250 kWc), partie de WATTS''ON B1', 'Photovoltaïque', 'Nouvelle-Aquitaine, France', 0.25, 80, 25, 950, 'operationnel'),
('REPUTE 3 - WATTS''ON B1', 'Troisième centrale REPUTE (250 kWc), partie de WATTS''ON B1', 'Photovoltaïque', 'Nouvelle-Aquitaine, France', 0.25, 80, 40, 950, 'operationnel'),
('REPUTE 4 - WATTS''ON B1', 'Quatrième centrale REPUTE (250 kWc), partie de WATTS''ON B1', 'Photovoltaïque', 'Nouvelle-Aquitaine, France', 0.25, 80, 35, 950, 'operationnel'),
('Centrale Supplémentaire - WATTS''ON B1', 'Sixième projet de la société WATTS''ON B1', 'Photovoltaïque', 'Provence-Alpes-Côte d''Azur, France', 0.14, 60, 20, 1100, 'operationnel');

-- WATTS'ON A1 (6 projets) - Recherche de fonds
INSERT INTO projets (nom, description, type_projet, localisation, capacite_mw, parts_totales, parts_disponibles, prix_par_part, statut) VALUES
('Centrale Loire-1 - WATTS''ON A1', 'Premier grand projet de la société WATTS''ON A1', 'Photovoltaïque', 'Centre-Val de Loire, France', 4.5, 200, 180, 2250, 'financement'),
('Centrale Loire-2 - WATTS''ON A1', 'Deuxième projet de WATTS''ON A1', 'Photovoltaïque', 'Centre-Val de Loire, France', 3.8, 170, 150, 2200, 'financement'),
('Centrale Bretagne - WATTS''ON A1', 'Projet breton de WATTS''ON A1', 'Photovoltaïque', 'Bretagne, France', 3.2, 150, 120, 2100, 'financement'),
('Centrale Normandie - WATTS''ON A1', 'Projet normand de WATTS''ON A1', 'Photovoltaïque', 'Normandie, France', 4.1, 180, 160, 2300, 'financement'),
('Centrale Picardie - WATTS''ON A1', 'Projet en Picardie de WATTS''ON A1', 'Photovoltaïque', 'Hauts-de-France, France', 3.7, 165, 140, 2150, 'financement'),
('Centrale Champagne - WATTS''ON A1', 'Dernier projet de WATTS''ON A1', 'Photovoltaïque', 'Grand Est, France', 2.7, 135, 110, 2000, 'financement');

-- WATTS'ON A2 (5 projets) - En construction
INSERT INTO projets (nom, description, type_projet, localisation, capacite_mw, parts_totales, parts_disponibles, prix_par_part, statut) VALUES
('Centrale Rhône-1 - WATTS''ON A2', 'Premier projet de WATTS''ON A2', 'Photovoltaïque', 'Auvergne-Rhône-Alpes, France', 3.5, 160, 160, 2180, 'en_construction'),
('Centrale Rhône-2 - WATTS''ON A2', 'Deuxième projet de WATTS''ON A2', 'Photovoltaïque', 'Auvergne-Rhône-Alpes, France', 4.2, 190, 190, 2320, 'en_construction'),
('Centrale Savoie - WATTS''ON A2', 'Projet en Savoie de WATTS''ON A2', 'Photovoltaïque', 'Auvergne-Rhône-Alpes, France', 2.8, 140, 140, 2050, 'en_construction'),
('Centrale Ardèche - WATTS''ON A2', 'Projet ardéchois de WATTS''ON A2', 'Photovoltaïque', 'Auvergne-Rhône-Alpes, France', 3.9, 175, 175, 2280, 'en_construction'),
('Centrale Drôme - WATTS''ON A2', 'Cinquième projet de WATTS''ON A2', 'Photovoltaïque', 'Auvergne-Rhône-Alpes, France', 3.1, 155, 155, 2120, 'en_construction');

-- WATTS'ON MAX (6 projets) - Recherche de fonds (plus gros projet)
INSERT INTO projets (nom, description, type_projet, localisation, capacite_mw, parts_totales, parts_disponibles, prix_par_part, statut) VALUES
('Méga-Centrale Sud-1 - WATTS''ON MAX', 'Premier méga-projet de WATTS''ON MAX', 'Photovoltaïque', 'Occitanie, France', 7.5, 300, 280, 2500, 'financement'),
('Méga-Centrale Sud-2 - WATTS''ON MAX', 'Deuxième méga-projet de WATTS''ON MAX', 'Photovoltaïque', 'Occitanie, France', 6.8, 280, 260, 2450, 'financement'),
('Centrale Languedoc - WATTS''ON MAX', 'Projet Languedoc de WATTS''ON MAX', 'Photovoltaïque', 'Occitanie, France', 5.9, 250, 230, 2380, 'financement'),
('Centrale Roussillon - WATTS''ON MAX', 'Projet Roussillon de WATTS''ON MAX', 'Photovoltaïque', 'Occitanie, France', 6.2, 260, 240, 2400, 'financement'),
('Centrale Gascogne - WATTS''ON MAX', 'Projet gascon de WATTS''ON MAX', 'Photovoltaïque', 'Occitanie, France', 4.8, 220, 200, 2300, 'financement'),
('Centrale Cévennes - WATTS''ON MAX', 'Dernier projet de WATTS''ON MAX', 'Photovoltaïque', 'Occitanie, France', 3.8, 190, 170, 2200, 'financement');

-- WATTS'ON B2 (5 projets) - En construction
INSERT INTO projets (nom, description, type_projet, localisation, capacite_mw, parts_totales, parts_disponibles, prix_par_part, statut) VALUES
('Centrale Atlantique-1 - WATTS''ON B2', 'Premier projet de WATTS''ON B2', 'Photovoltaïque', 'Nouvelle-Aquitaine, France', 3.6, 165, 100, 2180, 'en_construction'),
('Centrale Atlantique-2 - WATTS''ON B2', 'Deuxième projet de WATTS''ON B2', 'Photovoltaïque', 'Nouvelle-Aquitaine, France', 4.1, 185, 120, 2250, 'en_construction'),
('Centrale Dordogne - WATTS''ON B2', 'Projet en Dordogne de WATTS''ON B2', 'Photovoltaïque', 'Nouvelle-Aquitaine, France', 2.9, 145, 80, 2100, 'en_construction'),
('Centrale Gironde - WATTS''ON B2', 'Projet girondin de WATTS''ON B2', 'Photovoltaïque', 'Nouvelle-Aquitaine, France', 3.8, 170, 110, 2230, 'en_construction'),
('Centrale Landes - WATTS''ON B2', 'Cinquième projet de WATTS''ON B2', 'Photovoltaïque', 'Nouvelle-Aquitaine, France', 1.6, 105, 70, 1950, 'en_construction');

-- WATTS'ON B3 (6 projets) - En développement
INSERT INTO projets (nom, description, type_projet, localisation, capacite_mw, parts_totales, parts_disponibles, prix_par_part, statut) VALUES
('Centrale Méditerranée-1 - WATTS''ON B3', 'Premier projet de WATTS''ON B3', 'Photovoltaïque', 'Provence-Alpes-Côte d''Azur, France', 3.2, 150, 150, 2150, 'en_developpement'),
('Centrale Méditerranée-2 - WATTS''ON B3', 'Deuxième projet de WATTS''ON B3', 'Photovoltaïque', 'Provence-Alpes-Côte d''Azur, France', 2.8, 140, 140, 2080, 'en_developpement'),
('Centrale Var - WATTS''ON B3', 'Projet varois de WATTS''ON B3', 'Photovoltaïque', 'Provence-Alpes-Côte d''Azur, France', 4.5, 200, 200, 2300, 'en_developpement'),
('Centrale Vaucluse - WATTS''ON B3', 'Projet vauclusien de WATTS''ON B3', 'Photovoltaïque', 'Provence-Alpes-Côte d''Azur, France', 3.7, 165, 165, 2220, 'en_developpement'),
('Centrale Bouches-du-Rhône - WATTS''ON B3', 'Projet des Bouches-du-Rhône de WATTS''ON B3', 'Photovoltaïque', 'Provence-Alpes-Côte d''Azur, France', 2.4, 125, 125, 2000, 'en_developpement'),
('Centrale Alpes - WATTS''ON B3', 'Dernier projet de WATTS''ON B3', 'Photovoltaïque', 'Provence-Alpes-Côte d''Azur, France', 1.9, 110, 110, 1900, 'en_developpement');