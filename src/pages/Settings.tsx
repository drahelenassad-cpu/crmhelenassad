import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm">Preferências do sistema</p>
      </div>

      {/* Firm Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-base">Informações do Escritório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Escritório</Label>
              <Input defaultValue="Dra. Helen Assad Advogados & Associados" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input defaultValue="(11) 3456-7890" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>E-mail</Label>
              <Input defaultValue="contato@assadadvogados.com" className="bg-secondary border-border" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deadlines Config */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-base">Configuração de Prazos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prazo para protocolar petição (horas)</Label>
              <Input type="number" defaultValue="48" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Prazo coleta de documentos (dias úteis)</Label>
              <Input type="number" defaultValue="5" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Alerta de inatividade (dias)</Label>
              <Input type="number" defaultValue="15" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Prazo para recurso (dias)</Label>
              <Input type="number" defaultValue="30" className="bg-secondary border-border" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-base">Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alertas no aplicativo</p>
              <p className="text-xs text-muted-foreground">Receber notificações dentro do CRM</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alertas por e-mail</p>
              <p className="text-xs text-muted-foreground">Enviar alertas críticos por e-mail</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Escalação automática</p>
              <p className="text-xs text-muted-foreground">Escalar para Dra. Helen após 48h</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Button className="gold-gradient text-primary-foreground hover:opacity-90">
        Salvar Configurações
      </Button>
    </div>
  );
};

export default Settings;
