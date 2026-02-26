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
import { Download, Search } from "lucide-react";

const mockDeadlines = [
  { case: "#042", client: "Luísa Mendes", lawyer: "Dr. Paulo", type: "Protocolar Petição (48h)", due: "26/02/2026", daysLeft: 0, status: "Vencido" },
  { case: "#045", client: "Maria Costa", lawyer: "Dra. Carla", type: "Protocolar Petição (48h)", due: "27/02/2026", daysLeft: 1, status: "Crítico" },
  { case: "#043", client: "João Ferreira", lawyer: "Dr. Paulo", type: "Coleta de Documentos", due: "28/02/2026", daysLeft: 2, status: "Atenção" },
  { case: "#038", client: "Carlos Almeida", lawyer: "Dra. Carla", type: "Responder Exigência INSS", due: "01/03/2026", daysLeft: 3, status: "Atenção" },
  { case: "#051", client: "José Santos", lawyer: "Dr. Paulo", type: "Coleta de Documentos", due: "05/03/2026", daysLeft: 7, status: "No Prazo" },
  { case: "#049", client: "Ana Oliveira", lawyer: "Dra. Carla", type: "Contato com Cliente", due: "10/03/2026", daysLeft: 12, status: "No Prazo" },
  { case: "#047", client: "Pedro Lima", lawyer: "Dr. Paulo", type: "Revisão BPC (2 anos)", due: "15/06/2026", daysLeft: 109, status: "No Prazo" },
];

const statusColor: Record<string, string> = {
  "Vencido": "bg-destructive/20 text-destructive",
  "Crítico": "bg-critical/20 text-critical",
  "Atenção": "bg-warning/20 text-warning",
  "No Prazo": "bg-success/20 text-success",
};

const rowColor: Record<string, string> = {
  "Vencido": "border-l-4 border-l-destructive",
  "Crítico": "border-l-4 border-l-critical",
  "Atenção": "border-l-4 border-l-warning",
  "No Prazo": "",
};

const Deadlines = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Painel de Prazos</h1>
          <p className="text-muted-foreground text-sm">Controle centralizado de todos os prazos</p>
        </div>
        <Button size="sm" variant="outline">
          <Download className="w-4 h-4 mr-1" /> Exportar CSV
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar caso ou cliente..." className="pl-9 bg-secondary border-border" />
          </div>
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
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
              <SelectItem value="atencao">Atenção</SelectItem>
              <SelectItem value="prazo">No Prazo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Caso</TableHead>
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Advogado</TableHead>
              <TableHead className="text-muted-foreground">Tipo de Prazo</TableHead>
              <TableHead className="text-muted-foreground">Vencimento</TableHead>
              <TableHead className="text-muted-foreground">Dias Restantes</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDeadlines.map((d, i) => (
              <TableRow key={i} className={`border-border cursor-pointer hover:bg-accent/30 ${rowColor[d.status]}`}>
                <TableCell className="font-mono text-primary font-medium">{d.case}</TableCell>
                <TableCell className="font-medium">{d.client}</TableCell>
                <TableCell className="text-sm">{d.lawyer}</TableCell>
                <TableCell className="text-sm">{d.type}</TableCell>
                <TableCell className="text-sm">{d.due}</TableCell>
                <TableCell className={`text-sm font-bold ${d.daysLeft <= 0 ? "text-destructive" : d.daysLeft <= 2 ? "text-critical" : d.daysLeft <= 5 ? "text-warning" : "text-success"}`}>
                  {d.daysLeft <= 0 ? "Vencido" : `${d.daysLeft}d`}
                </TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${statusColor[d.status]}`}>
                    {d.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Deadlines;
