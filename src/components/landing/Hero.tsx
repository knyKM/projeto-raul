import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronDown, Phone, CheckCircle2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

const Hero = () => {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-hero overflow-hidden">
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/60 via-navy/30 to-navy-dark/90" />
      
      <div className="relative z-10 container mx-auto px-4 text-center pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-5 py-2 mb-8"
        >
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <span className="text-gold font-body text-xs tracking-wide">Mais de 2.500 clientes satisfeitos</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight"
        >
          Realize seus sonhos<br />
          <span className="text-gradient-gold">com tranquilidade</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-body text-gold-light/70 text-lg md:text-xl max-w-2xl mx-auto mb-5"
        >
          Consórcios para imóveis, veículos e serviços com as melhores condições do mercado. 
          Sem juros, sem entrada obrigatória.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10 text-gold-light/50 font-body text-sm"
        >
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold/60" /> Sem juros</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold/60" /> Sem entrada</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold/60" /> 100% seguro</span>
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
          className="mt-6 text-xs font-body text-gold-light/30"
        >
          Resposta em até 24h · Sem compromisso
        </motion.p>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-6 h-6 text-gold/40" />
      </motion.div>
    </section>
  );
};

export default Hero;
