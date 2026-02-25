import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-mogibens.png";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const navLinks = [
    { href: "#beneficios", label: "Benefícios" },
    { href: "#como-funciona", label: "Como Funciona" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-gold/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="Mogibens Consórcios" className="h-10 w-auto" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-gold-light/80 hover:text-gold transition-colors font-body">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="gold" size="sm" onClick={scrollToContact} className="hidden sm:inline-flex">
            Solicitar Orçamento
          </Button>
          <button
            className="md:hidden p-2 text-gold-light/80 hover:text-gold transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-navy/98 backdrop-blur-md border-t border-gold/10 animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-gold-light/80 hover:text-gold transition-colors font-body py-2"
              >
                {link.label}
              </a>
            ))}
            <Button variant="gold" size="sm" onClick={scrollToContact} className="mt-2">
              Solicitar Orçamento
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
