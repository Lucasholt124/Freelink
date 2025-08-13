// Em /components/mentor/CalendarView.tsx
"use client";

import { JSX, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, Event } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addDays, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Video, Newspaper, MessageSquare, Mic, CheckSquare, Edit, X } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ReactMarkdown from 'react-markdown';

// Tipos para o plano de conteúdo
export type PlanFormat = "Reels" | "Carrossel" | "Story" | "Live" | "Foto" | string;
export type PlanStatus = "planejado" | "concluido";

export type PlanItem = {
  id: string; // Adicionando um ID único para cada item
  day: string;
  time: string;
  format: PlanFormat;
  title: string;
  content_idea: string;
  status: PlanStatus;
  details?: { passo_a_passo: string };
};

// Componente do Formulário de Edição (para manter o código organizado)
const EditPostForm = ({
    item,
    onSave,
    onCancel,
}: {
    item: PlanItem;
    onSave: (updatedItem: PlanItem) => void;
    onCancel: () => void;
}) => {
    const [editedItem, setEditedItem] = useState(item);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedItem(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedItem);
    };

    // Supondo que você tenha componentes de UI prontos (Input, Textarea, etc.)
    return (
        <form onSubmit={handleSave} className="space-y-4 pt-4">
             <div>
                <label className="text-sm font-medium">Título</label>
                <input name="title" value={editedItem.title} onChange={handleChange} className="w-full mt-1 border rounded-md px-3 py-2 bg-background" />
            </div>
            <div>
                <label className="text-sm font-medium">Ideia de Conteúdo (suporta Markdown)</label>
                <textarea name="content_idea" value={editedItem.content_idea} onChange={handleChange} rows={5} className="w-full mt-1 border rounded-md px-3 py-2 bg-background" />
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-sm font-medium">Formato</label>
                    <input name="format" value={editedItem.format} onChange={handleChange} className="w-full mt-1 border rounded-md px-3 py-2 bg-background" />
                </div>
                <div className="flex-1">
                    <label className="text-sm font-medium">Horário</label>
                    <input name="time" type="time" value={editedItem.time} onChange={handleChange} className="w-full mt-1 border rounded-md px-3 py-2 bg-background" />
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}><X className="w-4 h-4 mr-2"/> Cancelar</Button>
                <Button type="submit"><CheckSquare className="w-4 h-4 mr-2"/> Salvar Alterações</Button>
            </div>
        </form>
    )
}


const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Ícones e cores aprimorados
const formatConfig: Record<string, { icon: JSX.Element; color: string }> = {
  reels: { icon: <Video className="w-4 h-4 mr-2" />, color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800" },
  carrossel: { icon: <Newspaper className="w-4 h-4 mr-2" />, color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800" },
  story: { icon: <MessageSquare className="w-4 h-4 mr-2" />, color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800" },
  live: { icon: <Mic className="w-4 h-4 mr-2" />, color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800" },
  foto: { icon: <MessageSquare className="w-4 h-4 mr-2" />, color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800" },
  default: { icon: <MessageSquare className="w-4 h-4 mr-2" />, color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700" },
};

const getConfig = (fmt: PlanFormat) => {
    const key = Object.keys(formatConfig).find(k => fmt.toLowerCase().includes(k));
    return formatConfig[key || 'default'];
}

export default function CalendarView({ plan, analysisId }: { plan: PlanItem[]; analysisId: Id<"analyses"> }) {
  const [selectedEvent, setSelectedEvent] = useState<PlanItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const updatePlanMutation = useMutation(api.mentor.updateContentPlan);

  // Adiciona um ID único para cada item do plano para facilitar a manipulação
  const planWithIds = useMemo(() => plan.map((p, index) => ({ ...p, id: p.title + index })), [plan]);

  const events = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    return planWithIds.map((item) => {
      const dayNumber = parseInt(item.day.replace(/\D/g, ""), 10) || 1;
      const eventDate = addDays(monthStart, dayNumber - 1);
      const [h, m] = (item.time ?? "09:00").split(":");
      eventDate.setHours(Number(h ?? 9), Number(m ?? 0), 0, 0);
      return { title: item.title, start: eventDate, end: eventDate, allDay: false, resource: item };
    });
  }, [planWithIds]);

    const handleUpdatePlan = (updatedPlan: PlanItem[]) => {
    // CORREÇÃO PARA REMOVER O 'id' SEM ERROS DE LINTER:
    // Criamos uma cópia de cada item e deletamos a propriedade 'id' da cópia.
    // Isso é limpo, não muta o estado original e não cria variáveis não utilizadas.
    const planToSave = updatedPlan.map(item => {
      const itemCopy = { ...item };
      delete (itemCopy as Partial<PlanItem>).id; // Usamos um cast mínimo e seguro aqui
      return itemCopy;
    });

    toast.promise(updatePlanMutation({ analysisId, newPlan: planToSave as PlanItem[] }), {
        loading: "Sincronizando com o banco de dados...",
        success: "Plano atualizado com sucesso!",
        // CORREÇÃO PARA O ERRO SEM USAR 'any':
        // Simplificamos a captura do erro. Em vez de tentar adivinhar a estrutura,
        // retornamos uma mensagem útil e segura.
        error: (err: unknown) => {
            if (err instanceof Error) {
                // A maioria dos erros do Convex tem a mensagem útil aqui
                return err.message;
            }
            return "Falha ao sincronizar. Verifique o console para mais detalhes.";
        },
    });
  };

  const handleMarkCompleted = (item: PlanItem) => {
    const updatedPlan = planWithIds.map((p) => (p.id === item.id ? { ...p, status: "concluido" as PlanStatus } : p));
    handleUpdatePlan(updatedPlan);
    setSelectedEvent(null);
  };

  const handleSaveEdit = (editedItem: PlanItem) => {
    const updatedPlan = planWithIds.map(p => p.id === editedItem.id ? editedItem : p);
    handleUpdatePlan(updatedPlan);
    setSelectedEvent(null);
    setIsEditing(false);
  }

  return (
    <>
      <div className="bg-card p-4 rounded-2xl shadow-lg border h-[75vh] min-h-[500px] overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="pt-BR"
          views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
          defaultView={Views.MONTH}
          onSelectEvent={(ev: Event & { resource: PlanItem }) => setSelectedEvent(ev.resource)}
          eventPropGetter={(ev: Event & { resource: PlanItem }) => ({
            className: `${getConfig(ev.resource.format).color} p-1 border rounded-md text-xs font-semibold cursor-pointer hover:scale-105 transition-transform shadow-sm ${ev.resource.status === "concluido" ? "opacity-60 line-through" : ""}`,
          })}
          components={{
            event: ({ event }) => {
              const res = event.resource as PlanItem;
              return (
                <div className="flex items-center overflow-hidden">
                  {getConfig(res.format).icon}
                  <span className="truncate">{event.title}</span>
                </div>
              );
            },
          }}
          messages={{
            next: "Próximo", previous: "Anterior", today: "Hoje",
            month: "Mês", week: "Semana", day: "Dia", agenda: "Agenda",
            noEventsInRange: "Nenhum post planejado para este período.",
          }}
        />
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={() => { setSelectedEvent(null); setIsEditing(false); }}>
        <DialogContent className="max-w-2xl bg-card">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", getConfig(selectedEvent.format).color)}>
                    {selectedEvent.format}
                  </span>
                  {selectedEvent.title}
                </DialogTitle>

                {!isEditing && (
                     <DialogDescription asChild className="pt-4 text-base text-muted-foreground prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{selectedEvent.content_idea.replace(/\\n/g, '\n')}</ReactMarkdown>
                    </DialogDescription>
                )}
              </DialogHeader>

              {isEditing ? (
                 <EditPostForm item={selectedEvent} onSave={handleSaveEdit} onCancel={() => setIsEditing(false)} />
              ) : (
                <div className="pt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" /> Editar
                    </Button>
                    {selectedEvent.status !== "concluido" && (
                    <Button onClick={() => handleMarkCompleted(selectedEvent)}>
                        <CheckSquare className="w-4 h-4 mr-2" /> Marcar como Concluído
                    </Button>
                    )}
              </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}