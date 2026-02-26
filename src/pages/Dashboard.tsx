import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  FileText,
  Activity,
  Plus,
} from "lucide-react";

const kpis = [
  { label: "Casos Ativos", value: "47", icon: Briefcase, color: "text-primary" },
  { label: "Alerta 48h (amarelo)", value: "5", icon: Clock, color: "text-warning" },
  { label: "Crítico 40h (laranja)", value: "2", icon: AlertTriangle, color: "text-critical" },
  { label: "Escalados (vermelho)", value: "1", icon: AlertTriangle, color: "text-destructive" },
  { label: "Deferimentos (mês)", value: "8", icon: CheckCircle2, color: "text-success" },
  { label: "Indeferimentos (mês)", value: "3", icon: XCircle, color: "text-destructive" },
];

const kanbanColumns = [
  {
    title: "No Prazo",
    emoji: "🟢",
    color: "border-success/40",
    items: [
      { id: "#051", client: "José Santos", lawyer: "Dr. Paulo", days: "3 dias restantes" },
      { id: "#049", client: "Ana Oliveira", lawyer: "Dra. Carla", days: "5 dias restantes" },
      { id: "#047", client: "Pedro Lima", lawyer: "Dr. Paulo", days: "7 dias restantes" },
    ],
  },
  {
    title: "Atenção (24h)",
    emoji: "🟡",
    color: "border-warning/40",
    items: [
      { id: "#045", client: "Maria Costa", lawyer: "Dra. Carla", days: "22h restantes" },
      { id: "#043", client: "João Ferreira", lawyer: "Dr. Paulo", days: "18h restantes" },
    ],
  },
  {
    title: "Crítico (40h)",
    emoji: "🔴",
    color: "border-critical/40",
    items: [
      { id: "#042", client: "Luísa Mendes", lawyer: "Dr. Paulo", days: "6h restantes" },
    ],
  },
  {
    title: "Escalado",
    emoji: "🚨",
    color: "border-destructive/40",
    items: [
      { id: "#038", client: "Carlos Almeida", lawyer: "Dra. Carla", days: "Expirado" },
    ],
  },
];

const recentActivities = [
  { icon: FileText, text: "Documentos enviados — Caso #049", time: "10 min" },
  { icon: CheckCircle2, text: "Caso #035 deferido pelo INSS", time: "2h" },
  { icon: UserPlus, text: "Novo lead: Fernanda Souza", time: "3h" },
  { icon: Activity, text: "Caso #042 — Prazo expirado!", time: "5h" },
  { icon: FileText, text: "Perícia agendada — Caso #047", time: "1 dia" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral dos processos e prazos</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            <UserPlus className="w-3.5 h-3.5 mr-1" /> Novo Lead
          </Button>
          <Button size="sm" className="text-xs gold-gradient text-primary-foreground hover:opacity-90">
            <Plus className="w-3.5 h-3.5 mr-1" /> Novo Caso
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Kanban */}
        <div className="xl:col-span-3">
          <h2 className="font-serif text-lg font-semibold mb-3">Painel de Urgência de Prazos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {kanbanColumns.map((col) => (
              <div key={col.title} className={`rounded-lg border-2 ${col.color} bg-card/50 p-3`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{col.emoji}</span>
                  <span className="text-xs font-semibold">{col.title}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] h-5">
                    {col.items.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {col.items.map((item) => (
                    <Card key={item.id} className="bg-card border-border cursor-pointer hover:border-primary/40 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-primary">{item.id}</span>
                          <span className="text-[10px] text-muted-foreground">{item.days}</span>
                        </div>
                        <p className="text-sm font-medium truncate">{item.client}</p>
                        <p className="text-[11px] text-muted-foreground">{item.lawyer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="font-serif text-lg font-semibold mb-3">Atividades Recentes</h2>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border-b border-border last:border-0 hover:bg-accent/30">
                  <act.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm leading-tight">{act.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
