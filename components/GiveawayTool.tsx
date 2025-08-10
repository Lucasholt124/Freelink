// Em /components/GiveawayTool.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import Image from "next/image";

// --- Importações de UI ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader2, Star, RefreshCw } from "lucide-react";
import { Checkbox } from '@/components/ui/checkbox';

// --- Tipagem ---
type Winner = {
  username: string;
  commentText: string;
  profilePicUrl: string;
} | null;

// --- Sub-componente WinnerCard ---
function WinnerCard({ winner, onRedraw }: { winner: Winner; onRedraw: () => void }) {
  if (!winner) return null;
  return (
    <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl border-2 border-amber-300 text-center animate-in fade-in-50 zoom-in-95">
      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">E o vencedor é...</h3>
      <div className="mt-4 flex flex-col items-center gap-4">
        <Image
          src={winner.profilePicUrl}
          alt={`Foto de perfil de ${winner.username}`}
          width={80}
          height={80}
          className="rounded-full border-4 border-white shadow-lg"
        />
        <div className="min-w-0">
          <p className="text-2xl font-bold text-gray-900 truncate">@{winner.username}</p>
          {/* CORREÇÃO 2: Usando aspas simples para evitar erro de 'unescaped entities' */}
          <p className="text-gray-600 mt-1 bg-white/70 px-3 py-2 rounded-lg text-sm">
            {winner.commentText}
          </p>
        </div>
      </div>
      <Button onClick={onRedraw} variant="ghost" className="mt-6 text-gray-500 hover:text-gray-800">
        <RefreshCw className="w-4 h-4 mr-2" /> Sortear Novamente
      </Button>
    </div>
  );
}

// --- Componente Principal ---
export default function GiveawayTool() {
  const [postUrl, setPostUrl] = useState("");
  const [isLoading] = useState(false);
  const [winner, setWinner] = useState<Winner>(null);
  const [filters, setFilters] = useState({ unique: true, mentions: 1 });

  // A mutação já está correta, não precisa de mudanças.
  const runGiveaway = useMutation(api.giveaways.runGiveaway);

  const handleRunGiveaway = async () => {
    if (!postUrl) {
      toast.error("Por favor, insira a URL do post.");
      return;
    }

    // Não é mais necessário gerenciar 'isLoading' manualmente com 'toast.promise'
    setWinner(null);

    toast.promise(
      runGiveaway({
        postUrl,
        unique: filters.unique,
        mentions: filters.mentions,
      }),
      {
        loading: "Buscando comentários e realizando o sorteio...",
        success: (result) => {
          setWinner(result); // Atualiza o estado com o vencedor
          return `Parabéns para @${result.username}! 🎉`;
        },
        error: (err) => {
          // O erro já é tratado aqui, não precisa de try/catch
          return `Erro: ${err instanceof Error ? err.message : 'Tente novamente.'}`;
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="postUrl" className="font-semibold text-gray-800">URL do Post do Instagram</Label>
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <Input
            id="postUrl"
            value={postUrl}
            onChange={(e) => setPostUrl(e.target.value)}
            placeholder="https://www.instagram.com/p/C..."
            className="flex-grow"
          />
          {/* O estado de 'loading' é inferido pelo 'toast.promise', mas podemos mantê-lo para desabilitar o botão */}
          <Button onClick={handleRunGiveaway} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4" />}
            Sortear Vencedor
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-700">Opções do Sorteio</h3>
        <div className="flex items-center space-x-2">
            <Checkbox
              id="unique"
              checked={filters.unique}
              // CORREÇÃO 3: Tipando o parâmetro 'checked'
              onCheckedChange={(checked: boolean | 'indeterminate') =>
                setFilters(prev => ({...prev, unique: Boolean(checked)}))
              }
            />
            <Label htmlFor="unique">Considerar apenas um comentário por pessoa.</Label>
        </div>
        <div className="flex items-center gap-2">
            <Label htmlFor="mentions">Exigir no mínimo</Label>
            <Input
              id="mentions"
              type="number"
              value={filters.mentions}
              onChange={e => setFilters(prev => ({...prev, mentions: Math.max(0, Number(e.target.value))}))} // Garante que o valor não seja negativo
              className="w-20 text-center"
              min="0"
            />
            <Label htmlFor="mentions">menção(ões) (@) no comentário.</Label>
        </div>
      </div>

      {/* A renderização do vencedor já está correta */}
      {winner && <WinnerCard winner={winner} onRedraw={handleRunGiveaway} />}
    </div>
  );
}