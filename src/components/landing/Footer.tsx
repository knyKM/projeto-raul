import logo from "@/assets/logo-mogibens.png";

const Footer = () => {
  return (
    <footer className="bg-navy-dark py-12 border-t border-gold/[0.06]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="#">
            <img src={logo} alt="Mogibens Consórcios" className="h-12 w-auto rounded-md" />
          </a>
          <div className="flex items-center gap-6 text-sm font-body text-gold-light/40">
            <a href="#beneficios" className="hover:text-gold transition-colors">Benefícios</a>
            <a href="#como-funciona" className="hover:text-gold transition-colors">Como Funciona</a>
            <a href="#contato" className="hover:text-gold transition-colors">Contato</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gold/[0.04] text-center">
          <p className="text-sm font-body text-gold-light/25">
            © {new Date().getFullYear()} Mogibens Consórcios. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
