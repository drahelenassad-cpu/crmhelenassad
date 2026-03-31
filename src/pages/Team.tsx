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
import { Plus, User, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "user";
  position: string;
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

const positions = [
  { value: "", label: "Sem cargo" },
  { value: "assistente_juridico", label: "Assistente Jurídico" },
  { value: "pos_vendas", label: "Pós-vendas" },
  { value: "advogado", label: "Advogado" },
];

const positionLabels: Record<string, string> = {
  "": "—",
  assistente_juridico: "Assistente Jurídico",
  pos_vendas: "Pós-vendas",
  advogado: "Advogado",
};

const teamLabels: Record<string, string> = {
  "": "—",
  assistente_juridico: "Time Comercial",
  pos_vendas: "Time Jurídico",
  advogado: "Jurídico",
};

const positionColors: Record<string, string> = {
  "": "",
  assistente_juridico: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  pos_vendas: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  advogado: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const Team = () => {
  const { role: currentUserRole, user: currentUser } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user");
  const [invitePosition, setInvitePosition] = useState("");
  const [inviting, setInviting] = useState(false);
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newName, setNewName] = useState("");

  const fetchMembers = async () => {
    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, created_at, position").order("created_at", { ascending: true }),
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
      position: p.position || "",
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
    toast.success("Nível de acesso atualizado!");
    fetchMembers();
  };

  const handleChangePosition = async (userId: string, newPosition: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ position: newPosition } as any)
      .eq("id", userId);

    if (error) { toast.error("Erro ao alterar cargo"); return; }
    toast.success("Cargo atualizado!");
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

    toast.success(`Convite enviado para ${inviteEmail}!`);
    setInviteEmail("");
    setInviteRole("user");
    setInvitePosition("");
    setDialogOpen(false);
    setTimeout(fetchMembers, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground text-sm">Gerencie os membros, cargos e níveis de acesso</p>
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
                  <Label>Nível de Acesso</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "user")}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Admin: acesso total. Usuário: cria e edita, sem deletar.</p>
                </div>
                <div className="space-y-2">
                  <Label>Cargo na Equipe</Label>
                  <Select value={invitePosition} onValueChange={setInvitePosition}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.filter(p => p.value).map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
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
                <TableHead className="text-muted-foreground">Cargo</TableHead>
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Acesso</TableHead>
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
                        value={m.position || "none"}
                        onValueChange={(v) => handleChangePosition(m.id, v === "none" ? "" : v)}
                      >
                        <SelectTrigger className={`w-40 h-7 text-[11px] border ${m.position ? positionColors[m.position] : "border-border text-muted-foreground"}`}>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem cargo</SelectItem>
                          {positions.filter(p => p.value).map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={`text-[10px] ${positionColors[m.position] || ""}`}>
                        {positionLabels[m.position] || "—"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {teamLabels[m.position] || "—"}
                    </span>
                  </TableCell>
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
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Cargos disponíveis:</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              {positions.filter(p => p.value).map(p => (
                <Badge key={p.value} variant="outline" className={`text-[10px] ${positionColors[p.value]}`}>
                  {p.label} — {teamLabels[p.value]}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong className="text-foreground">Níveis de acesso:</strong> Admin (acesso total) · Usuário (cria e edita, sem deletar ou gerenciar equipe).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;
