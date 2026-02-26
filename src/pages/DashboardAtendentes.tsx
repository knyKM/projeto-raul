import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAtendentes, mockLeads } from "@/data/mockDashboard";
import { User, CheckCircle2, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const DashboardAtendentes = () => {
  const atendentesStats = mockAtendentes.map((a) => {
    const leads = mockLeads.filter((l) => l.atendente === a.nome);
    const emAtendimento = leads.filter((l) => l.status === "em_atendimento").length;
    const concluidos = leads.filter((l) => l.status === "concluido").length;
    return { ...a, emAtendimento, concluidos, total: leads.length };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Atendentes</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Desempenho e carga de trabalho da equipe.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{mockAtendentes.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-1">Total de Atendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                {mockLeads.filter((l) => l.status === "em_atendimento").length}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-1">Em Atendimento</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                {mockLeads.filter((l) => l.status === "concluido").length}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-1">Concluídos</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {atendentesStats.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-5">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xs sm:text-sm shrink-0">
                      {a.nome.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">{a.nome}</p>
                      <p className="text-xs text-muted-foreground font-body">{a.total} leads atribuídos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.emAtendimento > 0 && (
                      <Badge variant="secondary" className="text-xs font-body gap-1">
                        <Clock className="w-3 h-3" />
                        {a.emAtendimento} ativo{a.emAtendimento > 1 ? "s" : ""}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs font-body gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {a.concluidos} concluído{a.concluidos > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                {/* Leads assigned */}
                {mockLeads.filter((l) => l.atendente === a.nome).length > 0 && (
                  <div className="mt-3 sm:mt-4 pl-0 sm:pl-14 space-y-2">
                    {mockLeads
                      .filter((l) => l.atendente === a.nome)
                      .map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-2.5 rounded-md bg-muted/50 border border-border text-xs font-body">
                          <span className="text-foreground font-medium">{lead.nome}</span>
                          <span className="text-muted-foreground capitalize">{lead.status.replace("_", " ")}</span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAtendentes;
