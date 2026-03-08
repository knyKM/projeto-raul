import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const DashboardGeo = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Geolocalização</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">De onde vêm os acessos à sua landing page.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-xs text-muted-foreground font-body mb-1">Total de Acessos Rastreados</p>
              <p className="text-3xl font-display font-bold text-foreground">0</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty state */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-body">Nenhum dado de geolocalização disponível</p>
            <p className="text-sm text-muted-foreground/60 font-body mt-1">
              Os dados de localização aparecerão conforme os acessos forem registrados.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardGeo;
