import { motion } from "framer-motion";
import { ShieldCheck, Landmark, Lock } from "lucide-react";

const TrustBadges = () => {
  return (
    <section className="py-12 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          <div className="flex items-center gap-3 text-muted-foreground">
            <Landmark className="w-5 h-5 text-secondary" />
            <span className="font-body text-xs md:text-sm">Regulamentado pelo Banco Central</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            <span className="font-body text-xs md:text-sm">Dados protegidos com criptografia</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Lock className="w-5 h-5 text-secondary" />
            <span className="font-body text-xs md:text-sm">Seus dados não serão compartilhados</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustBadges;
