import { Shield, TrendingDown, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";

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
    description: "Parcelas que cabem no seu bolso. Escolha o prazo ideal para conquistar seu veículo.",
  },
  {
    icon: Award,
    title: "Poder de Compra",
    description: "Use a carta de crédito como pagamento à vista na concessionária e negocie os melhores descontos.",
  },
];

const Benefits = () => {
  return (
    <section id="beneficios" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-secondary text-sm tracking-[0.2em] uppercase font-body mb-3">Vantagens</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que escolher o consórcio de veículos?
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            A forma mais inteligente de conquistar seu carro, moto ou caminhão sem comprometer seu orçamento.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-5 group-hover:bg-secondary/20 transition-colors duration-300">
                <benefit.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">{benefit.title}</h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
