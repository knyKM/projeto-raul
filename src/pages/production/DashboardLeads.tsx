import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, User, Users } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const DashboardLeads = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Fila de Leads</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Gerencie e atribua os leads dos formulários.</p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400 text-xs font-body font-medium">
            <Clock className="w-3.5 h-3.5" /> 0 pendentes
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400 text-xs font-body font-medium">
            <User className="w-3.5 h-3.5" /> 0 em atendimento
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 text-xs font-body font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> 0 concluídos
          </div>
        </div>

        {/* Empty state */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-body">Nenhum lead registrado ainda</p>
            <p className="text-sm text-muted-foreground/60 font-body mt-1">
              Os leads aparecerão aqui quando forem captados pelas landing pages.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardLeads;
