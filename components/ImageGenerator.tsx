// Em src/components/ImageGenerator.tsx
"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Loader2, Sparkles } from "lucide-react";
import Image from "next/image";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [latestImage, setLatestImage] = useState<string | null>(null);

  const generate = useAction(api.imageGenerator.generateImage);
  const imageHistory = useQuery(api.imageGenerator.getImagesForUser) || [];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setLatestImage(null);

    try {
      const imageUrl = await generate({ prompt });
      setLatestImage(imageUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        {/* ... (código do CardHeader e CardContent com o formulário, sem alterações) ... */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Estúdio de Imagens IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: um astronauta surfando em uma onda cósmica, estilo neon..."
                disabled={isLoading}
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Gerar Imagem"
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {(isLoading || latestImage) && (
        <Card>
          {/* ... (código do Card de Resultado, sem alterações) ... */}
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-md mx-auto">
              <AspectRatio ratio={1 / 1} className="bg-muted rounded-md">
                {isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                )}
                {latestImage && (
                  <Image
                    src={latestImage}
                    alt={prompt}
                    fill
                    className="rounded-md object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
              </AspectRatio>
            </div>
          </CardContent>
        </Card>
      )}

      {imageHistory.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Seu Histórico</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* ▼▼▼ 2. AQUI ESTÁ A CORREÇÃO PARA O 'ANY' ▼▼▼ */}
            {imageHistory.map((image: Doc<"generatedImages">) => (
              <div key={image._id} className="group relative">
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={image.imageUrl}
                    alt={image.prompt}
                    fill
                    className="rounded-md object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs line-clamp-3">{image.prompt}</p>
                  </div>
                </AspectRatio>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}