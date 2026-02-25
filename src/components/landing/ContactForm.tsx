import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo: "",
    mensagem: "",
  });

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
        <div className="text-center mb-12">
          <p className="text-secondary text-sm tracking-[0.2em] uppercase font-body mb-3">Fale Conosco</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Solicite seu orçamento
          </h2>
          <p className="font-body text-muted-foreground">
            Preencha o formulário abaixo e nossa equipe entrará em contato com a melhor proposta para você.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 md:p-10 rounded-xl shadow-card border border-border">
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
              placeholder="seu@email.com"
              className="font-body"
              maxLength={255}
            />
          </div>

          <div>
            <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Tipo de Consórcio *</label>
            <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
              <SelectTrigger className="font-body">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imovel">Imóvel</SelectItem>
                <SelectItem value="veiculo">Veículo</SelectItem>
                <SelectItem value="servico">Serviço</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Mensagem</label>
            <Textarea
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              placeholder="Conte-nos sobre o que você precisa..."
              rows={4}
              className="font-body resize-none"
              maxLength={1000}
            />
          </div>

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
