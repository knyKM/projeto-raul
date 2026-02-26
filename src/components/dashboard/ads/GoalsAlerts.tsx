import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Target } from "lucide-react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

interface Goal {
  label: string;
  metric: string;
  current: number;
  target: number;
  unit: string;
  invertColor?: boolean; // true = lower is better (CPL)
}

const goals: Goal[] = [
  { label: "CPL Meta Ads", metric: "cpl", current: 66.3, target: 80, unit: "R$", invertColor: true },
  { label: "CPL Google Ads", metric: "cpl", current: 114.29, target: 80, unit: "R$", invertColor: true },
  { label: "CPL TikTok Ads", metric: "cpl", current: 64.84, target: 80, unit: "R$", invertColor: true },
  { label: "ROAS Geral", metric: "roas", current: 3.73, target: 3.0, unit: "x" },
  { label: "Leads Semanais", metric: "leads", current: 289, target: 300, unit: "" },
];

const GoalsAlerts = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-body flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Metas & Alertas
          <InfoTooltip text="Acompanhe suas metas de performance. Vermelho = acima do limite (para CPL) ou abaixo da meta." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((g) => {
          const percentage = g.invertColor
            ? Math.min((g.target / g.current) * 100, 100)
            : Math.min((g.current / g.target) * 100, 100);

          const isGood = g.invertColor
            ? g.current <= g.target
            : g.current >= g.target;

          return (
            <div key={g.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isGood ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                  )}
                  <span className="text-sm font-body font-medium text-foreground">{g.label}</span>
                </div>
                <span className={`text-sm font-body font-semibold ${isGood ? "text-emerald-600" : "text-destructive"}`}>
                  {g.unit === "R$" ? `R$ ${g.current.toFixed(2)}` : `${g.current}${g.unit}`}
                  <span className="text-muted-foreground font-normal text-xs ml-1">
                    / {g.unit === "R$" ? `R$ ${g.target}` : `${g.target}${g.unit}`}
                  </span>
                </span>
              </div>
              <Progress
                value={percentage}
                className={`h-2 ${isGood ? "[&>div]:bg-emerald-500" : "[&>div]:bg-destructive"}`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default GoalsAlerts;
