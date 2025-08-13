// Em /components/MentorIaMvp.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { toPng } from 'html-to-image';

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Loader2, Sparkles, ShieldAlert, ImageDown, CheckCircle, Info } from "lucide-react";
import UpgradePaywall from "./UpgradePaywall";

// --- Tipos e Componentes Internos ---
type WeeklyPlanItem = { day: string; time: string; format: string; content_idea: string; };
type AnalysisResults = {
    strategy?: string;
    suggestions?: string[];
    grid?: string[];
    weekly_plan?: WeeklyPlanItem[];
    error?: string;
};

function GeneratedImageGrid({ gridSuggestions }: { gridSuggestions: string[] | undefined }) {
    const handleDownloadImage = useCallback(() => {
        const gridElement = document.getElementById('visual-feed');
        if (gridElement === null) return;
        toast.promise(toPng(gridElement, { cacheBust: true }), {
            loading: 'Gerando imagem...',
            success: (dataUrl) => {
                const link = document.createElement('a');
                link.download = 'meu-feed-ideal-freelinnk.png';
                link.href = dataUrl;
                link.click();
                return "Download iniciado!";
            },
            error: 'Falha ao gerar a imagem.'
        });
    }, []);

    if (!gridSuggestions || gridSuggestions.length === 0) return null;

    return (
        <div>
             <h3 className="text-lg font-semibold">Sugestão de Feed Ideal:</h3>
             <div id="visual-feed" className="grid grid-cols-3 gap-1 mt-2 border-2 bg-gray-300 p-1 rounded-md max-w-sm mx-auto">
                {gridSuggestions.slice(0, 9).map((text, i) => (
                    <div key={i} className="aspect-square bg-white flex items-center justify-center p-2 text-center text-xs font-medium text-gray-700">
                        {text}
                    </div>
                ))}
             </div>
             <Button onClick={handleDownloadImage} variant="outline" size="sm" className="mt-4 mx-auto flex items-center">
                <ImageDown className="w-4 h-4 mr-2" /> Baixar como Imagem
             </Button>
        </div>
    );
}

function CalendarView({ plan }: { plan: WeeklyPlanItem[] | undefined }) {
    if (!plan || plan.length === 0) return null;
    return (
        <div>
            <h3 className="text-lg font-semibold">Plano de Conteúdo Semanal:</h3>
            <div className="p-4 border rounded-lg bg-white mt-2 space-y-2">
                {plan.map(item => (
                    <div key={item.day}><strong>{item.day}:</strong> {item.content_idea}</div>
                ))}
            </div>
        </div>
    );
}

function FreeUsageLimitPaywall() {
    return (
        <div className="bg-amber-50 p-6 rounded-lg text-center border-2 border-dashed border-amber-300">
            <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto mb-3" />
            <h3 className="font-semibold text-amber-900">Você usou sua análise gratuita!</h3>
            <p className="text-amber-700 mt-1 mb-4 text-sm">Faça upgrade para o plano Pro para ter análises ilimitadas.</p>
            <Button asChild><Link href="/dashboard/billing">Ver Planos</Link></Button>
        </div>
    );
}

// --- Componente Principal ---
export default function MentorIaMvp({ planName, usageCount }: { planName: string; usageCount: number; }) {
  const [results, setResults] = useState<AnalysisResults>({});
  const [isLoading, setIsLoading] = useState(false);

  const instagramConnection = useQuery(api.connections.get, { provider: "instagram" });
  const isFreePlan = planName === 'free';
  const isUltraPlan = planName === 'ultra';
  const isUsageLimitReached = isFreePlan && usageCount >= 1;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResults({});
    const formData = new FormData(event.currentTarget);

    // O corpo da requisição é construído com base nos campos que existem no formulário
    const body = (instagramConnection && !isFreePlan)
      ? { // Modo Automático
          offer: formData.get("offer") as string,
          audience: formData.get("audience") as string,
        }
      : { // Modo Manual
          username: formData.get("username") as string,
          bio: formData.get("bio") as string,
          offer: formData.get("offer") as string,
          audience: formData.get("audience") as string,
        };

    setIsLoading(true);
    toast.promise(
      fetch('/api/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha ao gerar análise.");
        return data;
      }),
      {
        loading: "Analisando seu perfil com a IA...",
        success: (data: AnalysisResults) => { setResults(data); return "Sua análise está pronta!"; },
        error: (err: Error) => err.message,
        finally: () => setIsLoading(false),
      }
    );
  };

  if (isFreePlan && isUsageLimitReached) return <FreeUsageLimitPaywall />;
  if (instagramConnection === undefined) return <div className="p-8 text-center text-gray-500">Carregando status da conexão...</div>;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-lg">

      {/* Mensagem de Contexto Dinâmica */}
      {instagramConnection && !isFreePlan ? (
        <div className="mb-6 text-sm text-green-800 bg-green-50 p-3 rounded-md flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-semibold">Instagram Conectado!</p>
                <p>A análise usará os dados do seu perfil automaticamente. Basta preencher os campos abaixo.</p>
            </div>
        </div>
      ) : (
        <div className="mb-6 text-sm text-blue-800 bg-blue-50 p-3 rounded-md flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-semibold">Quer uma análise automática e mais precisa?</p>
                <p>
                  Você pode preencher os campos manualmente ou{" "}
                  <Link href="/dashboard/settings" className="font-bold underline hover:text-blue-600">
                    conectar seu Instagram
                  </Link>{" "}
                  para que a IA busque os dados por você.
                </p>
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Formulário Inteligente: só mostra os campos de bio/user se o Instagram não estiver conectado */}
        {!instagramConnection && (
          <>
            <div><Label htmlFor="username">Seu @usuário do Instagram</Label><Input id="username" name="username" placeholder="@seu_perfil" required disabled={isLoading} /></div>
            <div><Label htmlFor="bio">Sua bio atual</Label><Textarea id="bio" name="bio" placeholder="Cole sua bio aqui..." required rows={3} disabled={isLoading}/></div>
          </>
        )}

        <div><Label htmlFor="offer">O que você vende ou oferece?</Label><Input id="offer" name="offer" placeholder="Ex: Cursos de marketing, consultoria de imagem..." required disabled={isLoading}/></div>
        <div><Label htmlFor="audience">Quem é seu público-alvo?</Label><Input id="audience" name="audience" placeholder="Ex: Empreendedores, criadores de conteúdo..." required disabled={isLoading}/></div>

        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isLoading ? "Gerando..." : "Gerar Análise com IA"}
        </Button>
      </form>

      {Object.keys(results).length > 0 && (
        <div className="mt-8 space-y-8 pt-8 border-t border-gray-200">
          {results.suggestions && (
            <div>
              <h3 className="text-lg font-semibold">Sugestões de Bio Otimizada:</h3>
              <div className="mt-2 space-y-2">
                {results.suggestions.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-3 border rounded-lg"><p className="text-gray-800">{result}</p></div>
                ))}
              </div>
            </div>
          )}
          {results.strategy && (
            <div>
              <h3 className="text-lg font-semibold">Análise de Estratégia e Conteúdo:</h3>
              <div className="mt-2 bg-gray-50 p-4 border rounded-lg"><p className="whitespace-pre-line">{results.strategy}</p></div>
            </div>
          )}
          <GeneratedImageGrid gridSuggestions={results.grid} />
          {results.weekly_plan && (
            isUltraPlan
              ? <CalendarView plan={results.weekly_plan} />
              : <UpgradePaywall title="Plano de Conteúdo Semanal" description="Faça upgrade para o Ultra para desbloquear o calendário de conteúdo estratégico." />
          )}
        </div>
      )}
    </div>
  );
}