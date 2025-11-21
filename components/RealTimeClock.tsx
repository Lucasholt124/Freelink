"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RealTimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formato para horário de Sergipe (UTC-3)
  const sergipeTime = new Date(time.toLocaleString("en-US", { timeZone: "America/Maceio" }));
  const hours = sergipeTime.getHours().toString().padStart(2, '0');
  const minutes = sergipeTime.getMinutes().toString().padStart(2, '0');
  const seconds = sergipeTime.getSeconds().toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
      <Clock className="w-5 h-5 animate-pulse" />
      <span className="font-mono font-bold text-lg">
        {hours}:{minutes}:{seconds}
      </span>
      <Badge className="bg-white/20 text-white border-0 text-xs font-bold">
        Brasil
      </Badge>
    </div>
  );
}