import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { mockStats, mockAccessByDay, mockTipoVeiculo, mockLeads } from "@/data/mockDashboard";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const COLORS = ["hsl(220, 40%, 16%)", "hsl(43, 50%, 54%)", "hsl(220, 30%, 45%)", "hsl(43, 45%, 40%)"];

const stats = [
  { label: "Acessos Hoje", value: mockStats.acessosHoje.toLocaleString("pt-BR"), icon: Eye, change: "+12%" },
  { label: "Cadastros Hoje", value: mockStats.cadastrosHoje, icon: Users, change: "+33%" },
  { label: "Taxa de Conversão", value: `${mockStats.taxaConversao}%`, icon: TrendingUp, change: "+0.5%" },
  { label: "Pendentes", value: mockStats.pendentes, icon: AlertCircle, change: "" },
];

const DashboardOverview = () => {
  const recentLeads = mockLeads.filter((l) => l.status === "pendente").slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Acompanhe os indicadores da sua landing page.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                  {stat.change && (
                    <span className="text-xs font-body text-emerald-600 font-medium">{stat.change}</span>
                  )}
                </div>
                <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Bar chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-base">Acessos & Cadastros (Semana)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockAccessByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={30} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="acessos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Acessos" />
                  <Bar dataKey="cadastros" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Cadastros" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Tipo de Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={mockTipoVeiculo}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="valor"
                    nameKey="tipo"
                  >
                    {mockTipoVeiculo.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {mockTipoVeiculo.map((item, i) => (
                  <div key={item.tipo} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {item.tipo} ({item.valor}%)
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent pending leads */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-display text-base">Leads Pendentes</CardTitle>
            <Link to="/dashboard/leads" className="text-xs text-primary hover:underline font-body">
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <p className="font-body font-medium text-sm text-foreground">{lead.nome}</p>
                    <p className="text-xs text-muted-foreground font-body">{lead.telefone} · {lead.tipo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-body">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;
