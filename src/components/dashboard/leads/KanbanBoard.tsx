import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import KanbanLeadCard from "./KanbanLeadCard";

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

export interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  dotColor: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'novo', label: 'Novo', color: 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20', dotColor: 'bg-amber-500' },
  { id: 'em_contato', label: 'Em Contato', color: 'bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20', dotColor: 'bg-blue-500' },
  { id: 'negociando', label: 'Negociando', color: 'bg-purple-50 dark:bg-purple-500/5 border-purple-200 dark:border-purple-500/20', dotColor: 'bg-purple-500' },
  { id: 'fechado', label: 'Fechado', color: 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20', dotColor: 'bg-emerald-500' },
  { id: 'perdido', label: 'Perdido', color: 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20', dotColor: 'bg-red-500' },
];

// Map old statuses to kanban columns
export function mapLegacyStatus(status: string): string {
  if (status === 'em_atendimento') return 'em_contato';
  if (status === 'concluido') return 'fechado';
  return status;
}

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (leadId: number, newStatus: string) => void;
}

const KanbanBoard = ({ leads, onStatusChange }: KanbanBoardProps) => {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData('text/plain', leadId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(leadId)) {
      onStatusChange(leadId, columnId);
    }
  };

  const getLeadsForColumn = (columnId: string) => {
    return leads.filter(l => mapLegacyStatus(l.status) === columnId);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
      {KANBAN_COLUMNS.map((col) => {
        const columnLeads = getLeadsForColumn(col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            className={`flex-shrink-0 w-[260px] rounded-xl border transition-all ${col.color} ${
              isOver ? 'ring-2 ring-primary/40 scale-[1.01]' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <span className="text-xs font-body font-semibold text-foreground">{col.label}</span>
              </div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-body">
                {columnLeads.length}
              </Badge>
            </div>

            {/* Cards */}
            <ScrollArea className="h-[calc(100vh-320px)] min-h-[300px]">
              <div className="p-2 space-y-2">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[10px] font-body text-muted-foreground/50">Arraste leads aqui</p>
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <KanbanLeadCard
                      key={lead.id}
                      lead={lead}
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
