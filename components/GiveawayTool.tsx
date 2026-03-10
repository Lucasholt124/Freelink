"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  Loader2,
  Instagram,
  Trophy,
  Copy,
  QrCode,
  Link as LinkIcon,
  MessageSquare,
  Download,
  RefreshCw,
  Share2,
  Trash2,
  AlertCircle,
  Play,
  Users,
  Shield,
  Gift
} from "lucide-react";
import clsx from "clsx";


type Winner = {
  name: string;
  identifier?: string;
  timestamp?: string;
  method?: string;
  total?: number;
} | null;

type Participant = {
  id: string;
  name: string;
  identifier: string;
  timestamp: string;
  platform?: string;
  verified?: boolean;
};

type GiveawayMethod = "link" | "qrcode";

type GiveawayData = {
  id: string;
  title: string;
  participants: Participant[];
  createdAt: string;
  isActive: boolean;
  method?: GiveawayMethod;
};


async function generateRealQRCode(text: string): Promise<string> {
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;
}


function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 800;
    const increment = value > 0 ? value / (duration / 50) : 0;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}


const toast = {
  success: (message: string) => {
    if (typeof document === 'undefined') return;
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce max-w-[90vw] flex items-center gap-2 font-medium';
    toastEl.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>${message}</span>`;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      if (document.body.contains(toastEl)) {
        document.body.removeChild(toastEl);
      }
    }, 3000);
  },
  error: (message: string) => {
    if (typeof document === 'undefined') return;
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce max-w-[90vw] font-medium';
    toastEl.innerHTML = `<div class="text-sm sm:text-base">${message}</div>`;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      if (document.body.contains(toastEl)) {
        document.body.removeChild(toastEl);
      }
    }, 3000);
  },
};


function launchConfetti() {
  if (typeof document === 'undefined') return;
  const colors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff', '#ffa500'];
  const confettiCount = 80;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      const size = Math.random() * 10 + 5;
      const x = Math.random() * 100;
      confetti.style.cssText = `position: fixed; width: ${size}px; height: ${size}px; background: ${colors[Math.floor(Math.random() * colors.length)]}; left: ${x}%; top: -20px; border-radius: ${Math.random() > 0.5 ? '50%' : '0'}; z-index: 9999; pointer-events: none; opacity: 1;`;
      document.body.appendChild(confetti);

      const animation = confetti.animate([
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 2000 + 2000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      animation.onfinish = () => {
        if (document.body.contains(confetti)) {
           confetti.remove();
        }
      };
    }, i * 30);
  }
}


function SmartLinkGenerator({ onGenerate, existingGiveaway }: { onGenerate: (data: GiveawayData) => void; existingGiveaway?: GiveawayData | null; }) {
  const [giveawayData, setGiveawayData] = useState<GiveawayData | null>(existingGiveaway || null);
  const [title, setTitle] = useState(existingGiveaway?.title || "");
  const saveGiveawayMutation = useMutation(api.publicGiveaways.saveGiveaway);

  useEffect(() => {
    if (existingGiveaway) {
      setGiveawayData(existingGiveaway);
      setTitle(existingGiveaway.title);
    }
  }, [existingGiveaway]);

  const generateLink = async () => {
    if (!title.trim()) return toast.error("Digite um nome para o sorteio!");

    const newGiveaway: GiveawayData = {
      id: `giveaway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      participants: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      method: 'link'
    };

    try {
      await saveGiveawayMutation({
        giveawayId: newGiveaway.id,
        title: newGiveaway.title,
        participants: [],
        isActive: true,
        method: 'link'
      });
      setGiveawayData(newGiveaway);
      onGenerate(newGiveaway);
      toast.success("Link criado com sucesso!");
    } catch  {
      toast.error("Erro ao criar sorteio.");
    }
  };

  const shareUrl = giveawayData ? `${window.location.origin}/giveaway/${giveawayData.id}` : '';

  const copyLink = () => { navigator.clipboard.writeText(shareUrl); toast.success("Link copiado!"); };

  return (
    <div className="space-y-4">
      {!giveawayData ? (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nome do Sorteio (Ex: Kit Setup 2026)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 outline-none transition-all font-medium"
            onKeyPress={(e) => e.key === 'Enter' && generateLink()}
          />
          <button onClick={generateLink} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
            <LinkIcon className="w-5 h-5" /> Criar e Gerar Link
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2">
            <input type="text" value={shareUrl} readOnly className="flex-1 bg-transparent text-sm font-mono outline-none text-gray-600" />
            <button onClick={copyLink} className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shrink-0">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm">
              <Instagram className="w-4 h-4" /> Copiar para Insta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QRCodeGeneratorComponent({ onGenerate, existingGiveaway }: { onGenerate: (data: GiveawayData) => void; existingGiveaway?: GiveawayData | null; }) {
  const [qrCode, setQrCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [, setGiveawayData] = useState<GiveawayData | null>(existingGiveaway || null);
  const [title, setTitle] = useState(existingGiveaway?.title || "");
  const saveGiveawayMutation = useMutation(api.publicGiveaways.saveGiveaway);

  useEffect(() => {
    if (existingGiveaway) {
      setGiveawayData(existingGiveaway);
      setTitle(existingGiveaway.title);
      generateRealQRCode(`${window.location.origin}/giveaway/${existingGiveaway.id}`).then(setQrCode);
    }
  }, [existingGiveaway]);

  const generateQR = async () => {
    if (!title.trim()) return toast.error("Digite um nome para o sorteio!");
    setIsGenerating(true);
    const newGiveaway: GiveawayData = {
      id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      participants: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      method: 'qrcode'
    };

    try {
      await saveGiveawayMutation({
        giveawayId: newGiveaway.id,
        title: newGiveaway.title,
        participants: [],
        isActive: true,
        method: 'qrcode'
      });
      const qrDataUrl = await generateRealQRCode(`${window.location.origin}/giveaway/${newGiveaway.id}`);
      setQrCode(qrDataUrl);
      setGiveawayData(newGiveaway);
      onGenerate(newGiveaway);
      toast.success("QR Code gerado!");
    } catch {
      toast.error("Erro ao criar sorteio.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {!qrCode ? (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nome do Evento Presencial"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all font-medium"
            onKeyPress={(e) => e.key === 'Enter' && generateQR()}
          />
          <button onClick={generateQR} disabled={isGenerating} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><QrCode className="w-5 h-5" /> Gerar QR Code</>}
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl inline-block shadow-sm">
            <Image src={qrCode} alt="QR Code" width={200} height={200} unoptimized className="rounded-lg" />
          </div>
          <button onClick={() => {
            const link = document.createElement('a');
            link.download = `qr-sorteio.png`;
            link.href = qrCode;
            link.click();
          }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Baixar Imagem
          </button>
        </div>
      )}
    </div>
  );
}

export default function GiveawayTool() {
  const { user } = useUser();
  const [selectedMethod, setSelectedMethod] = useState<GiveawayMethod>("link");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Winner>(null);


  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningName, setSpinningName] = useState<string>("Sorteando...");

  const [currentGiveaway, setCurrentGiveaway] = useState<GiveawayData | null>(null);
  const [selectedGiveaway, setSelectedGiveaway] = useState<string | null>(null);

  const userGiveaways = useQuery(api.publicGiveaways.getUserGiveaways);
  const giveawayDetails = useQuery(
    api.publicGiveaways.getGiveaway,
    selectedGiveaway ? { giveawayId: selectedGiveaway } : "skip"
  );

  const deleteGiveawayMutation = useMutation(api.publicGiveaways.deleteGiveaway);
  const endGiveawayMutation = useMutation(api.publicGiveaways.endGiveaway);

  useEffect(() => {
    if (userGiveaways && userGiveaways.length > 0 && !selectedGiveaway) {
      const activeGiveaway = userGiveaways.find(g => g.isActive);
      if (activeGiveaway) {
        setSelectedGiveaway(activeGiveaway.id);
        setCurrentGiveaway(activeGiveaway as GiveawayData);
        setParticipants(activeGiveaway.participants as Participant[]);
        if (activeGiveaway.method) setSelectedMethod(activeGiveaway.method as GiveawayMethod);
      }
    }
  }, [userGiveaways, selectedGiveaway]);

  useEffect(() => {
    if (giveawayDetails) {
      setCurrentGiveaway(giveawayDetails as GiveawayData);
      setParticipants(giveawayDetails.participants as Participant[]);
    }
  }, [giveawayDetails]);

  // A Lógica da Roleta da Tensão
  const runRoulette = () => {
    if (participants.length < 2) return toast.error("Precisa de pelo menos 2 participantes!");

    setIsSpinning(true);
    setWinner(null);

    let spins = 0;
    const maxSpins = 40; // Quantas vezes vai pular de nome
    let delay = 50; // Começa bem rápido

    const spin = () => {
      const randomIdx = Math.floor(Math.random() * participants.length);
      setSpinningName(participants[randomIdx].name);
      spins++;

      if (spins < maxSpins) {
        // Desacelera nas últimas rodadas
        if (spins > 25) delay += 20;
        setTimeout(spin, delay);
      } else {
        // Vencedor Final!
        const finalWinner = participants[randomIdx];
        setWinner({
          name: finalWinner.name,
          identifier: finalWinner.identifier,
          timestamp: new Date().toISOString(),
          method: selectedMethod,
          total: participants.length
        });
        setIsSpinning(false);
        launchConfetti();
      }
    };

    spin();
  };

  const resetGiveaway = async () => {
    if (!currentGiveaway || !confirm("Certeza que deseja apagar o sorteio atual?")) return;
    try {
      await deleteGiveawayMutation({ giveawayId: currentGiveaway.id });
      setCurrentGiveaway(null);
      setSelectedGiveaway(null);
      setParticipants([]);
      setWinner(null);
      toast.success("Sorteio excluído!");
    } catch { toast.error("Erro ao excluir"); }
  };

  const endGiveaway = async () => {
    if (!currentGiveaway) return;
    try {
      await endGiveawayMutation({ giveawayId: currentGiveaway.id });
      toast.success("Sorteio finalizado e bloqueado para novos usuários!");
    } catch { toast.error("Erro ao finalizar"); }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Carregando perfil...</h2>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">


      <div className="lg:col-span-4 space-y-6">

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Gift className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-bold text-gray-900">Novo Sorteio</h2>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setSelectedMethod("link")}
              className={clsx(
                "py-2.5 rounded-xl border-2 text-xs font-bold transition-all",
                selectedMethod === "link" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-100 text-gray-500 hover:bg-gray-50"
              )}
            >
              Link (Web)
            </button>
            <button
              onClick={() => setSelectedMethod("qrcode")}
              className={clsx(
                "py-2.5 rounded-xl border-2 text-xs font-bold transition-all",
                selectedMethod === "qrcode" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-100 text-gray-500 hover:bg-gray-50"
              )}
            >
              QR Code (Evento)
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={selectedMethod} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              {selectedMethod === "link" ? (
                <SmartLinkGenerator onGenerate={(d) => { setCurrentGiveaway(d); setSelectedGiveaway(d.id); setParticipants([]); setWinner(null); }} existingGiveaway={currentGiveaway?.method === 'link' ? currentGiveaway : null} />
              ) : (
                <QRCodeGeneratorComponent onGenerate={(d) => { setCurrentGiveaway(d); setSelectedGiveaway(d.id); setParticipants([]); setWinner(null); }} existingGiveaway={currentGiveaway?.method === 'qrcode' ? currentGiveaway : null} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {userGiveaways && userGiveaways.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Seu Histórico</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {userGiveaways.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGiveaway(g.id);
                    setCurrentGiveaway(g as GiveawayData);
                    setParticipants(g.participants as Participant[]);
                    setWinner(null);
                    if (g.method) setSelectedMethod(g.method as GiveawayMethod);
                  }}
                  className={clsx(
                    "w-full p-3 rounded-xl text-left transition-all border",
                    selectedGiveaway === g.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-transparent bg-gray-50 hover:border-gray-300"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-gray-900 truncate pr-2">{g.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        <Users className="w-3 h-3 inline mr-1" />
                        {g.participantsCount} pessoas
                      </p>
                    </div>
                    {g.isActive ? (
                      <span className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0" title="Ativo" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300 mt-1 shrink-0" title="Finalizado" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>


      <div className="lg:col-span-8 flex flex-col gap-6">

        {!currentGiveaway ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <Trophy className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Palco Vazio</h3>
            <p className="text-sm max-w-sm">Crie ou selecione um sorteio ao lado para ver os participantes entrarem ao vivo e realizar o sorteio.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-50 pointer-events-none" />

              <div className="z-10 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className={clsx("text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider", currentGiveaway.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {currentGiveaway.isActive ? "🔴 AO VIVO" : "⚪ ENCERRADO"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-gray-100 text-gray-600">
                    VIA {currentGiveaway.method === 'link' ? 'LINK WEB' : 'QR CODE'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{currentGiveaway.title}</h2>
              </div>

              <div className="flex flex-col items-center sm:items-end z-10 shrink-0">
                <div className="text-4xl font-black text-purple-600">
                  <AnimatedCounter value={participants.length} />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Participantes</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden border border-gray-800">

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-500/20 blur-[100px] pointer-events-none" />

              {!isSpinning && !winner ? (
                <div className="relative z-10 space-y-6">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto border border-gray-700 shadow-inner">
                    <Trophy className="w-10 h-10 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">Tudo pronto para sortear?</h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">Certifique-se de que todos já entraram. O sorteio é aleatório e auditável.</p>
                  </div>
                  <button
                    onClick={runRoulette}
                    disabled={participants.length < 2 || !currentGiveaway.isActive}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-black text-lg shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-3 mx-auto"
                  >
                    <Play className="w-6 h-6 fill-white" /> SORTEAR AGORA
                  </button>
                </div>
              ) : isSpinning ? (
                <div className="relative z-10 py-10">
                  <p className="text-purple-400 font-bold text-sm tracking-[0.3em] uppercase mb-4 animate-pulse">Sorteando Vencedor...</p>
                  <div className="h-24 sm:h-32 flex items-center justify-center border-y border-white/10 overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-900 to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-900 to-transparent z-10" />

                    <motion.h2
                      key={spinningName}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -40, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="text-3xl sm:text-5xl font-black text-white truncate px-4"
                    >
                      {spinningName}
                    </motion.h2>
                  </div>
                </div>
              ) : winner ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10 space-y-6"
                >
                  <motion.div
                    initial={{ y: 20 }} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(250,204,21,0.5)] border-4 border-yellow-200"
                  >
                    <Trophy className="w-12 h-12 text-yellow-900" />
                  </motion.div>

                  <div>
                    <p className="text-yellow-400 font-bold text-sm tracking-widest uppercase mb-2">Temos um ganhador!</p>
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">{winner.name}</h2>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                      {winner.identifier?.includes('Instagram') ? <Instagram className="w-4 h-4 text-pink-400"/> : <MessageSquare className="w-4 h-4 text-green-400"/>}
                      <span className="text-gray-200 font-mono text-sm">{winner.identifier?.replace(/Instagram:|WhatsApp:/, '').trim() || winner.identifier}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-6 border-t border-white/10">
                    <button onClick={() => setWinner(null)} className="px-6 py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Voltar
                    </button>
                    <button onClick={() => {
                      navigator.clipboard.writeText(`🏆 Vencedor do Sorteio!\n\nNome: ${winner.name}\nContato: ${winner.identifier}`);
                      toast.success("Copiado para colar nas redes!");
                    }} className="px-6 py-3 rounded-xl font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
                      <Share2 className="w-4 h-4" /> Anunciar Resultado
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  Lista VIP de Participantes
                </h3>

                {currentGiveaway.isActive && (
                   <div className="flex gap-2">
                     <button onClick={endGiveaway} className="text-xs font-bold px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors">
                       Encerrar Inscrições
                     </button>
                     <button onClick={resetGiveaway} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors" title="Apagar Sorteio">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                )}
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">Ninguém entrou no sorteio ainda.</p>
                  <p className="text-xs text-gray-400 mt-1">Compartilhe o link para começar!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {participants.map((p, idx) => {
                    const isInsta = p.identifier.includes('Instagram');
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={p.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-black shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 font-mono truncate flex items-center gap-1 mt-0.5">
                            {isInsta ? <Instagram className="w-3 h-3 text-pink-500"/> : <MessageSquare className="w-3 h-3 text-green-500"/>}
                            {p.identifier.replace(/Instagram:|WhatsApp:/, '').trim()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}