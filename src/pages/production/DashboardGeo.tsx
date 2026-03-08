import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2, Globe, FileText, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LockedOverlay from "@/components/dashboard/LockedOverlay";
import { api } from "@/lib/apiClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with webpack/vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface GeoLocation {
  cidade: string;
  estado: string;
  total: string;
}

interface RecentVisit {
  id: number;
  landing_page_slug: string | null;
  cidade: string | null;
  estado: string | null;
  latitude: number | null;
  longitude: number | null;
  visited_at: string;
}

interface GeoData {
  locations: GeoLocation[];
  totalVisits: number;
  recentVisits: RecentVisit[];
  visitsWithoutGeo: number;
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Get visits with coordinates for the map
  const mapPoints = data?.recentVisits.filter((v) => v.latitude && v.longitude) || [];

  // Calculate map center
  const defaultCenter: [number, number] = [-15.78, -47.93]; // Brazil center
  const mapCenter: [number, number] = mapPoints.length > 0
    ? [mapPoints[0].latitude!, mapPoints[0].longitude!]
    : defaultCenter;

  return (
    <DashboardLayout>
      <LockedOverlay feature="geo">
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Geolocalização</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">De onde vêm os acessos à sua landing page.</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-body mb-1">Total de Acessos</p>
                <p className="text-3xl font-display font-bold text-foreground">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : data?.totalVisits || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-body mb-1">Cidades Identificadas</p>
                <p className="text-3xl font-display font-bold text-foreground">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : data?.locations?.length || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-body mb-1">Sem Localização</p>
                <p className="text-3xl font-display font-bold text-foreground">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : data?.visitsWithoutGeo || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          {!loading && data && data.totalVisits > 0 && (
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-lg">
                <div className="h-[400px] w-full">
                  <MapContainer
                    center={mapCenter}
                    zoom={mapPoints.length > 0 ? 5 : 3}
                    className="h-full w-full z-0"
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mapPoints.map((visit) => (
                      <Marker key={visit.id} position={[visit.latitude!, visit.longitude!]}>
                        <Popup>
                          <div className="text-xs space-y-1">
                            <p className="font-semibold">
                              📍 {visit.cidade || "Local desconhecido"}{visit.estado ? `, ${visit.estado}` : ""}
                            </p>
                            {visit.landing_page_slug && (
                              <p className="text-muted-foreground">📄 {visit.landing_page_slug}</p>
                            )}
                            <p className="text-muted-foreground">🕐 {formatDate(visit.visited_at)}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : !data || data.totalVisits === 0 ? (
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
            <Tabs defaultValue="cities" className="space-y-4">
              <TabsList>
                <TabsTrigger value="cities" className="font-body text-xs">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" /> Por Cidade
                </TabsTrigger>
                <TabsTrigger value="recent" className="font-body text-xs">
                  <Globe className="w-3.5 h-3.5 mr-1.5" /> Acessos Recentes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cities">
                {data.locations.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <MapPin className="w-10 h-10 text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground font-body text-sm">Nenhuma cidade identificada ainda</p>
                      <p className="text-xs text-muted-foreground/60 font-body mt-1">
                        Os {data.totalVisits} acessos foram registrados sem dados de localização.
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
              </TabsContent>

              <TabsContent value="recent">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm font-body">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Data</th>
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Landing Page</th>
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Localização</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.recentVisits.map((visit) => (
                            <tr key={visit.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                              <td className="p-3 text-foreground text-xs">{formatDate(visit.visited_at)}</td>
                              <td className="p-3">
                                {visit.landing_page_slug ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-body text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    <FileText className="w-3 h-3" />
                                    {visit.landing_page_slug}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground/50">—</span>
                                )}
                              </td>
                              <td className="p-3 text-xs">
                                {visit.cidade ? (
                                  <span className="text-foreground">
                                    📍 {visit.cidade}{visit.estado ? `, ${visit.estado}` : ''}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/50 italic">Não identificada</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </LockedOverlay>
    </DashboardLayout>
  );
};

export default DashboardGeo;
