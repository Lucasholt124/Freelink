// Em components/CalendarView.tsx

"use client";

import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Event as BigCalendarEvent } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importando componentes do Dialog do ShadCN/UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }), getDay, locales,
});

type WeeklyPlanItem = { day: string; time: string; format: string; content_idea: string; };
interface CalendarViewProps { plan: WeeklyPlanItem[]; }

export default function CalendarView({ plan }: CalendarViewProps) {
    // Estado para controlar o evento selecionado e a visibilidade do modal
    const [selectedEvent, setSelectedEvent] = useState<BigCalendarEvent | null>(null);

    const events = useMemo(() => {
        if (!plan) return [];

        const dayMap: { [key: string]: number } = {
            "Domingo": 0, "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3,
            "Quinta-feira": 4, "Sexta-feira": 5, "Sábado": 6
        };

        const today = new Date();
        const currentDayOfWeek = today.getDay();

        return plan.map(item => {
            const targetDay = dayMap[item.day];
            if (targetDay === undefined) return null;

            let dayDifference = targetDay - currentDayOfWeek;
            if (dayDifference < 0) { dayDifference += 7; }

            const eventDate = new Date();
            eventDate.setDate(today.getDate() + dayDifference);
            const [hours, minutes] = item.time.split(':').map(Number);
            eventDate.setHours(hours, minutes, 0, 0);
            const endDate = new Date(eventDate);
            endDate.setHours(eventDate.getHours() + 1);

            return {
                title: `${item.format}: ${item.content_idea.substring(0, 40)}...`,
                start: eventDate,
                end: endDate,
                allDay: false,
                resource: item,
            };
        }).filter(Boolean);

    }, [plan]) as BigCalendarEvent[];

    const handleSelectEvent = (event: BigCalendarEvent) => {
        setSelectedEvent(event);
    };

    return (
        <>
            <div className="bg-white p-4 rounded-lg shadow-sm border h-[600px]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    culture="pt-BR"
                    defaultView="week"
                    onSelectEvent={handleSelectEvent} // <-- Ação ao clicar no evento
                    messages={{
                        next: "Próximo", previous: "Anterior", today: "Hoje",
                        month: "Mês", week: "Semana", day: "Dia",
                        agenda: "Agenda", noEventsInRange: "Nenhum post planejado neste período.",
                    }}
                />
            </div>

            {/* Modal de Detalhes do Evento */}
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <span className="bg-purple-100 text-purple-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                                {selectedEvent?.resource.format}
                            </span>
                             - {selectedEvent?.resource.day} às {selectedEvent?.resource.time}
                        </DialogTitle>
                        <DialogDescription className="pt-4 text-base text-gray-700 whitespace-pre-line">
                            {selectedEvent?.resource.content_idea}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}