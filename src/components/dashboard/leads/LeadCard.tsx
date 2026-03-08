import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Timer, Flame, Snowflake, Sun, Eye } from "lucide-react";
import { calculateLeadScore, getElapsedTime, getUrgencyColor } from "@/lib/leadScoring";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LeadDetailDialog from "./LeadDetailDialog";

interface Lead {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  origem: string;
  landing_page_slug: string | null;
  status: string;
  consultor_id: number | null;
  created_at: string;
}

interface Atendente {
  id: number;
  nome: string;
}

interface LeadCardProps {
  lead: Lead;
  atendentes: Atendente[];
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  onStatusChange: (leadId: number, status: string) => void;
  onAssign: (leadId: number, consultorId: string) => void;
}

const scoreIcons = {
  quente: <Flame className="w-3 h-3" />,
  morno: <Sun className="w-3 h-3" />,
  frio: <Snowflake className="w-3 h-3" />,
};

const LeadCard = ({ lead, atendentes, statusColors, statusLabels, onStatusChange, onAssign }: LeadCardProps) => {
  const score = calculateLeadScore(lead);
  const [elapsed, setElapsed] = useState(getElapsedTime(lead.created_at));
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (lead.status !== 'novo') return;
    const interval = setInterval(() => {
      setElapsed(getElapsedTime(lead.created_at));
    }, 30000);
    return () => clearInterval(interval);
  }, [lead.created_at, lead.status]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Card className="hover:shadow-sm transition-shadow group">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Lead info — clickable */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => setDetailOpen(true)}
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-body font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">{lead.nome}</p>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${statusColors[lead.status] || ''}`}>
                  {statusLabels[lead.status] || lead.status}
                </Badge>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border gap-1 cursor-help ${score.color}`}>
                        {scoreIcons[score.label]}
                        {score.score}pts
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="font-semibold text-xs mb-1">{score.emoji} Lead {score.label}</p>
                      <ul className="text-[10px] space-y-0.5">
                        {score.reasons.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {lead.status === 'novo' && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-body font-semibold ${getUrgencyColor(elapsed.urgency)}`}>
                    <Timer className="w-3 h-3" />
                    {elapsed.text}
                  </span>
                )}

                {/* View details hint */}
                <Eye className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all" />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-body">
                <span>📞 {lead.telefone}</span>
                {lead.email && <span>✉️ {lead.email}</span>}
                <span>🕐 {formatDate(lead.created_at)}</span>
              </div>
              {lead.landing_page_slug && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <FileText className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-[11px] font-body text-muted-foreground/80 bg-muted px-2 py-0.5 rounded">
                    {lead.landing_page_slug}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Select value={lead.status} onValueChange={(v) => onStatusChange(lead.id, v)}>
                <SelectTrigger className="w-[140px] h-8 text-xs font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em_contato">Em Contato</SelectItem>
                  <SelectItem value="negociando">Negociando</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={lead.consultor_id?.toString() || "none"}
                onValueChange={(v) => onAssign(lead.id, v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs font-body">
                  <SelectValue placeholder="Atribuir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem atendente</SelectItem>
                  {atendentes.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>{a.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <LeadDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        leadId={detailOpen ? lead.id : null}
      />
    </>
  );
};

export default LeadCard;
