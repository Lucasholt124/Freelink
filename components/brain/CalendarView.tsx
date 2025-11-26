// components/brain/CalendarView.tsx - VERSÃO MELHORADA
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  Sparkles,
  TrendingUp,
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
  reel: { icon: Video, label: "Reel", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50 dark:bg-blue-950/30" },
  carousel: { icon: Layers, label: "Carrossel", color: "bg-purple-500", textColor: "text-purple-600", bgLight: "bg-purple-50 dark:bg-purple-950/30" },
  image_post: { icon: Camera, label: "Post", color: "bg-pink-500", textColor: "text-pink-600", bgLight: "bg-pink-50 dark:bg-pink-950/30" },
  story_sequence: { icon: MessageSquare, label: "Story", color: "bg-indigo-500", textColor: "text-indigo-600", bgLight: "bg-indigo-50 dark:bg-indigo-950/30" },
} as const;

const STATUS_CONFIG = {
  draft: { icon: AlertCircle, label: "Rascunho", color: "text-gray-500", bg: "bg-gray-100" },
  scheduled: { icon: CalendarIcon, label: "Agendado", color: "text-blue-500", bg: "bg-blue-100" },
  queued: { icon: Clock, label: "Na Fila", color: "text-yellow-500", bg: "bg-yellow-100" },
  publishing: { icon: Loader2, label: "Publicando", color: "text-orange-500 animate-spin", bg: "bg-orange-100" },
  published: { icon: Check, label: "Publicado", color: "text-green-500", bg: "bg-green-100" },
  failed: { icon: AlertCircle, label: "Falhou", color: "text-red-500", bg: "bg-red-100" },
  notified: { icon: Check, label: "Notificado", color: "text-cyan-500", bg: "bg-cyan-100" },
  completed: { icon: CheckCircle2, label: "Concluído", color: "text-green-500", bg: "bg-green-100" },
  cancelled: { icon: X, label: "Cancelado", color: "text-gray-500", bg: "bg-gray-100" },
} as const;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

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
      isPast: boolean;
      posts: Doc<"scheduledPosts">[];
      events: Doc<"customCalendarEvents">[];
    }> = [];

    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: "", day: 0, isCurrentMonth: false, isToday: false, isPast: true, posts: [], events: [] });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayPosts = postsMap.get(dateStr) || [];
      const dayEvents = eventsMap.get(dateStr) || [];
      const currentDayDate = new Date(year, month, day);
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
      const isPast = currentDayDate < today && !isToday;

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday,
        isPast,
        posts: dayPosts,
        events: dayEvents,
      });
    }

    return days;
  }, [currentDate, posts, customEvents]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDate(todayStr);
  };

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    return calendarDays.find((d) => d.date === selectedDate) || null;
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
      setEditingPost(null);
    } catch (error) {
      toast.dismiss(loading);
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    }
  };

  const handleDeletePost = async (postId: Id<"scheduledPosts">) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;

    const loading = toast.loading("Excluindo...");
    try {
      await deletePost({ postId });
      toast.dismiss(loading);
      toast.success("Post excluído!");
    } catch {
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
        time: newEventTime || undefined,
        color: "#8B5CF6",
        icon: newEventType === "meeting" ? "📅" : newEventType === "reminder" ? "⏰" : "✅",
        notificationMethods: [],
      });

      toast.dismiss(loading);
      toast.success("✅ Evento criado!");
      setIsNewEventModalOpen(false);
      setNewEventTitle("");
      setNewEventDesc("");
      setNewEventTime("");
      setNewEventType("task");
    } catch {
      toast.dismiss(loading);
      toast.error("Erro ao criar evento");
    }
  };

  const handleToggleEvent = async (eventId: Id<"customCalendarEvents">) => {
    try {
      await toggleEventStatus({ eventId });
      toast.success("Status atualizado!");
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDeleteEvent = async (eventId: Id<"customCalendarEvents">) => {
    if (!confirm("Excluir este evento?")) return;

    try {
      await deleteEvent({ eventId });
      toast.success("Evento excluído!");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <CalendarIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalPosts}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Posts</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.totalEvents}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Eventos</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.byStatus.completed || 0}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Concluídos</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.byStatus.scheduled || 0}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Pendentes</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CALENDÁRIO */}
        <Card className="lg:col-span-2 shadow-xl border-2 overflow-hidden">
          <CardHeader className="pb-3 px-3 sm:px-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl capitalize">
                  <CalendarIcon className="w-5 h-5 text-purple-600" />
                  {monthName}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={handleToday} className="flex-1 sm:flex-none h-9">
                  Hoje
                </Button>
                <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-9 w-9">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-9 w-9">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-2 sm:px-4 pb-4 pt-4">
            {/* Cabeçalho dos dias */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day, i) => (
                <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
                </div>
              ))}
            </div>

            {/* Grid do calendário */}
            <div className="grid grid-cols-7 gap-1">
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
                      "min-h-[70px] sm:min-h-[90px] p-1 sm:p-2 border rounded-lg relative transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                      day.isCurrentMonth
                        ? "bg-white dark:bg-gray-900 hover:shadow-md cursor-pointer"
                        : "bg-gray-50 dark:bg-gray-950 opacity-30 cursor-not-allowed",
                      day.isToday && "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/30",
                      day.isPast && day.isCurrentMonth && "opacity-60",
                      isSelected && "ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-lg",
                      hasContent && !isSelected && "border-purple-200 dark:border-purple-800"
                    )}
                    onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
                  >
                    {day.isCurrentMonth && (
                      <>
                        <div className={cn(
                          "text-xs sm:text-sm font-semibold mb-1",
                          day.isToday && "text-purple-600",
                          isSelected && "text-blue-600"
                        )}>
                          {day.day}
                        </div>

                        <div className="space-y-0.5">
                          {day.posts.slice(0, 2).map((post) => {
                            const config = CONTENT_TYPE_CONFIG[post.contentType];
                            return (
                              <div
                                key={post._id}
                                className={cn(
                                  "text-[8px] sm:text-[10px] px-1 py-0.5 rounded truncate",
                                  config.bgLight, config.textColor
                                )}
                              >
                                <span className="hidden sm:inline">{post.scheduledTime}</span>
                                <span className="sm:hidden">•</span>
                              </div>
                            );
                          })}
                          {day.events.slice(0, 1).map((event) => (
                            <div
                              key={event._id}
                              className="text-[8px] sm:text-[10px] px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 truncate"
                            >
                              {event.icon}
                            </div>
                          ))}
                          {(day.posts.length + day.events.length) > 3 && (
                            <div className="text-[8px] text-center text-muted-foreground">
                              +{day.posts.length + day.events.length - 3}
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SIDEBAR */}
        <Card className="shadow-xl border-2">
          <CardHeader className="pb-3 px-3 sm:px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                {selectedDate ? (
                  <>
                    📅 {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </>
                ) : (
                  "Selecione um dia"
                )}
              </CardTitle>
              {selectedDate && (
                <Button size="sm" onClick={() => setIsNewEventModalOpen(true)} className="h-8 bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-3 h-3 mr-1" />
                  Novo
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-2 sm:px-4 pt-4">
            <ScrollArea className="h-[350px] sm:h-[450px]">
              {!selectedDayData || (selectedDayData.posts.length === 0 && selectedDayData.events.length === 0) ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">
                    {selectedDate ? "Nada agendado" : "👆 Clique em um dia"}
                  </p>
                  {selectedDate && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setIsNewEventModalOpen(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar evento
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 px-1">
                  {/* Posts */}
                  {selectedDayData.posts.map((post) => {
                    const config = CONTENT_TYPE_CONFIG[post.contentType];
                    const Icon = config.icon;
                    const StatusIcon = STATUS_CONFIG[post.status]?.icon || AlertCircle;

                    return (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all hover:shadow-md",
                          config.bgLight
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-lg", config.color)}>
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <Badge variant="outline" className="text-[10px] h-5">
                                {config.label}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {post.scheduledTime}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
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

                        <p className="text-xs line-clamp-2 text-gray-700 dark:text-gray-300 mb-2">
                          {post.caption}
                        </p>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {post.platform}
                          </Badge>
                          <div className={cn(
                            "flex items-center gap-1 text-[10px]",
                            STATUS_CONFIG[post.status]?.color
                          )}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{STATUS_CONFIG[post.status]?.label}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Eventos */}
                  {selectedDayData.events.map((event) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xl">{event.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              "text-sm font-semibold truncate",
                              event.status === "completed" && "line-through text-muted-foreground"
                            )}>
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
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
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
      </div>

      {/* MODAL: EDITAR POST */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-purple-600" />
              Editar Post
            </DialogTitle>
          </DialogHeader>

          {editingPost && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Legenda</Label>
                <Textarea
                  value={editingPost.caption}
                  onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                  rows={5}
                  className="resize-none"
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

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSavePost} className="flex-1 bg-purple-600 hover:bg-purple-700">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600" />
              Novo Evento
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Título *</Label>
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
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newEventType}
                  onValueChange={(v: typeof newEventType) => setNewEventType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">✅ Tarefa</SelectItem>
                    <SelectItem value="meeting">📅 Reunião</SelectItem>
                    <SelectItem value="reminder">⏰ Lembrete</SelectItem>
                    <SelectItem value="deadline">🎯 Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsNewEventModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateEvent} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Evento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}