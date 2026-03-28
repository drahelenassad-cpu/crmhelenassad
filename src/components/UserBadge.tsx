import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function UserBadge() {
  const { profile, role, signOut } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium leading-tight text-foreground">{profile?.full_name || "Usuário"}</p>
        <Badge variant="outline" className="text-[10px] h-4 border-primary text-primary px-1.5">
          {role === "admin" ? "Admin" : "Usuário"}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        onClick={signOut}
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
