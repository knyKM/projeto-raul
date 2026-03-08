import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, Plus, Pencil, Trash2, Check, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";

export interface Tabulation {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  order: number;
  category: string;
}

const DEFAULT_TABULATIONS: Tabulation[] = [
  { id: 'novo', name: 'Novo', color: '#F59E0B', enabled: true, order: 0, category: 'Atendimento' },
  { id: 'em_contato', name: 'Em Contato', color: '#3B82F6', enabled: true, order: 1, category: 'Atendimento' },
  { id: 'negociando', name: 'Negociando', color: '#8B5CF6', enabled: true, order: 2, category: 'Vendas' },
  { id: 'fechado', name: 'Fechado', color: '#10B981', enabled: true, order: 3, category: 'Vendas' },
  { id: 'perdido', name: 'Perdido', color: '#EF4444', enabled: true, order: 4, category: 'Vendas' },
];

const PRESET_COLORS = [
  '#10B981', '#3B82F6', '#EF4444', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280',
  '#F97316', '#84CC16', '#14B8A6', '#A855F7',
];

const CATEGORIES = ['Atendimento', 'Vendas', 'Pós-venda'];

interface TabulationFormData {
  name: string;
  color: string;
  category: string;
}

const TabulationsSettings = () => {
  const { toast } = useToast();
  const [tabulations, setTabulations] = useState<Tabulation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TabulationFormData>({ name: '', color: '#10B981', category: 'Atendimento' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const dragItemRef = useRef<number | null>(null);
  const dragOverRef = useRef<number | null>(null);

  useEffect(() => {
    loadTabulations();
  }, []);

  const loadTabulations = async () => {
    const res = await api.get<Tabulation[]>('/config/tabulations');
    if (res.ok && res.data && res.data.length > 0) {
      setTabulations(res.data.sort((a, b) => a.order - b.order));
    } else {
      setTabulations(DEFAULT_TABULATIONS);
    }
  };

  const saveTabulations = async (tabs: Tabulation[]) => {
    setTabulations(tabs);
    await api.post('/config/tabulations', tabs);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ name: '', color: '#10B981', category: 'Atendimento' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (tab: Tabulation) => {
    setEditingId(tab.id);
    setForm({ name: tab.name, color: tab.color, category: tab.category });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    if (editingId) {
      const updated = tabulations.map(t =>
        t.id === editingId ? { ...t, name: form.name, color: form.color, category: form.category } : t
      );
      saveTabulations(updated);
      toast({ title: "Tabulação atualizada" });
    } else {
      const newTab: Tabulation = {
        id: `tab_${Date.now()}`,
        name: form.name,
        color: form.color,
        enabled: true,
        order: tabulations.length,
        category: form.category,
      };
      saveTabulations([...tabulations, newTab]);
      toast({ title: "Tabulação criada" });
    }
    setDialogOpen(false);
  };

  const handleToggle = (id: string) => {
    const updated = tabulations.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    saveTabulations(updated);
  };

  const handleDelete = (id: string) => {
    const updated = tabulations.filter(t => t.id !== id).map((t, i) => ({ ...t, order: i }));
    saveTabulations(updated);
    setDeleteConfirm(null);
    toast({ title: "Tabulação removida" });
  };

  // Drag and drop
  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverRef.current = index;
  };

  const handleDragEnd = () => {
    if (dragItemRef.current === null || dragOverRef.current === null) return;
    const from = dragItemRef.current;
    const to = dragOverRef.current;
    if (from === to) return;

    const items = [...tabulations];
    const [removed] = items.splice(from, 1);
    items.splice(to, 0, removed);
    const reordered = items.map((t, i) => ({ ...t, order: i }));
    saveTabulations(reordered);

    dragItemRef.current = null;
    dragOverRef.current = null;
  };

  const groupedByCategory = CATEGORIES.map(cat => ({
    category: cat,
    items: tabulations.filter(t => t.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-display">Tabulações de Atendimento</CardTitle>
              <CardDescription className="font-body">
                Configure os status disponíveis para qualificação de leads. Arraste para reordenar.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-2 font-body" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4" />
              Nova Tabulação
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedByCategory.map(({ category, items }) => (
            <div key={category}>
              <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Categoria "{category}"
              </p>
              <p className="text-[11px] font-body text-muted-foreground/60 mb-3">
                Arraste para reordenar. A ordem será refletida no dropdown de seleção.
              </p>
              <div className="space-y-1.5">
                {items.map((tab) => {
                  const globalIndex = tabulations.findIndex(t => t.id === tab.id);
                  return (
                    <div
                      key={tab.id}
                      draggable
                      onDragStart={() => handleDragStart(globalIndex)}
                      onDragEnter={() => handleDragEnter(globalIndex)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing group
                        ${tab.enabled
                          ? 'bg-card border-border hover:border-secondary/30 hover:shadow-sm'
                          : 'bg-muted/30 border-border/50 opacity-60'
                        }`}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground/30 shrink-0" />

                      {/* Color dot */}
                      <div
                        className="w-5 h-5 rounded-full shrink-0 shadow-sm border-2 border-background"
                        style={{ backgroundColor: tab.color }}
                      />

                      {/* Name */}
                      <span className={`flex-1 font-body text-sm font-medium ${tab.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {tab.name}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(tab)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {!['novo', 'fechado', 'perdido'].includes(tab.id) && (
                          <button
                            onClick={() => setDeleteConfirm(tab.id)}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Toggle */}
                      <Switch
                        checked={tab.enabled}
                        onCheckedChange={() => handleToggle(tab.id)}
                        className="shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {tabulations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm font-body text-muted-foreground">Nenhuma tabulação configurada</p>
              <Button variant="outline" size="sm" className="mt-3 font-body gap-2" onClick={handleOpenCreate}>
                <Plus className="w-4 h-4" /> Criar primeira tabulação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? 'Editar Tabulação' : 'Nova Tabulação'}
            </DialogTitle>
            <DialogDescription className="font-body">
              {editingId ? 'Altere o nome, cor ou categoria.' : 'Crie uma nova opção de status para qualificação de leads'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label className="font-body text-sm font-medium">Nome da Tabulação</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Venda Realizada, Sem Interesse..."
                className="font-body"
                maxLength={40}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="font-body text-sm font-medium">Categoria</Label>
              <div className="flex gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium border transition-colors ${
                      form.category === cat
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label className="font-body text-sm font-medium">Cor de Identificação</Label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                      form.color === c ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {form.color === c && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
              {/* Custom hex */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full border border-border shrink-0" style={{ backgroundColor: form.color }} />
                <Input
                  value={form.color}
                  onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                  placeholder="#hex ou selecione acima"
                  className="font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-2">Pré-visualização</p>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: form.color }} />
                <span className="font-body text-sm font-medium text-foreground">
                  {form.name || 'Nome da tabulação'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-body">Cancelar</Button>
            <Button onClick={handleSave} className="font-body">
              {editingId ? 'Salvar Alterações' : 'Criar Tabulação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Excluir tabulação?</DialogTitle>
            <DialogDescription className="font-body">
              Leads com esse status serão mantidos, mas a opção não aparecerá mais nos dropdowns.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="font-body">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="font-body">
              <Trash2 className="w-4 h-4 mr-1" /> Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TabulationsSettings;
