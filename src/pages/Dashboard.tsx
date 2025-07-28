import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { 
  LogOut, 
  TrendingUp, 
  Zap, 
  Euro, 
  Building, 
  Calendar,
  ShoppingCart,
  BarChart3,
  Sun,
  Wind,
  Leaf,
  TreePine
} from "lucide-react";

interface Projet {
  id: string;
  nom: string;
  description: string;
  type_projet: string;
  localisation: string;
  capacite_mw: number;
  prix_par_part: number;
  parts_totales: number;
  parts_disponibles: number;
  statut: string;
}

interface Investissement {
  id: string;
  projet_id: string;
  nombre_parts: number;
  prix_total: number;
  date_investissement: string;
  projets: Projet;
}

interface ProductionData {
  projet_id: string;
  date_production: string;
  production_kwh: number;
  revenus_total: number;
  projets: Projet;
}

interface Profile {
  id: string;
  user_id: string;
  nom: string;
  prenom: string;
  email: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investissements, setInvestissements] = useState<Investissement[]>([]);
  const [projetsDisponibles, setProjetsDisponibles] = useState<Projet[]>([]);
  const [productions, setProductions] = useState<ProductionData[]>([]);
  const [quantiteAcheter, setQuantiteAcheter] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
      } else {
        // Délayer légèrement le chargement pour s'assurer que l'utilisateur est défini
        setTimeout(() => loadDashboardData(), 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const createExampleInvestments = async () => {
    if (!user?.id) return;
    
    try {
      // Récupérer quelques projets disponibles pour créer des exemples
      const { data: projets, error: projetsError } = await supabase
        .from('projets')
        .select('*')
        .eq('statut', 'actif')
        .limit(3);

      if (projetsError) throw projetsError;
      if (!projets || projets.length === 0) return;

      // Créer des investissements d'exemple
      const exempleInvestissements = projets.slice(0, 2).map((projet, index) => {
        const nombreParts = index === 0 ? 5 : 3; // Premier projet: 5 parts, deuxième: 3 parts
        return {
          user_id: user.id,
          projet_id: projet.id,
          nombre_parts: nombreParts,
          prix_total: nombreParts * projet.prix_par_part
        };
      });

      const { error: insertError } = await supabase
        .from('investissements')
        .insert(exempleInvestissements);

      if (insertError) throw insertError;

      toast({
        title: "Bienvenue !",
        description: "Des investissements d'exemple ont été ajoutés à votre portfolio",
      });
    } catch (error) {
      console.error('Erreur lors de la création des investissements d\'exemple:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!user?.id) {
      console.log('User not loaded yet, skipping data load');
      return;
    }
    
    try {
      // Charger le profil de l'utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erreur lors du chargement du profil:', profileError);
      } else {
        setProfile(profileData);
      }

      // Charger les investissements de l'utilisateur
      const { data: investissementsData, error: investError } = await supabase
        .from('investissements')
        .select(`
          *,
          projets (*)
        `)
        .eq('user_id', user.id);

      if (investError) throw investError;
      
      // Si l'utilisateur n'a aucun investissement, créer des exemples
      if (!investissementsData || investissementsData.length === 0) {
        await createExampleInvestments();
        // Recharger les investissements après création des exemples
        const { data: newInvestissements } = await supabase
          .from('investissements')
          .select(`
            *,
            projets (*)
          `)
          .eq('user_id', user.id);
        setInvestissements(newInvestissements || []);
      } else {
        setInvestissements(investissementsData || []);
      }

      // Charger tous les projets disponibles
      const { data: projetsData, error: projetsError } = await supabase
        .from('projets')
        .select('*')
        .eq('statut', 'actif')
        .gt('parts_disponibles', 0);

      if (projetsError) throw projetsError;
      setProjetsDisponibles(projetsData || []);

      // Charger les données de production pour les projets investis
      const currentInvestissements = investissementsData && investissementsData.length > 0 ? investissementsData : 
        (await supabase.from('investissements').select('projet_id').eq('user_id', user.id)).data || [];
      
      if (currentInvestissements.length > 0) {
        const projetIds = currentInvestissements.map(inv => inv.projet_id);
        const { data: productionsData, error: prodError } = await supabase
          .from('productions_quotidiennes')
          .select(`
            *,
            projets (*)
          `)
          .in('projet_id', projetIds)
          .order('date_production', { ascending: false })
          .limit(10);

        if (prodError) throw prodError;
        setProductions(productionsData || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleAcheterParts = async (projetId: string) => {
    const quantite = quantiteAcheter[projetId];
    if (!quantite || quantite <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une quantité valide",
        variant: "destructive"
      });
      return;
    }

    const projet = projetsDisponibles.find(p => p.id === projetId);
    if (!projet) return;

    if (quantite > projet.parts_disponibles) {
      toast({
        title: "Erreur",
        description: "Quantité demandée supérieure aux parts disponibles",
        variant: "destructive"
      });
      return;
    }

    try {
      const prixTotal = quantite * projet.prix_par_part;

      // Créer l'investissement
      const { error: investError } = await supabase
        .from('investissements')
        .insert({
          user_id: user.id,
          projet_id: projetId,
          nombre_parts: quantite,
          prix_total: prixTotal
        });

      if (investError) throw investError;

      // Mettre à jour les parts disponibles du projet
      const { error: updateError } = await supabase
        .from('projets')
        .update({ parts_disponibles: projet.parts_disponibles - quantite })
        .eq('id', projetId);

      if (updateError) throw updateError;

      toast({
        title: "Investissement réussi",
        description: `Vous avez acheté ${quantite} parts pour ${prixTotal}€`
      });

      // Recharger les données
      loadDashboardData();
      setQuantiteAcheter({ ...quantiteAcheter, [projetId]: 0 });
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser l'achat",
        variant: "destructive"
      });
    }
  };

  const calculatePortfolioStats = () => {
    const totalInvesti = investissements.reduce((sum, inv) => sum + inv.prix_total, 0);
    const totalParts = investissements.reduce((sum, inv) => sum + inv.nombre_parts, 0);
    return { totalInvesti, totalParts };
  };

  const calculateDailyRevenue = () => {
    return productions.reduce((total, prod) => {
      const investissement = investissements.find(inv => inv.projet_id === prod.projet_id);
      if (!investissement) return total;
      
      const partOwnership = investissement.nombre_parts / investissement.projets.parts_totales;
      return total + (prod.revenus_total * partOwnership);
    }, 0);
  };

  const calculateEnvironmentalImpact = () => {
    const totalProduction = productions.reduce((total, prod) => {
      const investissement = investissements.find(inv => inv.projet_id === prod.projet_id);
      if (!investissement) return total;
      
      const partOwnership = investissement.nombre_parts / investissement.projets.parts_totales;
      return total + (prod.production_kwh * partOwnership);
    }, 0);

    // Calculs d'équivalences environnementales (ratios standards)
    // 1 kWh d'énergie renouvelable évite environ 0.5 kg de CO2
    // 1 arbre absorbe environ 22 kg de CO2 par an
    const co2Avoided = (totalProduction * 0.5) / 1000; // en tonnes
    const treesEquivalent = Math.round(co2Avoided * 1000 / 22); // nombre d'arbres

    return {
      totalProduction: totalProduction / 1000, // en MWh
      co2Avoided,
      treesEquivalent
    };
  };

  const getProductionChartData = () => {
    const chartData = productions.map(prod => {
      const investissement = investissements.find(inv => inv.projet_id === prod.projet_id);
      if (!investissement) return null;
      
      const partOwnership = investissement.nombre_parts / investissement.projets.parts_totales;
      const userProduction = prod.production_kwh * partOwnership;
      
      return {
        date: new Date(prod.date_production).toLocaleDateString(),
        production: Math.round(userProduction / 1000), // en MWh
        projet: prod.projets.nom,
        type: prod.projets.type_projet
      };
    }).filter(Boolean);

    return chartData;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  const { totalInvesti, totalParts } = calculatePortfolioStats();
  const dailyRevenue = calculateDailyRevenue();
  const environmentalImpact = calculateEnvironmentalImpact();
  const productionChartData = getProductionChartData();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/lovable-uploads/aa493da6-7e8f-4668-854f-4c142e81d9a4.png" alt="Montaigne Energie" className="h-10 w-10" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Montaigne Energie
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Bienvenue, {profile?.nom ? `Mr ${profile.nom}` : user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-premium border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Investi</p>
                  <p className="text-2xl font-bold text-foreground">{totalInvesti.toLocaleString()}€</p>
                </div>
                <Euro className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Parts Détenues</p>
                  <p className="text-2xl font-bold text-foreground">{totalParts}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projets</p>
                  <p className="text-2xl font-bold text-foreground">{investissements.length}</p>
                </div>
                <Building className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenus J-1</p>
                  <p className="text-2xl font-bold text-primary">{dailyRevenue.toFixed(2)}€</p>
                </div>
                <Zap className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio">Mes Investissements</TabsTrigger>
            <TabsTrigger value="buy">Acheter des Parts</TabsTrigger>
            <TabsTrigger value="production">Production J-1</TabsTrigger>
            <TabsTrigger value="impact">Impact Environnemental</TabsTrigger>
          </TabsList>

          {/* Onglet Mes Investissements */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2" />
                  Portfolio d'Investissements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {investissements.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun investissement pour le moment</p>
                    <p className="text-sm text-muted-foreground">Commencez par acheter des parts dans un projet</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {investissements.map((investissement) => (
                      <Card key={investissement.id} className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {investissement.projets.type_projet === 'solaire' ? (
                                <Sun className="h-6 w-6 text-yellow-500" />
                              ) : (
                                <Wind className="h-6 w-6 text-blue-500" />
                              )}
                              <div>
                                <h3 className="font-semibold">{investissement.projets.nom}</h3>
                                <p className="text-sm text-muted-foreground">{investissement.projets.localisation}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{investissement.nombre_parts} parts</p>
                              <p className="text-sm text-muted-foreground">{investissement.prix_total}€</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p className="font-medium capitalize">{investissement.projets.type_projet}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Capacité</p>
                              <p className="font-medium">{investissement.projets.capacite_mw} MW</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Prix/part</p>
                              <p className="font-medium">{investissement.projets.prix_par_part}€</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium">{new Date(investissement.date_investissement).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Acheter des Parts */}
          <TabsContent value="buy" className="space-y-6">
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-6 w-6 mr-2" />
                  Projets Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projetsDisponibles.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun projet disponible pour le moment</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {projetsDisponibles.map((projet) => (
                      <Card key={projet.id} className="border border-border/50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {projet.type_projet === 'solaire' ? (
                                <Sun className="h-8 w-8 text-yellow-500" />
                              ) : (
                                <Wind className="h-8 w-8 text-blue-500" />
                              )}
                              <div>
                                <h3 className="text-xl font-semibold">{projet.nom}</h3>
                                <p className="text-muted-foreground">{projet.description}</p>
                                <p className="text-sm text-muted-foreground">{projet.localisation}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div>
                              <p className="text-sm text-muted-foreground">Capacité</p>
                              <p className="font-semibold">{projet.capacite_mw} MW</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Prix par part</p>
                              <p className="font-semibold text-primary">{projet.prix_par_part}€</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Parts disponibles</p>
                              <p className="font-semibold">{projet.parts_disponibles}/{projet.parts_totales}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Statut</p>
                              <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-sm">
                                {projet.statut}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <label className="text-sm font-medium">Nombre de parts</label>
                              <input
                                type="number"
                                min="1"
                                max={projet.parts_disponibles}
                                value={quantiteAcheter[projet.id] || ''}
                                onChange={(e) => setQuantiteAcheter({
                                  ...quantiteAcheter,
                                  [projet.id]: parseInt(e.target.value) || 0
                                })}
                                className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                                placeholder="Quantité"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-sm font-medium">Total</label>
                              <p className="mt-1 text-lg font-semibold text-primary">
                                {((quantiteAcheter[projet.id] || 0) * projet.prix_par_part).toLocaleString()}€
                              </p>
                            </div>
                            <Button 
                              variant="premium" 
                              onClick={() => handleAcheterParts(projet.id)}
                              disabled={!quantiteAcheter[projet.id] || quantiteAcheter[projet.id] <= 0}
                            >
                              Acheter
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Production J-1 */}
          <TabsContent value="production" className="space-y-6">
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2" />
                  Production et Revenus (J-1)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productions.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune donnée de production disponible</p>
                    <p className="text-sm text-muted-foreground">Les données apparaîtront après vos premiers investissements</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productions.map((production, index) => {
                      const investissement = investissements.find(inv => inv.projet_id === production.projet_id);
                      if (!investissement) return null;
                      
                      const partOwnership = investissement.nombre_parts / investissement.projets.parts_totales;
                      const myRevenue = production.revenus_total * partOwnership;
                      const myProduction = production.production_kwh * partOwnership;

                      return (
                        <Card key={index} className="border border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                {production.projets.type_projet === 'solaire' ? (
                                  <Sun className="h-6 w-6 text-yellow-500" />
                                ) : (
                                  <Wind className="h-6 w-6 text-blue-500" />
                                )}
                                <div>
                                  <h3 className="font-semibold">{production.projets.nom}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 inline mr-1" />
                                    {new Date(production.date_production).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-primary">{myRevenue.toFixed(2)}€</p>
                                <p className="text-sm text-muted-foreground">Mes revenus</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Ma production</p>
                                <p className="font-medium">{myProduction.toFixed(0)} kWh</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Production totale</p>
                                <p className="font-medium">{production.production_kwh.toFixed(0)} kWh</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Revenus totaux</p>
                                <p className="font-medium">{production.revenus_total.toFixed(2)}€</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Ma participation</p>
                                <p className="font-medium">{(partOwnership * 100).toFixed(2)}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Impact Environnemental */}
          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Carte Production Totale */}
              <Card className="shadow-premium border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Production Totale</p>
                      <p className="text-2xl font-bold text-foreground">{environmentalImpact.totalProduction.toFixed(1)} MWh</p>
                    </div>
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              {/* Carte CO2 Évité */}
              <Card className="shadow-premium border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">CO2 Évité</p>
                      <p className="text-2xl font-bold text-green-600">{environmentalImpact.co2Avoided.toFixed(1)} tonnes</p>
                    </div>
                    <Leaf className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Carte Équivalent Arbres */}
              <Card className="shadow-premium border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Équivalent Arbres</p>
                      <p className="text-2xl font-bold text-green-600">{environmentalImpact.treesEquivalent}</p>
                      <p className="text-xs text-muted-foreground">arbres plantés</p>
                    </div>
                    <TreePine className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphique de Production */}
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2" />
                  Évolution de votre Production Électrique
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productionChartData.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune donnée de production disponible</p>
                    <p className="text-sm text-muted-foreground">Les données apparaîtront après vos premiers investissements</p>
                  </div>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productionChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Production (MWh)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value: any, name: any, props: any) => [
                            `${value} MWh`,
                            'Production'
                          ]}
                          labelFormatter={(label: any) => `Date: ${label}`}
                        />
                        <Bar dataKey="production" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations supplémentaires */}
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-6 w-6 mr-2" />
                  Impact Environnemental Détaillé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Équivalences CO2</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Voitures retirées de la circulation :</span>
                        <span className="font-medium">{Math.round(environmentalImpact.co2Avoided * 0.5)} voitures/an</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Foyers alimentés :</span>
                        <span className="font-medium">{Math.round(environmentalImpact.totalProduction / 3.5)} foyers/an</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Contribution Énergétique</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Énergie renouvelable produite :</span>
                        <span className="font-medium">{environmentalImpact.totalProduction.toFixed(1)} MWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pourcentage d'énergie verte :</span>
                        <span className="font-medium text-green-600">100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;