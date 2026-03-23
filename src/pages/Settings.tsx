import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type SM = Record<string, string>;

const defaults: SM = { firm_name: "", firm_phone: "", firm_email: "", deadline_petition_hours: "48", deadline_documents_days: "5", deadline_inactivity_days: "15", deadline_appeal_days: "30" };

const Settings = () => {
  const { role } = useAuth();
  const [s, setS] = useState<SM>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings" as any).select("key, value").then(({ data, error }) => {
      if (error) { toast.error("Erro ao carregar configurações"); setLoading(false); return; }
      const m: SM = { ...defaults };
      (data as any[]).forEach((r) => { m[r.key] = r.value; });
      setS(m); setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (role !== "admin") { toast.error("Apenas Admin pode salvar"); return; }
    setSaving(true);
    await Promise.all(Object.entries(s).map(([key, value]) => supabase.from("settings" as any).upsert({ key, value }, { onConflict: "key" })));
    setSaving(false);
    toast.success("Configurações salvas!");
  };

  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }));

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="font-serif text-2xl font-bold">Configurações</h1><p className="text-muted-foreground text-sm">Preferências do sistema</p></div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="font-serif text-base">Informações do Escritório</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2"><Label>Nome do Escritório</Label><Input value={s.firm_name} onChange={(e) => set("firm_name", e.target.value)} className="bg-secondary border-border" disabled={role !== "admin"} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={s.firm_phone} onChange={(e) => set("firm_phone", e.target.value)} className="bg-secondary border-border" disabled={role !== "admin"} /></div>
            <div className="space-y-2"><Label>E-mail</Label><Input value={s.firm_email} onChange={(e) => set("firm_email", e.target.value)} className="bg-secondary border-border" disabled={role !== "admin"} /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="font-serif text-base">Configuração de Prazos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Protocolar petição (horas)</Label><Input type="number" value={s.deadline_petition_hours} onChange={(e) => set("deadline_petition_hours", e.target.value)} className="bg-secondary border-border" disabled={role !== "admin"} /></div>
            <div className="space-y-2"><Label>Coleta de documentos (dias)</Label><Input type="number" value={s.deadline_documents_days} onChange={(e) => set("deadline_documents_days", e.target.value)} className="bg-secondary border-border" disabled={role !== "admin"} /></div>
            <div className="space-y-2"><Label>Alerta de inatividade (dias)</Label><Input type="number" value={s.deadline_inactivity_days} onChange={(e) => set("deadline_inactivity_days", e.target.value)} className="bg-secondary border-border" disabled={role !== "admin"} /></div>
            <div className="space-y-2"><Label>Prazo para recurso (dias)</Label><Input type="number" value={s.deadline_appeal_days} onChange={(e) => set("deadline_appeal_days", e.target.value)} className="bg-secondary border-border" disabled={role !== "admin"} /></div>
          </div>
        </CardContent>
      </Card>

      {role !== "admin" && <p className="text-xs text-muted-foreground">Apenas o Admin pode alterar as configurações.</p>}
      {role === "admin" && <Button className="gold-gradient text-primary-foreground hover:opacity-90" onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar Configurações"}</Button>}
    </div>
  );
};

export default Settings;
