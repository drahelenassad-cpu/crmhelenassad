import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Deadline = { id: string; case_number: string; client_name: string; lawyer_name: string; deadline_type: string; due_date: string; completed: boolean };

const getUrgency = (due: string, done: boolean) => {
  if (done) return { label: "Concluído", color: "bg-muted text-muted-foreground", row: "" };
  const days = Math.ceil((new Date(due).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
  if (days < 0) return { label: "Vencido", color: "bg-destructive/20 text-destructive", row: "border-l-4 border-l-destructive" };
  if (days <= 1) return { label: "Crítico", color: "bg-critical/20 text-critical", row: "border-l-4 border-l-orange-500" };
  if (days <= 5) return { label: "Atenção", color: "bg-warning/20 text-warning", row: "border-l-4 border-l-yellow-500" };
  return { label: "No Prazo", color: "bg-success/20 text-success", row: "" };
};

const empty = { case_number: "", client_name: "", lawyer_name: "", deadline_type: "", due_date: "" };

const Deadlines = () => {
  const { user, role } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Deadline | null>(null);
  const [form, setForm] = useState(empty);

  const fetch = async () => {
    const { data, error } = await supabase.from("deadlines" as any).select("*").order("due_date", { ascending: true });
    if (error) { toast.error("Erro ao carregar prazos"); return; }
    setDeadlines((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.client_name.trim() || !form.due_date) { toast.error("Cliente e data são obrigatórios"); return; }
    const err = editing
      ? (await supabase.from("deadlines" as any).update(form).eq("id", editing.id)).error
      : (await supabase.from("deadlines" as any).insert({ ...form, created_by: user!.id })).error;
    if (err) { toast.error("Erro ao salvar prazo"); return; }
    toast.success(editing ? "Prazo atualizado!" : "Prazo criado!");
    setDialogOpen(false); setEditing(null); setForm(empty); fetch();
  };

  const handleToggle = async (d: Deadline) => {
    await supabase.from("deadlines" as any).update({ completed: !d.completed }).eq("id", d.id);
    toast.success(d.completed ? "Prazo reaberto!" : "Concluído!"); fetch();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("deadlines" as any).delete().eq("id", id);
    toast.success("Prazo excluído!"); fetch();
  };

  const filtered = deadlines.filter((d) => {
    const match = d.client_name.toLowerCase().includes(search.toLowerCase()) || d.case_number.toLowerCase().includes(search.toLowerCase());
    const { label } = getUrgency(d.due_date, d.completed);
    const matchStatus = filterStatus === "all" || (filterStatus === "completed" ? d.completed : label === filterStatus);
    return match && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl font-bold">Painel de Prazos</h1><p className="text-muted-foreground text-sm">Controle centralizado de todos os prazos</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90" onClick={() => { setEditing(null); setForm(empty); }}>
              <Plus className="w-4 h-4 mr-1" /> Novo Prazo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">{editing ? "Editar Prazo" : "Novo Prazo"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Nº do Caso</Label><Input value={form.case_number} onChange={(e) => setForm({ ...form, case_number: e.target.value })} className="bg-secondary border-border" placeholder="#001" /></div>
                <div className="space-y-2"><Label>Cliente *</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="bg-secondary border-border" /></div>
              </div>
              <div className="space-y-2"><Label>Advogado</Label><Input value={form.lawyer_name} onChange={(e) => setForm({ ...form, lawyer_name: e.target.value })} className="bg-secondary border-border" /></div>
              <div className="space-y-2"><Label>Tipo de Prazo</Label><Input value={form.deadline_type} onChange={(e) => setForm({ ...form, deadline_type: e.target.value })} className="bg-secondary border-border" placeholder="Ex: Protocolar Petição" /></div>
              <div className="space-y-2"><Label>Data de Vencimento *</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-secondary border-border" /></div>
              <Button className="w-full gold-gradient text-primary-foreground hover:opacity-90" onClick={handleSave}>{editing ? "Salvar Alterações" : "Criar Prazo"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar caso ou cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44 bg-secondary border-border"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem><SelectItem value="Vencido">Vencido</SelectItem>
              <SelectItem value="Crítico">Crítico</SelectItem><SelectItem value="Atenção">Atenção</SelectItem>
              <SelectItem value="No Prazo">No Prazo</SelectItem><SelectItem value="completed">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        {loading ? <CardContent className="p-8 text-center text-muted-foreground">Carregando...</CardContent>
          : filtered.length === 0 ? (
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-3">Nenhum prazo encontrado.</p>
              <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90" onClick={() => { setEditing(null); setForm(empty); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Criar primeiro prazo</Button>
            </CardContent>
          ) : (
            <Table>
              <TableHeader><TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Caso</TableHead><TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Advogado</TableHead><TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Vencimento</TableHead><TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground w-24">Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((d) => {
                  const urg = getUrgency(d.due_date, d.completed);
                  return (
                    <TableRow key={d.id} className={`border-border hover:bg-accent/30 ${urg.row}`}>
                      <TableCell className="font-mono text-primary font-medium">{d.case_number || "—"}</TableCell>
                      <TableCell className="font-medium">{d.client_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.lawyer_name || "—"}</TableCell>
                      <TableCell className="text-sm">{d.deadline_type}</TableCell>
                      <TableCell className="text-sm">{new Date(d.due_date + "T12:00:00").toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${urg.color}`}>{urg.label}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className={`h-7 w-7 ${d.completed ? "text-success" : "text-muted-foreground"}`} onClick={() => handleToggle(d)} title={d.completed ? "Reabrir" : "Concluir"}><CheckCircle2 className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(d); setForm({ case_number: d.case_number, client_name: d.client_name, lawyer_name: d.lawyer_name, deadline_type: d.deadline_type, due_date: d.due_date }); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                          {role === "admin" && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(d.id)}><Trash2 className="w-3.5 h-3.5" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
      </Card>
    </div>
  );
};

export default Deadlines;
