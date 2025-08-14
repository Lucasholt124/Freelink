// Em /components/mentor/CalendarView.tsx
// (Substitua o arquivo inteiro por esta versão final, definitiva e correta)
"use client";

import { JSX, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, Event } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Newspaper, MessageSquare, Mic, Sparkles, Copy, Link as LinkIcon, ImageIcon } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ReactMarkdown from 'react-markdown';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// <<< TIPOS CORRIGIDOS PARA CORRESPONDER EXATAMENTE AO SEU SCHEMA >>>
type PlanItemFromDB = {
  day: string;
  time: string;
  format: string;
  title: string;
  content_idea: string;
  status: "planejado" | "concluido";
  details?: {
    tool_suggestion: string;
    step_by_step: string;
    script_or_copy: string;
    hashtags: string;
    creative_guidance: {
        type: string;
        description: string;
        prompt: string;
        tool_link: string;
    };
  };
};
export type PlanItem = PlanItemFromDB & { id: string; };

const EditPostForm = ({ item, onSave, onCancel }: { item: PlanItem; onSave: (updatedItem: PlanItem) => void; onCancel: () => void; }) => {
    const [editedItem, setEditedItem] = useState(item);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setEditedItem(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedItem(prev => ({ ...prev, details: prev.details ? { ...prev.details, [name]: value } : undefined }));
    };
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(editedItem); };

    return (
        <form onSubmit={handleSave} className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto pr-4">
             <div><label className="text-sm font-medium">Título do Post</label><Input name="title" value={editedItem.title} onChange={handleChange} className="w-full mt-1" /></div>
            <div><label className="text-sm font-medium">Roteiro / Legenda</label><Textarea name="script_or_copy" value={editedItem.details?.script_or_copy ?? ""} onChange={handleDetailsChange} rows={8} className="w-full mt-1" /></div>
            <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button><Button type="submit">Salvar Alterações</Button></div>
        </form>
    );
};

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const formatConfig: Record<string, { icon: JSX.Element; color: string }> = {
  reels: { icon: <Video className="w-4 h-4 mr-2" />, color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800" },
  carrossel: { icon: <Newspaper className="w-4 h-4 mr-2" />, color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800" },
  story: { icon: <MessageSquare className="w-4 h-4 mr-2" />, color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800" },
  live: { icon: <Mic className="w-4 h-4 mr-2" />, color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800" },
  foto: { icon: <ImageIcon className="w-4 h-4 mr-2" />, color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800" },
  default: { icon: <MessageSquare className="w-4 h-4 mr-2" />, color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700" },
};
const getConfig = (fmt: string) => { const key = Object.keys(formatConfig).find(k => fmt.toLowerCase().includes(k)); return formatConfig[key || 'default']; }

export default function CalendarView({ plan, analysisId }: { plan: PlanItemFromDB[]; analysisId: Id<"analyses"> }) {
  const [selectedEvent, setSelectedEvent] = useState<PlanItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const updatePlanMutation = useMutation(api.mentor.updateContentPlan);
  const planWithIds: PlanItem[] = useMemo(() => plan.map((p, index) => ({ ...p, id: `${p.title}-${index}` })), [plan]);
  const events = useMemo(() => {
    const today = startOfDay(new Date());
    return planWithIds.map((item) => {
      const dayNumber = parseInt(item.day.replace(/\D/g, ""), 10) || 1;
      const eventDate = addDays(today, dayNumber - 1);
      const [h, m] = (item.time ?? "09:00").split(":");
      eventDate.setHours(Number(h ?? 9), Number(m ?? 0), 0, 0);
      return { title: item.title, start: eventDate, end: eventDate, allDay: false, resource: item };
    });
  }, [planWithIds]);

  // <<< INÍCIO DA CORREÇÃO DEFINITIVA >>>
  const handleUpdatePlan = (updatedPlan: PlanItem[]) => {
    // Mapeamos o array e construímos um novo objeto para cada item,
    // incluindo explicitamente apenas os campos que o banco de dados espera.
    // Isso é 100% à prova de linter e 100% type-safe.
    const planToSave = updatedPlan.map(item => ({
      day: item.day,
      time: item.time,
      format: item.format,
      title: item.title,
      content_idea: item.content_idea,
      status: item.status,
      details: item.details,
    }));

    // O 'as any' foi removido porque 'planToSave' agora tem o tipo exato que a mutação espera.
    toast.promise(updatePlanMutation({ analysisId, newPlan: planToSave }), {
      loading: "Sincronizando...",
      success: "Plano atualizado!",
      error: (err: unknown) => err instanceof Error ? err.message : "Falha ao sincronizar."
    });
  };
  // <<< FIM DA CORREÇÃO DEFINITIVA >>>

  const handleMarkCompleted = (item: PlanItem) => { const updatedPlan = planWithIds.map((p) => (p.id === item.id ? { ...p, status: "concluido" as const } : p)); handleUpdatePlan(updatedPlan); setSelectedEvent(null); };
  const handleSaveEdit = (editedItem: PlanItem) => { const updatedPlan = planWithIds.map(p => p.id === editedItem.id ? editedItem : p); handleUpdatePlan(updatedPlan); setSelectedEvent(null); setIsEditing(false); }

  return (
    <>
      <div className="bg-card p-4 rounded-2xl shadow-lg border h-[75vh] min-h-[500px] overflow-hidden">
        <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" culture="pt-BR" views={[Views.MONTH, Views.WEEK, Views.AGENDA]} defaultView={Views.MONTH}
          onSelectEvent={(ev: Event & { resource: PlanItem }) => setSelectedEvent(ev.resource)}
          eventPropGetter={(ev: Event & { resource: PlanItem }) => ({ className: `${getConfig(ev.resource.format).color} p-1 border rounded-md text-xs font-semibold cursor-pointer hover:scale-105 transition-transform shadow-sm ${ev.resource.status === "concluido" ? "opacity-60 line-through" : ""}` })}
          components={{ event: ({ event }) => { const res = event.resource as PlanItem; return (<div className="flex items-center overflow-hidden">{getConfig(res.format).icon}<span className="truncate">{event.title}</span></div>); } }}
          messages={{ next: "Próximo", previous: "Anterior", today: "Hoje", month: "Mês", week: "Semana", day: "Dia", agenda: "Agenda", noEventsInRange: "Nenhum post planejado." }} />
      </div>
      <Dialog open={!!selectedEvent} onOpenChange={() => { setSelectedEvent(null); setIsEditing(false); }}>
        <DialogContent className="max-w-3xl bg-card">
          {selectedEvent && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-3 text-2xl"><span className={clsx("px-3 py-1 rounded-full text-sm font-bold", getConfig(selectedEvent.format).color)}>{selectedEvent.format}</span>{selectedEvent.title}</DialogTitle></DialogHeader>
              {isEditing ? ( <EditPostForm item={selectedEvent} onSave={handleSaveEdit} onCancel={() => setIsEditing(false)} /> ) : (
                <>
                <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                    <h3 className="font-bold text-lg">Ideia de Conteúdo</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-md whitespace-pre-line"><ReactMarkdown>{selectedEvent.content_idea?.replace(/\\n/g, '\n')}</ReactMarkdown></div>
                    {selectedEvent.details && (<>
                        <div><h3 className="font-bold text-lg mt-4 mb-2">Roteiro e Legenda</h3><div className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-md whitespace-pre-line"><ReactMarkdown>{selectedEvent.details.script_or_copy?.replace(/\\n/g, '\n')}</ReactMarkdown></div><p className="text-sm text-muted-foreground mt-2"><span className="font-semibold">Hashtags:</span> {selectedEvent.details.hashtags}</p></div>
                        <div><h3 className="font-bold text-lg mt-4 mb-2">Plano de Execução</h3><p className="text-sm text-muted-foreground mb-2"><span className="font-semibold">Ferramentas:</span> {selectedEvent.details.tool_suggestion}</p><div className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-md"><ReactMarkdown>{selectedEvent.details.step_by_step?.replace(/\\n/g, '\n')}</ReactMarkdown></div></div>
                        {selectedEvent.details.creative_guidance && (
                          <div><h3 className="font-bold text-lg mt-4 mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-500" />Guia Criativo</h3><div className="border p-4 rounded-lg bg-background"><p className="text-muted-foreground mb-4">{selectedEvent.details.creative_guidance.description}</p>
                            {selectedEvent.details.creative_guidance.type === 'image' && (
                              <div className="bg-blue-900/10 dark:bg-blue-500/10 p-4 rounded-md font-mono text-sm text-blue-800 dark:text-blue-300 relative mb-4">
                                <p className="font-semibold mb-2">Prompt Sugerido:</p><p>{selectedEvent.details.creative_guidance.prompt}</p>
                                <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => { navigator.clipboard.writeText(selectedEvent.details?.creative_guidance.prompt ?? ""); toast.success("Prompt copiado!"); }}><Copy className="w-4 h-4" /></Button>
                              </div>
                            )}
                            <a href={selectedEvent.details.creative_guidance.tool_link} target="_blank" rel="noopener noreferrer"><Button className="w-full"><LinkIcon className="w-4 h-4 mr-2" /> Abrir Ferramenta Recomendada</Button></a>
                          </div></div>
                        )}
                    </>)}
                </div>
                <div className="pt-6 flex justify-end gap-2 border-t mt-6">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>Editar</Button>
                    {selectedEvent.status !== "concluido" && (<Button onClick={() => handleMarkCompleted(selectedEvent)}>Marcar como Concluído</Button>)}
                </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}