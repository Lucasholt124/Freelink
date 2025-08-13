"use client";

import { useState } from "react";

export type FormData = {
  username: string;
  bio: string;
  offer: string;
  audience: string;
  planDuration: "week" | "month";
  format?: string;
  time?: string;
  status?: "planejado" | "concluido";
};

type Props = {
  onSubmit: (data: FormData) => void;
  defaults?: Partial<FormData>;
  isLoading?: boolean;
};

export default function ConversationalForm({ onSubmit, defaults, isLoading }: Props) {
  const [formData, setFormData] = useState<FormData>({
    username: defaults?.username ?? "",
    bio: defaults?.bio ?? "",
    offer: defaults?.offer ?? "",
    audience: defaults?.audience ?? "",
    planDuration: defaults?.planDuration ?? "week",
    format: defaults?.format,
    time: defaults?.time,
    status: defaults?.status,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-2xl shadow-lg bg-white">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="@seunome"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Duração do plano</label>
          <select
            name="planDuration"
            value={formData.planDuration}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="week">7 dias</option>
            <option value="month">30 dias</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Bio atual</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Quem é você e o que você faz?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Oferta (o que você oferece)</label>
          <input
            name="offer"
            value={formData.offer}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Ex: Mentoria em tráfego orgânico"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Público</label>
          <input
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Ex: infoprodutores iniciantes"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full disabled:opacity-60"
      >
        {isLoading ? "Gerando plano..." : "Gerar plano com Athena"}
      </button>
    </form>
  );
}
