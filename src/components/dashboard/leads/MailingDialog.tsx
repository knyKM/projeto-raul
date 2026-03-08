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
import { PhoneOutgoing, Download } from "lucide-react";
import { api } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: number;
  nome: string;
  telefone: string;
}

interface MailingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
}

const MailingDialog = ({ open, onOpenChange, leads }: MailingDialogProps) => {
  const { toast } = useToast();
  const [listName, setListName] = useState(`Mailing ${new Date().toLocaleDateString("pt-BR")}`);

  const handleDownload = () => {
    if (leads.length === 0) {
      toast({ title: "Nenhum lead disponível", variant: "destructive" });
      return;
    }

    const csvLines: string[] = [];
    csvLines.push('"identifier","Nome","","areacodephone","","areacode","","phone","","areacodephone"');

    for (const lead of leads) {
      const phone = (lead.telefone || "").replace(/\D/g, "");
      const areaCode = phone.length >= 10 ? phone.substring(0, 2) : "";
      const phoneNumber = phone.length >= 10 ? phone.substring(2) : phone;

      csvLines.push(
        [
          `"${lead.id}"`,
          `"${(lead.nome || "").replace(/"/g, '""')}"`,
          '""',
          `"${phone}"`,
          '""',
          `"${areaCode}"`,
          '""',
          `"${phoneNumber}"`,
          '""',
          `"${phone}"`,
        ].join(",")
      );
    }

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${listName.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Mailing baixado!", description: `${leads.length} leads exportados.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <PhoneOutgoing className="w-5 h-5 text-primary" />
            Montar Mailing — 3CPlus
          </DialogTitle>
          <DialogDescription className="font-body">
            Baixe o CSV com {leads.length} lead{leads.length !== 1 ? "s" : ""} no formato do 3CPlus para importar manualmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listName" className="font-body text-sm">
              Nome do arquivo
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-body">
            Cancelar
          </Button>
          <Button onClick={handleDownload} className="gap-2 font-body">
            <Download className="w-4 h-4" />
            Baixar CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MailingDialog;
