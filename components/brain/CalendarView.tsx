// components/brain/CalendarViewUltra.tsx - CALENDÁRIO EDITÁVEL COMPLETO
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Video,
  Layers,
  Camera,
  MessageSquare,
  Clock,
  Check,
  AlertCircle,
  Loader2,
  Edit,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Save,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Doc, Id } from "@/convex/_generated/dataModel";

const CONTENT_TYPE_CONFIG = {
  reel: { icon: Video, label: "Reel", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  carousel: { icon: Layers, label: "Carrossel", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  image_post: { icon: Camera, label: "Post", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  story_sequence: { icon: MessageSquare, label: "Story", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
} as const;

const STATUS_CONFIG = {
  draft: { icon: AlertCircle, label: "Rascunho", color: "text-gray-500" },
  scheduled: { icon: CalendarIcon, label: "Agendado", color: "text-blue-500" },
  queued: { icon: Clock, label: "Na Fila", color: "text-yellow-500" },
  publishing: { icon: Loader2, label: "Publicando", color: "text-orange-500 animate-spin" },
  published: { icon: Check, label: "Publicado", color: "text-green-500" },
  failed: { icon: AlertCircle, label: "Falhou", color: "text-red-500" },
  notified: { icon: Check, label: "Notificado", color: "text-cyan-500" },
  completed: { icon: CheckCircle2, label: "Concluído", color: "text-green-500" },
  cancelled: { icon: X, label: "Cancelado", color: "text-gray-500" },
} as const;

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Doc<"scheduledPosts"> | null>(null);

  // Estados para novo evento
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventType, setNewEventType] = useState<"task" | "meeting" | "reminder" | "deadline" | "custom">("task");

  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [currentDate]);

  const posts = useQuery(api.posts.getPostsByDateRange, { startDate, endDate });
  const customEvents = useQuery(api.calendar.getEventsByDateRange, { startDate, endDate });
  const stats = useQuery(api.calendar.getCalendarStats, { startDate, endDate });

  const updatePost = useMutation(api.calendar.updateScheduledPost);
  const deletePost = useMutation(api.calendar.deleteScheduledPost);
  const createEvent = useMutation(api.calendar.createCustomEvent);
  const deleteEvent = useMutation(api.calendar.deleteCustomEvent);
  const toggleEventStatus = useMutation(api.calendar.toggleEventStatus);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const postsMap = new Map<string, Doc<"scheduledPosts">[]>();
    posts?.forEach((post) => {
      if (!postsMap.has(post.scheduledDate)) {
        postsMap.set(post.scheduledDate, []);
      }
      postsMap.get(post.scheduledDate)!.push(post);
    });

    const eventsMap = new Map<string, Doc<"customCalendarEvents">[]>();
    customEvents?.forEach((event) => {
      if (!eventsMap.has(event.date)) {
        eventsMap.set(event.date, []);
      }
      eventsMap.get(event.date)!.push(event);
    });

    const days: Array<{
      date: string;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      posts: Doc<"scheduledPosts">[];
      events: Doc<"customCalendarEvents">[];
    }> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: "", day: 0, isCurrentMonth: false, isToday: false, posts: [], events: [] });
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayPosts = postsMap.get(dateStr) || [];
      const dayEvents = eventsMap.get(dateStr) || [];
      const isToday =
        today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday,
        posts: dayPosts,
        events: dayEvents,
      });
    }

    return days;
  }, [currentDate, posts, customEvents]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const dayData = calendarDays.find((d) => d.date === selectedDate);
    return dayData || null;
  }, [selectedDate, calendarDays]);

  const handleEditPost = (post: Doc<"scheduledPosts">) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleSavePost = async () => {
    if (!editingPost) return;

    const loading = toast.loading("Salvando...");
    try {
      await updatePost({
        postId: editingPost._id,
        caption: editingPost.caption,
        hashtags: editingPost.hashtags,
        scheduledDate: editingPost.scheduledDate,
        scheduledTime: editingPost.scheduledTime,
      });
      toast.dismiss(loading);
      toast.success("✅ Post atualizado!");
      setIsEditModalOpen(false);
    } catch (error) {
      toast.dismiss(loading);
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    }
  };

  const handleDeletePost = async (postId: Id<"scheduledPosts">) => {
    if (!confirm("Excluir este post?")) return;

    const loading = toast.loading("Excluindo...");
    try {
      await deletePost({ postId });
      toast.dismiss(loading);
      toast.success("Post excluído!");
    } catch  {
      toast.dismiss(loading);
      toast.error("Erro ao excluir");
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate) {
      toast.error("Preencha o título");
      return;
    }

    const loading = toast.loading("Criando evento...");
    try {
      await createEvent({
        title: newEventTitle,
        description: newEventDesc,
        type: newEventType,
        date: selectedDate,
        time: newEventTime,
        color: "#8B5CF6",
        icon: "📅",
        notificationMethods: [],
      });

      toast.dismiss(loading);
      toast.success("✅ Evento criado!");
      setIsNewEventModalOpen(false);
      setNewEventTitle("");
      setNewEventDesc("");
      setNewEventTime("");
    } catch  {
      toast.dismiss(loading);
      toast.error("Erro ao criar evento");
    }
  };

  const handleToggleEvent = async (eventId: Id<"customCalendarEvents">) => {
    try {
      await toggleEventStatus({ eventId });
      toast.success("Status atualizado!");
    } catch  {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDeleteEvent = async (eventId: Id<"customCalendarEvents">) => {
    if (!confirm("Excluir este evento?")) return;

    try {
      await deleteEvent({ eventId });
      toast.success("Evento excluído!");
    } catch  {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* CALENDÁRIO */}
      <Card className="lg:col-span-2 shadow-xl border-2">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl capitalize">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                {monthName}
              </CardTitle>
              {stats && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{stats.totalPosts} posts</span>
                  <span>•</span>
                  <span>{stats.totalEvents} eventos</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleToday} className="flex-1 sm:flex-none">
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 sm:h-9 sm:w-9">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 sm:h-9 sm:w-9">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-6 pb-4">
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
              <div
                key={i}
                className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground py-1 sm:py-2"
              >
                <span className="hidden sm:inline">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][i]}
                </span>
                <span className="sm:hidden">{day}</span>
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((day, idx) => {
              const isSelected = selectedDate === day.date;
              const hasContent = day.posts.length > 0 || day.events.length > 0;

              return (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={day.isCurrentMonth ? { scale: 1.02 } : {}}
                  whileTap={day.isCurrentMonth ? { scale: 0.98 } : {}}
                  disabled={!day.isCurrentMonth}
                  className={cn(
                    "min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border rounded-md sm:rounded-lg relative transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    day.isCurrentMonth
                      ? "bg-white dark:bg-gray-900 hover:shadow-lg hover:border-primary/60 cursor-pointer active:bg-primary/5"
                      : "bg-gray-50 dark:bg-gray-950 opacity-40 cursor-not-allowed",
                    day.isToday && "border-primary/80 bg-primary/5 ring-2 ring-primary/30",
                    isSelected && "ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-600 shadow-lg scale-105",
                    hasContent && "border-purple-300 dark:border-purple-700"
                  )}
                  onClick={() => {
                    if (day.isCurrentMonth) {
                      setSelectedDate(day.date);
                    }
                  }}
                >
                  {day.isCurrentMonth && (
                    <>
                      <div className={cn("text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1", isSelected && "text-blue-600")}>
                        {day.day}
                      </div>

                      <ScrollArea className="h-[40px] sm:h-[70px]">
                        <div className="space-y-0.5 sm:space-y-1">
                          {day.posts.slice(0, 2).map((post) => {
                            const config = CONTENT_TYPE_CONFIG[post.contentType];
                            const Icon = config.icon;
                            return (
                              <div
                                key={post._id}
                                className={cn("text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded border", config.color)}
                              >
                                <Icon className="w-2 h-2 sm:w-3 sm:h-3 inline mr-0.5" />
                                <span className="hidden sm:inline">{post.scheduledTime}</span>
                              </div>
                            );
                          })}{day.events.slice(0, 1).map((event) => (
                            <div
                              key={event._id}
                              className="text-[8px] sm:text-[10px] px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700"
                            >
                              {event.icon} <span className="hidden sm:inline">{event.title.slice(0, 10)}</span>
                            </div>
                          ))}
                          {day.posts.length + day.events.length > 3 && (
                            <div className="text-[8px] text-muted-foreground text-center">
                              +{day.posts.length + day.events.length - 3}
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900"
                          >
                            <Check className="w-full h-full text-white p-0.5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SIDEBAR: POSTS E EVENTOS DO DIA */}
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">
              {selectedDate
                ? `📅 ${new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                  })}`
                : "Selecione um dia"}
            </CardTitle>
            {selectedDate && (
              <Button size="sm" onClick={() => setIsNewEventModalOpen(true)} className="h-8">
                <Plus className="w-3 h-3 mr-1" />
                Novo
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-6">
          <ScrollArea className="h-[300px] sm:h-[500px]">
            {!selectedDayData || (selectedDayData.posts.length === 0 && selectedDayData.events.length === 0) ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                <p className="text-xs sm:text-sm px-4">
                  {selectedDate ? "Nenhum item agendado" : "👆 Clique em um dia"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 px-1">
                {/* POSTS */}
                {selectedDayData.posts.map((post) => {
                  const config = CONTENT_TYPE_CONFIG[post.contentType];
                  const Icon = config.icon;
                  const StatusIcon = STATUS_CONFIG[post.status].icon;

                  return (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg sm:rounded-xl border-2 hover:border-primary/50 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 sm:p-2 rounded-md", config.color.split(" ")[0])}>
                            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditPost(post)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(post._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-xs sm:text-sm line-clamp-2 mb-2">{post.caption}</p>

                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize">
                          {post.platform}
                        </Badge>
                        <div className={cn("flex items-center gap-1 text-[10px] sm:text-xs", STATUS_CONFIG[post.status].color)}>
                          <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>{STATUS_CONFIG[post.status].label}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* EVENTOS CUSTOM */}
                {selectedDayData.events.map((event) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-2 border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg">{event.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("text-sm font-semibold", event.status === "completed" && "line-through text-muted-foreground")}>
                            {event.title}
                          </h4>
                          {event.time && (
                            <p className="text-xs text-muted-foreground">{event.time}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggleEvent(event._id)}
                        >
                          {event.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* MODAL: EDITAR POST */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
          </DialogHeader>

          {editingPost && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Legenda</Label>
                <Textarea
                  value={editingPost.caption}
                  onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={editingPost.scheduledDate}
                    onChange={(e) => setEditingPost({ ...editingPost, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={editingPost.scheduledTime}
                    onChange={(e) => setEditingPost({ ...editingPost, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSavePost} className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: NOVO EVENTO */}
      <Dialog open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Ex: Reunião com cliente"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                placeholder="Detalhes do evento..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={newEventType}
                onValueChange={(value: "task" | "meeting" | "reminder" | "deadline" | "custom") => setNewEventType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Tarefa</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <Input type="time" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsNewEventModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateEvent} className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}