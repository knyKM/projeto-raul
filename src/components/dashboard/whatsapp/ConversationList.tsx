import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WaConversation } from "@/pages/production/DashboardWhatsApp";

interface Props {
  conversations: WaConversation[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading?: boolean;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const avatarGradients = [
  "from-secondary/30 to-secondary/10",
  "from-primary/20 to-primary/5",
  "from-accent/30 to-accent/10",
  "from-destructive/15 to-destructive/5",
];

const statusConfig: Record<string, { dot: string; label: string }> = {
  active: { dot: "bg-secondary", label: "Ativo" },
  pending: { dot: "bg-amber-400", label: "Aguardando" },
  expired: { dot: "bg-muted-foreground/30", label: "Expirado" },
};

const ConversationList = ({ conversations, selectedId, onSelect, loading }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "expired">("all");

  const filtered = conversations.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.lead_name?.toLowerCase().includes(search.toLowerCase()) && !c.phone?.includes(search)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome ou telefone..."
            className="pl-9 h-9 text-xs bg-muted/30 border-0 rounded-xl font-body focus-visible:ring-1 focus-visible:ring-secondary/30"
          />
        </div>
        <div className="flex bg-muted/40 rounded-xl p-0.5">
          {(["all", "active", "pending", "expired"] as const).map((f) => {
            const count = f === "all" ? conversations.length : conversations.filter((c) => c.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-1 px-2 py-1.5 rounded-lg text-[10px] font-body font-medium transition-all duration-200",
                  filter === f
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                {f === "all" ? "Todos" : statusConfig[f].label}
                <span className="ml-0.5 opacity-50">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Sparkles className="w-5 h-5 mb-2 opacity-30" />
            <p className="text-xs font-body">
              {conversations.length === 0 ? "Nenhuma conversa" : "Nenhum resultado"}
            </p>
          </div>
        ) : (
          filtered.map((conv, i) => {
            const status = statusConfig[conv.status] || statusConfig.pending;
            const isSelected = selectedId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                  isSelected
                    ? "bg-gradient-to-r from-secondary/10 to-secondary/5 ring-1 ring-secondary/15"
                    : "hover:bg-muted/40"
                )}
              >
                <div className="relative shrink-0">
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center text-[11px] font-display font-bold bg-gradient-to-br",
                    avatarGradients[i % avatarGradients.length],
                    isSelected ? "text-secondary" : "text-foreground/70"
                  )}>
                    {getInitials(conv.lead_name || "?")}
                  </div>
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                    status.dot
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className={cn(
                      "font-body text-sm truncate",
                      conv.unread > 0 ? "font-bold text-foreground" : "font-medium text-foreground/90"
                    )}>
                      {conv.lead_name || conv.phone}
                    </span>
                    {conv.last_message_at && (
                      <span className="text-[9px] text-muted-foreground/60 font-body shrink-0 tabular-nums">
                        {timeAgo(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-[11px] font-body truncate mt-0.5",
                    conv.unread > 0 ? "text-foreground/70" : "text-muted-foreground"
                  )}>
                    {conv.last_message || "Sem mensagens"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {conv.interest && (
                      <span className="text-[8px] uppercase tracking-wider bg-secondary/8 text-secondary border border-secondary/10 px-1.5 py-0.5 rounded-md font-body font-semibold">
                        {conv.interest}
                      </span>
                    )}
                    {conv.agent && (
                      <span className="text-[8px] text-muted-foreground/50 font-body">• {conv.agent}</span>
                    )}
                  </div>
                </div>

                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-body font-bold text-secondary-foreground">{conv.unread}</span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
