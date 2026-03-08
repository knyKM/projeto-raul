import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WhatsAppConversationList from "@/components/dashboard/whatsapp/ConversationList";
import WhatsAppChatView from "@/components/dashboard/whatsapp/ChatView";
import { MessageSquare } from "lucide-react";

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

// Mock data for demo
const mockConversations: WaConversation[] = [
  {
    id: "1",
    leadName: "João Faria",
    phone: "(21) 99387-8199",
    waId: "5521993878199",
    status: "active",
    lastMessage: "Sim, começar!",
    lastMessageAt: "2026-03-08T17:55:00",
    unread: 1,
    agent: "Vendedor 6",
    interest: "BYD_MINI_1280",
    adId: "6886688494198",
    windowExpires: "2026-03-09T17:55:31",
    startedAt: "2026-03-08T17:38:36",
  },
  {
    id: "2",
    leadName: "Maria Silva",
    phone: "(11) 98765-4321",
    waId: "5511987654321",
    status: "active",
    lastMessage: "Qual o valor da parcela?",
    lastMessageAt: "2026-03-08T16:20:00",
    unread: 0,
    agent: "Vendedor 3",
    interest: "CONSORCIO_AUTO",
    startedAt: "2026-03-08T15:00:00",
    windowExpires: "2026-03-09T16:20:00",
  },
  {
    id: "3",
    leadName: "Carlos Mendes",
    phone: "(31) 99876-5432",
    waId: "5531998765432",
    status: "expired",
    lastMessage: "Vou pensar...",
    lastMessageAt: "2026-03-07T10:30:00",
    unread: 0,
    startedAt: "2026-03-06T09:00:00",
    windowExpires: "2026-03-07T10:30:00",
  },
  {
    id: "4",
    leadName: "Ana Beatriz",
    phone: "(85) 99123-4567",
    waId: "5585991234567",
    status: "pending",
    lastMessage: "Olá, vi o anúncio...",
    lastMessageAt: "2026-03-08T18:01:00",
    unread: 2,
    interest: "TRACKER_2025",
    startedAt: "2026-03-08T18:01:00",
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
};

const DashboardWhatsApp = () => {
  const [conversations, setConversations] = useState<WaConversation[]>(mockConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WaMessage[]>([]);

  const selected = conversations.find((c) => c.id === selectedId) || null;

  useEffect(() => {
    if (selectedId) {
      setMessages(mockMessages[selectedId] || []);
      // Mark as read
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">WhatsApp</h1>
            <p className="text-xs text-muted-foreground font-body">
              {conversations.filter((c) => c.status === "active").length} conversas ativas
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex rounded-xl border border-border bg-card overflow-hidden min-h-0">
          {/* Conversation list */}
          <WhatsAppConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {/* Chat area */}
          {selected ? (
            <WhatsAppChatView
              conversation={selected}
              messages={messages}
              onSendMessage={handleSendMessage}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30" />
                <p className="font-body text-sm">Selecione uma conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardWhatsApp;
