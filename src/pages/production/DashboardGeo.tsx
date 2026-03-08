import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LockedOverlay from "@/components/dashboard/LockedOverlay";
import { api } from "@/lib/apiClient";

interface GeoLocation {
  cidade: string;
  estado: string;
  total: string;
}

interface GeoData {
  locations: GeoLocation[];
  totalVisits: number;
}

const DashboardGeo = () => {
  const [data, setData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGeo = async () => {
      const res = await api.get<GeoData>('/leads/geo');
      if (res.ok && res.data) setData(res.data);
      setLoading(false);
    };
    fetchGeo();
  }, []);

  return (
    <DashboardLayout>
      <LockedOverlay feature="geo">
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Geolocalização</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">De onde vêm os acessos à sua landing page.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-xs text-muted-foreground font-body mb-1">Total de Acessos Rastreados</p>
                <p className="text-3xl font-display font-bold text-foreground">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : data?.totalVisits || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : !data || data.locations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-body">Nenhum dado de geolocalização disponível</p>
                <p className="text-sm text-muted-foreground/60 font-body mt-1">
                  Os dados de localização aparecerão conforme os acessos forem registrados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Cidade</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Estado</th>
                        <th className="text-right p-3 text-xs text-muted-foreground font-medium">Acessos</th>
                        <th className="text-right p-3 text-xs text-muted-foreground font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.locations.map((loc, i) => {
                        const pct = data.totalVisits > 0 ? ((parseInt(loc.total) / data.totalVisits) * 100).toFixed(1) : '0';
                        return (
                          <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                            <td className="p-3 text-foreground flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
                              {loc.cidade}
                            </td>
                            <td className="p-3 text-muted-foreground">{loc.estado}</td>
                            <td className="p-3 text-right text-foreground font-medium">{loc.total}</td>
                            <td className="p-3 text-right text-muted-foreground">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </LockedOverlay>
    </DashboardLayout>
  );
};

export default DashboardGeo;
