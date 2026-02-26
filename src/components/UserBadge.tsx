import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function UserBadge() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium leading-tight">Dra. Helen Assad</p>
        <Badge variant="outline" className="text-[10px] h-4 border-primary text-primary px-1.5">
          Admin
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/login")}
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
