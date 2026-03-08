import { Phone, MessageCircle, Star, Shield, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";
import type { LandingPageData } from "@/lib/landingPages";
import ExitPopup from "./ExitPopup";
import ChatWidget from "./ChatWidget";

interface Props {
  page: LandingPageData;
  slug: string;
  trackFormStart?: () => void;
  trackChatMessage?: () => void;
}

const DestaqueLandingPage = ({ page, slug, trackFormStart, trackChatMessage }: Props) => {
  const { toast } = useToast();
  const [lead, setLead] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const whatsappUrl = `https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent(`Olá! Tenho interesse no ${page.vehicleName}.`)}`;

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name || !lead.phone) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/leads", {
        nome: lead.name,
        telefone: lead.phone,
        email: lead.email || null,
        origem: "landing_page",
        landing_page_slug: slug,
      });
      if (res.ok) {
        toast({ title: "Enviado!", description: "Entraremos em contato." });
        setLead({ name: "", phone: "", email: "" });
      }
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: Shield, text: "100% seguro — regulamentado pelo Banco Central" },
    { icon: CreditCard, text: "Sem juros — apenas taxa de administração" },
    { icon: Clock, text: "Sem entrada obrigatória" },
    { icon: Star, text: "Contemplação por sorteio ou lance" },
  ];

  return (
    <div className="min-h-screen bg-navy-dark">
      {/* Full-screen hero with split layout */}
      <section className="min-h-screen flex flex-col lg:flex-row">
        {/* Left: Image */}
        <div className="lg:w-1/2 relative min-h-[40vh] lg:min-h-screen">
          {page.imageUrl ? (
            <img
              src={page.imageUrl}
              alt={page.vehicleName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-navy-light/30 flex items-center justify-center">
              <span className="text-gold-light/20 font-body">Imagem do veículo</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-navy-dark/80 lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark to-transparent lg:hidden" />

          {/* Price overlay on mobile */}
          <div className="absolute bottom-4 left-4 lg:hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-navy-dark/80 backdrop-blur-md rounded-xl px-4 py-3 border border-gold/20"
            >
              <p className="text-xs font-body text-gold-light/60">Crédito de</p>
              <p className="text-2xl font-display font-bold text-gradient-gold">
                R$ {page.creditValue.toLocaleString("pt-BR")}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right: Content + Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md space-y-6"
          >
            {/* Vehicle name */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gold/[0.08] border border-gold/15 rounded-full px-3 py-1 mb-4">
                <Star className="w-3 h-3 text-gold" />
                <span className="text-gold font-body text-[10px] uppercase tracking-wider font-semibold">Oferta Destaque</span>
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary-foreground leading-tight mb-2">
                {page.vehicleName}
              </h1>
              <div className="hidden lg:block">
                <p className="text-xs font-body text-gold-light/50 mb-1">Crédito de</p>
                <p className="text-3xl font-display font-bold text-gradient-gold">
                  R$ {page.creditValue.toLocaleString("pt-BR")}
                </p>
                <p className="text-sm font-body text-gold-light/40 mt-1">
                  {page.installments}x de R$ {page.installmentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-2.5">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span className="text-xs font-body text-gold-light/70">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Lead form */}
            <motion.form
              onSubmit={handleSubmitLead}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 bg-navy/50 rounded-xl p-5 border border-gold/10"
            >
              <p className="text-sm font-display font-semibold text-primary-foreground text-center">
                Garanta sua proposta
              </p>
              <Input
                placeholder="Seu nome"
                value={lead.name}
                onChange={(e) => setLead(l => ({ ...l, name: e.target.value }))}
                onFocus={trackFormStart}
                className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
                maxLength={100}
              />
              <Input
                placeholder="Telefone com DDD"
                value={lead.phone}
                onChange={(e) => setLead(l => ({ ...l, phone: e.target.value }))}
                className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
                maxLength={20}
              />
              <Input
                placeholder="E-mail (opcional)"
                type="email"
                value={lead.email}
                onChange={(e) => setLead(l => ({ ...l, email: e.target.value }))}
                className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
                maxLength={255}
              />
              <Button variant="hero" size="lg" className="w-full gap-2" type="submit" disabled={submitting}>
                <MessageCircle className="w-4 h-4" />
                {submitting ? "Enviando..." : "Quero essa oferta"}
              </Button>
            </motion.form>

            {/* WhatsApp */}
            <div className="text-center">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-body text-gold hover:text-gold-light transition-colors">
                <Phone className="w-4 h-4" />Ou fale pelo WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-navy-dark border-t border-border/10 text-center">
        <p className="text-[10px] font-body text-gold-light/20">© {new Date().getFullYear()} Mogibens · Consórcio de Veículos</p>
      </footer>

      <ExitPopup vehicleName={page.vehicleName} slug={slug} whatsappUrl={whatsappUrl} />
      <ChatWidget vehicleName={page.vehicleName} slug={slug} whatsappNumber={page.whatsappNumber} />
    </div>
  );
};

export default DestaqueLandingPage;
