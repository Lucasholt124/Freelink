"use client";

import { useState, useMemo, useRef } from "react";
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

  CalendarDays,
  Bell,
  Target,
  Zap,
  Link,
  Upload,
  ImageIcon,
  Eye,
  Hash,
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
  DropdownMenuSeparator,
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

// =================================================================
// CONFIGURAÇÕES
// =================================================================
const CONTENT_TYPE_CONFIG = {
  reel: {
    icon: Video,
    label: "Reel",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-800",
    gradient: "from-blue-500 to-cyan-500",
  },
  carousel: {
    icon: Layers,
    label: "Carrossel",
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgLight: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-200 dark:border-purple-800",
    gradient: "from-purple-500 to-pink-500",
  },
  image_post: {
    icon: Camera,
    label: "Post",
    color: "bg-pink-500",
    textColor: "text-pink-600",
    bgLight: "bg-pink-50 dark:bg-pink-950/40",
    borderColor: "border-pink-200 dark:border-pink-800",
    gradient: "from-pink-500 to-rose-500",
  },
  story_sequence: {
    icon: MessageSquare,
    label: "Story",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgLight: "bg-orange-50 dark:bg-orange-950/40",
    borderColor: "border-orange-200 dark:border-orange-800",
    gradient: "from-orange-500 to-amber-500",
  },
} as const;

const STATUS_CONFIG = {
  draft: { icon: AlertCircle, label: "Rascunho", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
  scheduled: { icon: CalendarIcon, label: "Agendado", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  queued: { icon: Clock, label: "Na Fila", color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  publishing: { icon: Loader2, label: "Publicando", color: "text-orange-500 animate-spin", bg: "bg-orange-100 dark:bg-orange-900/30" },
  published: { icon: Check, label: "Publicado", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  failed: { icon: AlertCircle, label: "Falhou", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
  notified: { icon: Bell, label: "Notificado", color: "text-cyan-500", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
  completed: { icon: CheckCircle2, label: "Concluído", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  cancelled: { icon: X, label: "Cancelado", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
} as const;

const WEEKDAYS_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

const EVENT_TYPES = [
  { value: "task", label: "✅ Tarefa", icon: "✅" },
  { value: "meeting", label: "📅 Reunião", icon: "📅" },
  { value: "reminder", label: "⏰ Lembrete", icon: "⏰" },
  { value: "deadline", label: "🎯 Deadline", icon: "🎯" },
  { value: "custom", label: "📝 Personalizado", icon: "📝" },
] as const;

// =================================================================
// COMPONENTE STAT CARD
// =================================================================
const StatCard = ({
  icon: Icon,
  value,
  label,
  gradient,
  delay = 0,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  gradient: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring" }}
    whileHover={{ scale: 1.03, y: -2 }}
    className="relative overflow-hidden"
  >
    <Card className={cn(
      "p-3 sm:p-4 border-0 shadow-lg cursor-pointer transition-shadow hover:shadow-xl",
      `bg-gradient-to-br ${gradient}`
    )}>
      <div className="relative z-10 flex items-center gap-3">
        <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
            className="text-2xl sm:text-3xl font-black text-white"
          >
            {value}
          </motion.p>
          <p className="text-[10px] sm:text-xs text-white/80 font-medium">{label}</p>
        </div>
      </div>
      {/* Decoração */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full" />
    </Card>
  </motion.div>
);

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================
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

  const [, setEditMediaFile] = useState<File | null>(null);
const [editMediaPreview, setEditMediaPreview] = useState<string | null>(null);
const [isUploadingEdit, setIsUploadingEdit] = useState(false);
const editFileInputRef = useRef<HTMLInputElement>(null);

const generateUploadUrl = useMutation(api.files.generateUploadUrl);
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
const handleEditMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !editingPost) return;

  const isVideo = editingPost.contentType === "reel";
  const validTypes = isVideo
    ? ["video/mp4", "video/quicktime", "video/x-msvideo"]
    : ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!validTypes.includes(file.type)) {
    toast.error(`Formato inválido. Use ${isVideo ? "vídeo" : "imagem"}.`);
    return;
  }

  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error(`Arquivo muito grande. Máximo: ${isVideo ? "50MB" : "10MB"}`);
    return;
  }

  setIsUploadingEdit(true);

  try {
    const reader = new FileReader();
    reader.onload = () => setEditMediaPreview(reader.result as string);
    reader.readAsDataURL(file);

    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) throw new Error("Erro ao fazer upload");

    const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };

    setEditingPost({
      ...editingPost,
      mediaStorageId: storageId
    });
    setEditMediaFile(file);

    toast.success(isVideo ? "✅ Vídeo carregado!" : "✅ Imagem carregada!");
  } catch (error) {
    console.error("Erro no upload:", error);
    toast.error("Erro ao fazer upload. Tente novamente.");
  } finally {
    setIsUploadingEdit(false);
  }
};
  // =================================================================
  // DADOS DO CALENDÁRIO
  // =================================================================
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
      isWeekend: boolean;
      posts: Doc<"scheduledPosts">[];
      events: Doc<"customCalendarEvents">[];
    }> = [];

    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: "",
        day: 0,
        isCurrentMonth: false,
        isToday: false,
        isPast: true,
        isWeekend: false,
        posts: [],
        events: [],
      });
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
      const dayOfWeek = currentDayDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday,
        isPast,
        isWeekend,
        posts: dayPosts,
        events: dayEvents,
      });
    }

    return days;
  }, [currentDate, posts, customEvents]);

  // =================================================================
  // HANDLERS
  // =================================================================
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

    const loadingId = toast.loading("Salvando alterações...");
    try {
      await updatePost({
        postId: editingPost._id,
        caption: editingPost.caption,
        hashtags: editingPost.hashtags,
        scheduledDate: editingPost.scheduledDate,
        scheduledTime: editingPost.scheduledTime,
      });
      toast.dismiss(loadingId);
      toast.success("✅ Post atualizado com sucesso!");
      setIsEditModalOpen(false);
      setEditingPost(null);
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    }
  };

  const handleDeletePost = async (postId: Id<"scheduledPosts">) => {
    if (!confirm("Tem certeza que deseja excluir este post agendado?")) return;

    const loadingId = toast.loading("Excluindo...");
    try {
      await deletePost({ postId });
      toast.dismiss(loadingId);
      toast.success("Post excluído!");
    } catch {
      toast.dismiss(loadingId);
      toast.error("Erro ao excluir");
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate) {
      toast.error("Preencha o título do evento");
      return;
    }

    const loadingId = toast.loading("Criando evento...");
    try {
      const eventIcon = EVENT_TYPES.find(e => e.value === newEventType)?.icon || "📝";

      await createEvent({
        title: newEventTitle,
        description: newEventDesc,
        type: newEventType,
        date: selectedDate,
        time: newEventTime || undefined,
        color: "#8B5CF6",
        icon: eventIcon,
        notificationMethods: [],
      });

      toast.dismiss(loadingId);
      toast.success("✅ Evento criado com sucesso!");
      setIsNewEventModalOpen(false);
      resetNewEventForm();
    } catch {
      toast.dismiss(loadingId);
      toast.error("Erro ao criar evento");
    }
  };

  const resetNewEventForm = () => {
    setNewEventTitle("");
    setNewEventDesc("");
    setNewEventTime("");
    setNewEventType("task");
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

  // =================================================================
  // RENDER
  // =================================================================
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Título */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Calendário de Conteúdo
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie suas publicações e eventos
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={CalendarDays}
              value={stats.totalPosts}
              label="Posts Agendados"
              gradient="from-blue-500 to-cyan-500"
              delay={0}
            />
            <StatCard
              icon={Sparkles}
              value={stats.totalEvents}
              label="Eventos"
              gradient="from-purple-500 to-pink-500"
              delay={0.1}
            />
            <StatCard
              icon={CheckCircle2}
              value={stats.byStatus.completed || 0}
              label="Concluídos"
              gradient="from-green-500 to-emerald-500"
              delay={0.2}
            />
            <StatCard
              icon={Target}
              value={stats.byStatus.scheduled || 0}
              label="Pendentes"
              gradient="from-orange-500 to-amber-500"
              delay={0.3}
            />
          </div>
        )}
      </motion.div>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* CALENDÁRIO */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-2xl border-0 bg-white dark:bg-gray-900 overflow-hidden">
            {/* Header do Calendário */}
            <CardHeader className="pb-4 px-4 sm:px-6 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-black capitalize">
                    <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    {monthName}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    className="flex-1 sm:flex-none h-10 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/50"
                  >
                    <Zap className="w-4 h-4 mr-1.5 text-purple-600" />
                    Hoje
                  </Button>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevMonth}
                      className="h-9 w-9 hover:bg-white dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNextMonth}
                      className="h-9 w-9 hover:bg-white dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-2 sm:p-4">
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "text-center text-xs sm:text-sm font-bold py-2 sm:py-3 rounded-lg",
                      i === 0 || i === 6
                        ? "text-pink-500 bg-pink-50 dark:bg-pink-950/30"
                        : "text-gray-600 dark:text-gray-400"
                    )}
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
                  </div>
                ))}
              </div>

              {/* Grid do calendário */}
             <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
  {calendarDays.map((day, idx) => {
    const isSelected = selectedDate === day.date;
    const hasContent = day.posts.length > 0 || day.events.length > 0;
    const totalItems = day.posts.length + day.events.length;

    return (
      <motion.button
        key={idx}
        type="button"
        whileHover={day.isCurrentMonth ? { scale: 1.02 } : {}}
        whileTap={day.isCurrentMonth ? { scale: 0.98 } : {}}
        disabled={!day.isCurrentMonth}
        className={cn(
          "relative min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-2 rounded-xl transition-all",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
          day.isCurrentMonth
            ? "bg-white dark:bg-gray-800/50 hover:shadow-lg cursor-pointer border border-gray-100 dark:border-gray-800"
            : "bg-gray-50 dark:bg-gray-950 opacity-30 cursor-not-allowed",
          day.isToday && "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/50 border-purple-200 shadow-lg shadow-purple-500/20",
          day.isPast && day.isCurrentMonth && "opacity-60",
          day.isWeekend && day.isCurrentMonth && "bg-pink-50/50 dark:bg-pink-950/20",
          isSelected && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-xl border-blue-200 transform scale-105",
          hasContent && !isSelected && "border-purple-200 dark:border-purple-800 shadow-md"
        )}
        onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
      >
        {day.isCurrentMonth && (
          <>
            {/* Número do dia com animação */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.01 }}
              className={cn(
                "text-xs sm:text-sm font-bold mb-1 transition-all",
                day.isToday && "text-purple-600 dark:text-purple-400 text-base sm:text-lg",
                day.isWeekend && !day.isToday && "text-pink-500",
                isSelected && "text-blue-600 text-base sm:text-lg"
              )}
            >
              {day.day}
            </motion.div>

            {/* Indicadores de conteúdo com animação */}
            <div className="space-y-0.5">
              {day.posts.slice(0, 2).map((post, pIdx) => {
                const config = CONTENT_TYPE_CONFIG[post.contentType];
                return (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: pIdx * 0.05 }}
                    className={cn(
                      "hidden sm:flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md",
                      config.bgLight, config.textColor
                    )}
                  >
                    <config.icon className="w-2.5 h-2.5" />
                    <span className="truncate">{post.scheduledTime}</span>
                  </motion.div>
                );
              })}

              {/* Mobile: Dots indicadores animados */}
              <div className="sm:hidden flex gap-0.5 flex-wrap">
                {day.posts.slice(0, 3).map((post, pIdx) => {
                  const config = CONTENT_TYPE_CONFIG[post.contentType];
                  return (
                    <motion.div
                      key={post._id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: pIdx * 0.05, type: "spring" }}
                      className={cn("w-1.5 h-1.5 rounded-full", config.color)}
                    />
                  );
                })}
                {day.events.slice(0, 2).map((event, eIdx) => (
                  <motion.div
                    key={event._id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (day.posts.length + eIdx) * 0.05, type: "spring" }}
                    className="w-1.5 h-1.5 rounded-full bg-purple-500"
                  />
                ))}
              </div>

              {/* Contador de itens adicionais */}
              {totalItems > 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[9px] text-center text-muted-foreground font-medium bg-gray-100 dark:bg-gray-800 rounded-full px-1"
                >
                  +{totalItems - 3}
                </motion.div>
              )}
            </div>

            {/* Indicador de seleção com animação */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}

            {/* Indicador Today com pulso */}
            {day.isToday && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-600 rounded-full"
              />
            )}
          </>
        )}
      </motion.button>
    );
  })}
</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SIDEBAR - DETALHES DO DIA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-2xl border-0 bg-white dark:bg-gray-900 sticky top-20">
            <CardHeader className="pb-3 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  {selectedDate ? (
                    <>
                      <div className="p-1.5 bg-blue-600 rounded-lg">
                        <CalendarDays className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="block">
                          {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                          })}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {WEEKDAYS_FULL[new Date(selectedDate + "T00:00:00").getDay()]}
                        </span>
                      </div>
                    </>
            ) : (
              <>
                <div className="p-1.5 bg-gray-400 rounded-lg">
                  <CalendarDays className="w-4 h-4 text-white" />
                </div>
                Selecione um dia
              </>
            )}
          </CardTitle>
          {selectedDate && (
            <Button
              size="sm"
              onClick={() => setIsNewEventModalOpen(true)}
              className="h-9 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              <Plus className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Novo</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px] sm:h-[500px]">
          <div className="p-4">
            {!selectedDayData || (selectedDayData.posts.length === 0 && selectedDayData.events.length === 0) ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">
                  {selectedDate ? "Nada agendado" : "Selecione um dia"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDate ? "Este dia está livre" : "Clique em um dia do calendário"}
                </p>
                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsNewEventModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Adicionar evento
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* CUSTOM EVENTS */}
                {selectedDayData && selectedDayData.events.map((event, idx) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 transition-all hover:shadow-lg group relative"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="p-2 rounded-xl bg-purple-600">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <Badge className="bg-purple-600 text-white text-[10px]">
                            {EVENT_TYPES.find(t => t.value === event.type)?.label || event.type}
                          </Badge>
                          {event.time && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 hover:bg-white/80 dark:hover:bg-gray-800"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleToggleEvent(event._id)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Marcar como concluído
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteEvent(event._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </motion.div>
                ))}

                {/* POSTS */}
                {selectedDayData && selectedDayData.posts.map((post, idx) => {
                  const config = CONTENT_TYPE_CONFIG[post.contentType];
                  const Icon = config.icon;
                  const StatusIcon = STATUS_CONFIG[post.status]?.icon || AlertCircle;

                  return (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all hover:shadow-lg group relative",
                        config.bgLight, config.borderColor
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className={cn("p-2 rounded-xl bg-gradient-to-br", config.gradient)}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge className={cn("text-[10px] text-white", config.color)}>
                              {config.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.scheduledTime}
                            </p>
                          </div>
                        </div>

                        {/* 🔥 NOVO: Botão sempre visível no mobile */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 hover:bg-white/80 dark:hover:bg-gray-800"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleEditPost(post)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/brain/post/${post._id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(post._id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm line-clamp-2 text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                        {post.caption}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {post.platform}
                        </Badge>
                        <div className={cn(
                          "flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full font-medium",
                          STATUS_CONFIG[post.status]?.bg,
                          STATUS_CONFIG[post.status]?.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{STATUS_CONFIG[post.status]?.label}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </motion.div>
</div >

{/* ================================================================= */}
{/* MODAL: EDITAR POST */}
{/* ================================================================= */}
<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
  <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
        <Edit className="w-5 h-5 text-white" />
      </div>
      <DialogTitle className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
          <Edit className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="block">Editar Post Agendado</span>
          <span className="text-sm font-normal text-muted-foreground">
            Altere qualquer informação do post
          </span>
        </div>
      </DialogTitle>
    </DialogHeader>

    {editingPost && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 pt-2"
      >
        {/* 🔥 NOVO: Preview e Upload de Mídia */}
        {editingPost.mediaStorageId && (
          <div className="space-y-3">
            <Label className="font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Mídia do Post
            </Label>
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
              {editMediaPreview ? (
                editingPost.contentType === "reel" ? (
                  <video src={editMediaPreview} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={editMediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}

              <div className="absolute bottom-3 right-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={isUploadingEdit}
                  className="bg-white/90 hover:bg-white text-gray-900"
                >
                  {isUploadingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Trocar {editingPost.contentType === "reel" ? "Vídeo" : "Imagem"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setEditingPost({ ...editingPost, mediaStorageId: undefined });
                    setEditMediaPreview(null);
                    setEditMediaFile(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <input
              ref={editFileInputRef}
              type="file"
              accept={editingPost.contentType === "reel" ? "video/mp4,video/quicktime" : "image/*"}
              className="hidden"
              onChange={handleEditMediaChange}
            />
          </div>
        )}

        {/* Legenda */}
        <div className="space-y-2">
          <Label className="font-semibold">Legenda</Label>
          <Textarea
            value={editingPost.caption}
            onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
            rows={6}
            className="resize-none text-sm"
            placeholder="Escreva sua legenda..."
            maxLength={2200}
          />
          <p className="text-xs text-muted-foreground text-right">
            {editingPost.caption.length}/2200
          </p>
        </div>

        {/* 🔥 NOVO: Edição de Hashtags */}
        <div className="space-y-3">
          <Label className="font-semibold flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Hashtags ({editingPost.hashtags.length})
          </Label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border min-h-[60px]">
            {editingPost.hashtags.map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-white transition-colors"
                onClick={() => {
                  const newHashtags = editingPost.hashtags.filter((_, i) => i !== idx);
                  setEditingPost({ ...editingPost, hashtags: newHashtags });
                }}
              >
                {tag} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar hashtag"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.currentTarget;
                  const tag = input.value.trim();
                  if (tag && !editingPost.hashtags.includes(tag)) {
                    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
                    setEditingPost({
                      ...editingPost,
                      hashtags: [...editingPost.hashtags, formattedTag]
                    });
                    input.value = '';
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-semibold">Data</Label>
            <Input
              type="date"
              value={editingPost.scheduledDate}
              onChange={(e) => setEditingPost({ ...editingPost, scheduledDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Horário</Label>
            <Input
              type="time"
              value={editingPost.scheduledTime}
              onChange={(e) => setEditingPost({ ...editingPost, scheduledTime: e.target.value })}
              className="h-11"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditMediaPreview(null);
              setEditMediaFile(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSavePost}
            className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </motion.div>
    )}
  </DialogContent>
</Dialog>

      {/* ================================================================= */}
      {/* MODAL: NOVO EVENTO */}
      {/* ================================================================= */}
      <Dialog open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Novo Evento
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 pt-2"
          >
            <div className="space-y-2">
              <Label className="font-semibold">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Ex: Reunião com cliente"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Descrição</Label>
              <Textarea
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                placeholder="Detalhes adicionais do evento..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Tipo</Label>
                <Select
                  value={newEventType}
                  onValueChange={(v: typeof newEventType) => setNewEventType(v)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Horário</Label>
                <Input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {selectedDate && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Data selecionada:{" "}
                  <strong>
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => {
                  setIsNewEventModalOpen(false);
                  resetNewEventForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={!newEventTitle.trim()}
                className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Evento
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}