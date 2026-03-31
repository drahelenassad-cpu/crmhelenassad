import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, FileSearch, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

type Case = { id: string; case_number: string; client_name: string; case_type: string; lawyer_name: string; stage: string; urgency: string; notes: string; created_at: string };

const stageLabels: Record<string, string> = {
  contract_signed: "Contrato Assinado", document_collection: "Coleta de Documentos",
  petition_filed: "Petição Protocolada", inss_analysis: "Em Análise INSS",
  medical_exam: "Perícia Agendada", awaiting_decision: "Aguardando Decisão",
  admin_inss: "Aguardando Administrativo INSS", judicial_action: "Aguardando Ação Judicial",
  approved: "Deferido ✅", denied: "Indeferido ❌",
};

const stageColors: Record<string, string> = {
  contract_signed: "bg-primary/20 text-primary", document_collection: "bg-warning/20 text-warning",
  petition_filed: "bg-success/20 text-success", inss_analysis: "bg-muted text-muted-foreground",
  medical_exam: "bg-critical/20 text-critical", awaiting_decision: "bg-warning/20 text-warning",
  admin_inss: "bg-accent/20 text-accent-foreground", judicial_action: "bg-primary/20 text-primary",
  approved: "bg-success/20 text-success", denied: "bg-destructive/20 text-destructive",
};

const urgencyLabels: Record<string, string> = { green: "No Prazo", yellow: "Atenção", orange: "Crítico", red: "Escalado" };
const urgencyColors: Record<string, string> = { green: "bg-success/20 text-success", yellow: "bg-warning/20 text-warning", orange: "bg-critical/20 text-critical", red: "bg-destructive/20 text-destructive" };

const empty = { client_name: "", case_type: "", lawyer_name: "", stage: "contract_signed", urgency: "green", notes: "", valor_previsto: "" };

type TeamMember = { id: string; full_name: string; email: string | null };

type Processo = {
  numeroProcesso?: string;
  classe?: { nome?: string };
  orgaoJulgador?: { nome?: string };
  assuntos?: { nome?: string }[];
  dataAjuizamento?: string;
  movimentos?: { nome?: string; dataHora?: string }[];
  _tribunal?: string;
};

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

  // DataJud search
  const [cpfSearch, setCpfSearch] = useState("");
  const [datajudOpen, setDatajudOpen] = useState(false);
  const [searchingProcessos, setSearchingProcessos] = useState(false);
  const [processos, setProcessos] = useState<Processo[]>([]);

  const fetchCases = useCallback(async () => {
    const { data, error } = await supabase.from("cases" as any).select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Erro ao carregar casos"); return; }
    setCases((data as any[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);
  useRealtimeTable("cases", fetchCases);

  useEffect(() => {
    const loadTeam = async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email");
      setTeamMembers((data as TeamMember[]) ?? []);
    };
    loadTeam();
  }, []);

  const handleSave = async () => {
    if (!form.client_name.trim()) { toast.error("Nome do cliente é obrigatório"); return; }
    const isNew = !editing;
    const result = isNew
      ? await supabase.from("cases" as any).insert({ ...form, created_by: user!.id }).select("id").single()
      : await supabase.from("cases" as any).update(form).eq("id", editing!.id).select("id").single();
    if (result.error) { toast.error("Erro ao salvar caso"); return; }

    if (form.lawyer_name) {
      const assigned = teamMembers.find(m => m.full_name === form.lawyer_name);
      if (assigned && assigned.id !== user!.id) {
        const caseId = isNew ? (result.data as any)?.id : editing!.id;
        await supabase.from("notifications" as any).insert({
          user_id: assigned.id,
          case_id: caseId,
          type: "assignment",
          message: `Você foi designado como responsável no caso de ${form.client_name}`,
        });
      }
    }

    toast.success(editing ? "Caso atualizado!" : "Caso criado!");
    setDialogOpen(false); setEditing(null); setForm(empty); setResponsibleSearch(""); fetchCases();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cases" as any).delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Caso excluído!"); fetchCases();
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleSearchDatajud = async () => {
    const cleanCpf = cpfSearch.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      toast.error("Digite um CPF válido com 11 dígitos");
      return;
    }

    setSearchingProcessos(true);
    setProcessos([]);

    try {
      const { data, error } = await supabase.functions.invoke("datajud-search", {
        body: { cpf: cleanCpf },
      });

      if (error) throw error;

      if (data?.processos?.length > 0) {
        setProcessos(data.processos);
        toast.success(`${data.total} processo(s) encontrado(s)!`);
      } else {
        toast.info("Nenhum processo encontrado para este CPF.");
      }
    } catch (err) {
      toast.error("Erro ao buscar processos no DataJud");
    } finally {
      setSearchingProcessos(false);
    }
  };

  const handleImportProcesso = (proc: Processo) => {
    const assuntoText = proc.assuntos?.map(a => a.nome).join(", ") || "";
    const classeText = proc.classe?.nome || "";
    const tribunal = proc._tribunal?.replace("api_publica_", "").toUpperCase() || "";

    setForm({
      ...empty,
      client_name: form.client_name || "",
      case_type: classeText || assuntoText,
      notes: [
        `Nº Processo: ${proc.numeroProcesso || "N/A"}`,
        `Tribunal: ${tribunal}`,
        `Classe: ${classeText}`,
        `Assuntos: ${assuntoText}`,
        `Órgão Julgador: ${proc.orgaoJulgador?.nome || "N/A"}`,
        `Data de Ajuizamento: ${proc.dataAjuizamento ? new Date(proc.dataAjuizamento).toLocaleDateString("pt-BR") : "N/A"}`,
        proc.movimentos?.length
          ? `Última Movimentação: ${proc.movimentos[0]?.nome || "N/A"} (${proc.movimentos[0]?.dataHora ? new Date(proc.movimentos[0].dataHora).toLocaleDateString("pt-BR") : ""})`
          : "",
      ].filter(Boolean).join("\n"),
    });

    setDatajudOpen(false);
    setDialogOpen(true);
    toast.success("Processo importado! Complete os dados e salve o caso.");
  };

  const filtered = cases.filter((c) =>
    (c.client_name.toLowerCase().includes(search.toLowerCase()) || c.case_number.toLowerCase().includes(search.toLowerCase())) &&
    (filterUrgency === "all" || c.urgency === filterUrgency)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-serif text-2xl font-bold text-foreground">Casos</h1><p className="text-muted-foreground text-sm">Gestão de processos previdenciários</p></div>
        <div className="flex gap-2">
          <Dialog open={datajudOpen} onOpenChange={setDatajudOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => { setCpfSearch(""); setProcessos([]); }}>
                <FileSearch className="w-4 h-4 mr-1" /> Buscar por CPF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-serif text-foreground">Buscar Processos no DataJud</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>CPF do Cliente</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={cpfSearch}
                      onChange={(e) => setCpfSearch(formatCpf(e.target.value))}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      className="gold-gradient text-primary-foreground hover:opacity-90"
                      onClick={handleSearchDatajud}
                      disabled={searchingProcessos}
                    >
                      {searchingProcessos ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Search className="w-4 h-4 mr-1" />}
                      Buscar
                    </Button>
                  </div>
                </div>

                {searchingProcessos && (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
                    <p className="text-sm text-muted-foreground text-center">Consultando tribunais...</p>
                  </div>
                )}

                {!searchingProcessos && processos.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{processos.length} processo(s) encontrado(s)</p>
                    {processos.map((proc, idx) => (
                      <Card key={idx} className="bg-secondary border-border">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-mono text-sm text-primary font-medium">{proc.numeroProcesso || "Sem número"}</p>
                              <p className="text-sm text-foreground font-medium">{proc.classe?.nome || "Classe não informada"}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] border-primary text-primary shrink-0">
                              {proc._tribunal?.replace("api_publica_", "").toUpperCase()}
                            </Badge>
                          </div>
                          {proc.assuntos && proc.assuntos.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Assuntos: {proc.assuntos.map(a => a.nome).join(", ")}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Órgão: {proc.orgaoJulgador?.nome || "N/A"}</span>
                            {proc.dataAjuizamento && (
                              <span>Ajuizado em: {new Date(proc.dataAjuizamento).toLocaleDateString("pt-BR")}</span>
                            )}
                          </div>
                          {proc.movimentos && proc.movimentos.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Última movimentação: {proc.movimentos[0]?.nome}
                              {proc.movimentos[0]?.dataHora && ` (${new Date(proc.movimentos[0].dataHora).toLocaleDateString("pt-BR")})`}
                            </p>
                          )}
                          <Button
                            size="sm"
                            className="w-full mt-2 gold-gradient text-primary-foreground hover:opacity-90"
                            onClick={() => handleImportProcesso(proc)}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Importar como Caso
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!searchingProcessos && processos.length === 0 && cpfSearch.replace(/\D/g, "").length === 11 && (
                  <div className="text-center py-6">
                    <FileSearch className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Clique em "Buscar" para consultar processos</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90" onClick={() => { setEditing(null); setForm(empty); setResponsibleSearch(""); }}>
                <Plus className="w-4 h-4 mr-1" /> Novo Caso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-foreground">{editing ? "Editar Caso" : "Novo Caso"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Cliente *</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="bg-secondary border-border text-foreground" /></div>
                <div className="space-y-2"><Label>Tipo de Caso</Label><Input value={form.case_type} onChange={(e) => setForm({ ...form, case_type: e.target.value })} className="bg-secondary border-border text-foreground" placeholder="Ex: BPC/LOAS – Deficiência" /></div>
                <div className="space-y-2 relative">
                  <Label>Responsável</Label>
                  <Input
                    value={responsibleSearch}
                    onChange={(e) => { setResponsibleSearch(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    className="bg-secondary border-border text-foreground"
                    placeholder="Digite o nome do membro..."
                  />
                  {showSuggestions && responsibleSearch.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {teamMembers
                        .filter(m => m.full_name.toLowerCase().includes(responsibleSearch.toLowerCase()))
                        .map(m => (
                          <button key={m.id} type="button" className="w-full text-left px-3 py-2 hover:bg-accent/50 text-sm text-foreground"
                            onClick={() => { setForm({ ...form, lawyer_name: m.full_name }); setResponsibleSearch(m.full_name); setShowSuggestions(false); }}>
                            {m.full_name} <span className="text-muted-foreground text-xs">({m.email})</span>
                          </button>
                        ))}
                      {teamMembers.filter(m => m.full_name.toLowerCase().includes(responsibleSearch.toLowerCase())).length === 0 && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum membro encontrado</p>
                      )}
                    </div>
                  )}
                </div>
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
                <div className="space-y-2"><Label>Valor Previsto (R$)</Label><Input type="number" step="0.01" min="0" placeholder="0,00" value={form.valor_previsto} onChange={(e) => setForm({ ...form, valor_previsto: e.target.value })} className="bg-secondary border-border text-foreground" /></div>
                <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-secondary border-border text-foreground" /></div>
                <Button className="w-full gold-gradient text-primary-foreground hover:opacity-90" onClick={handleSave}>{editing ? "Salvar Alterações" : "Criar Caso"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
                <TableHead className="text-muted-foreground">Tipo</TableHead><TableHead className="text-muted-foreground">Responsável</TableHead>
                <TableHead className="text-muted-foreground">Etapa</TableHead><TableHead className="text-muted-foreground">Urgência</TableHead>
                <TableHead className="text-muted-foreground w-20">Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="border-border hover:bg-accent/30">
                    <TableCell className="font-mono text-primary font-medium">{c.case_number}</TableCell>
                    <TableCell className="font-medium text-foreground">{c.client_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.case_type}</TableCell>
                    <TableCell className="text-sm text-foreground">{c.lawyer_name}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${stageColors[c.stage]}`}>{stageLabels[c.stage]}</Badge></TableCell>
                    <TableCell><Badge className={`text-[10px] ${urgencyColors[c.urgency]}`}>{urgencyLabels[c.urgency]}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(c); setForm({ client_name: c.client_name, case_type: c.case_type, lawyer_name: c.lawyer_name, stage: c.stage, urgency: c.urgency, notes: c.notes, valor_previsto: (c as any).valor_previsto || "" }); setResponsibleSearch(c.lawyer_name); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
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
