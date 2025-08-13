// Em /components/mentor/MentorIaForm.tsx
// (Substitua o arquivo inteiro)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
// COMENTÁRIO DE MELHORIA: Corrigido o caminho de importação para seguir o padrão shadcn.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type FormData = {
  username: string;
  bio: string;
  offer: string;
  audience: string;
  planDuration: "week" | "month";
};

type Props = {
  onSubmit: (data: FormData) => void;
  defaults?: Partial<FormData>;
  isLoading?: boolean;
};

export default function MentorIaForm({ onSubmit, defaults, isLoading }: Props) {
  const [formData, setFormData] = useState<FormData>({
    username: defaults?.username ?? "",
    bio: defaults?.bio ?? "",
    offer: defaults?.offer ?? "",
    audience: defaults?.audience ?? "",
    planDuration: defaults?.planDuration ?? "week",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: "week" | "month") => {
    setFormData((prev) => ({...prev, planDuration: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-2xl shadow-blue-500/10">
      <CardHeader>
        <CardTitle className="text-2xl">Informações do Perfil</CardTitle>
        <CardDescription>Quanto mais detalhes, mais poderosa será a estratégia de Athena.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="username" className="font-medium">Seu @Username no Instagram</label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="@freelink" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="planDuration" className="font-medium">Duração da Missão</label>
               <Select name="planDuration" value={formData.planDuration} onValueChange={handleSelectChange} required>
                  <SelectTrigger id="planDuration">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Sprint de 7 dias</SelectItem>
                    <SelectItem value="month">Campanha de 30 dias</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="font-medium">Sua Bio Atual (opcional)</label>
            <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Ex: Ajudo criadores a monetizar com links inteligentes ✨ | Fundador da @freelink" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
             <div className="space-y-2">
              <label htmlFor="offer" className="font-medium">O que você vende/oferece?</label>
              <Input id="offer" name="offer" value={formData.offer} onChange={handleChange} placeholder="Ex: Mentoria, E-book, Software SaaS" required />
            </div>
             <div className="space-y-2">
              <label htmlFor="audience" className="font-medium">Quem é seu público-alvo?</label>
              <Input id="audience" name="audience" value={formData.audience} onChange={handleChange} placeholder="Ex: Infoprodutores, freelancers, agências" required />
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
            {isLoading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Sparkles className="w-6 h-6 mr-2" />}
            {isLoading ? "Analisando..." : "Convocar Athena e Gerar Plano"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}