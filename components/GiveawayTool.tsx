"use client";

import { useState, useEffect } from "react";
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

// Confetti animation component
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Aqui você pode usar uma lib de confetti ou criar um efeito simples */}
      <canvas id="confetti-canvas" className="w-full h-full"></canvas>
    </div>
  );
}

type Winner = FunctionReturnType<typeof api.giveaways.runInstagramGiveaway> | null;

function WinnerCard({ winner, onRedraw }: { winner: NonNullable<Winner>; onRedraw: () => void }) {
  // Trigger confetti on mount
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-100 p-8 rounded-3xl border-4 border-amber-400 text-center shadow-lg animate-fadeIn zoom-in-110 relative overflow-hidden">
      {showConfetti && <Confetti />}
      <h3 className="text-lg font-extrabold uppercase tracking-widest text-amber-700 drop-shadow-md">🎉 E o vencedor é... 🎉</h3>
      <div className="mt-6 flex flex-col items-center gap-5">
        <Image
          src={winner.profilePicUrl}
          alt={`Foto de ${winner.username}`}
          width={100}
          height={100}
          className="rounded-full border-8 border-white shadow-xl"
          priority
        />
        <p className="text-3xl font-extrabold text-gray-900 truncate max-w-xs">@{winner.username}</p>
        <p className="text-gray-700 mt-2 bg-white/80 px-5 py-3 rounded-xl text-lg font-medium shadow-inner max-w-md">{winner.commentText}</p>
      </div>
      <Button
        onClick={onRedraw}
        variant="outline"
        className="mt-8 text-amber-600 hover:text-amber-800 border-amber-600 hover:border-amber-800 transition-colors flex items-center justify-center mx-auto"
        aria-label="Sortear novamente"
      >
        <RefreshCw className="w-5 h-5 mr-2 animate-spin-slow" /> Sortear Novamente
      </Button>
    </div>
  );
}

function InstagramGiveaway({ setWinner }: { setWinner: (w: Winner) => void }) {
  const [comments, setComments] = useState("");
  const [filters, setFilters] = useState({ unique: true, mentions: 1 });
  const runGiveaway = useAction(api.giveaways.runInstagramGiveaway);
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = () => {
    const commentList = comments.split("\n").filter(Boolean);
    if (commentList.length === 0) return toast.error("Por favor, cole os comentários.");
    if (filters.mentions < 0) return toast.error("Menções não podem ser negativas.");
    setIsLoading(true);
    setWinner(null);
    toast.promise(
      runGiveaway({ comments: commentList, ...filters }),
      {
        loading: "Analisando comentários e sorteando...",
        success: (result) => {
          setWinner(result);
          return `Parabéns para @${result.username}! 🎉`;
        },
        error: (err) => (err instanceof Error ? err.message : "Tente novamente."),
        finally: () => setIsLoading(false),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-blue-50 border-l-8 border-blue-500 rounded-r-xl shadow-sm">
        <h3 className="font-semibold text-blue-900 text-lg">Como funciona?</h3>
        <p className="text-sm text-blue-800 mt-1 leading-relaxed">
          Use uma ferramenta gratuita para exportar os comentários do seu post e cole a lista abaixo para sortear.
        </p>
        <a
          href="https://commentpicker.com/instagram.php"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-blue-900 mt-3 inline-flex items-center hover:underline"
        >
          Usar o Comment Picker <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>

      <div>
        <Label htmlFor="comments" className="font-semibold">Cole os comentários aqui (um por linha)</Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="@usuario1 marcou @amigo1&#10;@usuario2 marcou @amigo2&#10;..."
          rows={8}
          disabled={isLoading}
          className="resize-none"
        />
      </div>

      <div className="space-y-4 rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-inner">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="ig_unique"
            checked={filters.unique}
            onCheckedChange={(c) => setFilters((p) => ({ ...p, unique: !!c }))}
            disabled={isLoading}
          />
          <Label htmlFor="ig_unique" className="select-none">Considerar apenas um comentário por pessoa.</Label>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="mentions-input" className="select-none">Exigir</Label>
          <Input
            id="mentions-input"
            type="number"
            value={filters.mentions}
            onChange={(e) => setFilters((p) => ({ ...p, mentions: Math.max(0, Number(e.target.value)) }))}
            className="w-20 text-center"
            min={0}
            disabled={isLoading}
          />
          <Label htmlFor="mentions-input" className="select-none">menção(ões).</Label>
        </div>
      </div>

      <Button
        onClick={handleRun}
        className={clsx("w-full flex justify-center items-center font-bold text-white", {
          "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700": !isLoading,
          "bg-gray-400 cursor-not-allowed": isLoading,
          "animate-pulse": isLoading,
        })}
        disabled={isLoading}
        aria-live="polite"
      >
        {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Star className="mr-3" />}
        {isLoading ? "Sorteando..." : "Sortear Vencedor do Instagram"}
      </Button>
    </div>
  );
}

function ListGiveaway({ setWinner }: { setWinner: (w: Winner) => void }) {
  const [participants, setParticipants] = useState("");
  const [unique, setUnique] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const runGiveaway = useAction(api.giveaways.runListGiveaway);

  const handleRun = () => {
    const list = participants.split("\n").map((p) => p.trim()).filter(Boolean);
    if (list.length === 0) return toast.error("A lista está vazia.");
    setIsLoading(true);
    setWinner(null);
    toast.promise(
      runGiveaway({ participants: list, unique }),
      {
        loading: "Sorteando participante...",
        success: (result) => {
          setWinner(result);
          return `Parabéns para ${result.username}! 🎉`;
        },
        error: (err) => (err instanceof Error ? err.message : "Tente novamente."),
        finally: () => setIsLoading(false),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="participants" className="font-semibold">Lista de Participantes (um por linha)</Label>
        <Textarea
          id="participants"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          placeholder="Lucas Aragão&#10;Luiza Coura&#10;..."
          rows={8}
          disabled={isLoading}
          className="resize-none"
        />
      </div>

      <div className="rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-inner">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="list_unique"
            checked={unique}
            onCheckedChange={(c) => setUnique(!!c)}
            disabled={isLoading}
          />
          <Label htmlFor="list_unique" className="select-none">Remover participantes duplicados.</Label>
        </div>
      </div>

      <Button
        onClick={handleRun}
        className={clsx("w-full flex justify-center items-center font-bold text-white", {
          "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700": !isLoading,
          "bg-gray-400 cursor-not-allowed": isLoading,
          "animate-pulse": isLoading,
        })}
        disabled={isLoading}
        aria-live="polite"
      >
        {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Users className="mr-3" />}
        {isLoading ? "Sorteando..." : "Sortear Vencedor da Lista"}
      </Button>
    </div>
  );
}

export default function GiveawayTool() {
  const [activeTab, setActiveTab] = useState<"instagram" | "list">("instagram");
  const [winner, setWinner] = useState<Winner>(null);

  const handleRedraw = () => {
toast(
  <div className="p-4 bg-white rounded shadow-lg flex flex-col items-center space-y-3">
    <p className="font-semibold text-gray-900">Quer sortear novamente?</p>
    <div className="flex space-x-4">
      <Button
        onClick={() => {
          setWinner(null);
          toast.dismiss();
        }}
        variant="default"
      >
        Sim, sortear de novo
      </Button>
      <Button onClick={() => toast.dismiss()} variant="outline">
        Cancelar
      </Button>
    </div>
  </div>,
  { duration: 8000 }
);
};

  return (
    <div className="space-y-8 max-w-3xl mx-auto p-4">
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => {
            setWinner(null);
            setActiveTab("instagram");
          }}
          className={clsx(
            "flex items-center gap-2 px-6 py-4 font-semibold transition-colors",
            activeTab === "instagram"
              ? "border-b-4 border-purple-700 text-purple-700"
              : "text-gray-500 hover:text-purple-600"
          )}
          aria-selected={activeTab === "instagram"}
          role="tab"
        >
          <Instagram className="w-6 h-6" /> Instagram
        </button>
        <button
          onClick={() => {
            setWinner(null);
            setActiveTab("list");
          }}
          className={clsx(
            "flex items-center gap-2 px-6 py-4 font-semibold transition-colors",
            activeTab === "list"
              ? "border-b-4 border-purple-700 text-purple-700"
              : "text-gray-500 hover:text-purple-600"
          )}
          aria-selected={activeTab === "list"}
          role="tab"
        >
          <List className="w-6 h-6" /> Lista de Nomes
        </button>
      </div>

      <div role="tabpanel" aria-hidden={activeTab !== "instagram"}>
        {activeTab === "instagram" && <InstagramGiveaway setWinner={setWinner} />}
      </div>
      <div role="tabpanel" aria-hidden={activeTab !== "list"}>
        {activeTab === "list" && <ListGiveaway setWinner={setWinner} />}
      </div>

      {winner && <WinnerCard winner={winner} onRedraw={handleRedraw} />}
    </div>
  );
}