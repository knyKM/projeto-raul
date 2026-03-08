import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Eye, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/apiClient";

interface OverviewData {
  acessosHoje: number;
  leadsHoje: number;
  taxaConversao: string;
  pendentes: number;
  totalLeads: number;
  totalAcessos: number;
  leadsPerPage: { landing_page_slug: string; total: string }[];
  dailyLeads: { data: string; total: string }[];
}

const DashboardOverview = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      const res = await api.get<OverviewData>('/overview');
      if (res.ok && res.data) setData(res.data);
      setLoading(false);
    };
    fetchOverview();
  }, []);

  const stats = [
    { label: "Acessos Hoje", value: data?.acessosHoje?.toString() || "0", icon: Eye },
    { label: "Cadastros Hoje", value: data?.leadsHoje?.toString() || "0", icon: Users },
    { label: "Taxa de Conversão", value: data?.taxaConversao || "0%", icon: TrendingUp },
    { label: "Pendentes", value: data?.pendentes?.toString() || "0", icon: AlertCircle },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Acompanhe os indicadores da sua landing page.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold font-display text-foreground truncate">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-1 truncate">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leads per landing page */}
        {data && data.leadsPerPage && data.leadsPerPage.length > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-display font-semibold text-foreground text-sm mb-4">Leads por Landing Page (últimos 7 dias)</h3>
              <div className="space-y-3">
                {data.leadsPerPage.map((lp, i) => {
                  const total = parseInt(lp.total);
                  const max = parseInt(data.leadsPerPage[0].total) || 1;
                  const pct = (total / max) * 100;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-body text-foreground">{lp.landing_page_slug}</span>
                        <span className="text-xs font-body text-muted-foreground font-medium">{lp.total}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Totals */}
        {data && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <p className="text-xs text-muted-foreground font-body mb-1">Total de Leads</p>
                <p className="text-2xl font-display font-bold text-foreground">{data.totalLeads}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <p className="text-xs text-muted-foreground font-body mb-1">Total de Acessos</p>
                <p className="text-2xl font-display font-bold text-foreground">{data.totalAcessos}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty state when no data */}
        {!loading && (!data || (data.totalLeads === 0 && data.totalAcessos === 0)) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Eye className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-body">Nenhum dado disponível ainda</p>
              <p className="text-sm text-muted-foreground/60 font-body mt-1">
                Os dados aparecerão aqui conforme os leads e acessos forem registrados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;
