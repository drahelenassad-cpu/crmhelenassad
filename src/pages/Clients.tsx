import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, User, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Client = { id: string; name: string; cpf: string; date_of_birth: string | null; phone: string; email: string; notes: string; created_at: string };
const empty = { name: "", cpf: "", date_of_birth: "", phone: "", email: "", notes: "" };

const Clients = () => {
  const { user, role } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(empty);

  const fetch = async () => {
    const { data, error } = await supabase.from("contacts").select("id, name, cpf, date_of_birth, phone, email, notes, created_at").eq("status", "client" as any).order("created_at", { ascending: false });
    if (error) { toast.error("Erro ao carregar clientes"); return; }
    setClients((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    const payload: any = { name: form.name, cpf: form.cpf, phone: form.phone, email: form.email, notes: form.notes, date_of_birth: form.date_of_birth || null, status: "client" };
    const err = editing
      ? (await supabase.from("contacts").update(payload).eq("id", editing.id)).error
      : (await supabase.from("contacts").insert({ ...payload, created_by: user!.id })).error;
    if (err) { toast.error("Erro ao salvar cliente"); return; }
    toast.success(editing ? "Cliente atualizado!" : "Cliente criado!");
    setDialogOpen(false); setEditing(null); setForm(empty); fetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Cliente excluído!"); fetch();
  };

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.cpf || "").includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl font-bold text-foreground">Clientes</h1><p className="text-muted-foreground text-sm">Base de dados de clientes ativos</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90" onClick={() => { setEditing(null); setForm(empty); }}>
              <Plus className="w-4 h-4 mr-1" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>CPF</Label><Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className="bg-secondary border-border" placeholder="000.000.000-00" /></div>
                <div className="space-y-2"><Label>Nascimento</Label><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="bg-secondary border-border" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-secondary border-border" /></div>
                <div className="space-y-2"><Label>E-mail</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-secondary border-border" /></div>
              </div>
              <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-secondary border-border" /></div>
              <Button className="w-full gold-gradient text-primary-foreground hover:opacity-90" onClick={handleSave}>{editing ? "Salvar Alterações" : "Criar Cliente"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        {loading ? <CardContent className="p-8 text-center text-muted-foreground">Carregando...</CardContent>
          : filtered.length === 0 ? (
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-3">Nenhum cliente encontrado.</p>
              <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90" onClick={() => { setEditing(null); setForm(empty); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Criar primeiro cliente</Button>
            </CardContent>
          ) : (
            <Table>
              <TableHeader><TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Cliente</TableHead><TableHead className="text-muted-foreground">CPF</TableHead>
                <TableHead className="text-muted-foreground">Nascimento</TableHead><TableHead className="text-muted-foreground">Telefone</TableHead>
                <TableHead className="text-muted-foreground">E-mail</TableHead><TableHead className="text-muted-foreground w-20">Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="border-border hover:bg-accent/30">
                    <TableCell><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div><span className="font-medium">{c.name}</span></div></TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{c.cpf || "—"}</TableCell>
                    <TableCell className="text-sm">{c.date_of_birth ? new Date(c.date_of_birth + "T12:00:00").toLocaleDateString("pt-BR") : "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.phone || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.email || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(c); setForm({ name: c.name, cpf: c.cpf || "", date_of_birth: c.date_of_birth || "", phone: c.phone || "", email: c.email || "", notes: c.notes || "" }); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                        {role === "admin" && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </Card>
    </div>
  );
};

export default Clients;
