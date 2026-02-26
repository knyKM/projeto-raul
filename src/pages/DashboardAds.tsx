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
} from "@/data/mockAds";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, DollarSign, Users, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import DateRangeFilter from "@/components/dashboard/ads/DateRangeFilter";
import CampaignRanking from "@/components/dashboard/ads/CampaignRanking";
import GoalsAlerts from "@/components/dashboard/ads/GoalsAlerts";
import ConversionFunnel from "@/components/dashboard/ads/ConversionFunnel";

const tooltips: Record<string, string> = {
  leads: "Quantidade de potenciais clientes captados através dos formulários de anúncios.",
  gasto: "Valor total investido em campanhas de anúncios na plataforma.",
  receita: "Receita gerada a partir dos leads convertidos em vendas de consórcio.",
  cpl: "Custo por Lead — quanto você paga, em média, para conquistar cada lead. Calculado: Gasto ÷ Leads.",
  roas: "Return on Ad Spend — retorno sobre o investimento em ads. Calculado: Receita ÷ Gasto. Acima de 1x significa lucro.",
  impressoes: "Número de vezes que seus anúncios foram exibidos para os usuários.",
  ctr: "Click-Through Rate — percentual de pessoas que clicaram no anúncio após vê-lo. Calculado: Cliques ÷ Impressões × 100.",
};

const DashboardAds = () => {
  const [filterPlatform, setFilterPlatform] = useState<string>("todas");
  const [dateRange, setDateRange] = useState("30d");

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
    ativa: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
    pausada: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
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
          <div className="flex items-center gap-2 flex-wrap">
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-full sm:w-48 font-body">
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
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-body">Total Leads</span>
                <InfoTooltip text={tooltips.leads} />
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold text-foreground">{totalLeads}</p>
              <p className="text-xs text-emerald-600 font-body flex items-center gap-0.5 mt-1 truncate">
                <ArrowUpRight className="w-3 h-3 shrink-0" /> +12%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-body">Gasto Total</span>
                <InfoTooltip text={tooltips.gasto} />
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold text-foreground truncate">
                R$ {totalGasto.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-destructive font-body flex items-center gap-0.5 mt-1 truncate">
                <ArrowUpRight className="w-3 h-3 shrink-0" /> +8%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-body">Receita Gerada</span>
                <InfoTooltip text={tooltips.receita} />
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold text-foreground truncate">
                R$ {totalReceita.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-emerald-600 font-body flex items-center gap-0.5 mt-1 truncate">
                <ArrowUpRight className="w-3 h-3 shrink-0" /> +18%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-body">CPL Médio</span>
                <InfoTooltip text={tooltips.cpl} />
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold text-foreground">
                R$ {cplGeral.toFixed(2)}
              </p>
              <p className="text-xs text-emerald-600 font-body flex items-center gap-0.5 mt-1 truncate">
                <ArrowDownRight className="w-3 h-3 shrink-0" /> -5%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-body">ROAS Geral</span>
                <InfoTooltip text={tooltips.roas} />
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold text-foreground">
                {roasGeral.toFixed(2)}x
              </p>
              <p className="text-xs text-emerald-600 font-body flex items-center gap-0.5 mt-1 truncate">
                <ArrowUpRight className="w-3 h-3 shrink-0" /> +0.3
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goals & Funnel Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoalsAlerts />
          <ConversionFunnel />
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
                    <p className="text-muted-foreground text-xs flex items-center gap-1">Leads <InfoTooltip text={tooltips.leads} /></p>
                    <p className="font-semibold text-foreground">{canal.leads}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">CPL <InfoTooltip text={tooltips.cpl} /></p>
                    <p className="font-semibold text-foreground">R$ {canal.cpl.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">Gasto <InfoTooltip text={tooltips.gasto} /></p>
                    <p className="font-semibold text-foreground">R$ {canal.gastoTotal.toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">ROAS <InfoTooltip text={tooltips.roas} /></p>
                    <p className="font-semibold text-foreground">{canal.roas.toFixed(2)}x</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">Impressões <InfoTooltip text={tooltips.impressoes} /></p>
                    <p className="font-semibold text-foreground">{(canal.impressoes / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">CTR <InfoTooltip text={tooltips.ctr} /></p>
                    <p className="font-semibold text-foreground">{canal.ctr}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Campaign Ranking */}
        <CampaignRanking campanhas={campanhasFiltradas} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-body">Leads por Dia / Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockLeadsPorDia}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                   <XAxis dataKey="data" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="meta" name="Meta Ads" fill="#1877F2" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="google" name="Google Ads" fill="#EA4335" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="tiktok" name="TikTok Ads" fill="#000000" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                 <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </div>
                ))}
              </div>
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
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", fontSize: "12px" }} />
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
                    <TableHead className="font-body text-right"><span className="flex items-center justify-end gap-1">Gasto <InfoTooltip text={tooltips.gasto} /></span></TableHead>
                    <TableHead className="font-body text-right"><span className="flex items-center justify-end gap-1">Leads <InfoTooltip text={tooltips.leads} /></span></TableHead>
                    <TableHead className="font-body text-right"><span className="flex items-center justify-end gap-1">CPL <InfoTooltip text={tooltips.cpl} /></span></TableHead>
                    <TableHead className="font-body text-right"><span className="flex items-center justify-end gap-1">Receita <InfoTooltip text={tooltips.receita} /></span></TableHead>
                    <TableHead className="font-body text-right"><span className="flex items-center justify-end gap-1">ROAS <InfoTooltip text={tooltips.roas} /></span></TableHead>
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
