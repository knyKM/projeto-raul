import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, MapPin, Globe, Smartphone, Monitor, Share2, Hash, Phone, Mail, Calendar, Clock, Navigation, Cpu, AppWindow, Link2, MousePointerClick, Copy, Check, Save, Pencil, Briefcase, DollarSign, CreditCard, Home, MessageSquare, Tag } from "lucide-react";
import { api } from "@/lib/apiClient";
import { calculateLeadScore } from "@/lib/leadScoring";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface LeadDetail {
  id: string | number;
  nome: string;
  telefone: string;
  email: string | null;
  origem: string;
  landing_page_slug: string | null;
  status: string;
  consultor_id: number | null;
  created_at: string;
  // Geo
  ip: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  // Device
  device_type: string | null;
  device_manufacturer: string | null;
  device_model: string | null;
  os: string | null;
  browser: string | null;
  // UTM / Traffic
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  ad_id: string | null;
  adset_id: string | null;
  campaign_id: string | null;
  click_id: string | null;
  referrer_url: string | null;
  // Extra contact fields
  observacoes: string | null;
  renda: string | null;
  profissao: string | null;
  cpf: string | null;
  endereco: string | null;
  interesse: string | null;
  tabulacao: string | null;
}

interface LeadDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number | null;
  onLeadUpdated?: () => void;
}

function getSourceBadge(source: string | null): { label: string; color: string } | null {
  if (!source) return null;
  const s = source.toLowerCase();
  if (s.includes('instagram') || s === 'ig') return { label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' };
  if (s.includes('facebook') || s === 'fb') return { label: 'Facebook', color: 'bg-blue-600 text-white' };
  if (s.includes('google')) return { label: 'Google', color: 'bg-red-500 text-white' };
  if (s.includes('tiktok')) return { label: 'TikTok', color: 'bg-foreground text-background' };
  if (s.includes('whatsapp')) return { label: 'WhatsApp', color: 'bg-emerald-500 text-white' };
  return { label: source, color: 'bg-muted text-muted-foreground' };
}

function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <span className="inline-flex items-center gap-1.5 group">
      <span className="font-medium text-foreground break-all">{value}</span>
      <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      </button>
    </span>
  );
}

function InfoRow({ icon: Icon, label, value, copyable = false }: { icon: React.ElementType; label: string; value: string | null | undefined; copyable?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-3 min-w-0 flex-1">
        <span className="text-xs text-muted-foreground font-body shrink-0 w-28">{label}:</span>
        {copyable ? <CopyableValue value={value} /> : <span className="text-xs font-medium text-foreground font-body break-all">{value}</span>}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <h3 className="text-sm font-display font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function EditableField({ icon: Icon, label, value, onChange, placeholder, type = "text" }: {
  icon: React.ElementType; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-2.5" />
      <div className="flex-1 space-y-1">
        <span className="text-xs text-muted-foreground font-body">{label}</span>
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 text-xs font-body"
        />
      </div>
    </div>
  );
}

const TABULACAO_OPTIONS = [
  'Sem contato',
  'Não atendeu',
  'Retornar depois',
  'Sem interesse',
  'Interessado',
  'Agendamento feito',
  'Proposta enviada',
  'Negociando',
  'Venda realizada',
  'Perdido',
];

const LeadDetailDialog = ({ open, onOpenChange, leadId, onLeadUpdated }: LeadDetailDialogProps) => {
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Editable fields state
  const [editFields, setEditFields] = useState({
    observacoes: '',
    renda: '',
    profissao: '',
    cpf: '',
    endereco: '',
    interesse: '',
    tabulacao: '',
  });

  useEffect(() => {
    if (!open || !leadId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    api.get<LeadDetail>(`/leads/${leadId}`).then((res) => {
      if (res.ok && res.data) {
        setDetail(res.data);
        setEditFields({
          observacoes: res.data.observacoes || '',
          renda: res.data.renda || '',
          profissao: res.data.profissao || '',
          cpf: res.data.cpf || '',
          endereco: res.data.endereco || '',
          interesse: res.data.interesse || '',
          tabulacao: res.data.tabulacao || '',
        });
      }
      setLoading(false);
    });
  }, [open, leadId]);

  const handleSave = async () => {
    if (!leadId) return;
    setSaving(true);
    const res = await api.put(`/leads/${leadId}`, editFields);
    setSaving(false);
    if (res.ok) {
      toast({ title: "Dados salvos", description: "Informações do lead atualizadas com sucesso." });
      onLeadUpdated?.();
      // Update local detail
      if (detail) setDetail({ ...detail, ...editFields });
    } else {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar as informações.", variant: "destructive" });
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const score = detail ? calculateLeadScore(detail) : null;
  const sourceBadge = detail ? getSourceBadge(detail.utm_source || detail.origem) : null;
  const hasGeo = detail && (detail.cidade || detail.ip);
  const hasDevice = detail && (detail.device_type || detail.os || detail.browser);
  const hasTraffic = detail && (detail.utm_source || detail.utm_medium || detail.campaign_id || detail.referrer_url);

  const deviceTypeLabel = detail?.device_type?.toLowerCase() === 'mobile' ? 'Mobile' : detail?.device_type?.toLowerCase() === 'desktop' ? 'Desktop' : detail?.device_type || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Detalhes do Lead</DialogTitle>
          <DialogDescription className="font-body text-xs">Visualize e edite informações do lead</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : detail ? (
          <div className="space-y-5">
            {/* ─── Personal Info ─── */}
            <div>
              <SectionHeader icon={User} title="Informações Pessoais" />
              <div className="rounded-lg bg-muted/30 border border-border/50 px-4 py-2 space-y-0.5">
                <InfoRow icon={Hash} label="ID" value={String(detail.id)} copyable />
                <InfoRow icon={User} label="Nome" value={detail.nome} />
                <InfoRow icon={Phone} label="Telefone" value={detail.telefone} copyable />
                {detail.email && <InfoRow icon={Mail} label="E-mail" value={detail.email} copyable />}
                <InfoRow icon={Calendar} label="Data" value={formatDate(detail.created_at)} />
                {score && (
                  <div className="flex items-start gap-3 py-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-body w-28">Score:</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border gap-1 ${score.color}`}>
                        {score.emoji} {score.score}pts — {score.label}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Editable Contact Details ─── */}
            <Separator />
            <div>
              <SectionHeader icon={Pencil} title="Informações Adicionais" />
              <div className="rounded-lg bg-muted/30 border border-border/50 px-4 py-3 space-y-2">
                {/* Tabulação */}
                <div className="flex items-start gap-3 py-1">
                  <Tag className="w-4 h-4 text-muted-foreground shrink-0 mt-2.5" />
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground font-body">Tabulação</span>
                    <Select value={editFields.tabulacao || 'none'} onValueChange={(v) => setEditFields(prev => ({ ...prev, tabulacao: v === 'none' ? '' : v }))}>
                      <SelectTrigger className="h-8 text-xs font-body">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem tabulação</SelectItem>
                        {TABULACAO_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <EditableField icon={Briefcase} label="Profissão" value={editFields.profissao} onChange={(v) => setEditFields(p => ({ ...p, profissao: v }))} placeholder="Ex: Engenheiro" />
                <EditableField icon={DollarSign} label="Renda" value={editFields.renda} onChange={(v) => setEditFields(p => ({ ...p, renda: v }))} placeholder="Ex: R$ 5.000" />
                <EditableField icon={CreditCard} label="CPF" value={editFields.cpf} onChange={(v) => setEditFields(p => ({ ...p, cpf: v }))} placeholder="000.000.000-00" />
                <EditableField icon={Home} label="Endereço" value={editFields.endereco} onChange={(v) => setEditFields(p => ({ ...p, endereco: v }))} placeholder="Rua, número, bairro..." />
                <EditableField icon={MessageSquare} label="Interesse" value={editFields.interesse} onChange={(v) => setEditFields(p => ({ ...p, interesse: v }))} placeholder="Ex: Consórcio de imóvel" />

                {/* Observações - textarea */}
                <div className="flex items-start gap-3 py-1">
                  <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-2.5" />
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground font-body">Observações</span>
                    <Textarea
                      value={editFields.observacoes}
                      onChange={(e) => setEditFields(p => ({ ...p, observacoes: e.target.value }))}
                      placeholder="Anotações sobre o lead..."
                      className="text-xs font-body min-h-[60px] resize-none"
                    />
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving} size="sm" className="w-full mt-2 gap-2 font-body">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Informações
                </Button>
              </div>
            </div>

            {/* ─── Location ─── */}
            {hasGeo && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={Globe} title="Informações de Localização" />
                  <div className="rounded-lg bg-muted/30 border border-border/50 px-4 py-2 space-y-0.5">
                    <InfoRow icon={Globe} label="Endereço IP" value={detail.ip} copyable />
                    <InfoRow icon={MapPin} label="Cidade/Estado" value={detail.cidade ? `${detail.cidade}${detail.estado ? `, ${detail.estado}` : ''}` : null} />
                    <InfoRow icon={Globe} label="País" value={detail.pais} />
                    {detail.latitude && detail.longitude && (
                      <InfoRow icon={Navigation} label="Coordenadas" value={`${detail.latitude}, ${detail.longitude}`} copyable />
                    )}
                    <InfoRow icon={Clock} label="Fuso Horário" value={detail.timezone} />
                  </div>
                </div>
              </>
            )}

            {/* ─── Device ─── */}
            {hasDevice && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={deviceTypeLabel === 'Mobile' ? Smartphone : Monitor} title="Dispositivo" />
                  <div className="rounded-lg bg-muted/30 border border-border/50 px-4 py-2 space-y-0.5">
                    {deviceTypeLabel && (
                      <div className="flex items-start gap-3 py-1.5">
                        {deviceTypeLabel === 'Mobile' ? <Smartphone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> : <Monitor className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-body w-28">Tipo:</span>
                          <Badge variant="outline" className="text-[10px] px-2 py-0 border">{deviceTypeLabel}</Badge>
                        </div>
                      </div>
                    )}
                    <InfoRow icon={Cpu} label="Fabricante" value={detail.device_manufacturer} />
                    <InfoRow icon={Smartphone} label="Modelo" value={detail.device_model} />
                    <InfoRow icon={Monitor} label="Sistema" value={detail.os} />
                    <InfoRow icon={AppWindow} label="Navegador" value={detail.browser} />
                  </div>
                </div>
              </>
            )}

            {/* ─── Traffic Origin ─── */}
            {hasTraffic && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={Share2} title="Origem do Tráfego" />
                  <div className="rounded-lg bg-muted/30 border border-border/50 px-4 py-2 space-y-0.5">
                    {sourceBadge && (
                      <div className="flex items-center gap-3 py-2">
                        <Share2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Badge className={`text-xs px-3 py-0.5 ${sourceBadge.color} border-0`}>{sourceBadge.label}</Badge>
                      </div>
                    )}
                    <InfoRow icon={Share2} label="Fonte" value={detail.utm_source} />
                    <InfoRow icon={Share2} label="Mídia" value={detail.utm_medium} />
                    <InfoRow icon={Hash} label="Campanha" value={detail.utm_campaign || detail.campaign_id} copyable />
                    <InfoRow icon={Hash} label="Grupo de Anúncios" value={detail.adset_id} copyable />
                    <InfoRow icon={Hash} label="ID do Anúncio" value={detail.ad_id} copyable />
                    <InfoRow icon={Hash} label="Conteúdo" value={detail.utm_content} />
                    <InfoRow icon={Hash} label="Termo" value={detail.utm_term} />
                    <InfoRow icon={MousePointerClick} label="Click ID" value={detail.click_id} copyable />
                    <InfoRow icon={Link2} label="URL Anterior" value={detail.referrer_url} />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground font-body">Lead não encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;
