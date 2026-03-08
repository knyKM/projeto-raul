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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  status: string;
  created_at: string;
}

interface RemarketingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
}

type ExportFormat = 'meta' | 'google' | 'csv';

const RemarketingDialog = ({ open, onOpenChange, leads }: RemarketingDialogProps) => {
  const { toast } = useToast();
  const [daysThreshold, setDaysThreshold] = useState(7);
  const [format, setFormat] = useState<ExportFormat>('meta');
  const [statusFilter, setStatusFilter] = useState<string>('all_cold');

  const getFilteredLeads = () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysThreshold);

    return leads.filter((lead) => {
      const isOld = new Date(lead.created_at) < cutoff;

      if (statusFilter === 'all_cold') {
        // Not closed/won
        return isOld && !['fechado', 'concluido'].includes(lead.status);
      }
      if (statusFilter === 'perdido') return lead.status === 'perdido';
      if (statusFilter === 'novo') return isOld && lead.status === 'novo';
      return isOld;
    });
  };

  const filteredLeads = getFilteredLeads();

  const handleExport = () => {
    if (filteredLeads.length === 0) {
      toast({ title: "Nenhum lead encontrado com esses filtros", variant: "destructive" });
      return;
    }

    let csvContent = '';
    const fileName = `remarketing_${format}_${new Date().toISOString().split('T')[0]}.csv`;

    if (format === 'meta') {
      // Meta Ads Custom Audience format: email, phone, fn (first name)
      csvContent = 'email,phone,fn\n';
      for (const lead of filteredLeads) {
        const phone = lead.telefone.replace(/\D/g, '');
        const firstName = lead.nome.split(' ')[0] || '';
        csvContent += `${lead.email || ''},${phone},${firstName}\n`;
      }
    } else if (format === 'google') {
      // Google Ads Customer Match: Email, Phone, First Name, Last Name
      csvContent = 'Email,Phone,First Name,Last Name\n';
      for (const lead of filteredLeads) {
        const phone = '+55' + lead.telefone.replace(/\D/g, '');
        const parts = lead.nome.split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        csvContent += `${lead.email || ''},${phone},${firstName},${lastName}\n`;
      }
    } else {
      // Generic CSV
      csvContent = 'id,nome,telefone,email,status,data_criacao\n';
      for (const lead of filteredLeads) {
        csvContent += `${lead.id},"${lead.nome}","${lead.telefone}","${lead.email || ''}","${lead.status}","${lead.created_at}"\n`;
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: `${filteredLeads.length} leads exportados!`, description: `Formato: ${format.toUpperCase()}` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Target className="w-5 h-5 text-primary" />
            Exportar Remarketing
          </DialogTitle>
          <DialogDescription className="font-body">
            Exporte leads frios para criar audiências customizadas no Meta ou Google Ads.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-sm">Filtro de status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="font-body text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_cold">Todos os frios (não fechados)</SelectItem>
                <SelectItem value="novo">Nunca contatados</SelectItem>
                <SelectItem value="perdido">Marcados como perdidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">Leads sem atividade há mais de</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={daysThreshold}
                onChange={(e) => setDaysThreshold(Number(e.target.value))}
                className="w-20 font-body"
                min={1}
              />
              <span className="text-sm font-body text-muted-foreground">dias</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">Formato de exportação</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectTrigger className="font-body text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meta">Meta Ads (Custom Audience)</SelectItem>
                <SelectItem value="google">Google Ads (Customer Match)</SelectItem>
                <SelectItem value="csv">CSV genérico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted rounded-lg px-3 py-2">
            <p className="text-sm font-body text-foreground font-semibold">{filteredLeads.length} leads</p>
            <p className="text-xs font-body text-muted-foreground">serão exportados com os filtros atuais</p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-body">Cancelar</Button>
          <Button onClick={handleExport} className="gap-2 font-body">
            <Download className="w-4 h-4" />
            Exportar {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemarketingDialog;
