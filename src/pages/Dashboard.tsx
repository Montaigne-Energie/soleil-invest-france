import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { InactivityModal } from "@/components/InactivityModal";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { 
  LogOut, 
  TrendingUp, 
  Euro, 
  Building, 
  Sun,
  Wind
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface ProjetBase {
  id: string;
  nom: string;
  type_projet: string;
  capacite_mw: number;
  prix_par_part: number;
}

interface ProjetDisponible extends ProjetBase {
  parts_disponibles: number;
  parts_totales: number;
  description?: string;
  localisation?: string;
  statut?: string;
}

interface Investissement {
  id: string;
  projet_id: string;
  nombre_parts: number;
  prix_total: number;
  projets: ProjetBase;
}

interface ProductionData {
  date: string;
  revenus: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [investissements, setInvestissements] = useState<Investissement[]>([]);
  const [projetsDisponibles, setProjetsDisponibles] = useState<ProjetDisponible[]>([]);
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Configuration du timer d'inactivité : 5 minutes = 300000ms
  const { showWarning } = useInactivityTimer({
    timeout: 300000, // 5 minutes
    onTimeout: () => {
      handleSignOut();
      toast({
        title: "Session expirée",
        description: "Vous avez été déconnecté automatiquement pour des raisons de sécurité.",
        variant: "destructive"
      });
    },
    onWarning: () => {
      setShowInactivityModal(true);
    },
    warningTime: 30000 // Avertissement 30 secondes avant déconnexion
  });

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
      setIsLoading(false);
      
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Effet séparé pour charger les données quand l'utilisateur est prêt
  useEffect(() => {
    if (user?.id && !isLoading) {
      loadDashboardData();
    }
  }, [user?.id, isLoading]);

  const loadDashboardData = async () => {
    try {
      console.log('Début chargement dashboard pour user:', user?.id);
      
      if (!user?.id) {
        console.log('Pas de user ID, arrêt du chargement');
        setIsLoading(false);
        return;
      }
      
      // Chargement simple - juste les investissements
      const { data: investissements, error } = await supabase
        .from('investissements')
        .select(`
          id, projet_id, nombre_parts, prix_total,
          projets!inner (id, nom, type_projet, capacite_mw, prix_par_part)
        `)
        .eq('user_id', user.id)
        .limit(3);
      
      console.log('Résultat requête investissements:', { investissements, error });
      
      if (error) {
        console.error('Erreur SQL:', error);
      }
      
      setInvestissements(investissements || []);
      
      // Chargement des projets disponibles
      const { data: projets, error: projetsError } = await supabase
        .from('projets')
        .select('id, nom, type_projet, capacite_mw, prix_par_part, parts_disponibles, parts_totales, description, localisation, statut')
        .eq('statut', 'actif')
        .gt('parts_disponibles', 0)
        .order('nom');
      
      if (projets && !projetsError) {
        setProjetsDisponibles(projets);
      }
      
      // Chargement des données de production
      if (investissements && investissements.length > 0) {
        const projetIds = investissements.map(inv => inv.projet_id);
        const { data: productions, error: prodError } = await supabase
          .from('productions_quotidiennes')
          .select('date_production, revenus_total')
          .in('projet_id', projetIds)
          .order('date_production', { ascending: true });
        
        if (productions && !prodError) {
          // Regrouper par date et sommer les revenus
          const groupedData = productions.reduce((acc: { [key: string]: number }, prod) => {
            const date = new Date(prod.date_production).getDate().toString().padStart(2, '0');
            acc[date] = (acc[date] || 0) + Number(prod.revenus_total);
            return acc;
          }, {});
          
          const chartData = Object.entries(groupedData).map(([day, revenus]) => ({
            date: day,
            revenus: Number(revenus.toFixed(2))
          }));
          
          setProductionData(chartData);
        }
      }
      
      setIsLoading(false);

    } catch (error) {
      console.error('Erreur chargement:', error);
      setInvestissements([]);
      setProjetsDisponibles([]);
      setProductionData([]);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setShowInactivityModal(false);
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleContinueSession = () => {
    setShowInactivityModal(false);
    toast({
      title: "Session prolongée",
      description: "Votre session a été prolongée avec succès.",
    });
  };

  const calculatePortfolioStats = () => {
    const totalInvesti = investissements.reduce((sum, inv) => sum + inv.prix_total, 0);
    const totalParts = investissements.reduce((sum, inv) => sum + inv.nombre_parts, 0);
    return { totalInvesti, totalParts };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Connexion rapide...</p>
        </div>
      </div>
    );
  }

  const { totalInvesti, totalParts } = calculatePortfolioStats();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation simplifiée */}
      <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/aa493da6-7e8f-4668-854f-4c142e81d9a4.png" alt="Montaigne Energie" className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Montaigne Energie
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* Stats ultra-simplifiées */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Investi</p>
                <p className="text-lg font-bold text-foreground">{totalInvesti.toLocaleString()}€</p>
                <Euro className="h-4 w-4 text-primary mx-auto mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Parts</p>
                <p className="text-lg font-bold text-foreground">{totalParts}</p>
                <TrendingUp className="h-4 w-4 text-accent mx-auto mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Projets</p>
                <p className="text-lg font-bold text-foreground">{investissements.length}</p>
                <Building className="h-4 w-4 text-primary mx-auto mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphique des revenus */}
        {productionData.length > 0 && (
          <Card className="shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Euro className="h-5 w-5 mr-2" />
                Revenus quotidiens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productionData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}€`, 'Revenus']}
                      labelFormatter={(label) => `Jour ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="revenus" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projets disponibles */}
        {projetsDisponibles.length > 0 && (
          <Card className="shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building className="h-5 w-5 mr-2" />
                Projets Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projetsDisponibles.slice(0, 6).map((projet) => (
                  <Card key={projet.id} className="border border-border/30 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          {projet.type_projet === 'solaire' ? (
                            <Sun className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <Wind className="h-5 w-5 text-blue-500" />
                          )}
                          <h4 className="font-semibold text-sm">{projet.nom}</h4>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Capacité:</span>
                            <span className="font-medium">
                              {projet.capacite_mw >= 1 
                                ? `${projet.capacite_mw} MW`
                                : `${(projet.capacite_mw * 1000).toFixed(0)} kWc`
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prix/part:</span>
                            <span className="font-medium">{projet.prix_par_part}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Disponible:</span>
                            <span className="font-medium">{projet.parts_disponibles}/{projet.parts_totales} parts</span>
                          </div>
                          {projet.localisation && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Lieu:</span>
                              <span className="font-medium">{projet.localisation}</span>
                            </div>
                          )}
                        </div>
                        
                        <Button size="sm" className="w-full">
                          Investir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {projetsDisponibles.length > 6 && (
                <div className="text-center mt-4">
                  <Button variant="outline" size="sm">
                    Voir tous les projets ({projetsDisponibles.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Portfolio simplifié */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2" />
              Mon Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {investissements.length === 0 ? (
              <div className="text-center py-6">
                <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun investissement</p>
              </div>
            ) : (
              <div className="space-y-3">
                {investissements.map((investissement) => (
                  <Card key={investissement.id} className="border border-border/30">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {investissement.projets.type_projet === 'solaire' ? (
                            <Sun className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Wind className="h-4 w-4 text-blue-500" />
                          )}
                          <div>
                            <h4 className="font-medium text-sm">{investissement.projets.nom}</h4>
                            <p className="text-xs text-muted-foreground">
                              {investissement.projets.capacite_mw >= 1 
                                ? `${investissement.projets.capacite_mw} MW`
                                : `${(investissement.projets.capacite_mw * 1000).toFixed(0)} kWc`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{investissement.nombre_parts} parts</p>
                          <p className="text-xs text-muted-foreground">{investissement.prix_total}€</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal d'inactivité */}
      <InactivityModal 
        isOpen={showInactivityModal}
        onContinue={handleContinueSession}
        onLogout={handleSignOut}
        countdown={30}
      />
    </div>
  );
};

export default Dashboard;