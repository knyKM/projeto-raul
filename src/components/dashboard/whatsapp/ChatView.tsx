import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Smile, Paperclip, Mic, QrCode, PanelRightClose, PanelRightOpen, Bot, UserCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LeadSidebar from "./LeadSidebar";
import QrCodeDialog from "./QrCodeDialog";
import type { WaConversation, WaMessage } from "@/pages/production/DashboardWhatsApp";

interface Props {
  conversation: WaConversation;
  messages: WaMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  loading?: boolean;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Hoje";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-secondary/10", text: "text-secondary", label: "Ativo" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Aguardando" },
  expired: { bg: "bg-muted", text: "text-muted-foreground", label: "Expirado" },
};

const ChatView = ({ conversation, messages, onSendMessage, onClose, loading }: Props) => {
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    await onSendMessage(input.trim());
    setInput("");
    setSending(false);
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const status = statusStyles[conversation.status] || statusStyles.pending;

  // Group messages by date
  const groupedMessages: { date: string; msgs: WaMessage[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = new Date(msg.timestamp).toDateString();
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateKey) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, msgs: [msg] });
    }
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-1 flex flex-col min-w-0"
        key={conversation.id}
      >
        {/* Header */}
        <div className="relative px-5 py-3 bg-card border-b border-border">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                <span className="text-xs font-display font-bold text-secondary">
                  {(conversation.lead_name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-sm text-foreground">{conversation.lead_name || conversation.phone}</span>
                  <span className={cn("text-[9px] font-body font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md", status.bg, status.text)}>
                    {status.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-body mt-0.5">{conversation.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-secondary" onClick={() => setShowQr(true)}>
                <QrCode className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground" onClick={() => setShowSidebar(!showSidebar)}>
                {showSidebar ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 0.5px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground font-body">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <span className="text-[10px] font-body font-medium text-muted-foreground bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50 shadow-sm">
                    {formatDateLabel(group.msgs[0].timestamp)}
                  </span>
                </div>

                {group.msgs.map((msg, msgIdx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, delay: msgIdx * 0.05, ease: "easeOut" }}
                    className={cn("flex mb-2", msg.role === "user" ? "justify-start" : "justify-end")}
                  >
                    <div className={cn("max-w-[60%]", msg.role === "user" ? "pr-4" : "pl-4")}>
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 text-[13px] font-body leading-relaxed shadow-sm",
                        msg.role === "user"
                          ? "bg-card border border-border text-foreground rounded-tl-sm"
                          : msg.role === "bot"
                          ? "bg-gradient-to-br from-secondary/12 to-secondary/6 border border-secondary/15 text-foreground rounded-tr-sm"
                          : "bg-primary text-primary-foreground rounded-tr-sm shadow-md"
                      )}>
                        {msg.role === "bot" && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Bot className="w-3 h-3 text-secondary" />
                            <span className="text-[9px] font-body font-bold uppercase tracking-widest text-secondary">Bot</span>
                          </div>
                        )}
                        {msg.role === "agent" && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <UserCircle className="w-3 h-3 text-primary-foreground/60" />
                            <span className="text-[9px] font-body font-bold uppercase tracking-widest text-primary-foreground/60">Você</span>
                          </div>
                        )}

                        <p>{msg.text}</p>

                        {msg.buttons && msg.buttons.length > 0 && (
                          <div className="flex flex-col gap-1 mt-2.5 pt-2 border-t border-secondary/15">
                            {msg.buttons.map((btn, i) => (
                              <button key={i} className="text-[11px] px-3 py-1.5 rounded-lg border border-secondary/20 text-secondary font-body font-medium hover:bg-secondary/8 transition-colors text-center">
                                {btn}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1.5 mt-1.5 -mb-0.5">
                          <span className={cn("text-[9px] tabular-nums", msg.role === "agent" ? "text-primary-foreground/40" : "text-muted-foreground/50")}>
                            {formatTime(msg.timestamp)}
                          </span>
                          {msg.role !== "user" && (
                            <span className={cn("text-[9px]", msg.status === "read" ? "text-secondary" : msg.role === "agent" ? "text-primary-foreground/30" : "text-muted-foreground/30")}>
                              {msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-card border-t border-border">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 bg-muted/30 rounded-2xl px-3 py-2 border border-border/50 focus-within:border-secondary/30 focus-within:shadow-[0_0_0_3px_hsl(var(--secondary)/0.08)] transition-all duration-200"
          >
            <button type="button" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1 shrink-0 self-end mb-0.5">
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={conversation.status === "expired" ? "Janela expirada — reenvie template" : "Escreva uma mensagem..."}
              disabled={conversation.status === "expired"}
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none resize-none text-sm font-body text-foreground placeholder:text-muted-foreground/40 py-1 max-h-[120px] disabled:opacity-40"
            />
            <button type="button" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1 shrink-0 self-end mb-0.5">
              <Smile className="w-4 h-4" />
            </button>
            {input.trim() ? (
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0 shadow-sm"
                disabled={conversation.status === "expired" || sending}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            ) : (
              <button type="button" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1 shrink-0 self-end mb-0.5">
                <Mic className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden shrink-0 hidden lg:block"
          >
            <LeadSidebar conversation={conversation} onShowQr={() => setShowQr(true)} />
          </motion.div>
        )}
      </AnimatePresence>
      <QrCodeDialog open={showQr} onOpenChange={setShowQr} conversation={conversation} />
    </>
  );
};

export default ChatView;
