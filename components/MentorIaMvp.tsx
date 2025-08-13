"use client";

import { useState } from "react";
import ConversationalForm, { FormData } from "./MentorIaForm";

export type PlanItem = {
  title: string;
  day: string;
  time: string;
  format: string; // agora aceita qualquer string
  content_idea: string;
  status: string;
};

export default function AnalysisDashboard() {
  const [plan, setPlan] = useState<PlanItem[]>([]);

  const handleFormSubmit = (data: FormData) => {
    console.log("Recebendo dados do formulário:", data);

    // Exemplo de plano gerado
    const generatedPlan: PlanItem[] = [
      {
        title: `Plano para ${data.username}`,
        day: "Segunda-feira",
        time: "10:00",
        format: "Reels", // ainda pode usar valores fixos
        content_idea: `Falar sobre ${data.topic}`,
        status: "Pendente",
      },
    ];

    setPlan(generatedPlan);
  };

  return (
    <div className="space-y-6">
      <ConversationalForm onSubmit={handleFormSubmit} />

      {plan.length > 0 && (
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Plano Gerado</h2>
          <ul className="space-y-2">
            {plan.map((item, idx) => (
              <li key={idx} className="border p-2 rounded">
                <strong>{item.day} às {item.time}</strong> - {item.title} ({item.format})<br />
                <em>{item.content_idea}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
