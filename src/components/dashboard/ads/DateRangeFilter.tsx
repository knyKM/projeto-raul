import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  value: string;
  onChange: (v: string) => void;
}

const ranges = [
  { label: "7 dias", value: "7d" },
  { label: "15 dias", value: "15d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
];

const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => (
  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
    {ranges.map((r) => (
      <Button
        key={r.value}
        variant="ghost"
        size="sm"
        onClick={() => onChange(r.value)}
        className={cn(
          "h-7 px-3 text-xs font-body rounded-md transition-all",
          value === r.value
            ? "bg-card text-foreground shadow-sm font-medium"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {r.label}
      </Button>
    ))}
  </div>
);

export default DateRangeFilter;
