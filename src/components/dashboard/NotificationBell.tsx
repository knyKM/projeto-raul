import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/apiClient";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "alert" | "info" | "success";
  read: boolean;
  created_at: string;
}

const typeDot: Record<string, string> = {
  alert: "bg-destructive",
  info: "bg-primary",
  success: "bg-emerald-500",
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const res = await api.get<Notification[]>('/notifications');
    if (res.ok && res.data) {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.read).length);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

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
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground font-body">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b border-border last:border-0 ${!n.read ? "bg-muted/50" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${typeDot[n.type] || typeDot.info}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground font-body">{n.title}</p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-body mt-1">{formatTime(n.created_at)} atrás</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
