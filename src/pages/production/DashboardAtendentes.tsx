import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LockedOverlay from "@/components/dashboard/LockedOverlay";

const DashboardAtendentes = () => {
  return (
    <DashboardLayout>
      <LockedOverlay feature="atendentes">
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Atendentes</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Desempenho e carga de trabalho da equipe.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: "Total de Atendentes", value: "0" },
              { label: "Em Atendimento", value: "0" },
              { label: "Concluídos", value: "0" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 sm:p-6 text-center">
                  <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-body">Nenhum atendente cadastrado</p>
              <p className="text-sm text-muted-foreground/60 font-body mt-1">
                Os atendentes e seus leads aparecerão aqui quando configurados.
              </p>
            </CardContent>
          </Card>
        </div>
      </LockedOverlay>
    </DashboardLayout>
  );
};

export default DashboardAtendentes;
