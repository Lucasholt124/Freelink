// Em /components/GiveawayTool.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Star, RefreshCw, Instagram, List, Users, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { FunctionReturnType } from "convex/server";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";

type Winner = FunctionReturnType<typeof api.giveaways.runInstagramGiveaway> | null;

function WinnerCard({ winner, onRedraw }: { winner: NonNullable<Winner>; onRedraw: () => void }) {
  return (
    <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl border-2 border-amber-300 text-center animate-in fade-in-50 zoom-in-95">
      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">E o vencedor é...</h3>
      <div className="mt-4 flex flex-col items-center gap-4">
        <Image src={winner.profilePicUrl} alt={`Foto de ${winner.username}`} width={80} height={80} className="rounded-full border-4 border-white shadow-lg"/>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-gray-900 truncate">@{winner.username}</p>
          <p className="text-gray-600 mt-1 bg-white/70 px-3 py-2 rounded-lg text-sm">{winner.commentText}</p>
        </div>
      </div>
      <Button onClick={onRedraw} variant="ghost" className="mt-6 text-gray-500 hover:text-gray-800"><RefreshCw className="w-4 h-4 mr-2" /> Sortear Novamente</Button>
    </div>
  );
}

function InstagramGiveaway({ setWinner }: { setWinner: (w: Winner) => void }) {
    const [comments, setComments] = useState("");
    const [filters, setFilters] = useState({ unique: true, mentions: 1 });
    const runGiveaway = useAction(api.giveaways.runInstagramGiveaway);
    const [isLoading, setIsLoading] = useState(false);

    const handleRun = () => {
        const commentList = comments.split('\n').filter(Boolean);
        if (commentList.length === 0) return toast.error("Por favor, cole os comentários.");
        setIsLoading(true);
        setWinner(null);
        toast.promise(runGiveaway({ comments: commentList, ...filters }), {
            loading: "Analisando comentários e sorteando...",
            success: (result) => { setWinner(result); return `Parabéns para @${result.username}! 🎉`; },
            error: (err) => err instanceof Error ? err.message : 'Tente novamente.',
            finally: () => setIsLoading(false),
        });
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <h3 className="font-semibold text-blue-800">Como funciona?</h3>
                <p className="text-sm text-blue-700 mt-1">
                    Use uma ferramenta gratuita para exportar os comentários do seu post e cole a lista abaixo para sortear.
                </p>
                <a href="https://commentpicker.com/instagram.php" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-800 mt-2 inline-flex items-center hover:underline">
                    Usar o Comment Picker <ExternalLink className="w-3 h-3 ml-1.5" />
                </a>
            </div>
            <div>
                <Label htmlFor="comments">Cole os comentários aqui (um por linha)</Label>
                <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="@usuario1 marcou @amigo1&#10;@usuario2 marcou @amigo2&#10;..." rows={8} disabled={isLoading} />
            </div>
            <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                <div className="flex items-center space-x-2"><Checkbox id="ig_unique" checked={filters.unique} onCheckedChange={(c) => setFilters(p => ({...p, unique: !!c}))} disabled={isLoading} /><Label htmlFor="ig_unique">Considerar apenas um comentário por pessoa.</Label></div>
                <div className="flex items-center gap-2"><Label htmlFor="mentions-input">Exigir</Label><Input id="mentions-input" type="number" value={filters.mentions} onChange={e => setFilters(p => ({...p, mentions: Number(e.target.value)}))} className="w-16 text-center" min="0" disabled={isLoading} /><Label htmlFor="mentions-input">menção(ões).</Label></div>
            </div>
            <Button onClick={handleRun} className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin mr-2"/> : <Star className="mr-2"/>} {isLoading ? "Sorteando..." : "Sortear Vencedor do Instagram"}</Button>
        </div>
    );
}

function ListGiveaway({ setWinner }: { setWinner: (w: Winner) => void }) {
    const [participants, setParticipants] = useState("");
    const [unique, setUnique] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const runGiveaway = useAction(api.giveaways.runListGiveaway);

    const handleRun = () => {
        const list = participants.split('\n').map(p => p.trim()).filter(Boolean);
        if (list.length === 0) return toast.error("A lista está vazia.");
        setIsLoading(true);
        setWinner(null);
        toast.promise(runGiveaway({ participants: list, unique }), {
            loading: "Sorteando participante...",
            success: (result) => { setWinner(result); return `Parabéns para ${result.username}! 🎉`; },
            error: (err) => err instanceof Error ? err.message : 'Tente novamente.',
            finally: () => setIsLoading(false),
        });
    };

    return (
        <div className="space-y-6">
            <div><Label htmlFor="participants">Lista de Participantes (um por linha)</Label><Textarea id="participants" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Lucas Aragão&#10;Luiza Coura&#10;..." rows={8} disabled={isLoading} /></div>
            <div className="rounded-lg border bg-gray-50 p-4"><div className="flex items-center space-x-2"><Checkbox id="list_unique" checked={unique} onCheckedChange={(c) => setUnique(!!c)} disabled={isLoading} /><Label htmlFor="list_unique">Remover participantes duplicados.</Label></div></div>
            <Button onClick={handleRun} className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin mr-2"/> : <Users className="mr-2"/>} {isLoading ? "Sorteando..." : "Sortear Vencedor da Lista"}</Button>
        </div>
    );
}

export default function GiveawayTool() {
  const [activeTab, setActiveTab] = useState<'instagram' | 'list'>('instagram');
  const [winner, setWinner] = useState<Winner>(null);

  const handleRedraw = () => {
      toast.info("Para sortear novamente, ajuste as opções e clique no botão principal.");
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        <button onClick={() => { setWinner(null); setActiveTab('instagram'); }} className={clsx("flex items-center gap-2 px-4 py-3 font-semibold", activeTab === 'instagram' ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500 hover:text-purple-600/80")}>
            <Instagram className="w-5 h-5" /> Instagram
        </button>
        <button onClick={() => { setWinner(null); setActiveTab('list'); }} className={clsx("flex items-center gap-2 px-4 py-3 font-semibold", activeTab === 'list' ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500 hover:text-purple-600/80")}>
            <List className="w-5 h-5" /> Lista de Nomes
        </button>
      </div>

      <div>
        {activeTab === 'instagram' && <InstagramGiveaway setWinner={setWinner} />}
        {activeTab === 'list' && <ListGiveaway setWinner={setWinner} />}
      </div>

      {winner && <WinnerCard winner={winner} onRedraw={handleRedraw} />}
    </div>
  );
}