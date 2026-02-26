import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const mockNotifications = [
  { id: 1, type: "critical", message: "Caso #042 — Prazo de 48h expirado!", time: "5 min atrás", read: false },
  { id: 2, type: "warning", message: "Caso #038 — 40h desde assinatura do contrato", time: "1h atrás", read: false },
  { id: 3, type: "success", message: "Caso #035 — Deferido pelo INSS!", time: "3h atrás", read: true },
  { id: 4, type: "info", message: "Novo lead cadastrado: Maria Silva", time: "5h atrás", read: true },
];

const typeColors: Record<string, string> = {
  critical: "bg-destructive",
  warning: "bg-critical",
  success: "bg-success",
  info: "bg-primary",
};

export function NotificationBell() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-card border-border" align="end">
        <div className="p-3 border-b border-border">
          <h3 className="font-serif font-semibold text-sm">Notificações</h3>
        </div>
        <div className="max-h-80 overflow-auto">
          {mockNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 border-b border-border hover:bg-accent/50 cursor-pointer flex gap-3 items-start ${!n.read ? "bg-accent/30" : ""}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[n.type]}`} />
              <div className="min-w-0">
                <p className="text-sm leading-tight">{n.message}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary">
            Marcar todas como lidas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
