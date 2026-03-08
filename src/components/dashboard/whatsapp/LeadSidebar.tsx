import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QrCode, Clock, Tag, ShieldCheck, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WaConversation } from "@/pages/production/DashboardWhatsApp";

interface Props {
  conversation: WaConversation;
  onShowQr: () => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getWindowRemaining(expires?: string) {
  if (!expires) return null;
  const diff = new Date(expires).getTime() - Date.now();
  if (diff <= 0) return "Expirada";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}min restantes`;
}

const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
  active: { label: "Ativo", className: "bg-secondary/15 text-secondary border-secondary/20", icon: "🟢" },
  pending: { label: "Aguardando", className: "bg-amber-500/15 text-amber-600 border-amber-500/20", icon: "🟡" },
  expired: { label: "Expirado", className: "bg-muted text-muted-foreground border-border", icon: "⚪" },
};

const LeadSidebar = ({ conversation, onShowQr }: Props) => {
  const status = statusConfig[conversation.status] || statusConfig.pending;
  const windowRemaining = getWindowRemaining(conversation.window_expires);

  return (
    <div className="w-[280px] border-l border-border bg-card overflow-y-auto shrink-0 hidden lg:flex flex-col">
      {/* Profile header */}
      <div className="p-5 text-center border-b border-border bg-gradient-to-b from-secondary/5 to-transparent">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mb-3 border border-secondary/10">
          <span className="text-lg font-display font-bold text-secondary">
            {(conversation.lead_name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </span>
        </div>
        <h3 className="font-display font-bold text-base text-foreground">{conversation.lead_name || conversation.phone}</h3>
        <p className="text-xs text-muted-foreground font-body mt-0.5">{conversation.phone}</p>
        <div className="mt-2">
          <Badge variant="outline" className={cn("text-[10px] font-body", status.className)}>
            {status.icon} {status.label}
          </Badge>
        </div>
      </div>

      {/* Info sections */}
      <div className="flex-1 p-4 space-y-4">
        <SidebarSection title="Sessão" icon={Clock}>
          <InfoRow label="Início" value={formatDate(conversation.started_at)} />
          <InfoRow label="Expira" value={formatDate(conversation.window_expires)} />
          {windowRemaining && (
            <div className="flex items-center gap-1.5 mt-1">
              <Timer className="w-3 h-3 text-secondary" />
              <span className={cn(
                "text-[10px] font-body font-semibold",
                windowRemaining === "Expirada" ? "text-destructive" : "text-secondary"
              )}>
                {windowRemaining}
              </span>
            </div>
          )}
        </SidebarSection>

        <Separator />

        <SidebarSection title="Contexto" icon={Tag}>
          <InfoRow label="Agente" value={conversation.agent || "Não atribuído"} />
          <InfoRow label="Tabulação" value={conversation.tabulation || "—"} />
          <InfoRow label="Interesse" value={conversation.interest || "—"} highlight />
          <InfoRow label="Ad ID" value={conversation.ad_id || "—"} mono />
        </SidebarSection>

        <Separator />

        <SidebarSection title="Identificação" icon={ShieldCheck}>
          <InfoRow label="WA ID" value={conversation.wa_id || "—"} mono />
        </SidebarSection>
      </div>

      {/* QR Code action */}
      <div className="p-4 border-t border-border bg-gradient-to-t from-secondary/3 to-transparent">
        <Button
          className="w-full gap-2 font-body text-xs bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl h-10 shadow-sm"
          onClick={onShowQr}
        >
          <QrCode className="w-4 h-4" />
          Atender via WhatsApp pessoal
        </Button>
        <p className="text-[9px] text-muted-foreground/60 font-body mt-2 text-center leading-relaxed">
          Gera QR Code para o atendente isolar o contato
        </p>
      </div>
    </div>
  );
};

const SidebarSection = ({ title, icon: Icon, children }: { title: string; icon: typeof Clock; children: React.ReactNode }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-secondary/70" />
      <h4 className="text-[11px] font-body font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
    </div>
    <div className="space-y-2 pl-5">{children}</div>
  </div>
);

const InfoRow = ({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) => (
  <div className="flex items-baseline justify-between gap-2">
    <span className="text-[11px] text-muted-foreground/70 font-body shrink-0">{label}</span>
    <span className={cn(
      "text-[11px] font-body text-right truncate",
      mono ? "font-mono text-[10px] text-muted-foreground" : "font-medium text-foreground",
      highlight && "text-secondary font-semibold"
    )}>
      {value}
    </span>
  </div>
);

export default LeadSidebar;
