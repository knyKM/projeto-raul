import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  mockCanaisResumo,
  mockLeadsPorDia,
  mockGastoPorDia,
  mockCampanhas,
  platformConfig,
  type AdsPlatform,
} from "@/data/mockAds";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, DollarSign, Users, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";

const DashboardAds = () => {
  const [filterPlatform, setFilterPlatform] = useState<string>("todas");

  const totalLeads = mockCanaisResumo.reduce((s, c) => s + c.leads, 0);
  const totalGasto = mockCanaisResumo.reduce((s, c) => s + c.gastoTotal, 0);
  const totalReceita = mockCanaisResumo.reduce((s, c) => s + c.receita, 0);
  const cplGeral = totalGasto / totalLeads;
  const roasGeral = totalReceita / totalGasto;

  const campanhasFiltradas =
    filterPlatform === "todas"
      ? mockCampanhas
      : mockCampanhas.filter((c) => c.platform === filterPlatform);

  const pieData = mockCanaisResumo.map((c) => ({
    name: c.label,
    value: c.leads,
    color: c.color,
  }));

  const statusColors: Record<string, string> = {
    ativa: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pausada: "bg-amber-100 text-amber-700 border-amber-200",
    encerrada: "bg-muted text-muted-foreground border-border",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Central de Ads</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Acompanhe o desempenho de Meta Ads, Google Ads e TikTok Ads em um só lugar.
            </p>
          </div>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-48 font-body">
              <SelectValue placeholder="Filtrar plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as plataformas</SelectItem>
              <SelectItem value="meta">📘 Meta Ads</SelectItem>
              <SelectItem value="google">🔍 Google Ads</SelectItem>
              <SelectItem value="tiktok">🎵 TikTok Ads</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-body">Total Leads</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{totalLeads}</p>
              <p className="text-xs text-emerald-600 font-body flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +12% vs semana anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-body">Gasto Total</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                R$ {totalGasto.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-destructive font-body flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +8% vs semana anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-body">Receita Gerada</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                R$ {totalReceita.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-emerald-600 font-body flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +18% vs semana anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-body">CPL Médio</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                R$ {cplGeral.toFixed(2)}
              </p>
              <p className="text-xs text-emerald-600 font-body flex items-center gap-0.5 mt-1">
                <ArrowDownRight className="w-3 h-3" /> -5% vs semana anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-body">ROAS Geral</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                {roasGeral.toFixed(2)}x
              </p>
              <p className="text-xs text-emerald-600 font-body flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +0.3 vs semana anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Channel Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockCanaisResumo.map((canal) => (
            <Card key={canal.platform} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: canal.color }}
              />
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-body flex items-center gap-2">
                  {platformConfig[canal.platform].icon} {canal.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm font-body">
                  <div>
                    <p className="text-muted-foreground text-xs">Leads</p>
                    <p className="font-semibold text-foreground">{canal.leads}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">CPL</p>
                    <p className="font-semibold text-foreground">R$ {canal.cpl.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Gasto</p>
                    <p className="font-semibold text-foreground">R$ {canal.gastoTotal.toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">ROAS</p>
                    <p className="font-semibold text-foreground">{canal.roas.toFixed(2)}x</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Impressões</p>
                    <p className="font-semibold text-foreground">{(canal.impressoes / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">CTR</p>
                    <p className="font-semibold text-foreground">{canal.ctr}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Leads por dia */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-body">Leads por Dia / Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mockLeadsPorDia}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="meta" name="Meta Ads" fill="#1877F2" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="google" name="Google Ads" fill="#EA4335" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="tiktok" name="TikTok Ads" fill="#000000" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie chart leads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-body">Distribuição de Leads</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gasto por dia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-body">Gasto Diário por Plataforma (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mockGastoPorDia}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="meta" name="Meta Ads" stroke="#1877F2" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="google" name="Google Ads" stroke="#EA4335" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="tiktok" name="TikTok Ads" stroke="#000000" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campanhas Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-body">Campanhas</CardTitle>
            <Badge variant="outline" className="font-body text-xs">
              {campanhasFiltradas.length} campanha{campanhasFiltradas.length !== 1 ? "s" : ""}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body">Campanha</TableHead>
                    <TableHead className="font-body">Plataforma</TableHead>
                    <TableHead className="font-body">Status</TableHead>
                    <TableHead className="font-body text-right">Gasto</TableHead>
                    <TableHead className="font-body text-right">Leads</TableHead>
                    <TableHead className="font-body text-right">CPL</TableHead>
                    <TableHead className="font-body text-right">Receita</TableHead>
                    <TableHead className="font-body text-right">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campanhasFiltradas.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-body font-medium">{c.nome}</TableCell>
                      <TableCell className="font-body">
                        {platformConfig[c.platform].icon} {platformConfig[c.platform].label}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-body capitalize ${statusColors[c.status]}`}>
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell className="font-body text-right">R$ {c.gasto.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="font-body text-right">{c.leads}</TableCell>
                      <TableCell className="font-body text-right">R$ {c.cpl.toFixed(2)}</TableCell>
                      <TableCell className="font-body text-right">R$ {c.receita.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="font-body text-right font-semibold">
                        {(c.receita / c.gasto).toFixed(2)}x
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAds;
