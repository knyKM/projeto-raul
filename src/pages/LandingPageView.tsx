import { useParams, Link } from "react-router-dom";
import { getLandingPageBySlug } from "@/lib/landingPages";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle2, Shield, Clock, CreditCard, ArrowLeft, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/apiClient";
import SimpleLandingPage from "@/components/landing-pages/SimpleLandingPage";
import DestaqueLandingPage from "@/components/landing-pages/DestaqueLandingPage";
import ExitPopup from "@/components/landing-pages/ExitPopup";
import ChatWidget from "@/components/landing-pages/ChatWidget";

const benefits = [
  { icon: Shield, title: "100% Seguro", desc: "Regulamentado pelo Banco Central" },
  { icon: CreditCard, title: "Sem Juros", desc: "Apenas taxa de administração diluída" },
  { icon: Clock, title: "Sem Entrada", desc: "Comece a pagar sem entrada obrigatória" },
];

const LandingPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getLandingPageBySlug(slug) : undefined;
  const { toast } = useToast();
  const [lead, setLead] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  // Track visit + geolocation on mount
  useEffect(() => {
    if (!slug) return;

    const trackVisit = async () => {
      let cidade: string | undefined;
      let estado: string | undefined;
      let latitude: number | undefined;
      let longitude: number | undefined;

      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          cidade = ipData.city || undefined;
          estado = ipData.region_code || ipData.region?.substring(0, 2)?.toUpperCase() || undefined;
          latitude = ipData.latitude || undefined;
          longitude = ipData.longitude || undefined;
        }
      } catch { /* silent */ }

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;

          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`,
              { headers: { 'User-Agent': 'SistemaLeads/1.0' } }
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              cidade = geoData?.address?.city || geoData?.address?.town || geoData?.address?.municipality || cidade;
              estado = geoData?.address?.state_code?.toUpperCase() || geoData?.address?.state?.substring(0, 2)?.toUpperCase() || estado;
            }
          } catch { /* keep IP-based data */ }
        } catch { /* denied or timeout */ }
      }

      try {
        await api.post('/leads/track-visit', {
          landing_page_slug: slug,
          latitude: latitude || null,
          longitude: longitude || null,
          cidade: cidade || null,
          estado: estado || null,
        });
      } catch { /* silent */ }
    };

    trackVisit();
  }, [slug]);

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-navy-dark text-primary-foreground p-6 text-center">
        <h1 className="text-2xl font-display font-bold mb-4">Página não encontrada</h1>
        <Link to="/">
          <Button variant="heroOutline" className="gap-2"><ArrowLeft className="w-4 h-4" />Voltar ao site</Button>
        </Link>
      </div>
    );
  }

  // Route to simple template
  if (page.template === "simples") {
    return <SimpleLandingPage page={page} slug={slug!} />;
  }
  if (page.template === "destaque") {
    return <DestaqueLandingPage page={page} slug={slug!} />;
  }

  // ─── Complete template (original) ─────────────────────────
  const whatsappUrl = `https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent(`Olá! Tenho interesse no consórcio do ${page.vehicleName}. Pode me ajudar?`)}`;

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name || !lead.phone) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/leads', {
        nome: lead.name,
        telefone: lead.phone,
        email: lead.email || null,
        origem: 'landing_page',
        landing_page_slug: slug,
      });

      if (res.ok) {
        toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
        setLead({ name: "", phone: "", email: "" });
      } else {
        toast({ title: "Erro ao enviar", description: res.error || "Tente novamente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro de conexão", description: "Não foi possível enviar. Tente pelo WhatsApp.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const installmentOptions = [
    { months: Math.round(page.installments * 0.5), value: page.creditValue / Math.round(page.installments * 0.5) },
    { months: page.installments, value: page.installmentValue },
    { months: Math.round(page.installments * 1.25), value: page.creditValue / Math.round(page.installments * 1.25) },
  ];

  return (
    <div className="min-h-screen bg-navy-dark">
      {/* Hero */}
      <section className="relative min-h-[80vh] sm:min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark via-navy to-navy-dark" />
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-gold/[0.03] blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative z-10 container mx-auto px-4 py-20 sm:py-28">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 bg-gold/[0.08] border border-gold/15 rounded-full px-4 py-1.5 mb-6">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                <span className="text-gold font-body text-xs">Consórcio sem juros</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                <span className="text-primary-foreground">{page.vehicleName}</span>
              </h1>
              <p className="text-2xl sm:text-3xl font-display font-bold text-gradient-gold mb-4">
                R$ {page.creditValue.toLocaleString("pt-BR")}
              </p>
              <p className="font-body text-gold-light/60 text-sm sm:text-base mb-6 leading-relaxed max-w-md">
                {page.description || `Adquira seu ${page.vehicleName} através do consórcio Mogibens. Sem juros, sem entrada obrigatória.`}
              </p>

              {page.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {page.highlights.map((h, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-xs font-body text-gold-light/60 bg-gold/[0.06] rounded-full px-3 py-1">
                      <CheckCircle2 className="w-3 h-3 text-gold/50" />{h}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="hero" size="lg" className="gap-2" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4" />Quero esse consórcio
                  </a>
                </Button>
                <Button variant="heroOutline" size="lg" onClick={() => document.getElementById("simulacao")?.scrollIntoView({ behavior: "smooth" })}>
                  Simular Parcelas
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
              {page.imageUrl ? (
                <img src={page.imageUrl} alt={page.vehicleName} className="w-full rounded-xl shadow-2xl object-cover aspect-[4/3]" />
              ) : (
                <div className="w-full aspect-[4/3] rounded-xl bg-navy-light/50 flex items-center justify-center border border-border/20">
                  <span className="text-muted-foreground/40 font-body text-sm">Imagem do veículo</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simulação de Parcelas */}
      <section id="simulacao" className="py-16 sm:py-20 bg-navy">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground text-center mb-3">
            Simulação de Parcelas
          </h2>
          <p className="text-gold-light/50 font-body text-center text-sm mb-10 max-w-md mx-auto">
            Valores aproximados sem juros. Consulte condições atualizadas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {installmentOptions.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl p-5 sm:p-6 text-center border ${i === 1 ? "bg-gold/10 border-gold/30 scale-105" : "bg-navy-light/30 border-border/20"}`}
              >
                <p className="text-xs font-body text-gold-light/50 mb-1">{opt.months}x de</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-primary-foreground">
                  R$ {opt.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs font-body text-gold-light/40 mt-2">Crédito de R$ {page.creditValue.toLocaleString("pt-BR")}</p>
                {i === 1 && <span className="inline-block mt-3 text-[10px] font-body bg-gold/20 text-gold px-2 py-0.5 rounded-full">Mais popular</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 sm:py-20 bg-navy-dark">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground text-center mb-10">
            Por que escolher o consórcio?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-navy-light/20 border border-border/10"
              >
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-primary-foreground mb-2">{b.title}</h3>
                <p className="text-xs font-body text-gold-light/50">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Contato */}
      <section className="py-16 sm:py-20 bg-navy">
        <div className="container mx-auto px-4 max-w-md">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground text-center mb-3">
            Ficou interessado?
          </h2>
          <p className="text-gold-light/50 font-body text-center text-sm mb-8">
            Deixe seus dados e entraremos em contato
          </p>

          <form onSubmit={handleSubmitLead} className="space-y-3">
            <Input
              placeholder="Seu nome"
              value={lead.name}
              onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))}
              className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
              maxLength={100}
            />
            <Input
              placeholder="Telefone com DDD"
              value={lead.phone}
              onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value }))}
              className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
              maxLength={20}
            />
            <Input
              placeholder="E-mail (opcional)"
              type="email"
              value={lead.email}
              onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
              className="bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30"
              maxLength={255}
            />
            <Button variant="hero" size="lg" className="w-full gap-2" type="submit" disabled={submitting}>
              <MessageCircle className="w-4 h-4" />{submitting ? "Enviando..." : "Enviar"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-body text-gold hover:text-gold-light transition-colors">
              <Phone className="w-4 h-4" />Ou fale pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-navy-dark border-t border-border/10 text-center">
        <p className="text-xs font-body text-gold-light/30">© {new Date().getFullYear()} Mogibens · Consórcio de Veículos</p>
      </footer>

      {/* Exit Intent Popup */}
      <ExitPopup vehicleName={page.vehicleName} slug={slug!} whatsappUrl={whatsappUrl} />
      <ChatWidget vehicleName={page.vehicleName} slug={slug!} whatsappNumber={page.whatsappNumber} />
    </div>
  );
};

export default LandingPageView;
