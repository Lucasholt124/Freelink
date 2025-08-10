// Em /components/FreelinnkBrainTool.tsx
// (Crie este novo arquivo)

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, Check } from "lucide-react";

// --- Tipagem para os Resultados ---
type ReelScript = { title: string; script: string; };
type CarouselIdea = { title: string; slides: string[]; };
type BrainResults = {
  viral_titles?: string[];
  reel_scripts?: ReelScript[];
  carousel_ideas?: CarouselIdea[];
};

// --- Sub-componente para copiar texto ---
function CopyButton({ textToCopy }: { textToCopy: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        toast.success("Copiado!");
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Button onClick={handleCopy} size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </Button>
    );
}


// --- Componente Principal ---
export default function FreelinnkBrainTool() {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults>({});
  const generateIdeas = useMutation(api.brain.generateContentIdeas);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
        toast.error("Por favor, insira um tema.");
        return;
    }
    setResults({});
    toast.promise(generateIdeas({ theme }), {
        loading: "O Brain™ está pensando...",
        success: (data) => {
            setResults(data);
            return "Suas ideias de conteúdo estão prontas!";
        },
        error: (err) => `Erro: ${err instanceof Error ? err.message : 'Tente novamente.'}`
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg border">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Label htmlFor="theme" className="font-semibold sr-only">Tema do Conteúdo</Label>
            <Input
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Como fazer o café perfeito em casa"
                className="py-6 text-base"
            />
          </div>
          <Button type="submit" className="py-6 font-bold">
            <Sparkles className="w-4 h-4 mr-2" /> Gerar Ideias
          </Button>
        </form>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-8 animate-in fade-in-50">
            {results.viral_titles && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Títulos Virais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.viral_titles.map((title, i) => (
                           <div key={i} className="bg-white p-4 rounded-lg border flex items-start gap-2">
                                <span className="text-purple-500 font-bold">#{i+1}</span>
                                <p className="flex-1">{title}</p>
                                <CopyButton textToCopy={title} />
                           </div>
                        ))}
                    </div>
                </section>
            )}
             {results.reel_scripts && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Roteiros para Reels</h2>
                    <div className="space-y-4">
                        {results.reel_scripts.map((reel, i) => (
                           <div key={i} className="bg-white p-4 rounded-lg border">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-semibold flex-1">{reel.title}</h3>
                                    <CopyButton textToCopy={reel.script} />
                                </div>
                                <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{reel.script}</p>
                           </div>
                        ))}
                    </div>
                </section>
            )}
            {/* Adicione a seção de carrosséis se desejar */}
        </div>
      )}
    </div>
  );
}