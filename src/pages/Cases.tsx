import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Case = { id: string; case_number: string; client_name: string; case_type: string; lawyer_name: string; stage: string; urgency: string; notes: string; created_at: string };

const stageLabels: Record<string, string> = {
  contract_signed: "Contrato Assinado", document_collection: "Coleta de Documentos",
  petition_filed: "Petição Protocolada", inss_analysis: "Em Análise INSS",
  medical_exam: "Perícia Agendada", awaiting_decision: "Aguardando Decisão",
  approved: "Deferido ✅", denied: "Indeferido ❌",
};

const stageColors: Record<string, string> = {
  contract_signed: "bg-primary/20 text-primary", document_collection: "bg-warning/20 text-warning",
  petition_filed: "bg-success/20 text-success", inss_analysis: "bg-muted text-muted-foreground",
  medical_exam: "bg-critical/20 text-critical", awaiting_decision: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success", denied: "bg-destructive/20 text-destructive",
};

const urgencyLabels: Record<string, string> = { green: "No Prazo", yellow: "Atenção", orange: "Crítico", red: "Escalado" };
const urgencyColors: Record<string, string> = { green: "bg-success/20 text-success", yellow: "bg-warning/20 text-warning", orange: "bg-critical/20 text-critical", red: "bg-destructive/20 text-destructive" };

const empty = { client_name: "", case_type: "", lawyer_name: "", stage: "contract_signed", urgency: "green", notes: "", valor_previsto: "" };

type TeamMember = { id: string; full_name: string; email: string | null };

const Cases = () => {
  const { user, role } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Case | null>(null);
  const [form, setForm] = useState(empty);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [responsibleSearch, setResponsibleSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetch = async () => {
    const { data, error } = await supabase.from("cases" as any).select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Erro ao carregar casos"); return; }
    setCases((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    const loadTeam = async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email");
      setTeamMembers((data as TeamMember[]) ?? []);
    };
    loadTeam();
  }, []);

  const handleSave = async () => {
    if (!form.client_name.trim()) { toast.error("Nome do cliente é obrigatório"); return; }
    const err = editing
      ? (await supabase.from("cases" as any).update(form).eq("id", editing.id)).error
      : (await supabase.from("cases" as any).insert({ ...form, created_by: user!.id })).error;
    if (err) { toast.error("Erro ao salvar caso"); return; }
    toast.success(editing ? "Caso atualizado!" : "Caso criado!");
    setDialogOpen(false); setEditing(null); setForm(empty); fetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cases" as any).delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Caso excluído!"); fetch();
  };

  const filtered = cases.filter((c) =>
    (c.client_name.toLowerCase().includes(search.toLowerCase()) || c.case_number.toLowerCase().includes(search.toLowerCase())) &&
    (filterUrgency === "all" || c.urgency === filterUrgency)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl font-bold">Casos</h1><p className="text-muted-foreground text-sm">Gestão de processos previdenciários</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90" onClick={() => { setEditing(null); setForm(empty); }}>
              <Plus className="w-4 h-4 mr-1" /> Novo Caso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">{editing ? "Editar Caso" : "Novo Caso"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Cliente *</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="bg-secondary border-border" /></div>
              <div className="space-y-2"><Label>Tipo de Caso</Label><Input value={form.case_type} onChange={(e) => setForm({ ...form, case_type: e.target.value })} className="bg-secondary border-border" placeholder="Ex: BPC/LOAS – Deficiência" /></div>
              <div className="space-y-2"><Label>Advogado Responsável</Label><Input value={form.lawyer_name} onChange={(e) => setForm({ ...form, lawyer_name: e.target.value })} className="bg-secondary border-border" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Etapa</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(stageLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Urgência</Label>
                  <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">🟢 No Prazo</SelectItem><SelectItem value="yellow">🟡 Atenção</SelectItem>
                      <SelectItem value="orange">🔴 Crítico</SelectItem><SelectItem value="red">🚨 Escalado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Valor Previsto (R$)</Label><Input type="number" step="0.01" min="0" placeholder="0,00" value={form.valor_previsto} onChange={(e) => setForm({ ...form, valor_previsto: e.target.value })} className="bg-secondary border-border" /></div>
              <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-secondary border-border" /></div>
              <Button className="w-full gold-gradient text-primary-foreground hover:opacity-90" onClick={handleSave}>{editing ? "Salvar Alterações" : "Criar Caso"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nº ou cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
          </div>
          <Select value={filterUrgency} onValueChange={setFilterUrgency}>
            <SelectTrigger className="w-44 bg-secondary border-border"><SelectValue placeholder="Urgência" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem><SelectItem value="green">🟢 No Prazo</SelectItem>
              <SelectItem value="yellow">🟡 Atenção</SelectItem><SelectItem value="orange">🔴 Crítico</SelectItem><SelectItem value="red">🚨 Escalado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        {loading ? <CardContent className="p-8 text-center text-muted-foreground">Carregando...</CardContent>
          : filtered.length === 0 ? (
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-3">Nenhum caso encontrado.</p>
              <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90" onClick={() => { setEditing(null); setForm(empty); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Criar primeiro caso</Button>
            </CardContent>
          ) : (
            <Table>
              <TableHeader><TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Caso</TableHead><TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead><TableHead className="text-muted-foreground">Advogado</TableHead>
                <TableHead className="text-muted-foreground">Etapa</TableHead><TableHead className="text-muted-foreground">Urgência</TableHead>
                <TableHead className="text-muted-foreground w-20">Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="border-border hover:bg-accent/30">
                    <TableCell className="font-mono text-primary font-medium">{c.case_number}</TableCell>
                    <TableCell className="font-medium">{c.client_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.case_type}</TableCell>
                    <TableCell className="text-sm">{c.lawyer_name}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${stageColors[c.stage]}`}>{stageLabels[c.stage]}</Badge></TableCell>
                    <TableCell><Badge className={`text-[10px] ${urgencyColors[c.urgency]}`}>{urgencyLabels[c.urgency]}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(c); setForm({ client_name: c.client_name, case_type: c.case_type, lawyer_name: c.lawyer_name, stage: c.stage, urgency: c.urgency, notes: c.notes, valor_previsto: (c as any).valor_previsto || "" }); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
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

export default Cases;
