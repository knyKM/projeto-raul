import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 2500, suffix: "+", label: "Clientes Satisfeitos" },
  { value: 15, suffix: "+", label: "Anos de Experiência" },
  { value: 98, suffix: "%", label: "Taxa de Satisfação" },
  { value: 500, suffix: "M+", label: "Em Créditos Liberados" },
];

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-4xl md:text-5xl font-bold text-gold">
        {count.toLocaleString("pt-BR")}{suffix}
      </p>
    </div>
  );
};

const StatsBar = () => {
  return (
    <section className="relative py-16 bg-navy border-y border-gold/10">
      <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/50 via-transparent to-navy-dark/50" />
      <div className="relative container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="font-body text-sm text-gold-light/50 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
