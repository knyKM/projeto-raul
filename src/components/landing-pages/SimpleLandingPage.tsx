import { Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";
import type { LandingPageData } from "@/lib/landingPages";
import ExitPopup from "./ExitPopup";

interface Props {
  page: LandingPageData;
  slug: string;
}

const SimpleLandingPage = ({ page, slug }: Props) => {
  const { toast } = useToast();
  const [lead, setLead] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const whatsappUrl = `https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent(`Olá! Tenho interesse no consórcio do ${page.vehicleName}. Pode me ajudar?`)}`;

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
        toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
        setLead({ name: "", phone: "", email: "" });
      } else {
        toast({ title: "Erro ao enviar", description: res.error || "Tente novamente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro de conexão", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Vehicle image */}
        <div className="rounded-xl overflow-hidden shadow-2xl">
          {page.imageUrl ? (
            <img
              src={page.imageUrl}
              alt={page.vehicleName}
              className="w-full aspect-[4/3] object-cover"
            />
          ) : (
            <div className="w-full aspect-[4/3] bg-navy-light/50 flex items-center justify-center">
              <span className="text-muted-foreground/40 font-body text-sm">Imagem do veículo</span>
            </div>
          )}
        </div>

        {/* Vehicle name + price */}
        <div className="text-center space-y-1">
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            {page.vehicleName}
          </h1>
          <p className="text-2xl font-display font-bold text-gradient-gold">
            R$ {page.creditValue.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs font-body text-gold-light/50">
            {page.installments}x de R$ {page.installmentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Lead form */}
        <form onSubmit={handleSubmitLead} className="space-y-3">
          <Input
            placeholder="Seu nome"
            value={lead.name}
            onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))}
            className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
            maxLength={100}
          />
          <Input
            placeholder="Telefone com DDD"
            value={lead.phone}
            onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value }))}
            className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
            maxLength={20}
          />
          <Input
            placeholder="E-mail (opcional)"
            type="email"
            value={lead.email}
            onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
            className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
            maxLength={255}
          />
          <Button variant="hero" size="lg" className="w-full gap-2" type="submit" disabled={submitting}>
            <MessageCircle className="w-4 h-4" />
            {submitting ? "Enviando..." : "Tenho Interesse"}
          </Button>
        </form>

        {/* WhatsApp link */}
        <div className="text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-body text-gold hover:text-gold-light transition-colors"
          >
            <Phone className="w-4 h-4" />
            Ou fale pelo WhatsApp
          </a>
        </div>

        {/* Footer */}
        <p className="text-[10px] font-body text-gold-light/20 text-center">
          © {new Date().getFullYear()} Mogibens · Consórcio de Veículos
        </p>
      </motion.div>

      <ExitPopup vehicleName={page.vehicleName} slug={slug} whatsappUrl={whatsappUrl} />
    </div>
  );
};

export default SimpleLandingPage;
