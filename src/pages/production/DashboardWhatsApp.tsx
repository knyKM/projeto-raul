import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WhatsAppConversationList from "@/components/dashboard/whatsapp/ConversationList";
import WhatsAppChatView from "@/components/dashboard/whatsapp/ChatView";
import { MessageSquare, Zap, Users, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";

export interface WaConversation {
  id: number;
  lead_id?: number;
  lead_name: string;
  phone: string;
  wa_id: string;
  status: "active" | "expired" | "pending";
  last_message: string;
  last_message_at: string;
  unread: number;
  agent?: string;
  tabulation?: string;
  interest?: string;
  ad_id?: string;
  window_expires?: string;
  started_at: string;
}

export interface WaMessage {
  id: number;
  conversation_id: number;
  wa_message_id?: string;
  role: "user" | "bot" | "agent";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  buttons?: string[];
}

const DashboardWhatsApp = () => {
  const [conversations, setConversations] = useState<WaConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const selected = conversations.find((c) => c.id === selectedId) || null;
  const activeCount = conversations.filter((c) => c.status === "active").length;
  const pendingCount = conversations.filter((c) => c.status === "pending").length;
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

  const fetchConversations = useCallback(async () => {
    const res = await api.get<WaConversation[]>("/whatsapp/conversations");
    if (res.ok && res.data) {
      setConversations(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
    // Poll every 10s
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const fetchMessages = useCallback(async (convId: number) => {
    setLoadingMessages(true);
    const res = await api.get<WaMessage[]>(`/whatsapp/conversations/${convId}/messages`);
    if (res.ok && res.data) {
      setMessages(res.data);
      // Mark as read locally
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c))
      );
    }
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
      // Poll messages every 5s while conversation is open
      const interval = setInterval(() => fetchMessages(selectedId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedId, fetchMessages]);

  const handleSendMessage = async (text: string) => {
    if (!selectedId) return;
    const res = await api.post<WaMessage>(`/whatsapp/conversations/${selectedId}/send`, { message: text });
    if (res.ok && res.data) {
      setMessages((prev) => [...prev, res.data]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId ? { ...c, last_message: text, last_message_at: new Date().toISOString() } : c
        )
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-5rem)]">
        {/* Stats ribbon */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center border border-secondary/10">
              <MessageSquare className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight">Central WhatsApp</h1>
              <p className="text-[11px] text-muted-foreground font-body">Atendimento em tempo real</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 ml-auto">
            <StatPill icon={Zap} label="Ativas" value={activeCount} accent />
            <StatPill icon={Clock} label="Pendentes" value={pendingCount} />
            <StatPill icon={Users} label="Não lidas" value={totalUnread} />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={fetchConversations}>
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-3 min-h-0">
          <div className="w-80 shrink-0 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <WhatsAppConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              loading={loading}
            />
          </div>

          <div className="flex-1 flex rounded-2xl border border-border bg-card overflow-hidden shadow-sm min-w-0">
            {selected ? (
              <WhatsAppChatView
                conversation={selected}
                messages={messages}
                onSendMessage={handleSendMessage}
                onClose={() => setSelectedId(null)}
                loading={loadingMessages}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-secondary/15 to-primary/5 flex items-center justify-center border border-secondary/10">
                    <MessageSquare className="w-8 h-8 text-secondary/50" />
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-foreground/70">
                      {loading ? "Carregando..." : conversations.length === 0 ? "Nenhuma conversa ainda" : "Selecione uma conversa"}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {conversations.length === 0
                        ? "As conversas aparecerão quando leads enviarem mensagens"
                        : "Escolha um contato à esquerda para iniciar"
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatPill = ({ icon: Icon, label, value, accent }: { icon: typeof Zap; label: string; value: number; accent?: boolean }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/50">
    <Icon className={`w-3.5 h-3.5 ${accent ? "text-secondary" : "text-muted-foreground"}`} />
    <span className="text-[11px] font-body text-muted-foreground">{label}</span>
    <span className={`text-sm font-display font-bold ${accent ? "text-secondary" : "text-foreground"}`}>{value}</span>
  </div>
);

export default DashboardWhatsApp;
