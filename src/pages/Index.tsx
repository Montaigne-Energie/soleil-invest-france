import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MapPin, Award, ArrowRight, AlertCircle } from "lucide-react";
import heroImage from "@/assets/hero-solar.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface ProjetBase {
  id: string;
  nom: string;
  description: string | null;
  type_projet: string;
  localisation: string | null;
  capacite_mw: number | null;
  prix_par_part: number;
  parts_totales: number;
  parts_disponibles: number;
  statut: string | null;
}

const Index = () => {
  const [projets, setProjets] = useState<ProjetBase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjets = async () => {
      try {
        const { data, error } = await supabase
          .from('projets')
          .select('*')
          .eq('statut', 'actif')
          .limit(4);

        if (error) {
          console.error('Erreur lors du chargement des projets:', error);
          return;
        }

        setProjets(data || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjets();
  }, []);

  const getStatutColor = (statut: string | null) => {
    switch (statut) {
      case 'operationnel':
        return 'bg-primary/20 text-primary';
      case 'construction':
        return 'bg-muted text-muted-foreground';
      case 'recherche_fonds':
        return 'bg-accent/20 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatutText = (statut: string | null) => {
    switch (statut) {
      case 'operationnel':
        return 'Opérationnel';
      case 'construction':
        return 'En construction';
      case 'recherche_fonds':
        return 'Recherche de fonds';
      default:
        return 'Actif';
    }
  };

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
            <div className="hidden md:flex items-center space-x-8">
              <a href="#projects" className="text-foreground hover:text-primary transition-colors">Projets</a>
              <a href="#investors" className="text-foreground hover:text-primary transition-colors">Investisseurs</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">À propos</a>
              <Button variant="premium" size="sm" onClick={() => window.location.href = '/auth'}>
                Espace Investisseur
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Installation photovoltaïque en France" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Financer l'Avenir
            <br />
            <span className="bg-gradient-energy bg-clip-text text-transparent">
              Énergétique
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Investissez dans les centrales photovoltaïques françaises 
            et participez à la transition énergétique durable
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Découvrir nos Projets
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10" onClick={() => window.location.href = '/auth'}>
              Devenir Investisseur
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">125MW</div>
              <div className="text-muted-foreground">Capacité Installée</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">€45M</div>
              <div className="text-muted-foreground">Investis à ce jour</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-muted-foreground">Investisseurs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">8.5%</div>
              <div className="text-muted-foreground">Rendement Moyen</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Nos Projets Photovoltaïques
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez notre portfolio de centrales solaires en France, 
              sélectionnées pour leur potentiel et leur rentabilité
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="shadow-premium border-border/50">
                  <CardHeader>
                    <div className="h-6 bg-muted animate-pulse rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                          <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                        </div>
                      ))}
                      <div className="h-10 bg-muted animate-pulse rounded w-full mt-4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projets.map((projet) => (
                <Card key={projet.id} className="shadow-premium hover:shadow-glow transition-all duration-300 border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{projet.nom}</CardTitle>
                      {projet.statut === 'operationnel' && <Award className="h-5 w-5 text-primary" />}
                      {projet.statut === 'recherche_fonds' && <AlertCircle className="h-5 w-5 text-accent" />}
                      {projet.localisation && <MapPin className="h-5 w-5 text-primary" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projet.capacite_mw && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Capacité:</span>
                          <span className="font-semibold">{projet.capacite_mw} MW</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-semibold">{projet.type_projet}</span>
                      </div>
                      {projet.localisation && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Localisation:</span>
                          <span className="font-semibold">{projet.localisation}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parts disponibles:</span>
                        <span className="font-semibold">{projet.parts_disponibles}/{projet.parts_totales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Statut:</span>
                        <span className={`px-2 py-1 rounded-full text-sm ${getStatutColor(projet.statut)}`}>
                          {getStatutText(projet.statut)}
                        </span>
                      </div>
                      {projet.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {projet.description}
                        </p>
                      )}
                      <Button 
                        variant={projet.statut === 'recherche_fonds' ? 'premium' : 'energy'} 
                        className="w-full mt-4"
                        onClick={() => window.location.href = '/auth'}
                      >
                        {projet.statut === 'recherche_fonds' ? 'Investir maintenant' : 'Voir les détails'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Investor Dashboard Section */}
      <section id="investors" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Tableau de Bord Investisseurs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Suivez vos investissements et découvrez de nouvelles opportunités
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Card className="shadow-premium border-border/50 bg-gradient-subtle">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3 text-primary" />
                    Performance Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Rendement Annuel</span>
                      <span className="text-2xl font-bold text-primary">+8.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Valeur Portfolio</span>
                      <span className="text-xl font-semibold">€125,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Gain Mensuel</span>
                      <span className="text-lg text-primary">+€902</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-premium border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-6 w-6 mr-3 text-accent" />
                    Communauté
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Investisseurs Actifs</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Nouveaux ce mois</span>
                      <span className="text-accent font-semibold">+89</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Satisfaction</span>
                      <span className="text-primary font-semibold">98%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-primary p-8 rounded-lg text-white shadow-premium">
                <h3 className="text-2xl font-bold mb-4">Rejoignez-nous</h3>
                <p className="mb-6 text-white/90">
                  Investissement minimum de €5,000 pour commencer votre 
                  parcours dans l'énergie renouvelable française.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                    Rendements attractifs et stables
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                    Impact environnemental positif
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                    Transparence totale sur vos investissements
                  </li>
                </ul>
                <Button variant="hero" size="lg" className="w-full" onClick={() => window.location.href = '/auth'}>
                  Commencer à Investir
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/lovable-uploads/aa493da6-7e8f-4668-854f-4c142e81d9a4.png" alt="Montaigne Energie" className="h-6 w-6 brightness-0 invert" />
                <span className="text-xl font-bold">Montaigne Energie</span>
              </div>
              <p className="text-white/80">
                Financement participatif pour l'énergie renouvelable en France.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Projets</h4>
              <ul className="space-y-2 text-white/80">
                <li>Centrales Photovoltaïques</li>
                <li>Stockage d'Énergie</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Investisseurs</h4>
              <ul className="space-y-2 text-white/80">
                <li>Comment investir</li>
                <li>Rendements</li>
                <li>Risques</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-white/80">
                <li>contact@enervest-france.fr</li>
                <li>+33 1 23 45 67 89</li>
                <li>Paris, France</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 Montaigne Energie. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
