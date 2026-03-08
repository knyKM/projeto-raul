import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QrCode, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WaConversation } from "@/pages/production/DashboardWhatsApp";

interface Props {
  conversation: WaConversation;
  onShowQr: () => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const statusBadge: Record<string, { label: string; className: string }> = {
  active: { label: "active", className: "bg-emerald-500 text-white" },
  pending: { label: "pending", className: "bg-amber-500 text-white" },
  expired: { label: "expired", className: "bg-muted-foreground text-white" },
};

const LeadSidebar = ({ conversation, onShowQr }: Props) => {
  const badge = statusBadge[conversation.status];

  return (
    <div className="w-72 border-l border-border bg-card overflow-y-auto shrink-0 hidden lg:block">
      {/* Lead card */}
      <div className="p-4 space-y-4">
        <h3 className="font-display font-bold text-base text-foreground">Lead</h3>

        <div className="space-y-3">
          <InfoRow label="Nome:" value={conversation.leadName} />
          <InfoRow label="Telefone:" value={conversation.phone} />
          <InfoRow label="WA ID:" value={conversation.waId} mono />

          <Separator />

          <div>
            <span className="text-xs text-muted-foreground font-body">Status:</span>
            <div className="mt-1">
              <Badge className={cn("text-xs font-body", badge.className)}>{badge.label}</Badge>
            </div>
          </div>

          <InfoRow label="Início:" value={formatDate(conversation.startedAt)} />
          <InfoRow label="Janela expira:" value={formatDate(conversation.windowExpires)} />
        </div>
      </div>

      <Separator />

      {/* Context card */}
      <div className="p-4 space-y-4">
        <h3 className="font-display font-bold text-base text-foreground">Contexto</h3>

        <div className="space-y-3">
          <InfoRow label="Agente:" value={conversation.agent || "—"} />
          <InfoRow label="Tabulação:" value={conversation.tabulation || "—"} />
          <InfoRow label="Interesse:" value={conversation.interest || "—"} />
          <InfoRow label="Ad ID:" value={conversation.adId || "—"} mono />
        </div>
      </div>

      <Separator />

      {/* QR Code action */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full gap-2 font-body text-sm"
          onClick={onShowQr}
        >
          <QrCode className="w-4 h-4" />
          Gerar QR Code exclusivo
        </Button>
        <p className="text-[10px] text-muted-foreground font-body mt-2 text-center">
          O atendente escaneia para abrir conversa no WhatsApp pessoal
        </p>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <span className="text-xs text-muted-foreground font-body">{label}</span>
    <p className={cn("text-sm font-body font-medium text-foreground", mono && "font-mono text-xs")}>
      {value}
    </p>
  </div>
);

export default LeadSidebar;
