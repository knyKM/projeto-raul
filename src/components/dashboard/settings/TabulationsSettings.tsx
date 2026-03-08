import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Check, GripVertical, Palette, Tag, Layers, Sparkles, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

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
const CATEGORY_ICONS: Record<string, typeof Tag> = {
  'Atendimento': Tag,
  'Vendas': Sparkles,
  'Pós-venda': Layers,
};

const SYSTEM_IDS = ['novo', 'fechado', 'perdido'];

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
  const [activeCategory, setActiveCategory] = useState<string>("all");
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
    setForm({ name: '', color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)], category: activeCategory === "all" ? 'Atendimento' : activeCategory });
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
      toast({ title: "Tabulação atualizada ✓" });
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
      toast({ title: "Tabulação criada ✓" });
    }
    setDialogOpen(false);
  };

  const handleToggle = (id: string) => {
    const updated = tabulations.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t);
    saveTabulations(updated);
  };

  const handleDelete = (id: string) => {
    const updated = tabulations.filter(t => t.id !== id).map((t, i) => ({ ...t, order: i }));
    saveTabulations(updated);
    setDeleteConfirm(null);
    toast({ title: "Tabulação removida" });
  };

  const handleDragStart = (index: number) => { dragItemRef.current = index; };
  const handleDragEnter = (index: number) => { dragOverRef.current = index; };
  const handleDragEnd = () => {
    if (dragItemRef.current === null || dragOverRef.current === null) return;
    const from = dragItemRef.current;
    const to = dragOverRef.current;
    if (from === to) return;
    const items = [...tabulations];
    const [removed] = items.splice(from, 1);
    items.splice(to, 0, removed);
    saveTabulations(items.map((t, i) => ({ ...t, order: i })));
    dragItemRef.current = null;
    dragOverRef.current = null;
  };

  const filtered = activeCategory === "all" ? tabulations : tabulations.filter(t => t.category === activeCategory);
  const enabledCount = tabulations.filter(t => t.enabled).length;
  const disabledCount = tabulations.filter(t => !t.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header area */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center border border-secondary/10">
              <Palette className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground tracking-tight">Tabulações</h2>
              <p className="text-xs text-muted-foreground font-body">Status de qualificação para seus leads</p>
            </div>
          </div>
        </div>
        <Button size="sm" className="gap-2 font-body bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl shadow-sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" />
          Nova
        </Button>
      </div>

      {/* Stats strip */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-xs font-body text-muted-foreground">Ativas</span>
          <span className="text-sm font-display font-bold text-foreground">{enabledCount}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="text-xs font-body text-muted-foreground">Inativas</span>
          <span className="text-sm font-display font-bold text-foreground">{disabledCount}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
          <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground/50" />
          <span className="text-xs font-body text-muted-foreground">Protegidas</span>
          <span className="text-sm font-display font-bold text-foreground">{tabulations.filter(t => SYSTEM_IDS.includes(t.id)).length}</span>
        </div>
      </div>

      {/* Category filter — segmented */}
      <div className="flex bg-muted/40 rounded-xl p-0.5 w-fit">
        {[{ key: "all", label: "Todas" }, ...CATEGORIES.map(c => ({ key: c, label: c }))].map(({ key, label }) => {
          const count = key === "all" ? tabulations.length : tabulations.filter(t => t.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-body font-medium transition-all duration-200",
                activeCategory === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              {label}
              <span className="ml-1.5 opacity-50">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Tabulation cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((tab) => {
            const globalIndex = tabulations.findIndex(t => t.id === tab.id);
            const isSystem = SYSTEM_IDS.includes(tab.id);
            const CatIcon = CATEGORY_ICONS[tab.category] || Tag;

            return (
              <motion.div
                key={tab.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                draggable
                onDragStart={() => handleDragStart(globalIndex)}
                onDragEnter={() => handleDragEnter(globalIndex)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                  "group relative rounded-2xl border p-4 transition-all cursor-grab active:cursor-grabbing",
                  tab.enabled
                    ? "bg-card border-border hover:border-secondary/30 hover:shadow-md"
                    : "bg-muted/20 border-border/40 opacity-60"
                )}
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full opacity-80"
                  style={{ backgroundColor: tab.color }}
                />

                <div className="flex items-start gap-3 pt-1">
                  {/* Drag handle + color */}
                  <div className="flex flex-col items-center gap-2 pt-0.5">
                    <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border border-background/50"
                      style={{ backgroundColor: tab.color + '20' }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tab.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-body text-sm font-semibold truncate",
                        tab.enabled ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {tab.name}
                      </span>
                      {isSystem && (
                        <span className="text-[8px] uppercase tracking-widest font-body font-bold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-md border border-secondary/10">
                          Sistema
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CatIcon className="w-3 h-3 text-muted-foreground/40" />
                      <span className="text-[10px] font-body text-muted-foreground/60">{tab.category}</span>
                      <span className="text-[10px] text-muted-foreground/30">•</span>
                      <span className="text-[10px] font-body text-muted-foreground/60">Posição {globalIndex + 1}</span>
                    </div>

                    {/* Preview badge */}
                    <div className="mt-2.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-body font-medium px-2.5 py-1 rounded-lg border"
                        style={{
                          backgroundColor: tab.color + '15',
                          borderColor: tab.color + '25',
                          color: tab.color,
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tab.color }} />
                        {tab.name}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(tab)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!isSystem && (
                        <button
                          onClick={() => setDeleteConfirm(tab.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <Switch
                      checked={tab.enabled}
                      onCheckedChange={() => handleToggle(tab.id)}
                      className="shrink-0"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl border border-dashed border-border bg-muted/10"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-secondary/15 to-secondary/5 flex items-center justify-center mb-4 border border-secondary/10">
            <Tag className="w-6 h-6 text-secondary/50" />
          </div>
          <p className="text-sm font-body font-medium text-foreground/60">Nenhuma tabulação nesta categoria</p>
          <Button variant="outline" size="sm" className="mt-4 font-body gap-2 rounded-xl" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" /> Criar tabulação
          </Button>
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {/* Dialog header with color preview */}
          <div
            className="px-6 pt-6 pb-4 border-b"
            style={{ borderColor: form.color + '20', background: `linear-gradient(135deg, ${form.color}08, transparent)` }}
          >
            <DialogHeader>
              <DialogTitle className="font-display text-base flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: form.color }} />
                {editingId ? 'Editar Tabulação' : 'Nova Tabulação'}
              </DialogTitle>
              <DialogDescription className="font-body text-xs">
                {editingId ? 'Altere nome, cor ou categoria' : 'Crie um novo status de qualificação'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Venda Realizada, Sem Interesse..."
                className="font-body rounded-xl h-10"
                maxLength={40}
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria</Label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = CATEGORY_ICONS[cat] || Tag;
                  return (
                    <button
                      key={cat}
                      onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={cn(
                        "flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-body font-medium border transition-all",
                        form.category === cat
                          ? "bg-secondary/10 border-secondary/20 text-secondary shadow-sm"
                          : "bg-card border-border text-muted-foreground hover:border-secondary/20"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cor</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <motion.button
                    key={c}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={cn(
                      "w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center",
                      form.color === c ? "border-foreground shadow-md" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  >
                    {form.color === c && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                  </motion.button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-xl border border-border shrink-0" style={{ backgroundColor: form.color }} />
                <Input
                  value={form.color}
                  onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                  placeholder="#hex"
                  className="font-mono text-xs rounded-xl h-8"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-[9px] font-body font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Pré-visualização</p>
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-lg border"
                  style={{
                    backgroundColor: form.color + '15',
                    borderColor: form.color + '25',
                    color: form.color,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: form.color }} />
                  {form.name || 'Nome da tabulação'}
                </span>
                <span className="text-[10px] text-muted-foreground/40 font-body">← como aparece nos leads</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-5 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-body rounded-xl">Cancelar</Button>
            <Button onClick={handleSave} className="font-body rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Excluir tabulação?</DialogTitle>
            <DialogDescription className="font-body text-sm">
              Leads existentes com esse status serão mantidos, mas a opção não aparecerá mais.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="font-body rounded-xl">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="font-body rounded-xl gap-1">
              <Trash2 className="w-4 h-4" /> Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TabulationsSettings;
