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

const statusColors: Record<string, string> = {
  "Novo Contato": "bg-muted text-muted-foreground",
  "Avaliação": "bg-primary/20 text-primary",
  "Qualificado": "bg-success/20 text-success",
  "Agendamento": "bg-warning/20 text-warning",
  "Aguardando Contrato": "bg-critical/20 text-critical",
  "Convertido": "bg-success text-success-foreground",
  "Desqualificado": "bg-destructive/20 text-destructive",
};

const mockLeads = [
  { id: 1, name: "Fernanda Souza", phone: "(11) 99876-5432", source: "Instagram", type: "BPC/LOAS – Deficiência", status: "Novo Contato", sdr: "Maria", date: "25/02/2026" },
  { id: 2, name: "Roberto Alves", phone: "(21) 98765-1234", source: "Indicação", type: "BPC/LOAS – Idoso", status: "Avaliação", sdr: "Maria", date: "24/02/2026" },
  { id: 3, name: "Cláudia Lima", phone: "(31) 97654-3210", source: "Site", type: "Salário Maternidade", status: "Qualificado", sdr: "Maria", date: "23/02/2026" },
  { id: 4, name: "Marcos Pereira", phone: "(41) 96543-2109", source: "WhatsApp", type: "BPC/LOAS – Deficiência", status: "Agendamento", sdr: "Maria", date: "22/02/2026" },
  { id: 5, name: "Juliana Santos", phone: "(51) 95432-1098", source: "Indicação", type: "BPC/LOAS – Idoso", status: "Aguardando Contrato", sdr: "Maria", date: "20/02/2026" },
  { id: 6, name: "Antônio Ferreira", phone: "(61) 94321-0987", source: "Instagram", type: "Salário Maternidade", status: "Convertido", sdr: "Maria", date: "18/02/2026" },
];

const Leads = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm">Captação e qualificação de novos clientes</p>
        </div>
        <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" /> Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou telefone..." className="pl-9 bg-secondary border-border" />
          </div>
          <Select>
            <SelectTrigger className="w-48 bg-secondary border-border">
              <SelectValue placeholder="Tipo do Caso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bpc-def">BPC/LOAS – Deficiência</SelectItem>
              <SelectItem value="bpc-idoso">BPC/LOAS – Idoso</SelectItem>
              <SelectItem value="maternidade">Salário Maternidade</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-44 bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(statusColors).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nome</TableHead>
              <TableHead className="text-muted-foreground">Telefone</TableHead>
              <TableHead className="text-muted-foreground">Origem</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">SDR</TableHead>
              <TableHead className="text-muted-foreground">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLeads.map((lead) => (
              <TableRow key={lead.id} className="border-border cursor-pointer hover:bg-accent/30">
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{lead.phone}</TableCell>
                <TableCell className="text-sm">{lead.source}</TableCell>
                <TableCell className="text-sm">{lead.type}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${statusColors[lead.status]}`}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{lead.sdr}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{lead.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Leads;
