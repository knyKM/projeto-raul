import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockGeoData } from "@/data/mockDashboard";
import { MapPin } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const DashboardGeo = () => {
  const totalAcessos = mockGeoData.reduce((acc, g) => acc + g.acessos, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Geolocalização</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">De onde vêm os acessos à sua landing page.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top locations */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Cidades com mais acessos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockGeoData.map((geo) => (
                <div key={geo.cidade}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-body font-medium text-foreground">
                      {geo.cidade}{geo.estado ? `, ${geo.estado}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {geo.acessos.toLocaleString("pt-BR")} ({geo.percentual}%)
                    </span>
                  </div>
                  <Progress value={geo.percentual} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground font-body mb-1">Total de Acessos Rastreados</p>
                <p className="text-3xl font-display font-bold text-foreground">{totalAcessos.toLocaleString("pt-BR")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Top 3 Estados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockGeoData.slice(0, 3).map((geo, i) => (
                  <div key={geo.cidade} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-body font-medium text-sm text-foreground">{geo.cidade}, {geo.estado}</p>
                      <p className="text-xs text-muted-foreground font-body">{geo.acessos} acessos</p>
                    </div>
                    <span className="text-sm font-display font-bold text-foreground">{geo.percentual}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardGeo;
