import { Shield, TrendingDown, Clock, Award } from "lucide-react";

const benefits = [
  {
    icon: TrendingDown,
    title: "Sem Juros",
    description: "Diferente de financiamentos, o consórcio não cobra juros. Você paga apenas a taxa de administração.",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Regulamentado pelo Banco Central, seu investimento está protegido e garantido por lei.",
  },
  {
    icon: Clock,
    title: "Flexibilidade",
    description: "Parcelas que cabem no seu bolso, com prazos que se adaptam à sua realidade financeira.",
  },
  {
    icon: Award,
    title: "Poder de Compra",
    description: "Use a carta de crédito como pagamento à vista e negocie os melhores descontos.",
  },
];

const Benefits = () => {
  return (
    <section id="beneficios" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-secondary text-sm tracking-[0.2em] uppercase font-body mb-3">Vantagens</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Por que escolher o consórcio?
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group p-8 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-5 group-hover:bg-secondary/20 transition-colors">
                <benefit.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">{benefit.title}</h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
