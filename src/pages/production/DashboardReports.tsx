import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, MapPin, Building2, TrendingUp, Clock, CalendarDays,
  Loader2, RefreshCw, BarChart3, Trophy, Smartphone, Monitor, Globe, AppWindow, Share2, FileText
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend
} from "recharts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/apiClient";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

// ── Color palette (design system aligned) ──
const CHART_COLORS = [
  'hsl(220, 40%, 16%)',   // navy
  'hsl(43, 50%, 54%)',    // gold
  'hsl(220, 30%, 35%)',   // navy-light
  'hsl(43, 55%, 70%)',    // gold-light
  'hsl(220, 25%, 50%)',   // mid
  'hsl(43, 40%, 45%)',    // gold-dark
  'hsl(220, 20%, 65%)',   // lighter
  'hsl(180, 30%, 50%)',   // teal accent
];

const STATUS_COLORS: Record<string, string> = {
  novo: 'hsl(43, 50%, 54%)',
  em_contato: 'hsl(220, 40%, 50%)',
  negociando: 'hsl(280, 40%, 55%)',
  fechado: 'hsl(150, 50%, 45%)',
  concluido: 'hsl(150, 50%, 45%)',
  perdido: 'hsl(0, 60%, 55%)',
};

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  em_contato: 'Em Contato',
  negociando: 'Negociando',
  fechado: 'Fechado',
  concluido: 'Concluído',
  perdido: 'Perdido',
};

interface ReportData {
  kpi: {
    totalLeads: number;
    totalVisits: number;
    estados: number;
    cidades: number;
    conversionRate: string;
    peakHour: string;
    bestDay: string;
    convertidos: number;
  };
  byState: { name: string; value: number }[];
  byCity: { name: string; value: number }[];
  bySources: { name: string; value: number }[];
  byMedium: { name: string; value: number }[];
  byDevice: { name: string; value: number }[];
  byOS: { name: string; value: number }[];
  byBrowser: { name: string; value: number }[];
  dailyTrend: { date: string; leads: number }[];
  heatmap: { dow: number; hour: number; value: number }[];
  hourlyDist: { hour: number; value: number }[];
  byLP: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
}

// ── KPI Card ──
function KpiCard({ icon: Icon, label, value, accent = false }: { icon: React.ElementType; label: string; value: string | number; accent?: boolean }) {
  return (
    <Card className={accent ? "border-secondary/30 bg-secondary/[0.04]" : ""}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-secondary/10' : 'bg-muted'}`}>
          <Icon className={`w-5 h-5 ${accent ? 'text-secondary' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-body">{label}</p>
          <p className="text-xl font-display font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Heatmap component ──
function LeadHeatmap({ data }: { data: { dow: number; hour: number; value: number }[] }) {
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const getVal = (dow: number, hour: number) => {
    const item = data.find(d => d.dow === dow && d.hour === hour);
    return item?.value || 0;
  };

  const getOpacity = (val: number) => {
    if (val === 0) return 0.04;
    return 0.15 + (val / maxVal) * 0.85;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="flex ml-10 mb-1">
          {hours.filter(h => h % 2 === 0).map(h => (
            <span key={h} className="text-[9px] text-muted-foreground font-body" style={{ width: `${100/12}%`, textAlign: 'center' }}>
              {h}h
            </span>
          ))}
        </div>
        {/* Grid */}
        {dayLabels.map((label, dow) => (
          <div key={dow} className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] text-muted-foreground font-body w-9 text-right shrink-0">{label}</span>
            <div className="flex flex-1 gap-0.5">
              {hours.map(h => {
                const val = getVal(dow, h);
                return (
                  <div
                    key={h}
                    className="flex-1 aspect-square rounded-sm relative group cursor-default"
                    style={{ backgroundColor: `hsl(220 40% 16% / ${getOpacity(val)})` }}
                    title={`${label} ${h}h: ${val} leads`}
                  >
                    {val > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[7px] font-bold text-foreground">{val}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-2 mr-1">
          <span className="text-[9px] text-muted-foreground font-body">Menos</span>
          {[0.08, 0.25, 0.45, 0.65, 0.9].map((op, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsl(220 40% 16% / ${op})` }} />
          ))}
          <span className="text-[9px] text-muted-foreground font-body">Mais</span>
        </div>
      </div>
    </div>
  );
}

// ── Custom Tooltip ──
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs font-body font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-body text-muted-foreground">{p.name}: <span className="font-semibold text-foreground">{p.value}</span></p>
      ))}
    </div>
  );
}

// ── Date presets ──
const presets = [
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
  { label: 'Últimos 90 dias', value: '90d' },
  { label: 'Personalizado', value: 'custom' },
];

const DashboardReports = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fetchData = async () => {
    setLoading(true);
    const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const res = await api.get<ReportData>(`/reports?startDate=${startDate}&endDate=${endDate}`);
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  const handlePreset = (value: string) => {
    setPreset(value);
    if (value === '7d') setDateRange({ from: subDays(new Date(), 7), to: new Date() });
    else if (value === '30d') setDateRange({ from: subDays(new Date(), 30), to: new Date() });
    else if (value === '90d') setDateRange({ from: subDays(new Date(), 90), to: new Date() });
  };

  const formattedTrend = useMemo(() => {
    if (!data) return [];
    return data.dailyTrend.map(d => ({
      ...d,
      date: format(new Date(d.date + 'T12:00:00'), 'dd/MM', { locale: ptBR }),
    }));
  }, [data]);

  const hourlyFull = useMemo(() => {
    if (!data) return [];
    const map = new Map(data.hourlyDist.map(d => [d.hour, d.value]));
    return Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, '0')}h`, value: map.get(h) || 0 }));
  }, [data]);

  const dateLabel = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "dd MMM yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}`
    : 'Selecione período';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Central de Relatórios</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Análises e insights dos seus leads</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 font-body" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-body mb-1.5">Período</p>
              <Select value={preset} onValueChange={handlePreset}>
                <SelectTrigger className="w-[160px] h-9 text-xs font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {presets.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {preset === 'custom' && (
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1.5">Intervalo</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs font-body gap-2 h-9">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {dateLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {preset !== 'custom' && (
              <div className="flex items-end">
                <p className="text-xs text-muted-foreground font-body bg-muted px-3 py-2 rounded-md h-9 flex items-center">
                  <CalendarDays className="w-3.5 h-3.5 mr-2 text-muted-foreground/60" />
                  {dateLabel}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard icon={Users} label="Total de Leads" value={data.kpi.totalLeads} accent />
              <KpiCard icon={MapPin} label="Estados Alcançados" value={data.kpi.estados} />
              <KpiCard icon={Building2} label="Cidades Atingidas" value={data.kpi.cidades} />
              <KpiCard icon={TrendingUp} label="Taxa de Conversão" value={`${data.kpi.conversionRate}%`} accent />
              <KpiCard icon={Clock} label="Horário de Pico" value={data.kpi.peakHour} />
              <KpiCard icon={CalendarDays} label="Melhor Dia" value={data.kpi.bestDay} />
            </div>

            {/* ── Trend + Hourly ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-secondary" /> Tendência de Leads
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formattedTrend}>
                        <defs>
                          <linearGradient id="gradientLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(220, 40%, 16%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(220, 40%, 16%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" />
                        <YAxis tick={{ fontSize: 10, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" />
                        <RTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="leads" name="Leads" stroke="hsl(220, 40%, 16%)" fill="url(#gradientLeads)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary" /> Leads por Hora do Dia
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyFull}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                        <XAxis dataKey="hour" tick={{ fontSize: 9, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" interval={1} />
                        <YAxis tick={{ fontSize: 10, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Leads" fill="hsl(43, 50%, 54%)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Sources + Medium ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-secondary" /> Fontes de Tráfego
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[280px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.bySources}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={100}
                          paddingAngle={3}
                          dataKey="value" nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {data.bySources.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Globe className="w-4 h-4 text-secondary" /> Plataforma de Origem
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byMedium} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                        <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" width={80} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                          {data.byMedium.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Heatmap ── */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-secondary" /> Mapa de Calor — Leads por Hora / Dia
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <LeadHeatmap data={data.heatmap} />
              </CardContent>
            </Card>

            {/* ── Top States + Cities + LPs ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-secondary" /> Top 10 Estados
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byState} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                        <XAxis type="number" tick={{ fontSize: 9, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" width={90} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                          {data.byState.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-secondary" /> Top 10 Cidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byCity} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                        <XAxis type="number" tick={{ fontSize: 9, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" width={90} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                          {data.byCity.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <FileText className="w-4 h-4 text-secondary" /> Top Landing Pages
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byLP} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                        <XAxis type="number" tick={{ fontSize: 9, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: 'DM Sans' }} stroke="hsl(220, 10%, 45%)" width={90} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Leads" fill="hsl(43, 50%, 54%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Device / OS / Browser + Status ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-secondary" /> Dispositivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.byDevice} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name">
                          {data.byDevice.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <RTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'DM Sans' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-secondary" /> Sistemas Operacionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.byOS} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name">
                          {data.byOS.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <RTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'DM Sans' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <AppWindow className="w-4 h-4 text-secondary" /> Navegadores
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.byBrowser} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name">
                          {data.byBrowser.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <RTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'DM Sans' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-secondary" /> Status dos Leads
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.byStatus.map(s => ({ ...s, name: STATUS_LABELS[s.name] || s.name }))}
                          cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name"
                        >
                          {data.byStatus.map((s, i) => (
                            <Cell key={i} fill={STATUS_COLORS[s.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'DM Sans' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-body">Nenhum dado disponível</p>
              <p className="text-sm text-muted-foreground/60 font-body mt-1">Os relatórios aparecerão quando houver leads registrados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardReports;
