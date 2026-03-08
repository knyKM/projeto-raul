import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check, Smartphone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { WaConversation } from "@/pages/production/DashboardWhatsApp";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: WaConversation;
}

const QrCodeDialog = ({ open, onOpenChange, conversation }: Props) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const waLink = `https://wa.me/${conversation.waId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(waLink);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Golden header */}
        <div className="bg-gradient-to-br from-secondary/15 to-secondary/5 px-6 pt-6 pb-4 border-b border-secondary/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">Atendimento Exclusivo</DialogTitle>
              <DialogDescription className="font-body text-xs mt-0.5">
                Escaneie para atender <strong>{conversation.leadName}</strong>
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 px-6 py-5">
          {/* QR Code with decorative frame */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-secondary/10 to-transparent" />
            <div className="relative bg-card p-4 rounded-2xl border border-border shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(waLink)}&color=1a1a2e`}
                alt="QR Code"
                width={180}
                height={180}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Contact pill */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-2 border border-border/50">
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center text-[9px] font-display font-bold text-secondary">
              {conversation.leadName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-body font-semibold text-xs text-foreground">{conversation.leadName}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{conversation.phone}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 gap-2 font-body text-xs rounded-xl h-9"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado!" : "Copiar link"}
            </Button>
            <Button
              className="flex-1 gap-2 font-body text-xs rounded-xl h-9 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => window.open(waLink, "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir WhatsApp
            </Button>
          </div>

          <p className="text-[9px] text-muted-foreground/60 font-body text-center leading-relaxed">
            O atendente escaneia com o celular para isolar o contato no WhatsApp pessoal
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDialog;
