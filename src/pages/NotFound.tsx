import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light opacity-90" />
      <div className="relative text-center px-4">
        <p className="font-display text-8xl md:text-9xl font-bold text-gradient-gold mb-4">404</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
          Página não encontrada
        </h1>
        <p className="font-body text-gold-light/50 max-w-md mx-auto mb-8">
          A página que você procura não existe ou foi movida.
        </p>
        <Button variant="hero" size="lg" asChild>
          <a href="/" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
