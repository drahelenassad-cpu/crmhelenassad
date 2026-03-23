import { useEffect, useState, DragEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  pipeline_stage: string;
  notes: string;
  created_at: string;
};

const stages = [
  { key: "new_lead", label: "Novo Lead", emoji: "🆕", color: "border-primary/40" },
  { key: "in_contact", label: "Em Contato", emoji: "📞", color: "border-warning/40" },
  { key: "consultation_scheduled", label: "Consulta Agendada", emoji: "📅", color: "border-critical/40" },
  { key: "client", label: "Cliente", emoji: "✅", color: "border-success/40" },
  { key: "closed", label: "Fechado", emoji: "🔒", color: "border-muted-foreground/40" },
];

const Pipeline = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const fetchContacts = async () => {
    const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
    setContacts((data as unknown as Contact[]) ?? []);
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleDragStart = (e: DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: DragEvent, stage: string) => {
    e.preventDefault();
    if (!draggedId) return;

    const { error } = await supabase.from("contacts").update({ pipeline_stage: stage } as any).eq("id", draggedId);
    if (error) { toast.error("Erro ao mover contato"); return; }
    setContacts((prev) => prev.map((c) => c.id === draggedId ? { ...c, pipeline_stage: stage } : c));
    setDraggedId(null);
    toast.success("Etapa atualizada!");
  };

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Pipeline</h1>
        <p className="text-muted-foreground text-sm">Arraste e solte contatos entre as etapas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {stages.map((stage) => {
          const stageContacts = contacts.filter((c) => c.pipeline_stage === stage.key);
          return (
            <div
              key={stage.key}
              className={`rounded-lg border-2 ${stage.color} bg-card/50 p-3 min-h-[200px]`}
              onDrop={(e) => handleDrop(e, stage.key)}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center gap-2 mb-3">
                <span>{stage.emoji}</span>
                <span className="text-xs font-semibold">{stage.label}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] h-5">{stageContacts.length}</Badge>
              </div>
              <div className="space-y-2">
                {stageContacts.map((c) => (
                  <Card
                    key={c.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    className="bg-card border-border cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors"
                  >
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{c.phone || c.email}</p>
                    </CardContent>
                  </Card>
                ))}
                {stageContacts.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-4">Arraste aqui</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
