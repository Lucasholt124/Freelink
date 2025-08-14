// Em /components/mentor/MentorIaForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Instagram, Info, CheckCircle2, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

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

  const [formProgress, setFormProgress] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    updateFormProgress();
  };

  const handleSelectChange = (value: "week" | "month") => {
    setFormData((prev) => ({...prev, planDuration: value}));
    updateFormProgress();
  };

  const updateFormProgress = () => {
    const total = 5; // Total number of fields
    let filled = 0;

    if (formData.username) filled++;
    if (formData.bio) filled++;
    if (formData.offer) filled++;
    if (formData.audience) filled++;
    if (formData.planDuration) filled++;

    setFormProgress(Math.floor((filled / total) * 100));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-3xl mx-auto shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 border-blue-200 dark:border-blue-800/50 overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-80" style={{ width: `${formProgress}%` }}></div>

        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Briefing Estratégico</CardTitle>
              <CardDescription className="mt-1">
                Forneça os detalhes para Athena criar sua estratégia personalizada
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-white/50 dark:bg-gray-900/50">
              {formProgress}% Completo
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 font-medium">
                <Instagram className="w-4 h-4 text-pink-500" />
                Seu @Username no Instagram
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Informe seu username sem o @. Usaremos isso para personalizar sua estratégia.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="freelink"
                  className="pl-7"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="offer" className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  O que você vende/oferece?
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Descreva seu produto ou serviço principal. Seja específico para resultados melhores.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="offer"
                  name="offer"
                  value={formData.offer}
                  onChange={handleChange}
                  placeholder="Ex: Mentoria, E-book, Software SaaS"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="flex items-center gap-2 font-medium">
                  <Link2 className="w-4 h-4 text-purple-500" />
                  Quem é seu público-alvo?
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Informe quem você quer alcançar. Quanto mais específico, melhor será o resultado.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="audience"
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  placeholder="Ex: Infoprodutores, freelancers, agências"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2 font-medium">
                Bio Atual (opcional)
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Ex: Ajudo criadores a monetizar com links inteligentes ✨ | Fundador da @freelink"
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Fornecer sua bio atual ajuda a Athena a criar sugestões mais alinhadas com seu perfil
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planDuration" className="flex items-center gap-2 font-medium">
                Duração da Missão
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Sprint: 7 dias de conteúdo focado para resultados rápidos. Campanha: 30 dias para uma estratégia completa.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Select
                name="planDuration"
                value={formData.planDuration}
                onValueChange={handleSelectChange}
                required
              >
                <SelectTrigger id="planDuration">
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">Sprint</Badge>
                      <span>7 dias (resultados rápidos)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="month">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">Campanha</Badge>
                      <span>30 dias (estratégia completa)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CardFooter className="px-0 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    <span className="text-lg">Athena está analisando seu perfil...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-2" />
                    <span className="text-lg">Convocar Athena & Gerar Plano Estratégico</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>

        <div className="px-6 py-4 text-xs text-center text-muted-foreground border-t">
          Seus dados são utilizados apenas para gerar uma estratégia personalizada e nunca são compartilhados.
        </div>
      </Card>
    </motion.div>
  );
}