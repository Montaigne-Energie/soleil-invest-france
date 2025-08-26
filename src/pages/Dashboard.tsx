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

interface Projet {
  id: string;
  nom: string;
  type_projet: string;
  capacite_mw: number;
  prix_par_part: number;
}

interface Investissement {
  id: string;
  projet_id: string;
  nombre_parts: number;
  prix_total: number;
  projets: Projet;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [investissements, setInvestissements] = useState<Investissement[]>([]);
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
      } else {
        loadDashboardData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      setIsLoading(false);

    } catch (error) {
      console.error('Erreur chargement:', error);
      setInvestissements([]);
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
                            <p className="text-xs text-muted-foreground">{investissement.projets.capacite_mw} MW</p>
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