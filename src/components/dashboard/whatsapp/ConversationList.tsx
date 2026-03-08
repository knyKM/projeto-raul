import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WaConversation } from "@/pages/production/DashboardWhatsApp";

interface Props {
  conversations: WaConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const statusColor: Record<string, string> = {
  active: "bg-emerald-500",
  pending: "bg-amber-500",
  expired: "bg-muted-foreground/40",
};

const statusLabel: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  expired: "Expirado",
};

const ConversationList = ({ conversations, selectedId, onSelect }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "expired">("all");

  const filtered = conversations.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.leadName.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
    return true;
  });

  return (
    <div className="w-80 border-r border-border flex flex-col shrink-0">
      {/* Search */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa..."
            className="pl-8 h-9 text-sm bg-muted/50 border-border"
          />
        </div>
        {/* Filter pills */}
        <div className="flex gap-1.5">
          {(["all", "active", "pending", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-body font-medium transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f === "all" ? "Todos" : statusLabel[f]}
              {f !== "all" && (
                <span className="ml-1 opacity-70">
                  ({conversations.filter((c) => c.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm font-body">
            Nenhuma conversa encontrada
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-3 text-left transition-colors border-b border-border/50",
                selectedId === conv.id
                  ? "bg-primary/5 border-l-2 border-l-primary"
                  : "hover:bg-muted/50"
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-display font-bold text-primary">
                  {getInitials(conv.leadName)}
                </div>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                    statusColor[conv.status]
                  )}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-body font-semibold text-sm text-foreground truncate">
                    {conv.leadName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-body shrink-0">
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-body truncate mt-0.5">
                  {conv.lastMessage}
                </p>
                {conv.interest && (
                  <span className="inline-block mt-1 text-[9px] bg-secondary/10 text-secondary-foreground px-1.5 py-0.5 rounded font-body">
                    {conv.interest}
                  </span>
                )}
              </div>

              {/* Unread badge */}
              {conv.unread > 0 && (
                <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-5 shrink-0">
                  {conv.unread}
                </Badge>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
