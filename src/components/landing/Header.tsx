import { Button } from "@/components/ui/button";

const Header = () => {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-gold/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-gold">Mogibens</span>
          <span className="text-gold-light/70 text-sm font-body">Consórcios</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#beneficios" className="text-sm text-gold-light/80 hover:text-gold transition-colors font-body">Benefícios</a>
          <a href="#como-funciona" className="text-sm text-gold-light/80 hover:text-gold transition-colors font-body">Como Funciona</a>
          <a href="#contato" className="text-sm text-gold-light/80 hover:text-gold transition-colors font-body">Contato</a>
        </nav>
        <Button variant="gold" size="sm" onClick={scrollToContact}>
          Solicitar Orçamento
        </Button>
      </div>
    </header>
  );
};

export default Header;
