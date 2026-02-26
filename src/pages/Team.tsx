import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, User } from "lucide-react";

const mockTeam = [
  { id: 1, name: "Dra. Helen Assad", role: "Admin", email: "helen@assadadvogados.com", cases: 0, status: "Ativo" },
  { id: 2, name: "Douglas", role: "Gestor", email: "douglas@assadadvogados.com", cases: 0, status: "Ativo" },
  { id: 3, name: "Dr. Paulo Mendes", role: "Advogado Associado", email: "paulo@assadadvogados.com", cases: 22, status: "Ativo" },
  { id: 4, name: "Dra. Carla Ribeiro", role: "Advogado Associado", email: "carla@assadadvogados.com", cases: 18, status: "Ativo" },
  { id: 5, name: "Maria Oliveira", role: "SDR", email: "maria@assadadvogados.com", cases: 0, status: "Ativo" },
  { id: 6, name: "Lucas Santos", role: "Closer", email: "lucas@assadadvogados.com", cases: 0, status: "Ativo" },
];

const roleColor: Record<string, string> = {
  Admin: "bg-primary/20 text-primary",
  Gestor: "bg-critical/20 text-critical",
  "Advogado Associado": "bg-success/20 text-success",
  SDR: "bg-muted text-muted-foreground",
  Closer: "bg-warning/20 text-warning",
};

const Team = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Equipe</h1>
          <p className="text-muted-foreground text-sm">Gerenciamento de membros da equipe</p>
        </div>
        <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" /> Adicionar Membro
        </Button>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Membro</TableHead>
              <TableHead className="text-muted-foreground">Cargo</TableHead>
              <TableHead className="text-muted-foreground">E-mail</TableHead>
              <TableHead className="text-muted-foreground">Casos Ativos</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTeam.map((m) => (
              <TableRow key={m.id} className="border-border cursor-pointer hover:bg-accent/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{m.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${roleColor[m.role]}`}>
                    {m.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                <TableCell className="text-sm">{m.cases}</TableCell>
                <TableCell>
                  <Badge className="text-[10px] bg-success/20 text-success">{m.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Team;
