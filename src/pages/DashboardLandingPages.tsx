import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Trash2, Copy, FileText, Eye, Users, TrendingUp, Zap, Loader2, Star } from "lucide-react";
import { getLandingPages, deleteLandingPage, type LandingPageData } from "@/lib/landingPages";
import CreateLandingPageDialog from "@/components/dashboard/landing-pages/CreateLandingPageDialog";
import LockedOverlay from "@/components/dashboard/LockedOverlay";
import { useToast } from "@/hooks/use-toast";
import { canCreateLandingPage } from "@/lib/featureAccess";
import { toast as sonnerToast } from "sonner";
import { api } from "@/lib/apiClient";

interface LpStat {
  slug: string;
  visits: number;
  leads: number;
  conversion: number;
}

const DashboardLandingPages = () => {
  const [pages, setPages] = useState<LandingPageData[]>(getLandingPages());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPageData | undefined>();
  const [lpStats, setLpStats] = useState<LpStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const { toast } = useToast();

  const refresh = () => setPages(getLandingPages());

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      const res = await api.get<LpStat[]>('/leads/lp-stats');
      if (res.ok && res.data) setLpStats(res.data);
      setLoadingStats(false);
    };
    fetchStats();
  }, []);

  const getStatForSlug = (slug: string): LpStat => {
    return lpStats.find(s => s.slug === slug) || { slug, visits: 0, leads: 0, conversion: 0 };
  };

  const handleDelete = (id: string) => {
    deleteLandingPage(id);
    refresh();
    toast({ title: "Landing page removida" });
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/lp/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  const handleEdit = (page: LandingPageData) => {
    setEditingPage(page);
    setDialogOpen(true);
  };

  const handleNewPage = () => {
    if (!canCreateLandingPage(pages.length)) {
      sonnerToast.error("Limite atingido", {
        description: "Seu plano Free permite apenas 1 landing page ativa. Faça upgrade para criar mais.",
      });
      return;
    }
    setEditingPage(undefined);
    setDialogOpen(true);
  };

  const templateLabel = (t: string) => t === 'simples' ? 'Simples' : 'Completa';

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Landing Pages</h1>
            <p className="text-sm text-muted-foreground font-body">Crie páginas de divulgação e compare a performance</p>
          </div>
          <Button onClick={handleNewPage} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Landing Page
          </Button>
        </div>

        {pages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-body">Nenhuma landing page criada ainda</p>
              <p className="text-sm text-muted-foreground/60 font-body mt-1">Clique em "Nova Landing Page" para começar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {pages.map((page) => {
              const stat = getStatForSlug(page.slug);
              return (
                <Card key={page.id} className="group hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => handleEdit(page)}>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
                      {page.imageUrl ? (
                        <img src={page.imageUrl} alt={page.vehicleName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <FileText className="w-10 h-10" />
                        </div>
                      )}
                      {/* Template badge */}
                      <Badge
                        variant="outline"
                        className={`absolute top-2 right-2 text-[10px] font-body border ${
                          page.template === 'simples'
                            ? 'bg-accent/80 text-accent-foreground border-accent'
                            : 'bg-primary/80 text-primary-foreground border-primary'
                        } backdrop-blur-sm`}
                      >
                        {page.template === 'simples' ? <Zap className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                        {templateLabel(page.template)}
                      </Badge>
                    </div>
                    <div className="p-3 sm:p-4 space-y-2">
                      <h3 className="font-display font-semibold text-foreground truncate">{page.vehicleName}</h3>
                      <p className="text-xs text-muted-foreground font-body">{page.brand} {page.model} · {page.year}</p>
                      <p className="text-sm font-semibold text-foreground font-body">
                        R$ {page.creditValue.toLocaleString("pt-BR")}
                      </p>

                      {/* Performance indicators */}
                      <div className="flex items-center gap-3 pt-1 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                        {loadingStats ? (
                          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <div className="flex items-center gap-1 text-[11px] font-body text-muted-foreground" title="Visitas">
                              <Eye className="w-3 h-3" />
                              <span>{stat.visits}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-body text-muted-foreground" title="Leads captados">
                              <Users className="w-3 h-3" />
                              <span>{stat.leads}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-body font-semibold" title="Taxa de conversão">
                              <TrendingUp className="w-3 h-3" />
                              <span className={stat.conversion >= 5 ? "text-emerald-600 dark:text-emerald-400" : stat.conversion > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
                                {stat.conversion}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1 text-xs"
                          onClick={() => handleCopyLink(page.slug)}
                        >
                          <Copy className="w-3 h-3" />
                          Copiar Link
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs"
                          asChild
                        >
                          <a href={`#/lp/${page.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(page.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CreateLandingPageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
        editingPage={editingPage}
      />
    </DashboardLayout>
  );
};

export default DashboardLandingPages;
