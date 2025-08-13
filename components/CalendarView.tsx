"use client";

import { JSX, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addDays, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Video, Image as ImageIcon, MessageSquare, Podcast, CheckSquare, Edit } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type PlanFormat = "Reels" | "Carrossel" | "Story" | "Live" | string;

export type PlanItem = {
  day: string;
  time: string;
  format: PlanFormat;
  title: string;
  content_idea: string;
  status: string;
};

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const formatIcons: Record<"Reels" | "Carrossel" | "Story" | "Live", JSX.Element> = {
  Reels: <Video className="w-4 h-4 mr-2 text-red-500" />,
  Carrossel: <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />,
  Story: <MessageSquare className="w-4 h-4 mr-2 text-yellow-500" />,
  Live: <Podcast className="w-4 h-4 mr-2 text-purple-500" />,
};

const formatColors: Record<"Reels" | "Carrossel" | "Story" | "Live", string> = {
  Reels: "bg-red-50 text-red-800 border-red-200",
  Carrossel: "bg-blue-50 text-blue-800 border-blue-200",
  Story: "bg-yellow-50 text-yellow-800 border-yellow-200",
  Live: "bg-purple-50 text-purple-800 border-purple-200",
};

const colorFor = (fmt: PlanFormat) => (formatColors as Record<string, string>)[fmt] || "bg-gray-50 text-gray-800 border-gray-200";
const iconFor = (fmt: PlanFormat) => (formatIcons as Record<string, JSX.Element>)[fmt] || <MessageSquare className="w-4 h-4 mr-2" />;

export default function CalendarView({ plan }: { plan: PlanItem[] }) {
  const [selectedEvent, setSelectedEvent] = useState<PlanItem | null>(null);

  const events = useMemo(() => {
    if (!plan) return [];
    const monthStart = startOfMonth(new Date());
    return plan.map((item) => {
      const dayNumber = parseInt(item.day.replace(/\D/g, ""), 10) || 1;
      const eventDate = addDays(monthStart, dayNumber - 1);
      const [h, m] = (item.time ?? "09:00").split(":");
      eventDate.setHours(Number(h ?? 9), Number(m ?? 0), 0, 0);
      return { title: item.title, start: eventDate, end: eventDate, allDay: false, resource: item };
    });
  }, [plan]);

  return (
    <>
      <div className="bg-white p-4 rounded-2xl shadow-lg border h-[70vh] min-h-[420px] overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="pt-BR"
          views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
          defaultView={Views.MONTH}
          onSelectEvent={(ev: { resource: PlanItem }) => setSelectedEvent(ev.resource)}
          eventPropGetter={(ev) => ({
            className: `${colorFor((ev.resource as PlanItem).format)} p-1 border rounded-md text-xs font-semibold cursor-pointer hover:scale-105 transition-transform shadow-sm`,
          })}
          components={{
            event: ({ event }) => {
              const res = event.resource as PlanItem;
              return (
                <div className="flex items-center overflow-hidden">
                  {iconFor(res.format)}
                  <span className="truncate">{event.title}</span>
                </div>
              );
            },
          }}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            noEventsInRange: "Nenhum post planejado.",
          }}
        />
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className={clsx(
                  "px-2.5 py-1 rounded-full text-xs font-bold",
                  selectedEvent ? colorFor(selectedEvent.format) : ""
                )}
              >
                {selectedEvent?.format}
              </span>
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription className="pt-4 text-base text-gray-800 whitespace-pre-line">
              {selectedEvent?.content_idea}
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => toast("Função editar em breve")}>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Button>
            <Button onClick={() => toast("Marcado como concluído!")}>
              <CheckSquare className="w-4 h-4 mr-2" /> Concluído
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
