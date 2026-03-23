import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, AlertTriangle, Clock, CheckCircle2, XCircle, UserPlus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type DeadlineCard = { id: string; case_number: string; client_name: string; lawyer_name: string; due_date: string };

const getUrgencyColumn = (due: string) => {
  const days = Math.ceil((new Date(due).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
  if (days < 0) return "Escalado";
  if (days <= 1) return "Crítico (40h)";
  if (days <= 5) return "Atenção (24h)";
  return "No Prazo";
};

const colStyle: Record<string, { color: string; emoji: string }> = {
  "No Prazo": { color: "border-success/40", emoji: "🟢" },
  "Atenção (24h)": { color: "border-warning/40", emoji: "🟡" },
  "Crítico (40h)": { color: "border-critical/40", emoji: "🔴" },
  "Escalado": { color: "border-destructive/40", emoji: "🚨" },
};
const columns = ["No Prazo", "Atenção (24h)", "Crítico (40h)", "Escalado"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [totalCases, setTotalCases] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [atencao, setAtencao] = useState(0);
  const [critico, setCritico] = useState(0);
  const [vencido, setVencido] = useState(0);
  const [cards, setCards] = useState<DeadlineCard[]>([]);
  const [recentContacts, setRecentContacts] = useState<{ name: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        { count: c1 }, { count: c2 }, { count: c3 },
        { data: dl }, { data: rc },
      ] = await Promise.all([
        supabase.from("cases" as any).select("*", { count: "exact", head: true }),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("status", "lead" as any),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("status", "client" as any),
        supabase.from("deadlines" as any).select("id, case_number, client_name, lawyer_name, due_date").eq("completed", false),
        supabase.from("contacts").select("name, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      setTotalCases(c1 ?? 0); setTotalLeads(c2 ?? 0); setTotalClients(c3 ?? 0);
      const dls = (dl as any[]) ?? [];
      setCards(dls);
      setAtencao(dls.filter((d) => getUrgencyColumn(d.due_date) === "Atenção (24h)").length);
      setCritico(dls.filter((d) => getUrgencyColumn(d.due_date) === "Crítico (40h)").length);
      setVencido(dls.filter((d) => getUrgencyColumn(d.due_date) === "Escalado").length);
      setRecentContacts((rc as any[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando dashboard...</div>;

  const kpis = [
    { label: "Casos Ativos", value: totalCases, icon: Briefcase, color: "text-primary" },
    { label: "Leads", value: totalLeads, icon: UserPlus, color: "text-warning" },
    { label: "Clientes", value: totalClients, icon: CheckCircle2, color: "text-success" },
    { label: "Prazos c/ Atenção", value: atencao, icon: Clock, color: "text-warning" },
    { label: "Prazos Críticos", value: critico, icon: AlertTriangle, color: "text-critical" },
    { label: "Prazos Vencidos", value: vencido, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl font-bold">Dashboard</h1><p className="text-muted-foreground text-sm">Visão geral dos processos e prazos</p></div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/contatos")}><UserPlus className="w-3.5 h-3.5 mr-1" /> Novo Lead</Button>
          <Button size="sm" className="text-xs gold-gradient text-primary-foreground hover:opacity-90" onClick={() => navigate("/casos")}><Plus className="w-3.5 h-3.5 mr-1" /> Novo Caso</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2"><k.icon className={`w-4 h-4 ${k.color}`} /><span className="text-[11px] text-muted-foreground">{k.label}</span></div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <h2 className="font-serif text-lg font-semibold mb-3">Painel de Urgência de Prazos</h2>
          {cards.length === 0 ? (
            <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">Nenhum prazo pendente. <button className="text-primary underline ml-1" onClick={() => navigate("/prazos")}>Criar prazo</button></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {columns.map((col) => {
                const items = cards.filter((d) => getUrgencyColumn(d.due_date) === col);
                const { color, emoji } = colStyle[col];
                return (
                  <div key={col} className={`rounded-lg border-2 ${color} bg-card/50 p-3`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{emoji}</span><span className="text-xs font-semibold">{col}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] h-5">{items.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {items.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-2">Nenhum</p>}
                      {items.map((d) => (
                        <Card key={d.id} className="bg-card border-border cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/prazos")}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-mono text-primary">{d.case_number || "—"}</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(d.due_date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                            </div>
                            <p className="text-sm font-medium truncate">{d.client_name}</p>
                            <p className="text-[11px] text-muted-foreground">{d.lawyer_name || "—"}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold mb-3">Contatos Recentes</h2>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {recentContacts.length === 0
                ? <p className="p-4 text-sm text-muted-foreground text-center">Nenhum contato ainda.</p>
                : recentContacts.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer" onClick={() => navigate("/contatos")}>
                    <UserPlus className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm leading-tight font-medium truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
