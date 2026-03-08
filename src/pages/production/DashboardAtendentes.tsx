import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, Trash2, Loader2, UserCheck, UserX } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LockedOverlay from "@/components/dashboard/LockedOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface Atendente {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
  leads_ativos: string;
  leads_concluidos: string;
  leads_total: string;
}

const DashboardAtendentes = () => {
  const { toast } = useToast();
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [saving, setSaving] = useState(false);

  const fetchAtendentes = async () => {
    setLoading(true);
    const res = await api.get<Atendente[]>('/atendentes');
    if (res.ok && res.data) setAtendentes(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchAtendentes(); }, []);

  const handleCreate = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    const res = await api.post('/atendentes', form);
    setSaving(false);
    if (res.ok) {
      toast({ title: "Atendente cadastrado!" });
      setForm({ nome: "", email: "", telefone: "" });
      setDialogOpen(false);
      fetchAtendentes();
    } else {
      toast({ title: "Erro ao cadastrar", description: res.error, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await api.delete(`/atendentes/${id}`);
    if (res.ok) {
      toast({ title: "Atendente removido" });
      fetchAtendentes();
    }
  };

  const handleToggleActive = async (id: number, ativo: boolean) => {
    await api.put(`/atendentes/${id}`, { ativo: !ativo });
    fetchAtendentes();
  };

  const totalAtivos = atendentes.filter((a) => a.ativo).length;
  const totalAtendimento = atendentes.reduce((acc, a) => acc + parseInt(a.leads_ativos || "0"), 0);
  const totalConcluidos = atendentes.reduce((acc, a) => acc + parseInt(a.leads_concluidos || "0"), 0);

  return (
    <DashboardLayout>
      <LockedOverlay feature="atendentes">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Atendentes</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Desempenho e carga de trabalho da equipe.</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-body" size="sm">
                  <Plus className="w-4 h-4" /> Novo Atendente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Cadastrar Atendente</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <Input
                    placeholder="Nome *"
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    maxLength={100}
                  />
                  <Input
                    placeholder="E-mail (opcional)"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    maxLength={255}
                  />
                  <Input
                    placeholder="Telefone (opcional)"
                    value={form.telefone}
                    onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                    maxLength={20}
                  />
                  <Button onClick={handleCreate} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Cadastrar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: "Total de Atendentes", value: totalAtivos.toString() },
              { label: "Em Atendimento", value: totalAtendimento.toString() },
              { label: "Concluídos", value: totalConcluidos.toString() },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 sm:p-6 text-center">
                  <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : atendentes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-body">Nenhum atendente cadastrado</p>
                <p className="text-sm text-muted-foreground/60 font-body mt-1">
                  Clique em "Novo Atendente" para adicionar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {atendentes.map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-body font-semibold text-foreground text-sm">{a.nome}</p>
                        {a.ativo ? (
                          <span className="text-[10px] font-body text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">Ativo</span>
                        ) : (
                          <span className="text-[10px] font-body text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Inativo</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-body mt-1">
                        {a.email && <span>✉️ {a.email}</span>}
                        {a.telefone && <span>📞 {a.telefone}</span>}
                        <span>📋 {a.leads_ativos} ativos · {a.leads_concluidos} concluídos</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleActive(a.id, a.ativo)}
                        title={a.ativo ? "Desativar" : "Ativar"}
                      >
                        {a.ativo ? <UserX className="w-4 h-4 text-muted-foreground" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(a.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </LockedOverlay>
    </DashboardLayout>
  );
};

export default DashboardAtendentes;
