import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip = ({ text }: InfoTooltipProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help shrink-0" />
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-xs font-body">
      {text}
    </TooltipContent>
  </Tooltip>
);

export default InfoTooltip;
