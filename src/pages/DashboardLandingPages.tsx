import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Trash2, Copy, FileText } from "lucide-react";
import { getLandingPages, deleteLandingPage, type LandingPageData } from "@/lib/landingPages";
import CreateLandingPageDialog from "@/components/dashboard/landing-pages/CreateLandingPageDialog";
import LockedOverlay from "@/components/dashboard/LockedOverlay";
import { useToast } from "@/hooks/use-toast";
import { canCreateLandingPage } from "@/lib/featureAccess";
import { toast as sonnerToast } from "sonner";

const DashboardLandingPages = () => {
  const [pages, setPages] = useState<LandingPageData[]>(getLandingPages());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPageData | undefined>();
  const { toast } = useToast();

  const refresh = () => setPages(getLandingPages());

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

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Landing Pages</h1>
            <p className="text-sm text-muted-foreground font-body">Crie páginas de divulgação para seus veículos</p>
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
            {pages.map((page) => (
              <Card key={page.id} className="group hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => handleEdit(page)}>
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    {page.imageUrl ? (
                      <img src={page.imageUrl} alt={page.vehicleName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                        <FileText className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 space-y-2">
                    <h3 className="font-display font-semibold text-foreground truncate">{page.vehicleName}</h3>
                    <p className="text-xs text-muted-foreground font-body">{page.brand} {page.model} · {page.year}</p>
                    <p className="text-sm font-semibold text-foreground font-body">
                      R$ {page.creditValue.toLocaleString("pt-BR")}
                    </p>
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
            ))}
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
