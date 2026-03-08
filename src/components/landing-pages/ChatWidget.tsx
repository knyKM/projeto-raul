import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface ChatWidgetProps {
  vehicleName: string;
  slug: string;
  whatsappNumber: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'bot' | 'customer' | 'agent';
  text: string;
}

const quickReplies = [
  'Quero saber mais sobre o consórcio',
  'Qual o valor da parcela?',
  'Como funciona a contemplação?',
  'Posso usar o FGTS?',
];

const botResponses: Record<string, string> = {
  'quero saber mais': 'O consórcio é uma forma planejada de adquirir seu veículo sem juros! Você paga parcelas mensais e pode ser contemplado por sorteio ou lance. Quer que um consultor entre em contato?',
  'valor da parcela': 'Os valores variam conforme o crédito e prazo escolhido. Deixe seu telefone e um consultor vai simular as melhores condições para você!',
  'contemplação': 'A contemplação pode acontecer por sorteio mensal ou por lance (você oferece um valor para antecipar). Quanto antes entrar, mais chances tem!',
  'fgts': 'Sim! O FGTS pode ser utilizado para ofertar lances ou complementar o crédito. Um consultor pode explicar todos os detalhes.',
};

function getBotResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const [key, response] of Object.entries(botResponses)) {
    if (lower.includes(key)) return response;
  }
  return 'Obrigado pela sua mensagem! Para um atendimento mais completo, deixe seu telefone ou fale diretamente pelo WhatsApp. 😊';
}

const CONV_KEY = 'chatwidget_conv';

const ChatWidget = ({ vehicleName, slug, whatsappNumber }: ChatWidgetProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '' });
  const [conversationId, setConversationId] = useState<number | null>(() => {
    try { const v = sessionStorage.getItem(CONV_KEY); return v ? parseInt(v) : null; } catch { return null; }
  });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Tenho interesse no ${vehicleName}.`)}`;

  // Show welcome message on open
  useEffect(() => {
    if (open && messages.length === 0 && !conversationId) {
      setMessages([{
        id: '1',
        role: 'bot',
        text: `Olá! 👋 Bem-vindo! Tem dúvidas sobre o ${vehicleName}? Escolha uma opção abaixo ou digite sua pergunta.`,
      }]);
    }
  }, [open, vehicleName]);

  // If we have an existing conversation, load messages
  useEffect(() => {
    if (open && conversationId) {
      loadMessages();
      setLeadCaptured(true);
    }
  }, [open, conversationId]);

  // Poll for new messages (agent replies) every 5s when conversation is active
  useEffect(() => {
    if (open && conversationId) {
      pollRef.current = setInterval(loadMessages, 5000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await api.get<Array<{ id: number; role: string; text: string; timestamp: string }>>(`/whatsapp/chat-widget/messages/${conversationId}`);
      if (res.ok && res.data) {
        setMessages(res.data.map(m => ({
          id: String(m.id),
          role: m.role as ChatMessage['role'],
          text: m.text,
        })));
      }
    } catch {
      // silent
    }
  }, [conversationId]);

  const sendMessageToBackend = async (text: string) => {
    if (!conversationId) return;
    try {
      await api.post('/whatsapp/chat-widget/message', {
        conversationId,
        text,
        role: 'customer',
      });
    } catch {
      // silent
    }
  };

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    if (conversationId) {
      // Already connected — send directly to backend
      await sendMessageToBackend(text);
      return;
    }

    // Not connected yet — show bot response locally + prompt for lead capture
    setTyping(true);
    setTimeout(() => {
      const botReply = getBotResponse(text);
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'bot', text: botReply };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);

      // After 3 user interactions, prompt for lead capture
      if (!leadCaptured && messages.length >= 3) {
        setTimeout(() => {
          setShowLeadForm(true);
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'bot',
            text: 'Quer que um consultor entre em contato? Deixe seu nome e telefone! 📞 Assim posso te conectar com nosso time.',
          }]);
        }, 1000);
      }
    }, 800 + Math.random() * 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;

    try {
      // Start conversation in the WhatsApp system
      const res = await api.post<{ conversationId: number; leadId: number; resumed: boolean }>('/whatsapp/chat-widget/start', {
        name: leadForm.name,
        phone: leadForm.phone,
        slug,
        vehicleName,
      });

      if (res.ok && res.data) {
        const convId = res.data.conversationId;
        setConversationId(convId);
        sessionStorage.setItem(CONV_KEY, String(convId));
        setLeadCaptured(true);
        setShowLeadForm(false);

        // Send all previous user messages to the conversation so the agent has context
        const userMessages = messages.filter(m => m.role === 'user');
        for (const msg of userMessages) {
          await api.post('/whatsapp/chat-widget/message', {
            conversationId: convId,
            text: msg.text,
            role: 'customer',
          });
        }

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'bot',
          text: `Obrigado, ${leadForm.name}! ✅ Você está agora conectado com nosso time. Um consultor vai responder aqui mesmo em instantes.`,
        }]);

        toast({ title: "Conectado ao atendimento!" });
      }
    } catch {
      toast({ title: "Erro ao conectar", description: "Tente novamente.", variant: "destructive" });
    }
  };

  const isUserMsg = (role: string) => role === 'user' || role === 'customer';

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 z-[999] w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">1</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-[1000] w-[340px] max-h-[500px] rounded-2xl shadow-2xl border border-border/30 overflow-hidden flex flex-col bg-navy-dark"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-navy border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs font-display font-semibold text-primary-foreground">Atendimento</p>
                  <p className="text-[10px] font-body text-gold-light/50">
                    {conversationId ? '🟢 Conectado ao time' : 'Online agora'}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gold-light/40 hover:text-gold-light/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[250px] max-h-[320px]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUserMsg(msg.role) ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs font-body leading-relaxed ${
                    isUserMsg(msg.role)
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : msg.role === 'agent'
                        ? 'bg-emerald-900/40 text-primary-foreground border border-emerald-500/20 rounded-bl-sm'
                        : 'bg-navy-light/50 text-primary-foreground border border-border/20 rounded-bl-sm'
                  }`}>
                    {msg.role === 'agent' && (
                      <span className="text-[9px] text-emerald-400/70 block mb-0.5 font-semibold">Consultor</span>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-navy-light/50 border border-border/20 rounded-xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gold-light/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gold-light/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gold-light/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Lead capture form */}
              {(showLeadForm || (!leadCaptured && messages.length >= 5)) && !leadCaptured && (
                <motion.form
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleLeadSubmit}
                  className="space-y-2 bg-navy-light/30 rounded-xl p-3 border border-gold/10"
                >
                  <p className="text-[10px] font-body text-gold-light/60 text-center">Conecte-se com nosso time:</p>
                  <Input
                    placeholder="Seu nome"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm(l => ({ ...l, name: e.target.value }))}
                    className="h-8 text-xs bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
                  />
                  <Input
                    placeholder="Telefone com DDD"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm(l => ({ ...l, phone: e.target.value }))}
                    className="h-8 text-xs bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
                  />
                  <Button type="submit" size="sm" className="w-full text-xs h-8">
                    Conectar com consultor
                  </Button>
                </motion.form>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies (only before connected) */}
            {!conversationId && messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {quickReplies.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-[10px] font-body px-2.5 py-1 rounded-full border border-gold/20 text-gold-light/70 hover:bg-gold/10 hover:text-gold transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5 border-t border-border/20 bg-navy">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={conversationId ? "Mensagem para o consultor..." : "Digite sua dúvida..."}
                className="flex-1 h-8 text-xs bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
              />
              <Button type="submit" size="sm" className="h-8 w-8 p-0 shrink-0" disabled={!input.trim()}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>

            {/* WhatsApp link */}
            <div className="text-center py-1.5 bg-navy border-t border-border/10">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-body text-gold/50 hover:text-gold transition-colors">
                💬 Prefere WhatsApp? Clique aqui
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
