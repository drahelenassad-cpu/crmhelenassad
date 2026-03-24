import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

type Notification = {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  time: string;
};

const STORAGE_KEY = "crm_read_notifications";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

const typeColors: Record<string, string> = {
  critical: "bg-destructive",
  warning: "bg-orange-500",
  info: "bg-primary",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);

  useEffect(() => {
    const load = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const in5days = new Date(today.getTime() + 5 * 86400000).toISOString().split("T")[0];
      const todayStr = today.toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      const [{ data: deadlines }, { data: leads }] = await Promise.all([
        supabase
          .from("deadlines" as any)
          .select("id, case_number, client_name, due_date")
          .eq("completed", false)
          .lte("due_date", in5days),
        supabase
          .from("contacts")
          .select("id, name, created_at")
          .eq("status", "lead" as any)
          .gte("created_at", yesterday),
      ]);

      const result: Notification[] = [];

      for (const d of (deadlines as any[]) ?? []) {
        const days = Math.ceil(
          (new Date(d.due_date).getTime() - today.getTime()) / 86400000
        );
        const label = d.case_number ? `Caso ${d.case_number}` : d.client_name;
        if (days < 0) {
          result.push({
            id: `dl-${d.id}`,
            type: "critical",
            message: `${label} — prazo VENCIDO há ${Math.abs(days)} dia(s)`,
            time: d.due_date,
          });
        } else if (days <= 1) {
          result.push({
            id: `dl-${d.id}`,
            type: "critical",
            message: `${label} — prazo crítico: vence ${days === 0 ? "hoje" : "amanhã"}`,
            time: d.due_date,
          });
        } else {
          result.push({
            id: `dl-${d.id}`,
            type: "warning",
            message: `${label} — prazo em ${days} dias (${new Date(d.due_date + "T12:00:00").toLocaleDateString("pt-BR")})`,
            time: d.due_date,
          });
        }
      }

      for (const l of (leads as any[]) ?? []) {
        result.push({
          id: `lead-${l.id}`,
          type: "info",
          message: `Novo lead cadastrado: ${l.name}`,
          time: l.created_at,
        });
      }

      // Sort: critical first, then warning, then info
      const order = { critical: 0, warning: 1, info: 2 };
      result.sort((a, b) => order[a.type] - order[b.type]);

      setNotifications(result);
    };

    load();
  }, []);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllRead = () => {
    const all = new Set(notifications.map((n) => n.id));
    setReadIds(all);
    saveReadIds(all);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-card border-border" align="end">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="font-serif font-semibold text-sm">Notificações</h3>
          {notifications.length > 0 && (
            <span className="text-[11px] text-muted-foreground">{unreadCount} não lida(s)</span>
          )}
        </div>
        <div className="max-h-80 overflow-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Nenhuma notificação.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b border-border hover:bg-accent/50 cursor-default flex gap-3 items-start ${!readIds.has(n.id) ? "bg-accent/30" : ""}`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[n.type]}`} />
                <div className="min-w-0">
                  <p className="text-sm leading-tight">{n.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(n.time)}</p>
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-primary hover:text-primary"
              onClick={markAllRead}
            >
              Marcar todas como lidas
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
