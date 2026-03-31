import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: "lead" | "client" | "inactive";
  pipeline_stage: string;
  notes: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  lead: "Lead",
  client: "Cliente",
  inactive: "Inativo",
};

const statusColors: Record<string, string> = {
  lead: "bg-primary/20 text-primary",
  client: "bg-success/20 text-success",
  inactive: "bg-muted text-muted-foreground",
};

const emptyContact = { name: "", phone: "", email: "", status: "lead" as "lead" | "client" | "inactive", notes: "" };

const Contacts = () => {
  const { user, role } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState(emptyContact);

  const fetchContacts = useCallback(async () => {
    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Erro ao carregar contatos"); return; }
    setContacts((data as unknown as Contact[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useRealtimeTable("contacts", fetchContacts);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (editingContact) {
      const { error } = await supabase.from("contacts").update({
        name: form.name, phone: form.phone, email: form.email,
        status: form.status as any, notes: form.notes,
      }).eq("id", editingContact.id);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Contato atualizado!");
    } else {
      const { error } = await supabase.from("contacts").insert({
        name: form.name, phone: form.phone, email: form.email,
        status: form.status as any, notes: form.notes,
        created_by: user!.id,
      } as any);
      if (error) { toast.error("Erro ao criar contato"); return; }
      toast.success("Contato criado!");
    }
    setDialogOpen(false);
    setEditingContact(null);
    setForm(emptyContact);
    fetchContacts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Contato excluído!");
    fetchContacts();
  };

  const openEdit = (c: Contact) => {
    setEditingContact(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, status: c.status, notes: c.notes });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingContact(null);
    setForm(emptyContact);
    setDialogOpen(true);
  };

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Contatos</h1>
          <p className="text-muted-foreground text-sm">Gerencie leads e clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1" /> Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">{editingContact ? "Editar Contato" : "Novo Contato"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-secondary border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-secondary border-border" />
              </div>
              <Button className="w-full gold-gradient text-primary-foreground hover:opacity-90" onClick={handleSave}>
                {editingContact ? "Salvar Alterações" : "Criar Contato"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        {loading ? (
          <CardContent className="p-8 text-center text-muted-foreground">Carregando...</CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-3">Nenhum contato encontrado.</p>
            <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1" /> Criar primeiro contato
            </Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Nome</TableHead>
                <TableHead className="text-muted-foreground">Telefone</TableHead>
                <TableHead className="text-muted-foreground">E-mail</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="text-muted-foreground w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="border-border hover:bg-accent/30">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${statusColors[c.status]}`}>{statusLabels[c.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {role === "admin" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
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

export default Contacts;
