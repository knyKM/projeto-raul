import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "alert" | "info" | "success";
}

const mockNotifications: Notification[] = [
  { id: "1", title: "CPL acima da meta", message: "Google Ads atingiu CPL de R$114 (meta: R$80)", time: "5 min", read: false, type: "alert" },
  { id: "2", title: "Novo lead captado", message: "Lead via Meta Ads — Consórcio Auto Premium", time: "12 min", read: false, type: "info" },
  { id: "3", title: "ROAS excelente!", message: "Meta Ads atingiu ROAS de 5.05x esta semana", time: "1h", read: false, type: "success" },
  { id: "4", title: "Campanha pausada", message: "Consórcio Moto - Stories foi pausada automaticamente", time: "2h", read: true, type: "alert" },
  { id: "5", title: "Meta batida!", message: "Você atingiu 200 leads esta semana 🎉", time: "3h", read: true, type: "success" },
];

const typeStyles: Record<string, string> = {
  alert: "bg-destructive/10 border-destructive/20",
  info: "bg-primary/10 border-primary/20",
  success: "bg-emerald-500/10 border-emerald-500/20",
};

const typeDot: Record<string, string> = {
  alert: "bg-destructive",
  info: "bg-primary",
  success: "bg-emerald-500",
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h4 className="font-display text-sm font-semibold text-foreground">Notificações</h4>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline font-body">
              Marcar todas como lidas
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 border-b border-border last:border-0 ${!n.read ? "bg-muted/50" : ""}`}
            >
              <div className="flex items-start gap-2">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${typeDot[n.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground font-body">{n.title}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 font-body mt-1">{n.time} atrás</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
