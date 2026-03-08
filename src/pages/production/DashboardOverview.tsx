import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, TrendingUp, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const DashboardOverview = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Acompanhe os indicadores da sua landing page.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {[
            { label: "Acessos Hoje", value: "0", icon: Eye },
            { label: "Cadastros Hoje", value: "0", icon: Users },
            { label: "Taxa de Conversão", value: "0%", icon: TrendingUp },
            { label: "Pendentes", value: "0", icon: AlertCircle },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold font-display text-foreground truncate">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-1 truncate">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Eye className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-body">Nenhum dado disponível ainda</p>
            <p className="text-sm text-muted-foreground/60 font-body mt-1">
              Os dados aparecerão aqui conforme os leads e acessos forem registrados.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;
