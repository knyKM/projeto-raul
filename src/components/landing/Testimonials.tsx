import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Conquistou seu imóvel",
    text: "A Mogibens tornou o processo tão simples! Em menos de 2 anos fui contemplada e realizei o sonho da casa própria. Atendimento impecável.",
    rating: 5,
  },
  {
    name: "Carlos Oliveira",
    role: "Comprou seu carro novo",
    text: "Sempre tive medo de consórcio, mas a equipe da Mogibens me explicou tudo com muita paciência. Hoje dirijo meu carro zero!",
    rating: 5,
  },
  {
    name: "Ana Beatriz",
    role: "Reformou sua casa",
    text: "Usei o consórcio de serviços para reformar toda minha casa. Parcelas que couberam no bolso e sem aquele estresse de financiamento.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-secondary text-sm tracking-[0.2em] uppercase font-body mb-3">Depoimentos</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Quem já realizou o sonho
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-card p-8 rounded-xl shadow-card border border-border hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-body font-semibold text-foreground text-sm">{t.name}</p>
                <p className="font-body text-xs text-secondary">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
