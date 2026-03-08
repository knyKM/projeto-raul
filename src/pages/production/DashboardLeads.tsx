import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, User, Users, Loader2, PhoneOutgoing, LayoutList, Columns3 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LockedOverlay from "@/components/dashboard/LockedOverlay";
import { hasFeature } from "@/lib/featureAccess";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import MailingDialog from "@/components/dashboard/leads/MailingDialog";
import LeadCard from "@/components/dashboard/leads/LeadCard";
import KanbanBoard from "@/components/dashboard/leads/KanbanBoard";

interface Lead {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  origem: string;
  landing_page_slug: string | null;
  status: string;
  consultor_id: number | null;
  created_at: string;
}

interface LeadStats {
  pendentes: string;
  em_atendimento: string;
  concluidos: string;
  total: string;
}

interface Atendente {
  id: number;
  nome: string;
}

const statusColors: Record<string, string> = {
  novo: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  em_contato: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  em_atendimento: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  negociando: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30",
  fechado: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  concluido: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  perdido: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
};

const statusLabels: Record<string, string> = {
  novo: "Novo",
  em_contato: "Em Contato",
  em_atendimento: "Em Atendimento",
  negociando: "Negociando",
  fechado: "Fechado",
  concluido: "Concluído",
  perdido: "Perdido",
};

type ViewMode = 'list' | 'kanban';

const DashboardLeads = () => {
  const canExportMailing = hasFeature('leads_export_mailing');
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({ pendentes: "0", em_atendimento: "0", concluidos: "0", total: "0" });
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [mailingOpen, setMailingOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  const fetchData = async () => {
    setLoading(true);
    const [leadsRes, statsRes, atenRes] = await Promise.all([
      api.get<Lead[]>('/leads'),
      api.get<LeadStats>('/leads/stats'),
      api.get<Atendente[]>('/atendentes'),
    ]);
    if (leadsRes.ok && leadsRes.data) setLeads(leadsRes.data);
    if (statsRes.ok && statsRes.data) setStats(statsRes.data);
    if (atenRes.ok && atenRes.data) setAtendentes(atenRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    // Optimistic update
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l));
    const res = await api.put(`/leads/${leadId}`, { status: newStatus });
    if (res.ok) {
      fetchData();
    }
  };

  const handleAssign = async (leadId: number, consultorId: string) => {
    const res = await api.put(`/leads/${leadId}`, {
      consultor_id: consultorId ? parseInt(consultorId) : null,
      status: consultorId ? 'em_contato' : 'novo',
    });
    if (res.ok) fetchData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Fila de Leads</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Gerencie e atribua os leads dos formulários.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Visualização em lista"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Visualização Kanban"
              >
                <Columns3 className="w-4 h-4" />
              </button>
            </div>

            {canExportMailing ? (
              <Button variant="gold" size="sm" className="gap-2 font-body" onClick={() => setMailingOpen(true)}>
                <PhoneOutgoing className="w-4 h-4" />
                Montar Mailing
              </Button>
            ) : (
              <LockedOverlay feature="leads_export_mailing">
                <Button variant="gold" size="sm" className="gap-2 font-body">
                  <PhoneOutgoing className="w-4 h-4" />
                  Montar Mailing
                </Button>
              </LockedOverlay>
            )}
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400 text-xs font-body font-medium">
            <Clock className="w-3.5 h-3.5" /> {stats.pendentes} pendentes
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400 text-xs font-body font-medium">
            <User className="w-3.5 h-3.5" /> {stats.em_atendimento} em atendimento
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 text-xs font-body font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> {stats.concluidos} concluídos
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : leads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-body">Nenhum lead registrado ainda</p>
              <p className="text-sm text-muted-foreground/60 font-body mt-1">
                Os leads aparecerão aqui quando forem captados pelas landing pages.
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard leads={leads} onStatusChange={handleStatusChange} />
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                atendentes={atendentes}
                statusColors={statusColors}
                statusLabels={statusLabels}
                onStatusChange={handleStatusChange}
                onAssign={handleAssign}
              />
            ))}
          </div>
        )}
      </div>

      <MailingDialog
        open={mailingOpen}
        onOpenChange={setMailingOpen}
        leads={leads.map(l => ({ id: l.id, nome: l.nome, telefone: l.telefone }))}
      />
    </DashboardLayout>
  );
};

export default DashboardLeads;
