import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PhoneOutgoing, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface MailingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadCount: number;
}

const MailingDialog = ({ open, onOpenChange, leadCount }: MailingDialogProps) => {
  const { toast } = useToast();
  const [apiToken, setApiToken] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [listName, setListName] = useState(`Mailing ${new Date().toLocaleDateString("pt-BR")}`);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async () => {
    if (!apiToken || !campaignId || !listName) {
      toast({
        title: "Preencha todos os campos",
        description: "Token, ID da campanha e nome da lista são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    setResult(null);

    const res = await api.post<{ success: boolean; leadsExported: number }>("/mailing/3cplus", {
      apiToken,
      campaignId,
      listName,
    });

    setSending(false);

    if (res.ok && res.data?.success) {
      setResult({
        success: true,
        message: `✅ ${res.data.leadsExported} leads enviados com sucesso para a campanha ${campaignId}!`,
      });
      toast({ title: "Mailing enviado!", description: `${res.data.leadsExported} leads exportados para o 3CPlus.` });
    } else {
      setResult({
        success: false,
        message: res.error || "Erro ao enviar mailing para o 3CPlus.",
      });
      toast({ title: "Erro ao enviar", description: res.error, variant: "destructive" });
    }
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <PhoneOutgoing className="w-5 h-5 text-primary" />
            Montar Mailing — 3CPlus
          </DialogTitle>
          <DialogDescription className="font-body">
            Envie {leadCount} lead{leadCount !== 1 ? "s" : ""} diretamente para o discador 3CPlus.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col items-center gap-3 py-6">
            {result.success ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            ) : (
              <AlertCircle className="w-12 h-12 text-destructive" />
            )}
            <p className="text-sm font-body text-center text-foreground">{result.message}</p>
            <Button variant="outline" onClick={handleClose} className="mt-2 font-body">
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiToken" className="font-body text-sm">
                  Token da API (manager_token)
                </Label>
                <Input
                  id="apiToken"
                  type="password"
                  placeholder="Cole o token do 3CPlus aqui"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignId" className="font-body text-sm">
                  ID da Campanha
                </Label>
                <Input
                  id="campaignId"
                  type="text"
                  placeholder="Ex: 1"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="listName" className="font-body text-sm">
                  Nome da Lista
                </Label>
                <Input
                  id="listName"
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="font-body"
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleClose} className="font-body">
                Cancelar
              </Button>
              <Button onClick={handleSend} disabled={sending} className="gap-2 font-body">
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <PhoneOutgoing className="w-4 h-4" />
                    Enviar Mailing
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MailingDialog;
