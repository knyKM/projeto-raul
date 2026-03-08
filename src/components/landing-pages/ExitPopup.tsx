import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface ExitPopupProps {
  vehicleName: string;
  slug: string;
  whatsappUrl: string;
}

const ExitPopup = ({ vehicleName, slug, whatsappUrl }: ExitPopupProps) => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lead, setLead] = useState({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 5 && !dismissed && !submitted) {
      setShow(true);
    }
  }, [dismissed, submitted]);

  useEffect(() => {
    // Only trigger on desktop (no hover on mobile)
    if (window.matchMedia('(pointer: fine)').matches) {
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [handleMouseLeave]);

  // Also trigger on mobile after 30s of inactivity on the page
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      const timer = setTimeout(() => {
        if (!dismissed && !submitted) setShow(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [dismissed, submitted]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name || !lead.phone) return;

    setSubmitting(true);
    try {
      const res = await api.post('/leads', {
        nome: lead.name,
        telefone: lead.phone,
        email: null,
        origem: 'exit_popup',
        landing_page_slug: slug,
      });

      if (res.ok) {
        setSubmitted(true);
        setShow(false);
        toast({ title: "Dados recebidos!", description: "Entraremos em contato em breve." });
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[90vw] max-w-sm"
          >
            <div className="bg-navy-dark border border-gold/20 rounded-2xl p-6 shadow-2xl relative">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-gold-light/40 hover:text-gold-light/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-lg font-bold text-primary-foreground mb-1">
                  Espere! Não vá embora 👋
                </h3>
                <p className="text-xs font-body text-gold-light/60 leading-relaxed">
                  Deixe seu contato e receba uma <span className="text-gold font-semibold">condição especial</span> para o {vehicleName}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Seu nome"
                  value={lead.name}
                  onChange={(e) => setLead(l => ({ ...l, name: e.target.value }))}
                  className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30 h-10 text-sm"
                  maxLength={100}
                />
                <Input
                  placeholder="WhatsApp com DDD"
                  value={lead.phone}
                  onChange={(e) => setLead(l => ({ ...l, phone: e.target.value }))}
                  className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30 h-10 text-sm"
                  maxLength={20}
                />
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2 text-sm"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Enviando..." : "Quero a condição especial"}
                </Button>
              </form>

              <div className="text-center mt-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-body text-gold/70 hover:text-gold transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  Ou fale pelo WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExitPopup;
