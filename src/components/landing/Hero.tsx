import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.png";

const Hero = () => {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-hero overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/50 via-transparent to-navy-dark/80" />
      
      <div className="relative z-10 container mx-auto px-4 text-center py-32">
        <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Mogibens Consórcios
        </p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
          Realize seus sonhos<br />
          <span className="text-gradient-gold">com planejamento</span>
        </h1>
        <p className="font-body text-gold-light/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
          Consórcios para imóveis, veículos e serviços com as melhores condições do mercado. 
          Sem juros, sem entrada obrigatória.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.6s", opacity: 0 }}>
          <Button variant="hero" size="lg" onClick={scrollToContact}>
            Solicitar Orçamento Grátis
          </Button>
          <Button variant="heroOutline" size="lg" onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}>
            Como Funciona
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
