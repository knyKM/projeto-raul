import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveLandingPageApi, generateSlug, type LandingPageData, type LandingPageTemplate } from "@/lib/landingPages";
import { useToast } from "@/hooks/use-toast";
import { FileText, Zap, Star, Heart } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  editingPage?: LandingPageData;
}

const defaults: Omit<LandingPageData, "id" | "slug" | "createdAt"> = {
  template: "completa",
  vehicleName: "",
  brand: "",
  model: "",
  year: new Date().getFullYear().toString(),
  creditValue: 0,
  installments: 80,
  installmentValue: 0,
  imageUrl: "",
  description: "",
  highlights: [],
  whatsappNumber: "5511999999999",
};

const CreateLandingPageDialog = ({ open, onOpenChange, onSaved, editingPage }: Props) => {
  const [form, setForm] = useState(defaults);
  const [highlightsText, setHighlightsText] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingPage) {
      setForm({
        template: editingPage.template || "completa",
        vehicleName: editingPage.vehicleName,
        brand: editingPage.brand,
        model: editingPage.model,
        year: editingPage.year,
        creditValue: editingPage.creditValue,
        installments: editingPage.installments,
        installmentValue: editingPage.installmentValue,
        imageUrl: editingPage.imageUrl,
        description: editingPage.description,
        highlights: editingPage.highlights,
        whatsappNumber: editingPage.whatsappNumber,
      });
      setHighlightsText(editingPage.highlights.join("\n"));
    } else {
      setForm(defaults);
      setHighlightsText("");
    }
  }, [editingPage, open]);

  useEffect(() => {
    if (form.creditValue > 0 && form.installments > 0) {
      setForm((f) => ({ ...f, installmentValue: Math.round((f.creditValue / f.installments) * 100) / 100 }));
    }
  }, [form.creditValue, form.installments]);

  const handleSave = async () => {
    if (!form.brand || !form.model || form.creditValue <= 0) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    const fullName = `${form.brand} ${form.model} ${form.year}`;
    const page: LandingPageData = {
      id: editingPage?.id || crypto.randomUUID(),
      slug: editingPage?.slug || generateSlug(fullName),
      ...form,
      vehicleName: form.vehicleName || fullName,
      highlights: highlightsText.split("\n").map((h) => h.trim()).filter(Boolean),
      createdAt: editingPage?.createdAt || new Date().toISOString(),
    };

    setSaving(true);
    const ok = await saveLandingPageApi(page);
    setSaving(false);

    if (ok) {
      onSaved();
      onOpenChange(false);
      toast({ title: editingPage ? "Landing page atualizada!" : "Landing page criada!" });
    } else {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const update = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }));
  const isSimples = form.template === "simples";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{editingPage ? "Editar" : "Nova"} Landing Page</DialogTitle>
          <DialogDescription>Configure o veículo e escolha o modelo da página.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Template selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Modelo da Página</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <TemplateCard selected={form.template === "completa"} onClick={() => update("template", "completa")} icon={<FileText className="w-5 h-5" />} title="Completa" desc="Hero, simulador, benefícios e formulário" />
              <TemplateCard selected={form.template === "simples"} onClick={() => update("template", "simples")} icon={<Zap className="w-5 h-5" />} title="Simples" desc="Valor, imagem e formulário direto" />
              <TemplateCard selected={form.template === "destaque"} onClick={() => update("template", "destaque")} icon={<Star className="w-5 h-5" />} title="Destaque" desc="Split-screen, features e chat widget" />
              <TemplateCard selected={form.template === "apelativo"} onClick={() => update("template", "apelativo")} icon={<Heart className="w-5 h-5" />} title="Apelativo" desc="Persuasivo, comparativo, depoimentos e CTA forte" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Marca *</Label>
              <Input value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="Fiat" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Modelo *</Label>
              <Input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="Argo 1.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Ano</Label>
              <Input value={form.year} onChange={(e) => update("year", e.target.value)} placeholder="2025" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome de exibição</Label>
              <Input value={form.vehicleName} onChange={(e) => update("vehicleName", e.target.value)} placeholder={`${form.brand} ${form.model} ${form.year}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Valor do crédito (R$) *</Label>
              <Input type="number" value={form.creditValue || ""} onChange={(e) => update("creditValue", Number(e.target.value))} placeholder="85000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nº de parcelas</Label>
              <Input type="number" value={form.installments} onChange={(e) => update("installments", Number(e.target.value))} placeholder="80" />
            </div>
          </div>

          {form.installmentValue > 0 && (
            <p className="text-sm text-muted-foreground font-body bg-muted rounded-md px-3 py-2">
              Parcela estimada: <span className="font-semibold text-foreground">R$ {form.installmentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </p>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">URL da imagem do veículo</Label>
            <Input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md mt-1" />
            )}
          </div>

          {!isSimples && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Descrição</Label>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Descreva o veículo e o consórcio..." rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Destaques (um por linha)</Label>
                <Textarea value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} placeholder={"Sem juros\nSem entrada obrigatória\nParcelas que cabem no bolso"} rows={3} />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">WhatsApp (com DDI+DDD)</Label>
            <Input value={form.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} placeholder="5511999999999" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editingPage ? "Salvar" : "Criar Landing Page"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface TemplateCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const TemplateCard = ({ selected, onClick, icon, title, desc }: TemplateCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${
      selected
        ? "border-primary bg-primary/5 text-primary"
        : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
    }`}
  >
    {icon}
    <span className="text-xs font-semibold font-body">{title}</span>
    <span className="text-[10px] font-body leading-tight opacity-70">{desc}</span>
  </button>
);

export default CreateLandingPageDialog;
