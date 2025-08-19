"use client";

import { useState, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Check, Loader2, Brain,
  Lightbulb, Video
, RefreshCcw,
  Layers, Camera,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// =================================================================
// 1. TIPOS DE DADOS CORRIGIDOS (PARA CORRESPONDER AO BACKEND)
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
  }
}


// =================================================================
// 2. SUB-COMPONENTES (SEM GRANDES MUDANÇAS)
// =================================================================

function CopyButton({ textToCopy }: { textToCopy: string; }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button onClick={handleCopy} size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}

function ResultSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">{icon}</div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function LoadingSpinner() {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-[300px] flex flex-col items-center justify-center p-8"
        >
            <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 rounded-full bg-blue-500 opacity-20 animate-ping" />
                <Brain className="w-12 h-12 text-blue-500 animate-pulse" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">O FreelinkBrain está pensando...</h3>
            <p className="mt-3 text-center text-muted-foreground max-w-xs">Criando uma campanha de conteúdo completa para você.</p>
        </motion.div>
    );
}

// =================================================================
// 3. COMPONENTE PRINCIPAL (TOTALMENTE REFEITO)
// =================================================================
export default function FreelinkBrainTool() {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateIdeas = useAction(api.brain.generateContentIdeas);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      toast.error("Por favor, insira um tema para gerar ideias.");
      return;
    }
    setIsLoading(true);
    setResults(null);

    toast.promise(generateIdeas({ theme }), {
      loading: "O FreelinkBrain está criando sua campanha...",
      success: (data) => {
        setResults(data);
        setIsLoading(false);
        return "Sua campanha de conteúdo está pronta!";
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

  return (
    <div className="space-y-8 pb-20">
      {/* Cabeçalho */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Freelink<span className="text-blue-600">Brain</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mt-2">
          A IA que transforma um tema em uma campanha de conteúdo completa.
        </p>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Campanhas de Conteúdo</CardTitle>
          <CardDescription>Insira um tema e receba Reels, Carrosséis, Posts e Stories prontos para usar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              ref={inputRef}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: Dicas para aumentar a produtividade"
              className="py-6 text-base"
              disabled={isLoading}
            />
            <Button type="submit" className="w-full py-6 font-bold text-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
              {isLoading ? "Gerando Campanha..." : "Gerar Conteúdo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Área de Resultados */}
      <AnimatePresence mode="wait">
        {isLoading && <LoadingSpinner key="loading" />}
        {results && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Resultados para: <span className="text-blue-600">{theme}</span></h2>
                <Button onClick={handleGenerateNew} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" /> Novo Tema
                </Button>
            </div>

            {/* Resumo Estratégico */}
            <Card className="mb-8 bg-muted/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb className="text-yellow-500"/> Resumo Estratégico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p><strong className="font-semibold">Ângulo do Conteúdo:</strong> {results.theme_summary}</p>
                    <p><strong className="font-semibold">Público Sugerido:</strong> {results.target_audience_suggestion}</p>
                </CardContent>
            </Card>

            {/* Abas com os Tipos de Conteúdo */}
            <Tabs defaultValue="reels" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="reels"><Video className="w-4 h-4 mr-2"/>Reels</TabsTrigger>
                <TabsTrigger value="carousels"><Layers className="w-4 h-4 mr-2"/>Carrosséis</TabsTrigger>
                <TabsTrigger value="image_posts"><Camera className="w-4 h-4 mr-2"/>Posts</TabsTrigger>
                <TabsTrigger value="story_sequences"><MessageSquare className="w-4 h-4 mr-2"/>Stories</TabsTrigger>
              </TabsList>

              {/* Conteúdo dos Reels */}
              <TabsContent value="reels">
                <ResultSection title="Roteiros para Reels" icon={<Video className="w-5 h-5 text-red-500" />}>
                  <div className="space-y-4">
                    {results.content_pack.reels.map((reel, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <CardTitle className="flex justify-between items-start">
                            {reel.title}
                            <CopyButton textToCopy={`${reel.title}\n\nGancho: ${reel.hook}\n\n${reel.main_points.join('\n')}\n\nCTA: ${reel.cta}`} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p><strong>Gancho (3s):</strong> {reel.hook}</p>
                          <div><strong>Conteúdo:</strong>
                            <ul className="list-disc pl-5">
                              {reel.main_points.map((p, idx) => <li key={idx}>{p}</li>)}
                            </ul>
                          </div>
                          <p><strong>CTA:</strong> {reel.cta}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ResultSection>
              </TabsContent>

              {/* Conteúdo dos Carrosséis */}
              <TabsContent value="carousels">
                <ResultSection title="Ideias para Carrosséis" icon={<Layers className="w-5 h-5 text-green-500" />}>
                  <div className="space-y-4">
                    {results.content_pack.carousels.map((carousel, i) => (
                      <Card key={i}>
                        <CardHeader><CardTitle>{carousel.title}</CardTitle></CardHeader>
                        <CardContent>
                          <ul className="space-y-2 border-l-2 pl-4">
                            {carousel.slides.map(slide => (
                              <li key={slide.slide_number}>
                                <strong className="font-semibold">Slide {slide.slide_number}: {slide.title}</strong>
                                <p className="text-muted-foreground text-sm">{slide.content}</p>
                              </li>
                            ))}
                             <li>
                                <strong className="font-semibold">Último Slide (CTA)</strong>
                                <p className="text-muted-foreground text-sm">{carousel.cta_slide}</p>
                              </li>
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ResultSection>
              </TabsContent>

              {/* Conteúdo dos Posts de Imagem */}
              <TabsContent value="image_posts">
                <ResultSection title="Posts de Imagem Única" icon={<Camera className="w-5 h-5 text-purple-500" />}>
                  <div className="space-y-4">
                    {results.content_pack.image_posts.map((post, i) => (
                      <Card key={i}>
                        <CardHeader><CardTitle>{post.idea}</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <Label>Legenda Sugerida</Label>
                                <p className="text-sm p-3 bg-muted/50 rounded-md whitespace-pre-wrap">{post.caption}</p>
                            </div>
                             <div>
                                <Label>Prompt para IA de Imagem</Label>
                                <p className="text-sm p-3 bg-muted/50 rounded-md font-mono">{post.image_prompt}</p>
                            </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ResultSection>
              </TabsContent>

              {/* Conteúdo das Sequências de Stories */}
              <TabsContent value="story_sequences">
                <ResultSection title="Sequências de Stories" icon={<MessageSquare className="w-5 h-5 text-pink-500" />}>
                   <div className="space-y-4">
                    {results.content_pack.story_sequences.map((seq, i) => (
                      <Card key={i}>
                        <CardHeader><CardTitle>{seq.theme}</CardTitle></CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {seq.slides.map(slide => (
                              <li key={slide.slide_number} className="flex items-start gap-3">
                                <Badge variant="outline">Slide {slide.slide_number}</Badge>
                                <div>
                                    <strong className="font-semibold">[{slide.type}]</strong>
                                    <p className="text-sm">{slide.content}</p>
                                    {slide.options && <p className="text-xs text-muted-foreground">Opções: {slide.options.join(' / ')}</p>}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ResultSection>
              </TabsContent>

            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}