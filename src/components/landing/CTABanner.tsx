import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTABanner = () => {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy to-navy-dark" />
      <div className="relative container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Pronto para conquistar seu veículo?
          </h2>
          <p className="font-body text-gold-light/60 max-w-md mx-auto mb-8">
            Fale com um consultor especializado e descubra a melhor opção de consórcio para o seu próximo carro, moto ou caminhão.
          </p>
          <Button variant="hero" size="lg" onClick={scrollToContact} className="gap-2">
            Falar com Consultor
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
