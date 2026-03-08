import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Target, Megaphone } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LockedOverlay from "@/components/dashboard/LockedOverlay";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

const tooltips: Record<string, string> = {
  leads: "Quantidade de potenciais clientes captados através dos formulários de anúncios.",
  gasto: "Valor total investido em campanhas de anúncios na plataforma.",
  receita: "Receita gerada a partir dos leads convertidos em vendas de consórcio.",
  cpl: "Custo por Lead — quanto você paga, em média, para conquistar cada lead.",
  roas: "Return on Ad Spend — retorno sobre o investimento em ads.",
};

const DashboardAds = () => {
  return (
    <DashboardLayout>
      <LockedOverlay feature="ads_central">
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Central de Ads</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Acompanhe o desempenho de Meta Ads, Google Ads e TikTok Ads em um só lugar.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {[
              { label: "Total Leads", value: "0", icon: Users, tip: tooltips.leads },
              { label: "Gasto Total", value: "R$ 0", icon: DollarSign, tip: tooltips.gasto },
              { label: "Receita Gerada", value: "R$ 0", icon: TrendingUp, tip: tooltips.receita },
              { label: "CPL Médio", value: "R$ 0", icon: Target, tip: tooltips.cpl },
              { label: "ROAS Geral", value: "0x", icon: TrendingUp, tip: tooltips.roas },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <kpi.icon className="w-4 h-4" />
                    <span className="text-xs font-body">{kpi.label}</span>
                    <InfoTooltip text={kpi.tip} />
                  </div>
                  <p className="text-xl sm:text-2xl font-display font-bold text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-body">Nenhuma campanha conectada</p>
              <p className="text-sm text-muted-foreground/60 font-body mt-1">
                Configure os tokens de Meta Ads, Google Ads ou TikTok Ads nas configurações para começar.
              </p>
            </CardContent>
          </Card>
        </div>
      </LockedOverlay>
    </DashboardLayout>
  );
};

export default DashboardAds;
