import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Briefcase, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const stageLabels: Record<string, string> = {
  contract_signed: "Contrato", document_collection: "Documentos",
  petition_filed: "Protocolado", inss_analysis: "Análise INSS",
  medical_exam: "Perícia", awaiting_decision: "Decisão",
  approved: "Deferido", denied: "Indeferido",
};

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: c }, { data: d }] = await Promise.all([
        supabase.from("cases" as any).select("*"),
        supabase.from("deadlines" as any).select("*"),
      ]);
      setCases((c as any[]) ?? []);
      setDeadlines((d as any[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="font-serif text-2xl font-bold text-foreground">Relatórios</h1><p className="text-muted-foreground text-sm">Carregando dados...</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[300px] rounded-lg" />)}
        </div>
      </div>
    );
  }

  // KPIs
  const totalCases = cases.length;
  const approved = cases.filter(c => c.stage === "approved").length;
  const denied = cases.filter(c => c.stage === "denied").length;
  const inProgress = totalCases - approved - denied;
  const totalRevenue = cases.reduce((sum, c) => sum + (Number(c.valor_previsto) || 0), 0);
  const approvedRevenue = cases.filter(c => c.stage === "approved").reduce((sum, c) => sum + (Number(c.valor_previsto) || 0), 0);

  // Cases by stage chart
  const casesByStage = Object.keys(stageLabels).map(stage => ({
    stage: stageLabels[stage],
    count: cases.filter(c => c.stage === stage).length,
  })).filter(s => s.count > 0);

  // Approval pie
  const approvalRate = totalCases > 0 ? [
    { name: "Deferido", value: approved, color: "hsl(150, 41%, 39%)" },
    { name: "Indeferido", value: denied, color: "hsl(0, 65%, 55%)" },
    { name: "Em Andamento", value: inProgress, color: "hsl(45, 70%, 47%)" },
  ].filter(d => d.value > 0) : [];

  // Monthly data from cases
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyMap: Record<string, { deferidos: number; indeferidos: number }> = {};
  cases.forEach(c => {
    if (c.stage === "approved" || c.stage === "denied") {
      const d = new Date(c.updated_at || c.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = { deferidos: 0, indeferidos: 0 };
      if (c.stage === "approved") monthlyMap[key].deferidos++;
      else monthlyMap[key].indeferidos++;
    }
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => ({ month: monthNames[parseInt(key.split("-")[1])], ...val }));

  // Lawyer performance
  const lawyerMap: Record<string, { cases: number; approved: number; revenue: number }> = {};
  cases.forEach(c => {
    const name = c.lawyer_name || "Sem advogado";
    if (!lawyerMap[name]) lawyerMap[name] = { cases: 0, approved: 0, revenue: 0 };
    lawyerMap[name].cases++;
    if (c.stage === "approved") lawyerMap[name].approved++;
    lawyerMap[name].revenue += Number(c.valor_previsto) || 0;
  });
  const lawyerPerformance = Object.entries(lawyerMap).map(([name, data]) => ({ name, ...data }));

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground text-sm">Análises e métricas em tempo real</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Briefcase className="w-4 h-4 text-primary" /><span className="text-[11px] text-muted-foreground">Total de Casos</span></div>
          <p className="text-2xl font-bold text-primary">{totalCases}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="w-4 h-4 text-success" /><span className="text-[11px] text-muted-foreground">Deferidos</span></div>
          <p className="text-2xl font-bold text-success">{approved}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><XCircle className="w-4 h-4 text-destructive" /><span className="text-[11px] text-muted-foreground">Indeferidos</span></div>
          <p className="text-2xl font-bold text-destructive">{denied}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-primary" /><span className="text-[11px] text-muted-foreground">Faturamento Previsto</span></div>
          <p className="text-xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
          <p className="text-[10px] text-success">{formatCurrency(approvedRevenue)} confirmado</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Stage */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="font-serif text-base">Casos por Etapa</CardTitle></CardHeader>
          <CardContent>
            {casesByStage.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Nenhum caso cadastrado ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={casesByStage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="count" fill="hsl(45, 70%, 47%)" radius={[4, 4, 0, 0]} name="Casos" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Approval Rate */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="font-serif text-base">Taxa de Aprovação</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {approvalRate.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados de aprovação.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={approvalRate} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                    label={({ name, value }) => `${name}: ${totalCases > 0 ? Math.round(value / totalCases * 100) : 0}%`}
                  >
                    {approvalRate.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Results */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="font-serif text-base">Resultados Mensais</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem resultados mensais ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="deferidos" stroke="hsl(150, 41%, 39%)" strokeWidth={2} name="Deferidos" />
                  <Line type="monotone" dataKey="indeferidos" stroke="hsl(0, 65%, 55%)" strokeWidth={2} name="Indeferidos" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Lawyer Performance with Revenue */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="font-serif text-base">Desempenho por Advogado</CardTitle></CardHeader>
          <CardContent>
            {lawyerPerformance.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Nenhum advogado com casos.</p>
            ) : (
              <div className="space-y-4">
                {lawyerPerformance.map((l) => (
                  <div key={l.name} className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="font-medium text-sm mb-2">{l.name}</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-primary">{l.cases}</p>
                        <p className="text-[10px] text-muted-foreground">Casos</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-success">{l.approved}</p>
                        <p className="text-[10px] text-muted-foreground">Deferidos</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{formatCurrency(l.revenue)}</p>
                        <p className="text-[10px] text-muted-foreground">Faturamento</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
