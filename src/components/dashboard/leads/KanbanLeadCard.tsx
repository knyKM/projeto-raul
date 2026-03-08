import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Flame, Sun, Snowflake, FileText, GripVertical } from "lucide-react";
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

interface KanbanLeadCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, leadId: number) => void;
}

const scoreIcons = {
  quente: <Flame className="w-3 h-3" />,
  morno: <Sun className="w-3 h-3" />,
  frio: <Snowflake className="w-3 h-3" />,
};

const KanbanLeadCard = ({ lead, onDragStart }: KanbanLeadCardProps) => {
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
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, lead.id)}
        className="cursor-grab active:cursor-grabbing"
        onClick={() => setDetailOpen(true)}
      >
        <Card className="hover:shadow-md transition-shadow border-border/60">
          <CardContent className="p-3 space-y-2">
            {/* Header: name + score */}
            <div className="flex items-start justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <GripVertical className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                <p className="font-body font-semibold text-foreground text-xs truncate">{lead.nome}</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={`text-[9px] px-1 py-0 border gap-0.5 shrink-0 cursor-help ${score.color}`}>
                      {scoreIcons[score.label]}
                      {score.score}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[180px]">
                    <p className="font-semibold text-[10px] mb-1">{score.emoji} Lead {score.label}</p>
                    <ul className="text-[9px] space-y-0.5">
                      {score.reasons.map((r, i) => <li key={i}>• {r}</li>)}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Contact info */}
            <div className="text-[10px] text-muted-foreground font-body space-y-0.5">
              <p>📞 {lead.telefone}</p>
              {lead.email && <p className="truncate">✉️ {lead.email}</p>}
            </div>

            {/* Footer: date + timer + LP */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/30">
              <span className="text-[10px] font-body text-muted-foreground">{formatDate(lead.created_at)}</span>
              <div className="flex items-center gap-2">
                {lead.landing_page_slug && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-body text-muted-foreground/70">
                    <FileText className="w-2.5 h-2.5" />
                    {lead.landing_page_slug.substring(0, 12)}
                  </span>
                )}
                {lead.status === 'novo' && (
                  <span className={`inline-flex items-center gap-0.5 text-[9px] font-body font-semibold ${getUrgencyColor(elapsed.urgency)}`}>
                    <Timer className="w-2.5 h-2.5" />
                    {elapsed.text}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <LeadDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        leadId={detailOpen ? lead.id : null}
      />
    </>
  );
};

export default KanbanLeadCard;
