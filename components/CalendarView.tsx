// Em /components/mentor/CalendarView.tsx
"use client";

import { JSX, useMemo, useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views, Event } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addDays, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Video, Newspaper, MessageSquare, Mic, Sparkles,
  Copy, Link as LinkIcon, ImageIcon, CheckCircle,
  Clock, Calendar as CalendarIcon, X, Edit, Share2,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ReactMarkdown from 'react-markdown';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Tipos
type PlanItemFromDB = {
  day: string;
  time: string;
  format: string;
  title: string;
  content_idea: string;
  status: "planejado" | "concluido";
  completedAt?: number;
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

interface EditPostFormProps {
  item: PlanItem;
  onSave: (updatedItem: PlanItem) => void;
  onCancel: () => void;
}

// Componente de edição aprimorado
const EditPostForm = ({ item, onSave, onCancel }: EditPostFormProps) => {
  const [editedItem, setEditedItem] = useState(item);
  const [activeTab, setActiveTab] = useState("content");

  // Função para inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedItem(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Função para textareas
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedItem(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Função para campos de detalhes em textareas
  const handleDetailsTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({
      ...prev,
      details: prev.details
        ? { ...prev.details, [name]: value }
        : undefined
    }));
  };

  // Função para campos de detalhes em inputs
  const handleDetailsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({
      ...prev,
      details: prev.details
        ? { ...prev.details, [name]: value }
        : undefined
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedItem);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 pt-2">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Edit className="w-4 h-4 text-blue-500" />
              Título do Post
            </label>
            <Input
              name="title"
              value={editedItem.title}
              onChange={handleInputChange}
              className="w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Ideia de Conteúdo
            </label>
            <Textarea
              name="content_idea"
              value={editedItem.content_idea}
              onChange={handleTextAreaChange}
              rows={4}
              className="w-full mt-1 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Horário Ideal
            </label>
            <Input
              name="time"
              value={editedItem.time}
              onChange={handleInputChange}
              className="w-full mt-1"
              placeholder="Ex: 19:30"
            />
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              Roteiro / Legenda
            </label>
            <Textarea
              name="script_or_copy"
              value={editedItem.details?.script_or_copy ?? ""}
              onChange={handleDetailsTextAreaChange}
              rows={6}
              className="w-full mt-1 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Hashtags
            </label>
            <Input
              name="hashtags"
              value={editedItem.details?.hashtags ?? ""}
              onChange={handleDetailsInputChange}
              className="w-full mt-1"
              placeholder="#marketing #instagram"
            />
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="pt-4 flex justify-end gap-2 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <CheckCircle className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </DialogFooter>
    </form>
  );
};

// Configuração do calendário
const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Mapeamento de formatos para ícones e cores
const formatConfig: Record<string, { icon: JSX.Element; color: string }> = {
  reels: {
    icon: <Video className="w-4 h-4 mr-2" />,
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800"
  },
  carrossel: {
    icon: <Newspaper className="w-4 h-4 mr-2" />,
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
  },
  story: {
    icon: <MessageSquare className="w-4 h-4 mr-2" />,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800"
  },
  live: {
    icon: <Mic className="w-4 h-4 mr-2" />,
    color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800"
  },
  foto: {
    icon: <ImageIcon className="w-4 h-4 mr-2" />,
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800"
  },
  default: {
    icon: <MessageSquare className="w-4 h-4 mr-2" />,
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
  },
};

// Helper para determinar configuração baseada no formato
const getConfig = (fmt: string) => {
  const key = Object.keys(formatConfig).find(k => fmt.toLowerCase().includes(k));
  return formatConfig[key || 'default'];
};

// Componente principal do calendário
export default function CalendarView({ plan, analysisId }: { plan: PlanItemFromDB[]; analysisId: Id<"analyses"> }) {
  const [selectedEvent, setSelectedEvent] = useState<PlanItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentView, setCurrentView] = useState<string>(Views.MONTH);
  const [progressStats, setProgressStats] = useState({ total: 0, completed: 0, percent: 0 });
  const [todaysEvents, setTodaysEvents] = useState<PlanItem[]>([]);

  const updatePlanMutation = useMutation(api.mentor.updateContentPlan);

  // Preparar dados para o calendário
  const planWithIds: PlanItem[] = useMemo(() =>
    plan.map((p, index) => ({ ...p, id: `${p.title}-${index}` })),
    [plan]
  );

  // Criar eventos para o calendário
  const events = useMemo(() => {
    const today = startOfDay(new Date());
    return planWithIds.map((item) => {
      const dayNumber = parseInt(item.day.replace(/\D/g, ""), 10) || 1;
      const eventDate = addDays(today, dayNumber - 1);
      const [h, m] = (item.time ?? "09:00").split(":");
      eventDate.setHours(Number(h ?? 9), Number(m ?? 0), 0, 0);
      return {
        title: item.title,
        start: eventDate,
        end: eventDate,
        allDay: false,
        resource: item
      };
    });
  }, [planWithIds]);

  // Atualizar estatísticas de progresso
  useEffect(() => {
    const total = planWithIds.length;
    const completed = planWithIds.filter(item => item.status === "concluido").length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    setProgressStats({ total, completed, percent });

    // Encontrar eventos de hoje
    const today = new Date();
    const todaysItems = events
      .filter(event => isSameDay(event.start, today))
      .map(event => event.resource as PlanItem);

    setTodaysEvents(todaysItems);
  }, [planWithIds, events]);

  // Função para atualizar o plano
  const handleUpdatePlan = (updatedPlan: PlanItem[]) => {
    const planToSave = updatedPlan.map(item => ({
      day: item.day,
      time: item.time,
      format: item.format,
      title: item.title,
      content_idea: item.content_idea,
      status: item.status,
      completedAt: item.completedAt,
      details: item.details,
    }));

    toast.promise(updatePlanMutation({ analysisId, newPlan: planToSave }), {
      loading: "Sincronizando seu plano estratégico...",
      success: "Plano atualizado com sucesso!",
      error: (err: unknown) => err instanceof Error ? err.message : "Falha ao sincronizar. Tente novamente."
    });
  };

  // Marcar item como concluído
  const handleMarkCompleted = (item: PlanItem) => {
    const updatedPlan = planWithIds.map((p) => (
      p.id === item.id
        ? { ...p, status: "concluido" as const, completedAt: Date.now() }
        : p
    ));

    handleUpdatePlan(updatedPlan);
    setSelectedEvent(null);
  };

  // Salvar item editado
  const handleSaveEdit = (editedItem: PlanItem) => {
    const updatedPlan = planWithIds.map(p =>
      p.id === editedItem.id ? editedItem : p
    );

    handleUpdatePlan(updatedPlan);
    setSelectedEvent(null);
    setIsEditing(false);
  };

  // Compartilhar item
  const handleShareItem = () => {
    if (!selectedEvent) return;

    const shareText = `📅 ${selectedEvent.day} - ${selectedEvent.format}: ${selectedEvent.title}\n\n${selectedEvent.content_idea}\n\nGerado com Mentor.IA do @freelink 🚀`;

    navigator.clipboard.writeText(shareText);
    toast.success("Conteúdo copiado para compartilhamento!");
  };

  return (
    <>
      <div className="mb-6 space-y-6">
        {/* Estatísticas de progresso */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-500" />
              Progresso do Plano
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progressStats.percent} className="h-2 w-40" />
              <span className="text-sm text-muted-foreground">
                {progressStats.completed}/{progressStats.total} ({progressStats.percent}%)
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Visualização
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { label: "Mês", value: Views.MONTH },
                    { label: "Semana", value: Views.WEEK },
                    { label: "Agenda", value: Views.AGENDA }
                  ].map((view) => (
                    <Button
                      key={view.value}
                      variant={currentView === view.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentView(view.value)}
                      className="justify-start"
                    >
                      {view.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Posts de hoje */}
        {todaysEvents.length > 0 && (
          <div className="pb-3">
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Posts de Hoje
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              {todaysEvents.map((event, index) => (
                <Card key={index} className={cn(
                  "min-w-[220px] max-w-[220px] snap-start hover:shadow-md transition-shadow cursor-pointer",
                  event.status === "concluido" && "opacity-70"
                )} onClick={() => setSelectedEvent(event)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={cn(
                        "px-2 py-0.5 text-xs",
                        getConfig(event.format).color
                      )}>
                        <span className="flex items-center">
                          {getConfig(event.format).icon}
                          {event.format}
                        </span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">{event.time}</span>
                    </div>
                    <h5 className="font-medium text-sm line-clamp-2">{event.title}</h5>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">{event.day}</span>
                      {event.status === "concluido" ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                          Concluído
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                          Pendente
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calendário */}
      <div className="bg-card p-4 rounded-2xl shadow-lg border h-[65vh] min-h-[500px] overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="pt-BR"
          views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
          defaultView={Views.MONTH}
          onView={(view) => setCurrentView(view)}
          onSelectEvent={(ev: Event & { resource: PlanItem }) => setSelectedEvent(ev.resource)}
          eventPropGetter={(ev: Event & { resource: PlanItem }) => ({
            className: `${getConfig(ev.resource.format).color} p-1 border rounded-md text-xs font-semibold cursor-pointer hover:scale-105 transition-transform shadow-sm ${ev.resource.status === "concluido" ? "opacity-60 line-through" : ""}`
          })}
          components={{
            event: ({ event }: { event: Event & { resource: PlanItem } }) => {
              const res = event.resource;
              return (
                <div className="flex items-center overflow-hidden">
                  {getConfig(res.format).icon}
                  <span className="truncate">{event.title}</span>
                </div>
              );
            }
          }}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            noEventsInRange: "Nenhum post planejado neste período."
          }}
        />
      </div>

      {/* Modal de detalhes do evento */}
      <Dialog open={!!selectedEvent} onOpenChange={() => { setSelectedEvent(null); setIsEditing(false); }}>
        <DialogContent className="max-w-3xl bg-card">
          <AnimatePresence mode="wait">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                      <span className={clsx("px-3 py-1 rounded-full text-sm font-bold", getConfig(selectedEvent.format).color)}>
                        {selectedEvent.format}
                      </span>
                      {selectedEvent.title}
                    </DialogTitle>
                    <Badge className={
                      selectedEvent.status === "concluido"
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                        : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    }>
                      {selectedEvent.status === "concluido" ? "Concluído" : "Pendente"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{selectedEvent.day}</span>
                    <span>•</span>
                    <Clock className="w-4 h-4" />
                    <span>{selectedEvent.time}</span>
                  </div>
                </DialogHeader>

                {isEditing ? (
                  <motion.div
                    key="edit-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <EditPostForm
                      item={selectedEvent}
                      onSave={handleSaveEdit}
                      onCancel={() => setIsEditing(false)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Tabs defaultValue="content">
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="content">Conteúdo</TabsTrigger>
                        <TabsTrigger value="execution">Execução</TabsTrigger>
                      </TabsList>

                      <TabsContent value="content" className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                        <div>
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            Ideia de Conteúdo
                          </h3>
                          <div className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-md whitespace-pre-line mt-2">
                            <ReactMarkdown>{selectedEvent.content_idea?.replace(/\\n/g, '\n')}</ReactMarkdown>
                          </div>
                        </div>

                        {selectedEvent.details && (
                          <div>
                            <h3 className="font-bold text-lg mt-4 mb-2 flex items-center gap-2">
                              <Newspaper className="w-5 h-5 text-blue-500" />
                              Roteiro e Legenda
                            </h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-md whitespace-pre-line">
                              <ReactMarkdown>{selectedEvent.details.script_or_copy?.replace(/\\n/g, '\n')}</ReactMarkdown>
                            </div>

                            <div className="mt-4 p-3 border rounded-md bg-muted/50">
                              <p className="text-sm flex items-start gap-2">
                                <span className="font-semibold text-muted-foreground mt-0.5">Hashtags:</span>
                                <span className="text-blue-500">{selectedEvent.details.hashtags}</span>
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedEvent.details?.script_or_copy + "\n\n" + selectedEvent.details?.hashtags);
                                  toast.success("Legenda com hashtags copiada!");
                                }}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Legenda Completa
                              </Button>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="execution" className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                        {selectedEvent.details && (
                          <>
                            <div>
                              <h3 className="font-bold text-lg flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Plano de Execução
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2 mt-2">
                                <span className="font-semibold">Ferramenta Recomendada:</span>
                                {selectedEvent.details.tool_suggestion}
                              </p>
                              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-md">
                                <ReactMarkdown>{selectedEvent.details.step_by_step?.replace(/\\n/g, '\n')}</ReactMarkdown>
                              </div>
                            </div>

                            {selectedEvent.details.creative_guidance && (
                              <div>
                                <h3 className="font-bold text-lg mt-4 mb-2 flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-blue-500" />
                                  Guia Criativo
                                </h3>
                                <div className="border p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                                  <p className="text-muted-foreground mb-4">{selectedEvent.details.creative_guidance.description}</p>

                                  {selectedEvent.details.creative_guidance.type === 'image' && (
                                    <div className="bg-blue-900/10 dark:bg-blue-500/10 p-4 rounded-md font-mono text-sm text-blue-800 dark:text-blue-300 relative mb-4">
                                      <p className="font-semibold mb-2">Prompt Sugerido:</p>
                                      <p>{selectedEvent.details.creative_guidance.prompt}</p>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2 h-7 w-7"
                                        onClick={() => {
                                          navigator.clipboard.writeText(selectedEvent.details?.creative_guidance.prompt ?? "");
                                          toast.success("Prompt copiado!");
                                        }}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}

                                  <a
                                    href={selectedEvent.details.creative_guidance.tool_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                      <LinkIcon className="w-4 h-4 mr-2" />
                                      Abrir Ferramenta Recomendada
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </TabsContent>
                    </Tabs>

                    <div className="pt-6 flex justify-end gap-2 border-t mt-6">
                      <Button variant="outline" onClick={handleShareItem}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </Button>

                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>

                      {selectedEvent.status !== "concluido" ? (
                        <Button
                          onClick={() => handleMarkCompleted(selectedEvent)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como Concluído
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/50"
                          onClick={() => {
                            const updatedPlan = planWithIds.map((p) => (
                              p.id === selectedEvent.id
                                ? { ...p, status: "planejado" as const, completedAt: undefined }
                                : p
                            ));
                            handleUpdatePlan(updatedPlan);
                            setSelectedEvent(null);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como Pendente
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}