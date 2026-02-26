import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Filter } from "lucide-react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

interface FunnelStep {
  label: string;
  value: number;
  color: string;
}

const funnelData: FunnelStep[] = [
  { label: "Leads Captados", value: 289, color: "bg-primary" },
  { label: "Contato Realizado", value: 214, color: "bg-blue-500" },
  { label: "Proposta Enviada", value: 89, color: "bg-amber-500" },
  { label: "Venda Fechada", value: 34, color: "bg-emerald-500" },
];

const ConversionFunnel = () => {
  const maxValue = funnelData[0].value;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-body flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          Funil de Conversão
          <InfoTooltip text="Visualize a jornada do lead até a venda: Lead → Contato → Proposta → Venda." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {funnelData.map((step, i) => {
          const widthPercent = Math.max((step.value / maxValue) * 100, 20);
          const conversionRate = i > 0
            ? ((step.value / funnelData[i - 1].value) * 100).toFixed(1)
            : null;

          return (
            <div key={step.label}>
              {i > 0 && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <ArrowDown className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-body">
                    {conversionRate}% conversão
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div
                    className={`${step.color} rounded-lg py-3 px-4 flex items-center justify-between transition-all`}
                    style={{ width: `${widthPercent}%`, minWidth: "fit-content" }}
                  >
                    <span className="text-xs font-body font-medium text-white whitespace-nowrap">
                      {step.label}
                    </span>
                    <span className="text-sm font-display font-bold text-white ml-3">
                      {step.value}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="mt-3 p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground font-body">
            Taxa de conversão geral: <span className="font-semibold text-foreground">{((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100).toFixed(1)}%</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnel;
