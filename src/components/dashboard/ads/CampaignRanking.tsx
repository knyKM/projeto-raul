import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingDown } from "lucide-react";
import { CampanhaAds, platformConfig } from "@/data/mockAds";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

interface CampaignRankingProps {
  campanhas: CampanhaAds[];
}

const CampaignRanking = ({ campanhas }: CampaignRankingProps) => {
  const topROAS = [...campanhas]
    .sort((a, b) => b.receita / b.gasto - a.receita / a.gasto)
    .slice(0, 5);

  const topCPL = [...campanhas]
    .sort((a, b) => a.cpl - b.cpl)
    .slice(0, 5);

  const medalColors = ["text-yellow-500", "text-muted-foreground", "text-amber-700"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-body flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Top 5 — Melhor ROAS
            <InfoTooltip text="Campanhas com maior retorno sobre o investimento em ads." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topROAS.map((c, i) => {
            const roas = (c.receita / c.gasto).toFixed(2);
            return (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <span className={`font-display font-bold text-lg w-6 text-center ${medalColors[i] || "text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">{c.nome}</p>
                  <p className="text-xs text-muted-foreground font-body">
                    {platformConfig[c.platform].icon} {platformConfig[c.platform].label}
                  </p>
                </div>
                <span className="text-sm font-display font-bold text-emerald-600">{roas}x</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-body flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            Top 5 — Menor CPL
            <InfoTooltip text="Campanhas com o menor custo para adquirir cada lead." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topCPL.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <span className={`font-display font-bold text-lg w-6 text-center ${medalColors[i] || "text-muted-foreground"}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-foreground truncate">{c.nome}</p>
                <p className="text-xs text-muted-foreground font-body">
                  {platformConfig[c.platform].icon} {platformConfig[c.platform].label}
                </p>
              </div>
              <span className="text-sm font-display font-bold text-emerald-600">R$ {c.cpl.toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignRanking;
