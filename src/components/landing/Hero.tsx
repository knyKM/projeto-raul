import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronDown, Phone, CheckCircle2 } from "lucide-react";

const Hero = () => {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-dark">
      {/* Subtle geometric accents - contained within section */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-gold/[0.03] blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full bg-gold/[0.02] blur-3xl translate-y-1/2 -translate-x-1/3" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark via-navy to-navy-dark" />
      
      <div className="relative z-10 container mx-auto px-4 text-center pt-24 sm:pt-28 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-gold/[0.08] border border-gold/15 rounded-full px-5 py-2 mb-8"
        >
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <span className="text-gold font-body text-xs tracking-wide">Mais de 2.500 clientes satisfeitos</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="text-primary-foreground">Seu carro novo</span><br />
          <span className="text-gradient-gold">com tranquilidade</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-body text-gold-light/60 text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-6 leading-relaxed px-2"
        >
          Consórcio de veículos sem juros e sem entrada obrigatória. Carros, motos e caminhões.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10 sm:mb-12 text-gold-light/40 font-body text-xs sm:text-sm"
        >
          <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-gold/50" /> Sem juros</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-gold/50" /> Sem entrada</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-gold/50" /> 100% seguro</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="hero" size="lg" onClick={scrollToContact} className="gap-2">
            <Phone className="w-4 h-4" />
            Solicitar Orçamento Grátis
          </Button>
          <Button variant="heroOutline" size="lg" onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}>
            Como Funciona
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 text-xs font-body text-gold-light/25"
        >
          Resposta em até 24h · Sem compromisso
        </motion.p>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-5 h-5 text-gold/30" />
      </motion.div>
    </section>
  );
};

export default Hero;
