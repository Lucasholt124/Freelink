"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

import ConversationalForm, { FormData } from "./MentorIaForm";
import CalendarView, { PlanFormat, PlanItem } from "./CalendarView";

export type AnalysisDoc = {
  _id: string;
  _creationTime: number;
  userId: string;
  createdAt?: number;
  updatedAt?: number;

  suggestions: string[];
  strategy: string;
  grid: string[];
  content_plan: PlanItem[];

  username?: string;
  bio?: string;
  offer?: string;
  audience?: string;
  planDuration?: "week" | "month";
};

export default function MentorIaMvp() {
  const savedAnalysis = useQuery(api.mentor.getSavedAnalysis) as AnalysisDoc | null | undefined;
  const generateAnalysis = useAction(api.mentor.generateAnalysis);

  const [view, setView] = useState<"loading" | "form" | "dashboard">("loading");
  const [isLoading, setIsLoading] = useState(false);
  const [defaults, setDefaults] = useState<Partial<FormData> | undefined>(undefined);

  useEffect(() => {
    if (savedAnalysis === undefined) return;
    if (savedAnalysis) {
      setView("dashboard");
      setDefaults({
        username: savedAnalysis.username ?? "",
        bio: savedAnalysis.bio ?? "",
        offer: savedAnalysis.offer ?? "",
        audience: savedAnalysis.audience ?? "",
        planDuration: savedAnalysis.planDuration ?? "week",
      });
    } else {
      setView("form");
    }
  }, [savedAnalysis]);

  const normalizedPlan: PlanItem[] = useMemo(() => {
  const plan = savedAnalysis?.content_plan ?? [];
  return plan.map((p, idx) => ({
    title: p.title ?? "",
    day: String(p.day ?? idx + 1),
    time: String(p.time ?? "09:00"),
    format: String(p.format ?? "Story") as PlanFormat,
    content_idea: String(p.content_idea ?? ""),
    status: p.status === "concluido" ? "concluido" : "planejado", // ✅ aqui
  }));
}, [savedAnalysis]);

  const onSubmit = (data: FormData) => {
    setIsLoading(true);
    toast.promise(
      generateAnalysis({
        username: data.username,
        bio: data.bio,
        offer: data.offer,
        audience: data.audience,
        planDuration: data.planDuration,
      }),
      {
        loading: "Athena está criando seu plano estratégico...",
        success: () => {
          setView("dashboard");
          return "Plano gerado com sucesso!";
        },
        error: (err: Error) => err.message || "Falha ao gerar plano.",
      }
    );
  };

  if (view === "loading") return <div>Carregando Mentor IA...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {view === "form" && (
        <ConversationalForm onSubmit={onSubmit} defaults={defaults} isLoading={isLoading} />
      )}

      {view === "dashboard" && savedAnalysis && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-tr from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg">
            <div>
              <h2 className="text-2xl font-bold">Plano de Ação Estratégico</h2>
              <p className="opacity-80">
                @{savedAnalysis.username} • {savedAnalysis.offer}
              </p>
              <p className="opacity-70 text-sm">
                {new Date(savedAnalysis.updatedAt ?? savedAnalysis._creationTime).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setView("form")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Aprimorar Plano
            </Button>
          </div>

          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="strategy">Estratégia</TabsTrigger>
              <TabsTrigger value="suggestions">Bios</TabsTrigger>
              <TabsTrigger value="grid">Feed Ideal</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-6">
              <CalendarView plan={normalizedPlan} />
            </TabsContent>

            <TabsContent value="strategy" className="mt-6 p-6 bg-white rounded-lg border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Sua Estratégia de Conteúdo</h3>
              <div className="prose prose-lg max-w-none whitespace-pre-line text-gray-700">
                {savedAnalysis.strategy}
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-6">
              <div className="grid md:grid-cols-3 gap-4">
                {savedAnalysis.suggestions?.map((s, i) => (
                  <div key={i} className="p-6 border rounded-lg bg-white shadow-sm">
                    <p className="font-semibold mb-2">Opção {i + 1}</p>
                    <p className="text-gray-700">{s}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="grid" className="mt-6 flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4">Grid Harmônico Sugerido</h3>
              <div className="grid grid-cols-3 gap-2 p-2 bg-gray-100 rounded-xl max-w-sm">
                {savedAnalysis.grid?.map((idea, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-white rounded-lg flex items-center justify-center p-2 text-center text-xs font-medium text-gray-700 shadow-sm"
                  >
                    {idea}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </motion.div>
  );
}
