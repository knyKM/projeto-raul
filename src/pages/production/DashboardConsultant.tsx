import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, Target, TrendingUp, Clock, Trophy, Flame, Medal,
  ChevronUp, ChevronDown, Minus, Loader2, Star, Zap
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/lib/authContext";
import { calculateLeadScore } from "@/lib/leadScoring";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ConsultantDashboardData {
  consultor: { id: number; nome: string };
  stats: {
    pendentes: string;
    em_atendimento: string;
    negociando: string;
    fechados: string;
    perdidos: string;
    total: string;
    hoje: string;
  };
  leads: Array<{
    id: number;
    nome: string;
    telefone: string;
    email: string | null;
    origem: string;
    landing_page_slug: string | null;
    status: string;
    created_at: string;
  }>;
  metrics: {
    conversionRate: number;
    avgResponseMinutes: number;
    totalAssigned: number;
    totalClosed: number;
  };
  dailyPerformance: Array<{ day: string; total: string; fechados: string }>;
}

interface RankingEntry {
  id: number;
  nome: string;
  total_leads: string;
  fechados: string;
  perdidos: string;
  hoje: string;
  conversion_rate: string;
}

const statusLabels: Record<string, string> = {
  novo: "Novo",
  em_contato: "Em Contato",
  negociando: "Negociando",
  fechado: "Fechado",
  perdido: "Perdido",
};

const statusDot: Record<string, string> = {
  novo: "bg-amber-500",
  em_contato: "bg-blue-500",
  negociando: "bg-purple-500",
  fechado: "bg-emerald-500",
  perdido: "bg-red-500",
};

const DashboardConsultant = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ConsultantDashboardData | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultorId, setSelectedConsultorId] = useState<number | null>(null);
  const [consultores, setConsultores] = useState<Array<{ id: number; nome: string }>>([]);

  useEffect(() => {
    // Load consultores list for admin/supervisor to pick
    api.get<Array<{ id: number; nome: string }>>('/atendentes').then(res => {
      if (res.ok && res.data && res.data.length > 0) {
        setConsultores(res.data);
        // Auto-select first or match by user name
        const match = res.data.find(c => c.nome.toLowerCase() === user?.nome?.toLowerCase());
        setSelectedConsultorId(match?.id || res.data[0].id);
      } else {
        // No consultores — stop loading
        setLoading(false);
      }
    }).catch(() => setLoading(false));
    // Load ranking
    api.get<RankingEntry[]>('/consultant/ranking/all').then(res => {
      if (res.ok && res.data) setRanking(res.data);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedConsultorId) return;
    setLoading(true);
    api.get<ConsultantDashboardData>(`/consultant/${selectedConsultorId}/dashboard`).then(res => {
      if (res.ok && res.data) setData(res.data);
      setLoading(false);
    });
  }, [selectedConsultorId]);

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data.stats;
  const metrics = data.metrics;
  const myRank = ranking.findIndex(r => r.id === selectedConsultorId) + 1;

  // Chart data
  const chartData = data.dailyPerformance.map(d => ({
    day: new Date(d.day).toLocaleDateString('pt-BR', { weekday: 'short' }),
    total: parseInt(d.total),
    fechados: parseInt(d.fechados),
  }));

  // Lead priority (sorted by score)
  const priorityLeads = data.leads
    .filter(l => l.status !== 'fechado' && l.status !== 'perdido' && l.status !== 'concluido')
    .map(l => ({ ...l, score: calculateLeadScore(l) }))
    .sort((a, b) => b.score.score - a.score.score)
    .slice(0, 8);

  const getRankIcon = (pos: number) => {
    if (pos === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (pos === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (pos === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">{pos}º</span>;
  };

  const conversionGoal = 30; // 30% goal
  const conversionProgress = Math.min((metrics.conversionRate / conversionGoal) * 100, 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Meu Painel
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Performance individual e leads prioritários</p>
          </div>

          {/* Consultor selector (admin/supervisor) */}
          {consultores.length > 1 && (
            <select
              value={selectedConsultorId || ''}
              onChange={(e) => setSelectedConsultorId(parseInt(e.target.value))}
              className="h-9 px-3 rounded-md border border-border bg-background text-sm font-body text-foreground"
            >
              {consultores.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs font-body text-muted-foreground">Total de leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{metrics.totalClosed}</p>
                  <p className="text-xs font-body text-muted-foreground">Fechados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{metrics.conversionRate}%</p>
                  <p className="text-xs font-body text-muted-foreground">Conversão</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{metrics.avgResponseMinutes}<span className="text-sm">min</span></p>
                  <p className="text-xs font-body text-muted-foreground">Tempo médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Left: Priority Leads + Chart */}
          <div className="md:col-span-2 space-y-4">
            {/* Conversion Goal */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-body font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Meta de conversão: {conversionGoal}%
                  </p>
                  <Badge variant={metrics.conversionRate >= conversionGoal ? "default" : "secondary"} className="text-xs">
                    {metrics.conversionRate >= conversionGoal ? '✅ Atingida!' : `${metrics.conversionRate}% atual`}
                  </Badge>
                </div>
                <Progress value={conversionProgress} className="h-2" />
              </CardContent>
            </Card>

            {/* Priority leads */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-body font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  Leads Prioritários
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {priorityLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-body text-center py-6">Nenhum lead pendente 🎉</p>
                ) : (
                  <div className="space-y-2">
                    {priorityLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border shrink-0 ${lead.score.color}`}>
                          {lead.score.emoji} {lead.score.score}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-body font-semibold text-foreground truncate">{lead.nome}</p>
                          <p className="text-[10px] font-body text-muted-foreground">📞 {lead.telefone}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusDot[lead.status] || 'bg-gray-400'}`} />
                          <span className="text-[10px] font-body text-muted-foreground">{statusLabels[lead.status] || lead.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-body font-semibold">Últimos 7 dias</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {chartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-body text-center py-8">Sem dados no período</p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        labelStyle={{ fontWeight: 600 }}
                      />
                      <Bar dataKey="total" name="Recebidos" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill="hsl(var(--primary) / 0.3)" />
                        ))}
                      </Bar>
                      <Bar dataKey="fechados" name="Fechados" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill="hsl(var(--primary))" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Ranking + Stats */}
          <div className="space-y-4">
            {/* My position */}
            {myRank > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  {getRankIcon(myRank)}
                  <p className="text-3xl font-display font-bold text-foreground mt-1">{myRank}º</p>
                  <p className="text-xs font-body text-muted-foreground">Sua posição no ranking</p>
                </CardContent>
              </Card>
            )}

            {/* Status breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-body font-semibold">Meus Leads por Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {[
                  { key: 'pendentes', label: 'Pendentes', dot: 'bg-amber-500', value: stats.pendentes },
                  { key: 'em_atendimento', label: 'Em Atendimento', dot: 'bg-blue-500', value: stats.em_atendimento },
                  { key: 'negociando', label: 'Negociando', dot: 'bg-purple-500', value: stats.negociando },
                  { key: 'fechados', label: 'Fechados', dot: 'bg-emerald-500', value: stats.fechados },
                  { key: 'perdidos', label: 'Perdidos', dot: 'bg-red-500', value: stats.perdidos },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                      <span className="text-xs font-body text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-body font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ranking */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-body font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Ranking Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-1.5">
                    {ranking.map((r, i) => {
                      const isMe = r.id === selectedConsultorId;
                      return (
                        <div
                          key={r.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                            isMe ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/30'
                          }`}
                        >
                          {getRankIcon(i + 1)}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-body truncate ${isMe ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                              {r.nome}
                            </p>
                            <p className="text-[10px] font-body text-muted-foreground">
                              {r.fechados} fechados · {r.conversion_rate}%
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-[9px] px-1.5">{r.total_leads}</Badge>
                        </div>
                      );
                    })}
                    {ranking.length === 0 && (
                      <p className="text-xs text-muted-foreground font-body text-center py-4">Nenhum consultor registrado</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardConsultant;
