"use client";

import { useState } from "react";

export type FormData = {
  username: string; // Agora obrigatório para manter igual nos dois arquivos
  topic: string;
  goal: string;
};

export type ConversationalFormProps = {
  onSubmit: (data: FormData) => void;
};

export default function ConversationalForm({ onSubmit }: ConversationalFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    topic: "",
    goal: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Topic</label>
        <input
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Goal</label>
        <textarea
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Enviar
      </button>
    </form>
  );
}
