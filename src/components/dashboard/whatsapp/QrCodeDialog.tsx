import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">QR Code — WhatsApp Exclusivo</DialogTitle>
          <DialogDescription className="font-body text-sm">
            Escaneie o QR Code abaixo para abrir a conversa com{" "}
            <strong>{conversation.leadName}</strong> diretamente no WhatsApp do atendente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <QRCodeSVG
              value={waLink}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#1a1a2e"
            />
          </div>

          {/* Contact info */}
          <div className="text-center space-y-1">
            <p className="font-body font-semibold text-sm text-foreground">{conversation.leadName}</p>
            <p className="font-body text-xs text-muted-foreground">{conversation.phone}</p>
            <p className="font-mono text-[11px] text-muted-foreground/70">{conversation.waId}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 gap-2 font-body text-xs"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado!" : "Copiar link"}
            </Button>
            <Button
              className="flex-1 gap-2 font-body text-xs"
              onClick={() => window.open(waLink, "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir WhatsApp
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground font-body text-center leading-relaxed max-w-[280px]">
            O atendente escaneia este QR Code com o celular para iniciar o atendimento exclusivo pelo WhatsApp pessoal, isolando o contato do sistema.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDialog;
