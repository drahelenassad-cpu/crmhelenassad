import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const casesByStage = [
  { stage: "Contrato", count: 5 },
  { stage: "Documentos", count: 8 },
  { stage: "Protocolado", count: 12 },
  { stage: "Análise INSS", count: 10 },
  { stage: "Perícia", count: 6 },
  { stage: "Decisão", count: 4 },
  { stage: "Deferido", count: 15 },
  { stage: "Indeferido", count: 7 },
];

const approvalData = [
  { name: "Deferido", value: 65, color: "hsl(150, 41%, 39%)" },
  { name: "Indeferido", value: 25, color: "hsl(0, 65%, 55%)" },
  { name: "Em Recurso", value: 10, color: "hsl(45, 70%, 47%)" },
];

const monthlyData = [
  { month: "Set", deferidos: 5, indeferidos: 2 },
  { month: "Out", deferidos: 7, indeferidos: 3 },
  { month: "Nov", deferidos: 6, indeferidos: 1 },
  { month: "Dez", deferidos: 9, indeferidos: 4 },
  { month: "Jan", deferidos: 8, indeferidos: 2 },
  { month: "Fev", deferidos: 8, indeferidos: 3 },
];

const lawyerPerformance = [
  { name: "Dr. Paulo", cases: 22, approved: 14, deadlinesMet: 18 },
  { name: "Dra. Carla", cases: 18, approved: 12, deadlinesMet: 16 },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground text-sm">Análises e métricas de desempenho</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Stage */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">Casos por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={casesByStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                <XAxis dataKey="stage" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,13%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(45, 70%, 47%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Approval Rate */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">Taxa de Aprovação</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={approvalData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {approvalData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(0,0%,13%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Results */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">Resultados Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,13%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="deferidos" stroke="hsl(150, 41%, 39%)" strokeWidth={2} name="Deferidos" />
                <Line type="monotone" dataKey="indeferidos" stroke="hsl(0, 65%, 55%)" strokeWidth={2} name="Indeferidos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lawyer Performance */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">Desempenho por Advogado</CardTitle>
          </CardHeader>
          <CardContent>
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
                      <p className="text-lg font-bold text-foreground">{l.deadlinesMet}</p>
                      <p className="text-[10px] text-muted-foreground">Prazos Cumpridos</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
