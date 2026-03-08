import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, User, Users, FileText, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LockedOverlay from "@/components/dashboard/LockedOverlay";
import { hasFeature } from "@/lib/featureAccess";
import { Button } from "@/components/ui/button";
import { PhoneOutgoing } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import MailingDialog from "@/components/dashboard/leads/MailingDialog";

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
  em_atendimento: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  concluido: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
};

const statusLabels: Record<string, string> = {
  novo: "Pendente",
  em_atendimento: "Em Atendimento",
  concluido: "Concluído",
};

const DashboardLeads = () => {
  const canExportMailing = hasFeature('leads_export_mailing');
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({ pendentes: "0", em_atendimento: "0", concluidos: "0", total: "0" });
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [mailingOpen, setMailingOpen] = useState(false);

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
    const res = await api.put(`/leads/${leadId}`, { status: newStatus });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l));
      fetchData(); // refresh stats
    }
  };

  const handleAssign = async (leadId: number, consultorId: string) => {
    const res = await api.put(`/leads/${leadId}`, {
      consultor_id: consultorId ? parseInt(consultorId) : null,
      status: consultorId ? 'em_atendimento' : 'novo',
    });
    if (res.ok) fetchData();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
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

        {/* Leads table */}
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
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Lead info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-body font-semibold text-foreground text-sm truncate">{lead.nome}</p>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${statusColors[lead.status] || ''}`}>
                          {statusLabels[lead.status] || lead.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-body">
                        <span>📞 {lead.telefone}</span>
                        {lead.email && <span>✉️ {lead.email}</span>}
                        <span>🕐 {formatDate(lead.created_at)}</span>
                      </div>
                      {lead.landing_page_slug && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <FileText className="w-3 h-3 text-muted-foreground/60" />
                          <span className="text-[11px] font-body text-muted-foreground/80 bg-muted px-2 py-0.5 rounded">
                            {lead.landing_page_slug}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={lead.status}
                        onValueChange={(v) => handleStatusChange(lead.id, v)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs font-body">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novo">Pendente</SelectItem>
                          <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={lead.consultor_id?.toString() || "none"}
                        onValueChange={(v) => handleAssign(lead.id, v === "none" ? "" : v)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs font-body">
                          <SelectValue placeholder="Atribuir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem atendente</SelectItem>
                          {atendentes.map((a) => (
                            <SelectItem key={a.id} value={a.id.toString()}>{a.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MailingDialog
        open={mailingOpen}
        onOpenChange={setMailingOpen}
        leadCount={leads.length}
      />
    </DashboardLayout>
  );
};

export default DashboardLeads;
