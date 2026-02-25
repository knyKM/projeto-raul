const steps = [
  {
    number: "01",
    title: "Escolha seu plano",
    description: "Selecione o tipo de consórcio ideal: imóveis, veículos ou serviços.",
  },
  {
    number: "02",
    title: "Parcelas acessíveis",
    description: "Pague parcelas mensais sem juros, apenas com taxa de administração.",
  },
  {
    number: "03",
    title: "Contemplação",
    description: "Seja contemplado por sorteio ou lance e receba sua carta de crédito.",
  },
  {
    number: "04",
    title: "Realize seu sonho",
    description: "Use sua carta de crédito como pagamento à vista para o que desejar.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 bg-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.2em] uppercase font-body mb-3">Passo a Passo</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            Como funciona o consórcio?
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gold/30 to-transparent z-0" />
              )}
              <div className="relative z-10">
                <span className="font-display text-5xl font-bold text-gold/20">{step.number}</span>
                <h3 className="font-display text-lg font-semibold text-primary-foreground mt-2 mb-3">{step.title}</h3>
                <p className="font-body text-gold-light/60 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
