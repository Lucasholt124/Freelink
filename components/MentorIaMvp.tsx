// Em /components/mentor/MentorIaMvp.tsx
// (COPIE E COLE O ARQUIVO INTEIRO)

"use client";

import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, FileText, Copy, LayoutGrid, BrainCircuit, Mic, Video, ImageIcon, Newspaper } from "lucide-react";
import ReactMarkdown from 'react-markdown';

import MentorIaForm, { FormData } from "./MentorIaForm";
import CalendarView, { PlanItem } from "./CalendarView";


// --- Componente de Loading (A Forja) ---
const MentorLoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center text-center p-8 min-h-[50vh] bg-gray-50 dark:bg-gray-900 rounded-2xl"
  >
    <BrainCircuit className="w-16 h-16 text-blue-500 animate-pulse" />
    <h2 className="text-2xl font-bold mt-6">Athena está forjando sua estratégia...</h2>
    <p className="mt-2 text-muted-foreground max-w-md">
      Analisando seu perfil, público e oferta para criar um plano de batalha de conteúdo que vai revolucionar seu tráfego orgânico.
    </p>
  </motion.div>
);

// --- Componente para o Grid do Feed ---
const GridIcon = ({ format }: { format: string }) => {
    const lowerFormat = format.toLowerCase();
    if (lowerFormat.includes("reels")) return <Video className="w-6 h-6 text-red-500" />;
    if (lowerFormat.includes("carrossel")) return <Newspaper className="w-6 h-6 text-blue-500" />;
    if (lowerFormat.includes("foto") || lowerFormat.includes("imagem")) return <ImageIcon className="w-6 h-6 text-green-500" />;
    return <Mic className="w-6 h-6 text-purple-500" />;
};

export default function MentorIaMvp() {
  const savedAnalysis = useQuery(api.mentor.getSavedAnalysis);
  const generateAnalysis = useAction(api.mentor.generateAnalysis);

  const [view, setView] = useState<"loading" | "form" | "dashboard">("loading");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formDefaults, setFormDefaults] = useState<Partial<FormData> | undefined>(undefined);

  useEffect(() => {
    if (savedAnalysis === undefined) {
      setView("loading");
    } else if (savedAnalysis) {
      setView("dashboard");
      // Agora isso funciona, pois o schema garante que os campos existem
      setFormDefaults({
        username: savedAnalysis.username,
        bio: savedAnalysis.bio,
        offer: savedAnalysis.offer,
        audience: savedAnalysis.audience,
        planDuration: savedAnalysis.planDuration,
      });
    } else {
      setView("form");
    }
  }, [savedAnalysis]);

  const handleGenerate = (data: FormData) => {
    setIsGenerating(true);
    toast.promise(generateAnalysis(data), {
      loading: "Athena foi convocada. Forjando sua estratégia...",
      success: () => {
        setIsGenerating(false);
        // A view mudará automaticamente pelo useEffect ao receber o novo `savedAnalysis`
        return "Seu plano de batalha está pronto!";
      },
      error: (err: Error) => {
        setIsGenerating(false);
        return err.message || "Houve um erro. Tente novamente.";
      },
    });
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiada para a área de transferência!`);
  };

  if (view === "loading" || (isGenerating && view !== 'dashboard')) {
    return <MentorLoadingState />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-6xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        {view === "form" && !isGenerating && (
          <motion.div key="form" exit={{ opacity: 0, y: -10 }}>
             <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Mentor.IA <span className="text-blue-600">3.0</span></h1>
                <p className="mt-3 text-lg text-muted-foreground">Briefing Estratégico: Forneça os dados para Athena criar sua arma de tráfego orgânico.</p>
            </div>
            <MentorIaForm onSubmit={handleGenerate} defaults={formDefaults} isLoading={isGenerating} />
          </motion.div>
        )}

        {view === "dashboard" && savedAnalysis && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl shadow-2xl shadow-blue-500/20">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Sparkles className="text-yellow-400" />
                    Seu Plano de Batalha
                </h2>
                <p className="opacity-80 mt-1">Estratégia para <span className="font-semibold">@{savedAnalysis.username}</span></p>
                <p className="opacity-60 text-sm mt-2">
                  Última atualização: {new Date(savedAnalysis.updatedAt ?? savedAnalysis._creationTime).toLocaleString("pt-BR")}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setView("form")}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refinar Estratégia
              </Button>
            </div>

            <Tabs defaultValue="calendar" className="w-full mt-8">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                <TabsTrigger value="calendar">🗓️ Calendário</TabsTrigger>
                <TabsTrigger value="strategy">🎯 Estratégia</TabsTrigger>
                <TabsTrigger value="suggestions">💡 Bios Otimizadas</TabsTrigger>
                <TabsTrigger value="grid">🖼️ Feed Harmônico</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="mt-6">
                <CalendarView plan={savedAnalysis.content_plan as PlanItem[]} analysisId={savedAnalysis._id} />
              </TabsContent>

              <TabsContent value="strategy" className="mt-6 p-6 bg-card rounded-lg border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText /> Sua Estratégia de Conteúdo</h3>
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground">
                    <ReactMarkdown>{savedAnalysis.strategy.replace(/\\n/g, '\n')}</ReactMarkdown>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-6">
                 <div className="grid md:grid-cols-3 gap-6">
                    {(savedAnalysis.suggestions ?? []).map((suggestion, i) => (
                      <div key={i} className="bg-card border rounded-lg p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow">
                        <div>
                          <p className="font-bold mb-3 text-lg">Opção {i + 1}</p>
                          <p className="text-muted-foreground">{suggestion}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-4 self-end" onClick={() => handleCopyToClipboard(suggestion, `Opção ${i+1}`)}>
                            <Copy className="w-4 h-4 mr-2" /> Copiar
                        </Button>
                      </div>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="grid" className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-center"><LayoutGrid /> Grid Harmônico Sugerido</h3>
                <div className="grid grid-cols-3 gap-2 p-2 bg-muted rounded-xl max-w-sm mx-auto shadow-inner">
                  {(savedAnalysis.grid.length > 0 ? savedAnalysis.grid : Array(9).fill("Ideia de Post")).map((idea, i) => (
                    <div key={i} className="aspect-square bg-background rounded-lg flex flex-col items-center justify-center p-2 text-center text-xs font-medium text-muted-foreground border shadow-sm gap-2">
                        <GridIcon format={idea} />
                        <span>{idea}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}