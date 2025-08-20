"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Check, Brain,
  Lightbulb, Video, RefreshCcw, Layers,
  Camera, MessageSquare, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// =================================================================
// 1. TIPOS DE DADOS (IDÊNTICOS AO BACKEND)
// =================================================================

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
}

interface CarouselContent {
  title: string;
  slides: {
    slide_number: number;
    title: string;
    content: string;
  }[];
  cta_slide: string;
}

interface ImagePostContent {
  idea: string;
  caption: string;
  image_prompt: string;
}

interface StorySequenceContent {
  theme: string;
  slides: {
    slide_number: number;
    type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text";
    content: string;
    options?: string[];
  }[];
}

interface BrainResults {
  theme_summary: string;
  target_audience_suggestion: string;
  content_pack: {
    reels: ReelContent[];
    carousels: CarouselContent[];
    image_posts: ImagePostContent[];
    story_sequences: StorySequenceContent[];
  };
}

// =================================================================
// 2. SUB-COMPONENTES DE UI OTIMIZADOS PARA MOBILE-FIRST
// =================================================================

function CopyButton({ textToCopy, className }: { textToCopy: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button onClick={handleCopy} size="icon" variant="ghost" className={cn("h-8 w-8 flex-shrink-0 text-muted-foreground hover:bg-primary/10", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
            <Check className="w-4 h-4 text-emerald-500" />
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
            <Copy className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

function EnhancedLoadingSpinner() {
  const [status, setStatus] = useState("Analisando seu tema...");
  const statuses = [ "Mapeando a persona...", "Criando roteiros virais para Reels...", "Estruturando Carrosséis de alto valor...", "Gerando ideias para Posts e Stories...", "Finalizando sua campanha...", ];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % statuses.length;
      setStatus(statuses[currentIndex]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[400px] flex flex-col items-center justify-center text-center p-4 bg-background rounded-2xl">
      <div className="relative flex items-center justify-center mb-6">
        <motion.div className="w-20 h-20 rounded-full border-4 border-blue-500/20" animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}/>
        <motion.div className="absolute w-16 h-16 rounded-full border-4 border-purple-500/30" animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}/>
        <Brain className="w-10 h-10 text-blue-500 absolute animate-pulse" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> O FreelinkBrain está criando... </h3>
      <AnimatePresence mode="wait">
        <motion.p key={status} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.3 }} className="mt-4 text-muted-foreground text-base sm:text-lg">
          {status}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

const ReelCard = ({ reel }: { reel: ReelContent }) => (
  <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-blue-500/50">
    <CardHeader className="p-4 sm:p-6">
      <CardTitle className="flex justify-between items-start gap-2 text-base sm:text-lg">
        <span>{reel.title}</span>
        <CopyButton textToCopy={`Título: ${reel.title}\n\nGancho (3s): ${reel.hook}\n\nConteúdo:\n- ${reel.main_points.join('\n- ')}\n\nCTA: ${reel.cta}`} />
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
        <span className="text-lg mt-0.5">🪝</span>
        <div className="text-sm"><strong className="font-semibold text-foreground">Gancho (3s):</strong> {reel.hook}</div>
      </div>
      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
        <span className="text-lg mt-0.5">🎬</span>
        <div className="text-sm"><strong className="font-semibold text-foreground">Conteúdo:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            {reel.main_points.map((p, idx) => <li key={idx}>{p}</li>)}
          </ul>
        </div>
      </div>
      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
        <span className="text-lg mt-0.5">📢</span>
        <div className="text-sm"><strong className="font-semibold text-foreground">CTA:</strong> {reel.cta}</div>
      </div>
    </CardContent>
  </Card>
);

const CarouselViewer = ({ carousel }: { carousel: CarouselContent }) => (
  <Card className="overflow-hidden">
    <CardHeader className="p-4 sm:p-6">
      <CardTitle className="text-base sm:text-lg">{carousel.title}</CardTitle>
      <CardDescription>Arraste para ver os slides da sua ideia de carrossel.</CardDescription>
    </CardHeader>
    <CardContent className="p-4 sm:p-6 pt-0">
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {carousel.slides.map(slide => (
          <div key={slide.slide_number} className="min-w-[220px] w-[220px] sm:min-w-[250px] sm:w-[250px] aspect-square flex flex-col justify-between p-4 rounded-lg bg-muted/50 border shadow-sm">
            <div>
              <Badge variant="secondary">Slide {slide.slide_number}</Badge>
              <h4 className="font-bold text-base sm:text-lg mt-2">{slide.title}</h4>
            </div>
            <p className="text-sm">{slide.content}</p>
          </div>
        ))}
        <div className="min-w-[220px] w-[220px] sm:min-w-[250px] sm:w-[250px] aspect-square flex flex-col justify-center items-center text-center p-4 rounded-lg bg-blue-500 text-white shadow-lg">
          <Layers className="w-8 h-8 mb-2"/>
          <h4 className="font-bold text-base sm:text-lg">Último Slide (CTA)</h4>
          <p className="text-sm mt-1">{carousel.cta_slide}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ImagePostCard = ({ post }: { post: ImagePostContent }) => (
  <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-purple-500/50">
    <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">{post.idea}</CardTitle></CardHeader>
    <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold">Legenda Sugerida</label>
          <CopyButton textToCopy={post.caption} />
        </div>
        <p className="text-sm p-3 sm:p-4 bg-muted/50 rounded-lg whitespace-pre-wrap border">{post.caption}</p>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold">Prompt para IA de Imagem</label>
          <CopyButton textToCopy={post.image_prompt} />
        </div>
        <p className="text-xs sm:text-sm p-3 sm:p-4 bg-gray-900 text-gray-200 rounded-lg font-mono border border-gray-700">{post.image_prompt}</p>
      </div>
    </CardContent>
  </Card>
);

const StorySequenceCard = ({ seq }: { seq: StorySequenceContent }) => {
  const iconMap = { Poll: "📊", Quiz: "❓", "Q&A": "💬", Link: "🔗", Text: "✍️" };
  return (
  <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-pink-500/50">
    <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">{seq.theme}</CardTitle></CardHeader>
    <CardContent className="p-4 sm:p-6 pt-0">
      <div className="space-y-4">
        {seq.slides.map(slide => (
          <Fragment key={slide.slide_number}>
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border font-semibold">{slide.slide_number}</div>
                {slide.slide_number < seq.slides.length && <div className="w-px h-6 bg-border" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{iconMap[slide.type]}</span>
                  <strong className="font-semibold text-foreground">{slide.type}</strong>
                </div>
                <p className="text-sm p-3 bg-muted/50 rounded-lg border">{slide.content}</p>
                {slide.options && <p className="text-xs text-muted-foreground mt-2">Opções: {slide.options.join(' / ')}</p>}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </CardContent>
  </Card>
)};

// =================================================================
// 4. COMPONENTE PRINCIPAL (COM ESTADOS E LÓGICA)
// =================================================================
export default function FreelinkBrainTool() {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateIdeas = useAction(api.brain.generateContentIdeas);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!theme.trim()) {
      toast.error("Por favor, insira um tema para gerar ideias.");
      return;
    }
    setIsLoading(true);
    setResults(null);

    toast.promise(generateIdeas({ theme }), {
      loading: "O FreelinkBrain está criando sua campanha...",
      success: (data) => {
        setIsLoading(false);
        setResults(data);
        return "Sua campanha de conteúdo está pronta! ✨";
      },
      error: (err) => {
        setIsLoading(false);
        return `Erro: ${err instanceof Error ? err.message : 'Tente novamente.'}`
      }
    });
  };

  const handleGenerateNew = () => {
    setResults(null);
    setTheme("");
    inputRef.current?.focus();
  };

  const handleExampleClick = (exampleTheme: string) => {
    setTheme(exampleTheme);
    handleSubmit();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 sm:space-y-12 pb-20 px-4">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <EnhancedLoadingSpinner key="loading" />
        ) : results ? (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Sua Campanha de Conteúdo</h2>
                <p className="text-muted-foreground mt-1">Resultados para: <span className="font-semibold text-primary">{theme}</span></p>
              </div>
              <Button onClick={handleGenerateNew} variant="outline" className="gap-2 w-full sm:w-auto">
                <RefreshCcw className="w-4 h-4" /> Gerar Novo Tema
              </Button>
            </div>

            <Card className="mb-8 border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl"><Lightbulb className="w-6 h-6 text-yellow-400"/> Resumo Estratégico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                <div className="p-3 bg-background/50 rounded-md text-sm sm:text-base"><strong className="font-semibold">🧠 Ângulo:</strong> {results.theme_summary}</div>
                <div className="p-3 bg-background/50 rounded-md text-sm sm:text-base"><strong className="font-semibold">🎯 Público:</strong> {results.target_audience_suggestion}</div>
              </CardContent>
            </Card>

            <Tabs defaultValue="reels" className="w-full">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                <TabsList className="inline-flex h-auto p-1">
                  <TabsTrigger value="reels" className="gap-2 px-3"><Video className="w-4 h-4"/>Reels</TabsTrigger>
                  <TabsTrigger value="carousels" className="gap-2 px-3"><Layers className="w-4 h-4"/>Carrosséis</TabsTrigger>
                  <TabsTrigger value="image_posts" className="gap-2 px-3"><Camera className="w-4 h-4"/>Posts</TabsTrigger>
                  <TabsTrigger value="story_sequences" className="gap-2 px-3"><MessageSquare className="w-4 h-4"/>Stories</TabsTrigger>
                </TabsList>
              </div>
              <div className="mt-6 space-y-4">
                <TabsContent value="reels" className="mt-0">{results.content_pack.reels.map((reel, i) => <ReelCard key={i} reel={reel} />)}</TabsContent>
                <TabsContent value="carousels" className="mt-0">{results.content_pack.carousels.map((carousel, i) => <CarouselViewer key={i} carousel={carousel} />)}</TabsContent>
                <TabsContent value="image_posts" className="mt-0">{results.content_pack.image_posts.map((post, i) => <ImagePostCard key={i} post={post} />)}</TabsContent>
                <TabsContent value="story_sequences" className="mt-0">{results.content_pack.story_sequences.map((seq, i) => <StorySequenceCard key={i} seq={seq} />)}</TabsContent>
              </div>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/50 dark:via-background dark:to-purple-950/50 border shadow-sm">
              <Badge variant="secondary" className="gap-2 mb-4 animate-pulse"><Sparkles className="w-4 h-4 text-blue-500"/>Nova IA Criativa</Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Freelink<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Brain</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mt-3">
                A faísca de gênio para seu conteúdo. Transforme <span className="font-semibold text-foreground">um único tema</span> em uma campanha completa para o Instagram.
              </p>
            </div>
           
            <Card className="shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="theme-input" className="text-sm font-medium flex items-center gap-2 mb-2"><Wand2 className="w-4 h-4 text-purple-500"/> Sobre qual tema você quer criar?</label>
                    <Input id="theme-input" ref={inputRef} value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex: Como criar hábitos de estudo eficientes" className="py-6 text-base" />
                  </div>
                  <Button type="submit" className="w-full py-6 font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Campanha de Conteúdo
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <span className="text-xs text-muted-foreground">Sem ideias? Tente um exemplo:</span>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {["Marketing de afiliados", "Receitas saudáveis", "Vencer a procrastinação"].map(ex => (
                      <Button key={ex} size="sm" variant="outline" onClick={() => handleExampleClick(ex)}>{ex}</Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}