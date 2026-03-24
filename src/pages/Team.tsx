import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  user: "Usuário",
};

const roleColors: Record<string, string> = {
  admin: "bg-primary/20 text-primary",
  user: "bg-muted text-muted-foreground",
};

const Team = () => {
  const { role: currentUserRole } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user");
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: true }),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    if (error) {
      toast.error("Erro ao carregar equipe");
      setLoading(false);
      return;
    }

    const rolesMap: Record<string, "admin" | "user"> = {};
    (roles ?? []).forEach((r: any) => { rolesMap[r.user_id] = r.role; });

    const mapped: TeamMember[] = (profiles ?? []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name || "(sem nome)",
      email: p.email || "",
      role: rolesMap[p.id] ?? "user",
      created_at: p.created_at,
    }));

    setMembers(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleChangeRole = async (userId: string, newRole: "admin" | "user") => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) { toast.error("Erro ao alterar função"); return; }
    toast.success("Função atualizada!");
    fetchMembers();
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast.error("Informe o e-mail"); return; }
    setInviting(true);

    const tempPassword = Math.random().toString(36).slice(-8) + "A1!";

    const { error } = await supabase.auth.signUp({
      email: inviteEmail.trim(),
      password: tempPassword,
      options: {
        data: { full_name: "" },
        emailRedirectTo: window.location.origin + "/reset-password",
      },
    });

    setInviting(false);

    if (error) { toast.error(error.message); return; }

    toast.success(`Convite enviado para ${inviteEmail}! O usuário receberá um e-mail para confirmar o acesso.`);
    setInviteEmail("");
    setInviteRole("user");
    setDialogOpen(false);
    setTimeout(fetchMembers, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Equipe</h1>
          <p className="text-muted-foreground text-sm">Usuários com acesso ao sistema</p>
        </div>
        {currentUserRole === "admin" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-1" /> Convidar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">Convidar Membro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Função</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "user")}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  O membro receberá um e-mail para confirmar o acesso e criar sua senha.
                </p>
                <Button
                  className="w-full gold-gradient text-primary-foreground hover:opacity-90"
                  onClick={handleInvite}
                  disabled={inviting}
                >
                  {inviting ? "Enviando convite..." : "Enviar Convite"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="bg-card border-border overflow-hidden">
        {loading ? (
          <CardContent className="p-8 text-center text-muted-foreground">Carregando...</CardContent>
        ) : members.length === 0 ? (
          <CardContent className="p-8 text-center text-muted-foreground">Nenhum membro encontrado.</CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Membro</TableHead>
                <TableHead className="text-muted-foreground">E-mail</TableHead>
                <TableHead className="text-muted-foreground">Função</TableHead>
                <TableHead className="text-muted-foreground">Desde</TableHead>
                {currentUserRole === "admin" && (
                  <TableHead className="text-muted-foreground w-16">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id} className="border-border hover:bg-accent/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{m.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                  <TableCell>
                    {currentUserRole === "admin" ? (
                      <Select
                        value={m.role}
                        onValueChange={(v) => handleChangeRole(m.id, v as "admin" | "user")}
                      >
                        <SelectTrigger className={`w-28 h-7 text-[11px] border-0 ${roleColors[m.role]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`text-[10px] ${roleColors[m.role]}`}>
                        {roleLabels[m.role]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  {currentUserRole === "admin" && (
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Como funciona:</strong> o primeiro usuário cadastrado vira Admin automaticamente. Os demais entram como Usuário e podem ter a função alterada pelo Admin nesta tela.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;
