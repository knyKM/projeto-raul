import { MessageCircle } from "lucide-react";

const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os consórcios da Mogibens."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-[#fff] rounded-full pl-5 pr-6 py-3.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="font-body font-semibold text-sm hidden sm:inline">Fale pelo WhatsApp</span>
    </a>
  );
};

export default WhatsAppFloat;
