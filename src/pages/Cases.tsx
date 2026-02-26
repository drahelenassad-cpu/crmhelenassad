import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

const stageColors: Record<string, string> = {
  "Contrato Assinado": "bg-primary/20 text-primary",
  "Coleta de Documentos": "bg-warning/20 text-warning",
  "Petição Protocolada": "bg-success/20 text-success",
  "Em Análise INSS": "bg-muted text-muted-foreground",
  "Perícia Agendada": "bg-critical/20 text-critical",
  "Aguardando Decisão": "bg-warning/20 text-warning",
  "Deferido ✅": "bg-success text-success-foreground",
  "Indeferido ❌": "bg-destructive text-destructive-foreground",
};

const urgencyBadge: Record<string, string> = {
  green: "bg-success/20 text-success",
  yellow: "bg-warning/20 text-warning",
  orange: "bg-critical/20 text-critical",
  red: "bg-destructive/20 text-destructive",
};

const mockCases = [
  { id: "#051", client: "José Santos", type: "BPC/LOAS – Deficiência", lawyer: "Dr. Paulo", stage: "Coleta de Documentos", days: 3, urgency: "green", lastActivity: "Hoje" },
  { id: "#049", client: "Ana Oliveira", type: "BPC/LOAS – Idoso", lawyer: "Dra. Carla", stage: "Petição Protocolada", days: 7, urgency: "green", lastActivity: "Ontem" },
  { id: "#047", client: "Pedro Lima", type: "Salário Maternidade", lawyer: "Dr. Paulo", stage: "Em Análise INSS", days: 15, urgency: "green", lastActivity: "3 dias" },
  { id: "#045", client: "Maria Costa", type: "BPC/LOAS – Deficiência", lawyer: "Dra. Carla", stage: "Contrato Assinado", days: 1, urgency: "yellow", lastActivity: "22h" },
  { id: "#042", client: "Luísa Mendes", type: "BPC/LOAS – Idoso", lawyer: "Dr. Paulo", stage: "Contrato Assinado", days: 2, urgency: "red", lastActivity: "2 dias" },
  { id: "#038", client: "Carlos Almeida", type: "BPC/LOAS – Deficiência", lawyer: "Dra. Carla", stage: "Perícia Agendada", days: 30, urgency: "orange", lastActivity: "5 dias" },
  { id: "#035", client: "Antônio Ferreira", type: "Salário Maternidade", lawyer: "Dr. Paulo", stage: "Deferido ✅", days: 45, urgency: "green", lastActivity: "Hoje" },
];

const Cases = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Casos</h1>
          <p className="text-muted-foreground text-sm">Gestão de processos previdenciários</p>
        </div>
        <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" /> Novo Caso
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nº do caso ou cliente..." className="pl-9 bg-secondary border-border" />
          </div>
          <Select>
            <SelectTrigger className="w-48 bg-secondary border-border">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bpc-def">BPC/LOAS – Deficiência</SelectItem>
              <SelectItem value="bpc-idoso">BPC/LOAS – Idoso</SelectItem>
              <SelectItem value="maternidade">Salário Maternidade</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-44 bg-secondary border-border">
              <SelectValue placeholder="Advogado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paulo">Dr. Paulo</SelectItem>
              <SelectItem value="carla">Dra. Carla</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-44 bg-secondary border-border">
              <SelectValue placeholder="Urgência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="green">🟢 No Prazo</SelectItem>
              <SelectItem value="yellow">🟡 Atenção</SelectItem>
              <SelectItem value="orange">🔴 Crítico</SelectItem>
              <SelectItem value="red">🚨 Escalado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Caso</TableHead>
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Advogado</TableHead>
              <TableHead className="text-muted-foreground">Etapa</TableHead>
              <TableHead className="text-muted-foreground">Dias</TableHead>
              <TableHead className="text-muted-foreground">Urgência</TableHead>
              <TableHead className="text-muted-foreground">Última Atividade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCases.map((c) => (
              <TableRow key={c.id} className="border-border cursor-pointer hover:bg-accent/30">
                <TableCell className="font-mono text-primary font-medium">{c.id}</TableCell>
                <TableCell className="font-medium">{c.client}</TableCell>
                <TableCell className="text-sm">{c.type}</TableCell>
                <TableCell className="text-sm">{c.lawyer}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${stageColors[c.stage] || "bg-muted text-muted-foreground"}`}>
                    {c.stage}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{c.days}d</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${urgencyBadge[c.urgency]}`}>
                    {c.urgency === "green" ? "No Prazo" : c.urgency === "yellow" ? "Atenção" : c.urgency === "orange" ? "Crítico" : "Escalado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.lastActivity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Cases;
