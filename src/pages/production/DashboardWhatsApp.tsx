import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WhatsAppConversationList from "@/components/dashboard/whatsapp/ConversationList";
import WhatsAppChatView from "@/components/dashboard/whatsapp/ChatView";
import { MessageSquare, Zap, Users, Clock } from "lucide-react";

export interface WaConversation {
  id: string;
  leadName: string;
  phone: string;
  waId: string;
  status: "active" | "expired" | "pending";
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  agent?: string;
  tabulation?: string;
  interest?: string;
  adId?: string;
  windowExpires?: string;
  startedAt: string;
  avatar?: string;
}

export interface WaMessage {
  id: string;
  conversationId: string;
  role: "user" | "bot" | "agent";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  buttons?: string[];
}

const mockConversations: WaConversation[] = [
  {
    id: "1", leadName: "João Faria", phone: "(21) 99387-8199", waId: "5521993878199",
    status: "active", lastMessage: "Sim, começar!", lastMessageAt: "2026-03-08T17:55:00",
    unread: 1, agent: "Vendedor 6", interest: "BYD_MINI_1280", adId: "6886688494198",
    windowExpires: "2026-03-09T17:55:31", startedAt: "2026-03-08T17:38:36",
  },
  {
    id: "2", leadName: "Maria Silva", phone: "(11) 98765-4321", waId: "5511987654321",
    status: "active", lastMessage: "Qual o valor da parcela?", lastMessageAt: "2026-03-08T16:20:00",
    unread: 0, agent: "Vendedor 3", interest: "CONSORCIO_AUTO",
    startedAt: "2026-03-08T15:00:00", windowExpires: "2026-03-09T16:20:00",
  },
  {
    id: "3", leadName: "Carlos Mendes", phone: "(31) 99876-5432", waId: "5531998765432",
    status: "expired", lastMessage: "Vou pensar...", lastMessageAt: "2026-03-07T10:30:00",
    unread: 0, startedAt: "2026-03-06T09:00:00", windowExpires: "2026-03-07T10:30:00",
  },
  {
    id: "4", leadName: "Ana Beatriz", phone: "(85) 99123-4567", waId: "5585991234567",
    status: "pending", lastMessage: "Olá, vi o anúncio...", lastMessageAt: "2026-03-08T18:01:00",
    unread: 2, interest: "TRACKER_2025", startedAt: "2026-03-08T18:01:00",
  },
  {
    id: "5", leadName: "Pedro Almeida", phone: "(47) 99654-3210", waId: "5547996543210",
    status: "active", lastMessage: "Pode me enviar a tabela?", lastMessageAt: "2026-03-08T14:10:00",
    unread: 0, agent: "Vendedor 1", interest: "HILUX_SW4",
    startedAt: "2026-03-08T13:00:00", windowExpires: "2026-03-09T14:10:00",
  },
];

const mockMessages: Record<string, WaMessage[]> = {
  "1": [
    { id: "m1", conversationId: "1", role: "user", text: "Sim, quero simular!", timestamp: "2026-03-08T17:38:00", status: "read" },
    { id: "m2", conversationId: "1", role: "bot", text: "Podemos iniciar sua simulação agora?", timestamp: "2026-03-08T17:38:30", status: "delivered", buttons: ["Sim, começar!", "Mais tarde", "Não tenho interesse"] },
    { id: "m3", conversationId: "1", role: "user", text: "Sim, começar!", timestamp: "2026-03-08T17:55:00", status: "read" },
  ],
  "2": [
    { id: "m4", conversationId: "2", role: "user", text: "Boa tarde, vi o anúncio de vocês", timestamp: "2026-03-08T15:00:00" },
    { id: "m5", conversationId: "2", role: "bot", text: "Olá! Seja bem-vindo! Como posso ajudar?", timestamp: "2026-03-08T15:00:30" },
    { id: "m6", conversationId: "2", role: "user", text: "Qual o valor da parcela?", timestamp: "2026-03-08T16:20:00" },
  ],
  "3": [
    { id: "m7", conversationId: "3", role: "bot", text: "Olá Carlos! Tudo bem? Vi que você demonstrou interesse no consórcio.", timestamp: "2026-03-06T09:00:00" },
    { id: "m8", conversationId: "3", role: "user", text: "Vou pensar...", timestamp: "2026-03-07T10:30:00" },
  ],
  "4": [
    { id: "m9", conversationId: "4", role: "user", text: "Olá, vi o anúncio do Tracker 2025", timestamp: "2026-03-08T18:01:00" },
    { id: "m10", conversationId: "4", role: "user", text: "Tem disponibilidade?", timestamp: "2026-03-08T18:01:30" },
  ],
  "5": [
    { id: "m11", conversationId: "5", role: "user", text: "Boa tarde!", timestamp: "2026-03-08T13:00:00" },
    { id: "m12", conversationId: "5", role: "bot", text: "Olá Pedro! Como posso ajudar?", timestamp: "2026-03-08T13:00:30" },
    { id: "m13", conversationId: "5", role: "user", text: "Pode me enviar a tabela?", timestamp: "2026-03-08T14:10:00" },
  ],
};

const DashboardWhatsApp = () => {
  const [conversations, setConversations] = useState<WaConversation[]>(mockConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WaMessage[]>([]);

  const selected = conversations.find((c) => c.id === selectedId) || null;
  const activeCount = conversations.filter((c) => c.status === "active").length;
  const pendingCount = conversations.filter((c) => c.status === "pending").length;
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  useEffect(() => {
    if (selectedId) {
      setMessages(mockMessages[selectedId] || []);
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, unread: 0 } : c))
      );
    }
  }, [selectedId]);

  const handleSendMessage = (text: string) => {
    if (!selectedId) return;
    const newMsg: WaMessage = {
      id: `m-${Date.now()}`,
      conversationId: selectedId,
      role: "agent",
      text,
      timestamp: new Date().toISOString(),
      status: "sent",
    };
    setMessages((prev) => [...prev, newMsg]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, lastMessage: text, lastMessageAt: newMsg.timestamp } : c
      )
    );
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
          </div>
        </div>

        {/* Main content — unique split layout */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Conversation list with rounded card */}
          <div className="w-80 shrink-0 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <WhatsAppConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Chat area */}
          <div className="flex-1 flex rounded-2xl border border-border bg-card overflow-hidden shadow-sm min-w-0">
            {selected ? (
              <WhatsAppChatView
                conversation={selected}
                messages={messages}
                onSendMessage={handleSendMessage}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-secondary/15 to-primary/5 flex items-center justify-center border border-secondary/10">
                    <MessageSquare className="w-8 h-8 text-secondary/50" />
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-foreground/70">Nenhuma conversa selecionada</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">Escolha um contato à esquerda para iniciar</p>
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
