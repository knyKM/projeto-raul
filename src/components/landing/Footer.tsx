const Footer = () => {
  return (
    <footer className="bg-navy-dark py-12 border-t border-gold/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-display text-xl font-bold text-gold">Mogibens</span>
            <span className="text-gold-light/50 text-sm font-body ml-2">Consórcios</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-body text-gold-light/50">
            <a href="#beneficios" className="hover:text-gold transition-colors">Benefícios</a>
            <a href="#como-funciona" className="hover:text-gold transition-colors">Como Funciona</a>
            <a href="#contato" className="hover:text-gold transition-colors">Contato</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gold/5 text-center">
          <p className="text-sm font-body text-gold-light/30">
            © {new Date().getFullYear()} Mogibens Consórcios. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
