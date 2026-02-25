import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo: "",
    mensagem: "",
  });

  const filledFields = [formData.nome, formData.telefone, formData.tipo].filter(Boolean).length;
  const progress = Math.round((filledFields / 3) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.telefone || !formData.tipo) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({ nome: "", email: "", telefone: "", tipo: "", mensagem: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contato" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-secondary text-sm tracking-[0.2em] uppercase font-body mb-3">Fale Conosco</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Solicite seu orçamento
          </h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Preencha o formulário e nossa equipe entrará em contato com a melhor proposta para seu veículo. <strong className="text-foreground">É rápido e sem compromisso.</strong>
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-5 bg-card p-8 md:p-10 rounded-xl shadow-card border border-border"
        >
          {/* Progress indicator */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-body text-muted-foreground">Progresso do formulário</span>
              <span className="text-xs font-body text-secondary font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Nome *</label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Seu nome completo"
                className="font-body"
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Telefone *</label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="font-body"
                maxLength={20}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com (opcional)"
              className="font-body"
              maxLength={255}
            />
          </div>

          <div>
            <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Tipo de Veículo *</label>
            <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
              <SelectTrigger className="font-body">
                <SelectValue placeholder="Selecione o tipo de veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carro">🚗 Carro</SelectItem>
                <SelectItem value="moto">🏍️ Moto</SelectItem>
                <SelectItem value="caminhao">🚛 Caminhão</SelectItem>
                <SelectItem value="outro">📋 Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Mensagem</label>
            <Textarea
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              placeholder="Conte-nos sobre o que você precisa... (opcional)"
              rows={4}
              className="font-body resize-none"
              maxLength={1000}
            />
          </div>

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Solicitação Grátis"}
          </Button>

          {/* Trust signals below button */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-body text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-secondary" /> Dados protegidos</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-secondary" /> Resposta em 24h</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Sem compromisso</span>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactForm;
