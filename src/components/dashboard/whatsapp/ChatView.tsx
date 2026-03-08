import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Smile, Image, Mic, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import LeadSidebar from "./LeadSidebar";
import QrCodeDialog from "./QrCodeDialog";
import type { WaConversation, WaMessage } from "@/pages/production/DashboardWhatsApp";

interface Props {
  conversation: WaConversation;
  messages: WaMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const statusBadge: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" },
  pending: { label: "Pendente", className: "bg-amber-500/15 text-amber-600 border-amber-500/20" },
  expired: { label: "Expirado", className: "bg-muted text-muted-foreground border-border" },
};

const ChatView = ({ conversation, messages, onSendMessage, onClose }: Props) => {
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const badge = statusBadge[conversation.status];

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-display font-bold text-emerald-600">
              {conversation.leadName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-body font-semibold text-sm text-foreground">
                  {conversation.leadName}
                </span>
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-body", badge.className)}>
                  {badge.label}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-body flex items-center gap-1">
                📞 {conversation.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-body h-8"
              onClick={() => setShowQr(true)}
            >
              QR Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-body h-8"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? "Fechar" : "Detalhes"}
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex", msg.role === "user" ? "justify-start" : "justify-end")}
            >
              <div
                className={cn(
                  "max-w-[65%] rounded-2xl px-4 py-2.5 text-sm font-body relative group",
                  msg.role === "user"
                    ? "bg-card border border-border text-foreground rounded-bl-sm"
                    : msg.role === "bot"
                    ? "bg-secondary/15 border border-secondary/20 text-foreground rounded-br-sm"
                    : "bg-primary text-primary-foreground rounded-br-sm"
                )}
              >
                {/* Role label for bot messages */}
                {msg.role === "bot" && (
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] font-body font-medium text-secondary">🤖 Bot</span>
                  </div>
                )}
                {msg.role === "agent" && (
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] font-body font-medium text-primary-foreground/70">👤 Agente</span>
                  </div>
                )}

                <p className="leading-relaxed">{msg.text}</p>

                {/* Quick reply buttons */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/30">
                    {msg.buttons.map((btn, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-full border border-secondary/30 text-secondary font-body cursor-pointer hover:bg-secondary/10 transition-colors"
                      >
                        {btn}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp + status */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] opacity-50">{formatTime(msg.timestamp)}</span>
                  {msg.status === "read" && <span className="text-[10px] text-blue-400">✓✓</span>}
                  {msg.status === "delivered" && <span className="text-[10px] opacity-50">✓✓</span>}
                  {msg.status === "sent" && <span className="text-[10px] opacity-50">✓</span>}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card"
        >
          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 h-10 bg-muted/50 border-border font-body text-sm"
            disabled={conversation.status === "expired"}
          />
          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
            disabled={!input.trim() || conversation.status === "expired"}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Lead sidebar */}
      {showSidebar && (
        <LeadSidebar conversation={conversation} onShowQr={() => setShowQr(true)} />
      )}

      {/* QR Code dialog */}
      <QrCodeDialog
        open={showQr}
        onOpenChange={setShowQr}
        conversation={conversation}
      />
    </>
  );
};

export default ChatView;
