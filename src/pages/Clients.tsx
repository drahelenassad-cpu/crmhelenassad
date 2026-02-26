import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, User } from "lucide-react";

const mockClients = [
  { id: 1, name: "José Santos", cpf: "123.456.789-00", dob: "15/03/1955", phone: "(11) 99876-5432", activeCases: 2, status: "Ativo" },
  { id: 2, name: "Ana Oliveira", cpf: "234.567.890-11", dob: "22/07/1960", phone: "(21) 98765-1234", activeCases: 1, status: "Ativo" },
  { id: 3, name: "Pedro Lima", cpf: "345.678.901-22", dob: "08/11/1988", phone: "(31) 97654-3210", activeCases: 1, status: "Ativo" },
  { id: 4, name: "Maria Costa", cpf: "456.789.012-33", dob: "30/01/1975", phone: "(41) 96543-2109", activeCases: 1, status: "Ativo" },
  { id: 5, name: "Carlos Almeida", cpf: "567.890.123-44", dob: "12/09/1950", phone: "(51) 95432-1098", activeCases: 1, status: "Ativo" },
  { id: 6, name: "Antônio Ferreira", cpf: "678.901.234-55", dob: "25/05/1992", phone: "(61) 94321-0987", activeCases: 0, status: "Inativo" },
];

const Clients = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">Base de dados de clientes</p>
        </div>
        <Button size="sm" className="gold-gradient text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" /> Novo Cliente
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou CPF..." className="pl-9 bg-secondary border-border" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">CPF</TableHead>
              <TableHead className="text-muted-foreground">Nascimento</TableHead>
              <TableHead className="text-muted-foreground">Telefone</TableHead>
              <TableHead className="text-muted-foreground">Casos Ativos</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockClients.map((client) => (
              <TableRow key={client.id} className="border-border cursor-pointer hover:bg-accent/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">{client.cpf}</TableCell>
                <TableCell className="text-sm">{client.dob}</TableCell>
                <TableCell className="text-sm">{client.phone}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">
                    {client.activeCases}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${client.status === "Ativo" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                    {client.status}
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

export default Clients;
