import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Escolha seu veículo",
    description: "Defina o valor da carta de crédito ideal para o carro, moto ou caminhão dos seus sonhos.",
  },
  {
    number: "02",
    title: "Parcelas acessíveis",
    description: "Pague parcelas mensais sem juros, apenas com taxa de administração. Sem surpresas.",
  },
  {
    number: "03",
    title: "Contemplação",
    description: "Seja contemplado por sorteio ou lance e receba sua carta de crédito para usar.",
  },
  {
    number: "04",
    title: "Dirija seu novo veículo",
    description: "Use a carta como pagamento à vista na concessionária e negocie o melhor preço.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/30 via-transparent to-navy-dark/30" />
      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-gold text-sm tracking-[0.2em] uppercase font-body mb-3">Passo a Passo</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Como funciona o consórcio de veículos?
          </h2>
          <p className="font-body text-gold-light/50 max-w-lg mx-auto">
            Um processo simples e transparente, do início até a chave na mão.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gold/30 to-transparent z-0" />
              )}
              <div className="relative z-10 bg-navy-light/30 rounded-xl p-6 border border-gold/5 hover:border-gold/15 transition-colors duration-300">
                <span className="font-display text-4xl font-bold text-gold/20">{step.number}</span>
                <h3 className="font-display text-lg font-semibold text-primary-foreground mt-2 mb-3">{step.title}</h3>
                <p className="font-body text-gold-light/55 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
