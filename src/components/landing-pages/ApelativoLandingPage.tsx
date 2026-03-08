import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, MessageCircle, Shield, CreditCard, Clock, CheckCircle2,
  Star, TrendingUp, Heart, Sparkles, ArrowRight, Gift, Zap, BadgeCheck, Users, ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";
import type { LandingPageData } from "@/lib/landingPages";
import ExitPopup from "./ExitPopup";
import ChatWidget from "./ChatWidget";

interface Props {
  page: LandingPageData;
  slug: string;
  trackFormStart?: () => void;
  trackChatMessage?: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const ApelativoLandingPage = ({ page, slug, trackFormStart, trackChatMessage }: Props) => {
  const { toast } = useToast();
  const [lead, setLead] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const whatsappUrl = `https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent(`Olá! Vi a oferta do ${page.vehicleName} e quero saber mais!`)}`;

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name || !lead.phone) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/leads", {
        nome: lead.name,
        telefone: lead.phone,
        email: lead.email || null,
        origem: "landing_page",
        landing_page_slug: slug,
      });
      if (res.ok) {
        toast({ title: "Perfeito! 🎉", description: "Nosso time vai entrar em contato rapidinho!" });
        setLead({ name: "", phone: "", email: "" });
      }
    } catch {
      toast({ title: "Erro ao enviar", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    { icon: Shield, title: "Segurança Total", desc: "Regulamentado pelo Banco Central do Brasil. Seu dinheiro protegido.", color: "from-emerald-500/20 to-emerald-600/5" },
    { icon: CreditCard, title: "Zero Juros", desc: "Diferente do financiamento, aqui você não paga juros. Só uma taxa de administração diluída.", color: "from-blue-500/20 to-blue-600/5" },
    { icon: Clock, title: "Sem Entrada", desc: "Não precisa juntar dinheiro para dar entrada. Comece agora mesmo.", color: "from-amber-500/20 to-amber-600/5" },
    { icon: Gift, title: "Contemplação Mensal", desc: "Todo mês você tem chances de ser contemplado por sorteio ou lance.", color: "from-purple-500/20 to-purple-600/5" },
    { icon: TrendingUp, title: "Valorização do Crédito", desc: "Seu crédito é reajustado anualmente — seu poder de compra aumenta.", color: "from-rose-500/20 to-rose-600/5" },
    { icon: Heart, title: "Parcelas que Cabem no Bolso", desc: "Planos flexíveis que se adaptam à sua realidade financeira.", color: "from-cyan-500/20 to-cyan-600/5" },
  ];

  const comparisons = [
    { feature: "Juros", consorcio: "Não tem ✅", financiamento: "Sim, altos ❌" },
    { feature: "Entrada obrigatória", consorcio: "Não precisa ✅", financiamento: "Geralmente sim ❌" },
    { feature: "Valor final do bem", consorcio: "Menor ✅", financiamento: "Até 2x mais caro ❌" },
    { feature: "Segurança", consorcio: "Banco Central ✅", financiamento: "Banco Central ✅" },
    { feature: "Contemplação antecipada", consorcio: "Sim, por lance ✅", financiamento: "Não se aplica ➖" },
  ];

  const testimonials = [
    { name: "Carlos M.", text: "Nunca imaginei que seria tão fácil. Em 6 meses fui contemplado e hoje dirijo meu carro novo!", rating: 5 },
    { name: "Ana Paula S.", text: "A parcela cabe no meu bolso e não pago juros. Melhor decisão financeira que já tomei!", rating: 5 },
    { name: "Roberto L.", text: "O atendimento foi excepcional. Me explicaram tudo com calma e transparência.", rating: 5 },
  ];

  const steps = [
    { num: "01", title: "Escolha seu plano", desc: "Selecione o crédito e parcela ideais para você" },
    { num: "02", title: "Participe do grupo", desc: "Entre no grupo e comece a pagar suas parcelas" },
    { num: "03", title: "Seja contemplado", desc: "Por sorteio mensal ou oferecendo um lance" },
    { num: "04", title: "Use seu crédito", desc: "Compre o veículo que você sempre quis!" },
  ];

  const installmentOptions = [
    { months: Math.round(page.installments * 0.5), value: page.creditValue / Math.round(page.installments * 0.5) },
    { months: page.installments, value: page.installmentValue },
    { months: Math.round(page.installments * 1.25), value: page.creditValue / Math.round(page.installments * 1.25) },
  ];

  return (
    <div className="min-h-screen bg-navy-dark overflow-hidden">

      {/* ══════════════════════════════════════════════
          HERO — Full-impact emotional opener
          ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gold/[0.04] blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark via-transparent to-navy-dark" />

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 bg-gold/[0.08] border border-gold/15 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span className="text-gold font-body text-xs tracking-wide uppercase">Oportunidade exclusiva</span>
              </motion.div>

              <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                <span className="text-primary-foreground">Seu </span>
                <span className="text-gradient-gold">{page.vehicleName}</span>
                <span className="text-primary-foreground block mt-2">está mais perto do que você imagina</span>
              </motion.h1>

              <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
                className="text-gold-light/60 font-body text-base sm:text-lg mb-4 max-w-lg leading-relaxed">
                {page.description || `Imagine-se ao volante do ${page.vehicleName}. Sem pagar juros, sem entrada, com parcelas que cabem no seu bolso. Isso é real — e começa agora.`}
              </motion.p>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
                className="flex flex-wrap gap-3 mb-8">
                {["Sem juros", "Sem entrada", "Contemplação mensal", "100% seguro"].map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1.5 border border-emerald-500/15">
                    <CheckCircle2 className="w-3 h-3" />{tag}
                  </span>
                ))}
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
                className="bg-navy-light/30 rounded-2xl border border-gold/10 p-6 mb-8">
                <p className="text-xs font-body text-gold-light/50 mb-1">Crédito de</p>
                <p className="text-4xl font-display font-bold text-gradient-gold">
                  R$ {page.creditValue.toLocaleString("pt-BR")}
                </p>
                <p className="text-sm font-body text-gold-light/50 mt-2">
                  A partir de <span className="text-primary-foreground font-semibold">R$ {installmentOptions[2].value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês</span>
                </p>
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}
                className="flex flex-col sm:flex-row gap-3">
                <Button variant="hero" size="lg" className="gap-2 text-base px-8" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-5 h-5" />Quero garantir o meu!
                  </a>
                </Button>
                <Button variant="heroOutline" size="lg" className="gap-2"
                  onClick={() => document.getElementById("beneficios")?.scrollIntoView({ behavior: "smooth" })}>
                  Ver todos os benefícios <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            {/* Right — Image */}
            <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }} className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-transparent rounded-3xl" />
              {page.imageUrl ? (
                <img src={page.imageUrl} alt={page.vehicleName}
                  className="w-full rounded-3xl shadow-2xl object-cover aspect-[4/3] border border-gold/10" />
              ) : (
                <div className="w-full aspect-[4/3] rounded-3xl bg-navy-light/30 flex items-center justify-center border border-border/20">
                  <span className="text-muted-foreground/40 font-body">Imagem do veículo</span>
                </div>
              )}
              {/* Floating badge */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-navy border border-gold/20 rounded-xl px-4 py-3 shadow-xl">
                <p className="text-[10px] font-body text-gold-light/50">Parcelas desde</p>
                <p className="text-lg font-display font-bold text-gold">
                  R$ {installmentOptions[2].value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-3 -right-3 bg-emerald-600 text-white rounded-full px-4 py-2 shadow-lg">
                <p className="text-xs font-display font-bold">SEM JUROS</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SOCIAL PROOF — Ticker
          ══════════════════════════════════════════════ */}
      <section className="py-6 bg-navy border-y border-border/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { icon: Users, value: "12.000+", label: "Clientes contemplados" },
              { icon: ThumbsUp, value: "98%", label: "Satisfação dos clientes" },
              { icon: BadgeCheck, value: "15+", label: "Anos de mercado" },
              { icon: Star, value: "4.9/5", label: "Avaliação média" },
            ].map((stat, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-gold" />
                </div>
                <div className="text-left">
                  <p className="font-display text-lg font-bold text-primary-foreground">{stat.value}</p>
                  <p className="text-[10px] font-body text-gold-light/50">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BENEFITS — 6-card grid
          ══════════════════════════════════════════════ */}
      <section id="beneficios" className="py-20 bg-navy-dark">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-body text-gold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />Por que escolher o consórcio?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Benefícios que fazem a diferença
            </h2>
            <p className="font-body text-gold-light/50 max-w-2xl mx-auto">
              Entenda por que mais de 12 mil pessoas já escolheram o consórcio para realizar o sonho do carro próprio.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="group relative rounded-2xl border border-border/10 bg-navy-light/20 p-6 hover:border-gold/20 transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${b.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <b.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-primary-foreground mb-2">{b.title}</h3>
                  <p className="font-body text-sm text-gold-light/50 leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMPARISON TABLE — Consórcio vs Financiamento
          ══════════════════════════════════════════════ */}
      <section className="py-20 bg-navy">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Consórcio <span className="text-gold">vs</span> Financiamento
            </h2>
            <p className="font-body text-gold-light/50">Veja a diferença com seus próprios olhos.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="rounded-2xl border border-border/10 overflow-hidden">
            <div className="grid grid-cols-3 bg-navy-light/30 border-b border-border/10">
              <div className="p-4 text-xs font-body text-gold-light/40 font-semibold uppercase tracking-wider">Comparativo</div>
              <div className="p-4 text-xs font-body text-gold font-semibold uppercase tracking-wider text-center bg-gold/[0.05]">Consórcio</div>
              <div className="p-4 text-xs font-body text-gold-light/40 font-semibold uppercase tracking-wider text-center">Financiamento</div>
            </div>
            {comparisons.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-navy-dark/50' : 'bg-navy-light/10'} border-b border-border/5 last:border-0`}>
                <div className="p-4 text-sm font-body text-primary-foreground font-medium">{row.feature}</div>
                <div className="p-4 text-sm font-body text-center bg-gold/[0.03]">{row.consorcio}</div>
                <div className="p-4 text-sm font-body text-center text-gold-light/50">{row.financiamento}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INSTALLMENT SIMULATOR
          ══════════════════════════════════════════════ */}
      <section className="py-20 bg-navy-dark">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Parcelas que cabem no seu bolso
            </h2>
            <p className="font-body text-gold-light/50">Escolha o plano ideal para você. Sem surpresas.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {installmentOptions.map((opt, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className={`relative rounded-2xl p-8 text-center border transition-all duration-300 ${
                  i === 1
                    ? "bg-gradient-to-b from-gold/15 to-gold/5 border-gold/30 scale-[1.03] shadow-xl shadow-gold/5"
                    : "bg-navy-light/20 border-border/10 hover:border-gold/15"
                }`}>
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gold text-navy-dark text-[10px] font-display font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                      Mais escolhido
                    </span>
                  </div>
                )}
                <p className="text-xs font-body text-gold-light/50 mb-2 uppercase tracking-wider">{opt.months} parcelas</p>
                <p className="text-4xl font-display font-bold text-primary-foreground mb-1">
                  R$ {opt.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs font-body text-gold-light/40 mb-6">/mês</p>
                <p className="text-[11px] font-body text-gold-light/30">Crédito: R$ {page.creditValue.toLocaleString("pt-BR")}</p>
                <Button variant={i === 1 ? "hero" : "heroOutline"} size="sm" className="w-full mt-4 gap-2" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Quero esse plano <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — 4 steps
          ══════════════════════════════════════════════ */}
      <section className="py-20 bg-navy">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Como funciona?
            </h2>
            <p className="font-body text-gold-light/50">Simples, transparente e sem burocracia.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/15 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-2xl font-bold text-gold">{step.num}</span>
                </div>
                <h3 className="font-display font-bold text-primary-foreground mb-2">{step.title}</h3>
                <p className="text-xs font-body text-gold-light/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
          ══════════════════════════════════════════════ */}
      <section className="py-20 bg-navy-dark">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Quem fez, aprova
            </h2>
            <p className="font-body text-gold-light/50">Histórias reais de quem realizou o sonho do carro próprio.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl bg-navy-light/20 border border-border/10 p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="font-body text-sm text-gold-light/70 mb-4 leading-relaxed italic">"{t.text}"</p>
                <p className="font-display text-sm font-bold text-primary-foreground">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HIGHLIGHTS
          ══════════════════════════════════════════════ */}
      {page.highlights.length > 0 && (
        <section className="py-16 bg-navy">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="rounded-2xl bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/15 p-8">
              <h3 className="font-display text-xl font-bold text-primary-foreground mb-6 text-center">
                Destaques desta oferta
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {page.highlights.map((h, i) => (
                  <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                    className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="font-body text-sm text-primary-foreground">{h}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          CTA + LEAD FORM
          ══════════════════════════════════════════════ */}
      <section className="py-20 bg-navy-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gold/[0.04] blur-[120px]" />
        </div>
        <div className="relative z-10 container mx-auto px-4 max-w-lg text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Não perca essa oportunidade
            </h2>
            <p className="font-body text-gold-light/50 mb-8">
              Deixe seu contato e nosso time vai te mostrar como conquistar seu {page.vehicleName} com as melhores condições.
            </p>
          </motion.div>

          <motion.form initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            onSubmit={handleSubmitLead}
            className="space-y-3 bg-navy-light/30 rounded-2xl border border-gold/10 p-6">
            <Input
              placeholder="Seu nome completo"
              value={lead.name}
              onChange={(e) => setLead(l => ({ ...l, name: e.target.value }))}
              onFocus={trackFormStart}
              className="h-12 bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30 rounded-xl"
              maxLength={100}
            />
            <Input
              placeholder="WhatsApp com DDD"
              value={lead.phone}
              onChange={(e) => setLead(l => ({ ...l, phone: e.target.value }))}
              className="h-12 bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30 rounded-xl"
              maxLength={20}
            />
            <Input
              placeholder="E-mail (opcional)"
              type="email"
              value={lead.email}
              onChange={(e) => setLead(l => ({ ...l, email: e.target.value }))}
              className="h-12 bg-navy-light/30 border-border/20 text-primary-foreground placeholder:text-gold-light/30 rounded-xl"
              maxLength={255}
            />
            <Button variant="hero" size="lg" className="w-full gap-2 text-base h-12" type="submit" disabled={submitting}>
              <MessageCircle className="w-5 h-5" />{submitting ? "Enviando..." : "Quero ser atendido agora"}
            </Button>
            <p className="text-[10px] font-body text-gold-light/30 mt-2">
              Seus dados estão seguros. Não enviamos spam.
            </p>
          </motion.form>

          <div className="mt-6">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-body text-gold hover:text-gold-light transition-colors">
              <Phone className="w-4 h-4" />Ou fale direto pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-navy border-t border-border/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-body text-gold-light/30">
            © {new Date().getFullYear()} Consórcio de Veículos · Créditos sujeitos a análise. Imagens meramente ilustrativas.
          </p>
        </div>
      </footer>

      {/* Exit Intent + Chat Widget */}
      <ExitPopup vehicleName={page.vehicleName} slug={slug} whatsappUrl={whatsappUrl} />
      <ChatWidget vehicleName={page.vehicleName} slug={slug} whatsappNumber={page.whatsappNumber} />
    </div>
  );
};

export default ApelativoLandingPage;
