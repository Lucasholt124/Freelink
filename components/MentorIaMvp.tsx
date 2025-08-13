// Em /components/MentorIaMvp.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, RefreshCw, Bot, ChevronRight } from "lucide-react";
import CalendarView from "./CalendarView";
import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "@/convex/_generated/dataModel";

// --- Tipos ---
type AnalysisResults = Doc<"analyses">;
type FormData = {
    username?: string;
    bio?: string;
    offer: string;
    audience: string;
    planDuration: 'week' | 'month';
};

// --- Componentes Filhos ---

function AnalysisDashboard({ analysis, onRegenerate }: { analysis: AnalysisResults; onRegenerate: () => void }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-tr from-gray-900 to-gray-800 text-white rounded-2xl">
                <div>
                    <h2 className="text-2xl font-bold">Seu Plano de Ação Estratégico</h2>
                    <p className="opacity-80">Gerado em: {new Date(analysis.updatedAt || analysis._creationTime).toLocaleDateString('pt-BR')}</p>
                </div>
                <Button variant="secondary" onClick={onRegenerate}><RefreshCw className="w-4 h-4 mr-2" />Gerar Novo Plano</Button>
            </div>
            <Tabs defaultValue="calendar" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                    <TabsTrigger value="calendar">Calendário</TabsTrigger>
                    <TabsTrigger value="strategy">Estratégia</TabsTrigger>
                    <TabsTrigger value="suggestions">Bios</TabsTrigger>
                    <TabsTrigger value="grid">Feed Ideal</TabsTrigger>
                </TabsList>
                <TabsContent value="calendar" className="mt-6"><CalendarView plan={analysis.content_plan} /></TabsContent>
                <TabsContent value="strategy" className="mt-6 p-6 bg-white rounded-lg border"><h3 className="text-xl font-bold mb-4">Sua Estratégia de Conteúdo</h3><div className="prose prose-lg max-w-none whitespace-pre-line text-gray-700">{analysis.strategy}</div></TabsContent>
                <TabsContent value="suggestions" className="mt-6"><div className="grid md:grid-cols-3 gap-4">{analysis.suggestions.map((s: string, i: number) => <div key={i} className="p-6 border rounded-lg bg-white shadow-sm"><p className="font-semibold mb-2">Opção {i+1}</p><p className="text-gray-600">{s}</p></div>)}</div></TabsContent>
                <TabsContent value="grid" className="mt-6 flex flex-col items-center"><h3 className="text-xl font-bold mb-4">Grid Harmônico Sugerido</h3><div className="grid grid-cols-3 gap-2 p-2 bg-gray-200 rounded-xl max-w-sm">{analysis.grid.map((idea: string, i: number) => <div key={i} className="aspect-square bg-white rounded-lg flex items-center justify-center p-2 text-center text-xs font-medium text-gray-700">{idea}</div>)}</div></TabsContent>
            </Tabs>
        </motion.div>
    );
}

function ConversationalForm({ onSubmit, isLoading }: { onSubmit: (data: FormData) => void; isLoading: boolean }) {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({ offer: "", audience: "", planDuration: "week" as 'week' | 'month' });
    const instagramConnection = useQuery(api.connections.get, { provider: "instagram" });

    const questions = [
        { key: "offer", question: "Primeiro, o que você vende ou oferece para sua audiência?", type: "textarea" },
        { key: "audience", question: "Ótimo! E para quem você fala? Descreva seu público-alvo.", type: "textarea" },
        { key: "planDuration", question: "Perfeito. Você quer um plano de conteúdo para 7 ou 30 dias?", type: "select" },
    ];
    const currentQuestion = questions[step];

    const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            const finalData: FormData = { ...formData, username: "", bio: "" };
            if (!instagramConnection) {
                const form = e.target as HTMLFormElement;
                finalData.username = (form.elements.namedItem('username') as HTMLInputElement).value;
                finalData.bio = (form.elements.namedItem('bio') as HTMLInputElement).value;
            }
            onSubmit(finalData);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-lg">
            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                    <form onSubmit={handleNext} className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-purple-100 p-3 rounded-full"><Bot className="w-6 h-6 text-purple-600"/></div>
                            <div>
                                <h2 className="text-xl font-semibold">Athena está pronta para te ajudar!</h2>
                                <p className="text-gray-600">{currentQuestion.question}</p>
                            </div>
                        </div>
                        {!instagramConnection && step === 0 && (
                            <div className="space-y-4 ml-16 pl-4 border-l-2">
                                <div><Label>Seu @usuário do Instagram</Label><Input name="username" required /></div>
                                <div><Label>Sua bio atual</Label><Textarea name="bio" required rows={3}/></div>
                            </div>
                        )}
                        <div className="ml-16 pl-4 border-l-2 space-y-4">
                            {currentQuestion.type === 'textarea' && <Textarea name={currentQuestion.key} required rows={3} onChange={e => setFormData({...formData, [currentQuestion.key]: e.target.value})} />}
                            {currentQuestion.type === 'select' &&
                                <Select onValueChange={(value: "week" | "month") => setFormData({...formData, planDuration: value})} defaultValue="week">
                                    <SelectTrigger><SelectValue placeholder="Selecione a duração" /></SelectTrigger>
                                    <SelectContent><SelectItem value="week">7 Dias</SelectItem><SelectItem value="month">30 Dias</SelectItem></SelectContent>
                                </Select>
                            }
                            <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : step < questions.length - 1 ? <>Próximo <ChevronRight className="w-4 h-4 ml-2"/></> : <>Gerar Plano <Sparkles className="w-4 h-4 ml-2"/></>}</Button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default function MentorIaMvp() {
  const savedAnalysis = useQuery(api.mentor.getSavedAnalysis);
  const generateAnalysisAction = useAction(api.mentor.generateAnalysis);
  const instagramConnection = useQuery(api.connections.get, { provider: "instagram" });
  const [isLoading, setIsLoading] = useState(false);
  const [viewState, setViewState] = useState<'loading' | 'form' | 'dashboard'>('loading');

  useEffect(() => {
    if (savedAnalysis !== undefined) { setViewState(savedAnalysis ? 'dashboard' : 'form'); }
  }, [savedAnalysis]);

  const handleSubmit = (data: FormData) => {
    const body = {
        username: instagramConnection?.providerAccountId || data.username || "",
        bio: data.bio || "",
        offer: data.offer,
        audience: data.audience,
        planDuration: data.planDuration,
    };

    setIsLoading(true);
    toast.promise(generateAnalysisAction(body), {
        loading: "Athena está mergulhando nos dados e criando sua estratégia...",
        success: () => { setViewState('dashboard'); return "Seu plano de ação está pronto!"; },
        error: (err: Error) => err.message,
        finally: () => setIsLoading(false),
    });
  };

  if (viewState === 'loading') return <div>Carregando seu Mentor IA...</div>;
  if (viewState === 'dashboard' && savedAnalysis) {
      return <AnalysisDashboard analysis={savedAnalysis} onRegenerate={() => setViewState('form')} />;
  }

  return <ConversationalForm onSubmit={handleSubmit} isLoading={isLoading} />;
}