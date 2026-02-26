import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockLeads, mockAtendentes, type Lead } from "@/data/mockDashboard";
import { Clock, CheckCircle2, User, Phone, Mail, MessageSquare, UserPlus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

const statusConfig = {
  pendente: { label: "Pendente", variant: "outline" as const, icon: Clock, color: "text-amber-600" },
  em_atendimento: { label: "Em Atendimento", variant: "secondary" as const, icon: User, color: "text-blue-600" },
  concluido: { label: "Concluído", variant: "default" as const, icon: CheckCircle2, color: "text-emerald-600" },
};

const DashboardLeads = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const filtered = filterStatus === "todos" ? leads : leads.filter((l) => l.status === filterStatus);

  const handleAssign = (leadId: string, atendenteNome: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, atendente: atendenteNome, status: "em_atendimento" as const } : l
      )
    );
    toast.success(`Lead atribuído a ${atendenteNome}`);
  };

  const handleComplete = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: "concluido" as const } : l
      )
    );
    toast.success("Atendimento concluído!");
  };

  const pendingCount = leads.filter((l) => l.status === "pendente").length;
  const activeCount = leads.filter((l) => l.status === "em_atendimento").length;
  const doneCount = leads.filter((l) => l.status === "concluido").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Fila de Leads</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Gerencie e atribua os leads dos formulários.</p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 font-body">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos ({leads.length})</SelectItem>
              <SelectItem value="pendente">Pendentes ({pendingCount})</SelectItem>
              <SelectItem value="em_atendimento">Em Atendimento ({activeCount})</SelectItem>
              <SelectItem value="concluido">Concluídos ({doneCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-body font-medium">
            <Clock className="w-3.5 h-3.5" /> {pendingCount} pendentes
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-body font-medium">
            <User className="w-3.5 h-3.5" /> {activeCount} em atendimento
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-body font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> {doneCount} concluídos
          </div>
        </div>

        {/* Lead cards */}
        <div className="space-y-3">
          {filtered.map((lead) => {
            const config = statusConfig[lead.status];
            return (
              <Card key={lead.id}>
                <CardContent className="p-4 md:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Lead info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-body font-semibold text-foreground">{lead.nome}</h3>
                        <Badge variant={config.variant} className="text-xs font-body gap-1">
                          <config.icon className={`w-3 h-3 ${config.color}`} />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-body">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.telefone}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                        <span className="capitalize">🚗 {lead.tipo}</span>
                        <span>{new Date(lead.criadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {lead.mensagem && (
                        <p className="text-xs text-muted-foreground font-body flex items-start gap-1.5 mt-1">
                          <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                          {lead.mensagem}
                        </p>
                      )}
                      {lead.atendente && (
                        <p className="text-xs font-body text-primary font-medium flex items-center gap-1.5">
                          <User className="w-3 h-3" /> Atendente: {lead.atendente}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {lead.status === "pendente" && (
                        <Select onValueChange={(v) => handleAssign(lead.id, v)}>
                          <SelectTrigger className="w-44 font-body text-xs h-9">
                            <SelectValue placeholder="Atribuir atendente" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockAtendentes.map((a) => (
                              <SelectItem key={a.id} value={a.nome}>
                                {a.nome} ({a.ativos} ativo{a.ativos !== 1 ? "s" : ""})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {lead.status === "em_atendimento" && (
                        <Button size="sm" variant="default" onClick={() => handleComplete(lead.id)} className="text-xs font-body gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-body text-sm">
              Nenhum lead encontrado com este filtro.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardLeads;
