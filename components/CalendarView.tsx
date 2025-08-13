// Em /components/CalendarView.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useMemo, useState, ReactNode } from 'react';
import { Calendar, dateFnsLocalizer, Event as BigCalendarEvent, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addDays, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Video, Image as ImageIcon, MessageSquare, Podcast, CheckSquare, Edit } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './ui/button';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type PlanItem = { day: string; time: string; format: string; title: string; content_idea: string; status: string; };

const formatIcons: Record<string, ReactNode> = {
    "Reels": <Video className="w-4 h-4 mr-2" />, "Carrossel": <ImageIcon className="w-4 h-4 mr-2" />, "Story": <MessageSquare className="w-4 h-4 mr-2" />, "Live": <Podcast className="w-4 h-4 mr-2" />,
};
const formatColors: Record<string, string> = {
    "Reels": "bg-red-100 text-red-800 border-red-200", "Carrossel": "bg-blue-100 text-blue-800 border-blue-200", "Story": "bg-yellow-100 text-yellow-800 border-yellow-200", "Live": "bg-purple-100 text-purple-800 border-purple-200",
};

export default function CalendarView({ plan }: { plan: PlanItem[] }) {
    const [selectedEvent, setSelectedEvent] = useState<BigCalendarEvent | null>(null);

    const events = useMemo(() => {
        if (!plan) return [];
        const monthStart = startOfMonth(new Date());
        return plan.map(item => {
            const dayNumber = parseInt(item.day.replace(/Dia /i, ''), 10);
            if (isNaN(dayNumber)) return null;
            const eventDate = addDays(monthStart, dayNumber - 1);
            const [hours, minutes] = item.time.split(':').map(Number);
            eventDate.setHours(hours, minutes, 0, 0);
            return { title: item.title, start: eventDate, end: eventDate, allDay: false, resource: item, };
        }).filter(Boolean) as BigCalendarEvent[];
    }, [plan]);

    const eventStyleGetter = (event: BigCalendarEvent) => {
        const format = event.resource.format;
        const colorClass = formatColors[format] || "bg-gray-100 text-gray-800";
        return { className: `${colorClass} p-1 border rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500` };
    };

    return (
        <>
            <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-lg border h-[80vh] min-h-[700px]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    culture="pt-BR"
                    views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
                    defaultView={Views.MONTH}
                    onSelectEvent={(event) => setSelectedEvent(event)}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        event: ({ event }) => ( <div className="flex items-center overflow-hidden">{formatIcons[event.resource.format]}<span className="truncate">{event.title}</span></div> )
                    }}
                    messages={{ next: "Próximo", previous: "Anterior", today: "Hoje", month: "Mês", week: "Semana", day: "Dia", agenda: "Agenda", noEventsInRange: "Nenhum post planejado." }}
                />
            </div>
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                           <span className={clsx("px-2.5 py-1 rounded-full text-xs font-bold", formatColors[selectedEvent?.resource.format])}>
                                {selectedEvent?.resource.format}
                            </span>
                            {selectedEvent?.title}
                        </DialogTitle>
                        <DialogDescription className="pt-4 text-base text-gray-800 whitespace-pre-line prose max-w-none">
                            {selectedEvent?.resource.content_idea}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline"><Edit className="w-4 h-4 mr-2"/>Editar Post</Button>
                        <Button><CheckSquare className="w-4 h-4 mr-2"/>Marcar como Concluído</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}