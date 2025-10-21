"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Loader2,
  Instagram,
  Trophy,

  Copy,

  QrCode,
  Link as LinkIcon,
  MessageSquare,
  Download,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,

  RefreshCw,
  Share2,
  Trash2,
} from "lucide-react";
import clsx from "clsx";

// Types
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

// Storage helpers
const STORAGE_KEY = 'freelinnk_giveaways';
const ACTIVE_GIVEAWAY_KEY = 'freelinnk_active_giveaway';
const CURRENT_STATE_KEY = 'freelinnk_current_state';

// Save active giveaway
const setActiveGiveaway = (giveawayId: string | null) => {
  if (typeof window === 'undefined') return;
  if (giveawayId) {
    localStorage.setItem(ACTIVE_GIVEAWAY_KEY, giveawayId);
  } else {
    localStorage.removeItem(ACTIVE_GIVEAWAY_KEY);
  }
};

// Get active giveaway
const getActiveGiveawayId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_GIVEAWAY_KEY);
};

// Save current state
const saveCurrentState = (state: {
  selectedMethod: GiveawayMethod;
  currentGiveaway: GiveawayData | null;
  participants: Participant[];
  winner: Winner;
}) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(state));
};

// Get current state
const getCurrentState = () => {
  if (typeof window === 'undefined') return null;
  const state = localStorage.getItem(CURRENT_STATE_KEY);
  return state ? JSON.parse(state) : null;
};

// Clear current state
const clearCurrentState = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_STATE_KEY);
  localStorage.removeItem(ACTIVE_GIVEAWAY_KEY);
};

const saveGiveaway = (giveaway: GiveawayData) => {
  if (typeof window === 'undefined') return;

  const giveaways = getAllGiveaways();
  const index = giveaways.findIndex(g => g.id === giveaway.id);

  if (index >= 0) {
    giveaways[index] = giveaway;
  } else {
    giveaways.push(giveaway);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(giveaways));
};

const getGiveaway = (id: string): GiveawayData | null => {
  const giveaways = getAllGiveaways();
  return giveaways.find(g => g.id === id) || null;
};

const getAllGiveaways = (): GiveawayData[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const deleteGiveaway = (id: string) => {
  if (typeof window === 'undefined') return;
  const giveaways = getAllGiveaways().filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(giveaways));
};

// QR Code generator using public API
async function generateRealQRCode(text: string): Promise<string> {
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;
  return qrApiUrl;
}

// Animated counter
function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 800;
    const increment = value / (duration / 50);
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

// Toast notifications
const toast = {
  success: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce max-w-[90vw]';
    toastEl.innerHTML = `<div class="flex items-center gap-2 text-sm sm:text-base"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${message}</div>`;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      if (document.body.contains(toastEl)) {
        document.body.removeChild(toastEl);
      }
    }, 3000);
  },
  error: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce max-w-[90vw]';
    toastEl.innerHTML = `<div class="text-sm sm:text-base">${message}</div>`;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      if (document.body.contains(toastEl)) {
        document.body.removeChild(toastEl);
      }
    }, 3000);
  },
};

// Confetti function
function launchConfetti() {
  const colors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff', '#ffa500'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      const size = Math.random() * 10 + 5;
      confetti.style.cssText = `position: fixed; width: ${size}px; height: ${size}px; background: ${colors[Math.floor(Math.random() * colors.length)]}; left: ${Math.random() * 100}%; top: -20px; border-radius: ${Math.random() > 0.5 ? '50%' : '0'}; z-index: 9999; pointer-events: none; opacity: 1;`;
      document.body.appendChild(confetti);

      const animation = confetti.animate([
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 2000 + 2000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      animation.onfinish = () => confetti.remove();
    }, i * 50);
  }
}

// Instructions component
function InstructionsPanel({
  method,
  isOpen,
  onToggle
}: {
  method: GiveawayMethod;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const instructions = {
    link: {
      title: "Como usar o Link Único",
      steps: [
        "Digite um nome para o sorteio",
        "Clique em 'Gerar Link de Participação'",
        "Compartilhe o link nas suas redes sociais",
        "Participantes preenchem o formulário SEM LOGIN",
        "Acompanhe em tempo real os participantes",
        "Clique em 'Sortear Vencedor' quando quiser"
      ],
      tips: "💡 Participantes NÃO precisam fazer login! Link público e direto."
    },
    qrcode: {
      title: "Como usar o QR Code",
      steps: [
        "Digite um nome para o sorteio",
        "Clique em 'Gerar QR Code'",
        "Baixe ou compartilhe a imagem do QR",
        "Pessoas escaneiam com a câmera do celular",
        "São direcionados para o formulário SEM LOGIN",
        "Sorteie quando tiver participantes suficientes"
      ],
      tips: "💡 QR Code funciona sem login! Acesso público direto."
    }
  };

  const content = instructions[method];

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-blue-900 dark:text-blue-100 text-sm sm:text-base">
            Como funciona?
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-blue-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-600" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <h4 className="font-bold text-sm text-blue-900 dark:text-blue-100">
                {content.title}
              </h4>
              <div className="space-y-2">
                {content.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 flex-1">{step}</p>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mt-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  {content.tips}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Smart Link Generator
function SmartLinkGenerator({
  onGenerate,
  existingGiveaway,
  onContinue
}: {
  onGenerate: (id: string, data: GiveawayData) => void;
  existingGiveaway?: GiveawayData | null;
  onContinue?: () => void;
}) {
  const [giveawayData, setGiveawayData] = useState<GiveawayData | null>(existingGiveaway || null);
  const [title, setTitle] = useState(existingGiveaway?.title || "");
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (existingGiveaway) {
      setGiveawayData(existingGiveaway);
      setTitle(existingGiveaway.title);
    }
  }, [existingGiveaway]);

  const generateLink = () => {
    if (!title.trim()) {
      toast.error("Digite um nome para o sorteio!");
      return;
    }

    const newGiveaway: GiveawayData = {
      id: `giveaway_${Date.now()}`,
      title: title.trim(),
      participants: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      method: 'link'
    };

    saveGiveaway(newGiveaway);
    setGiveawayData(newGiveaway);
    setActiveGiveaway(newGiveaway.id);
    onGenerate(newGiveaway.id, newGiveaway);
    toast.success("Link criado com sucesso!");
  };

  // Generate PUBLIC shareable URL
  const shareUrl = giveawayData
    ? `${window.location.origin}/giveaway/${giveawayData.id}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  const shareWhatsApp = () => {
    const text = `🎁 Participe do sorteio: ${giveawayData?.title}\n\nClique no link para participar:\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Show continue option if there's an existing giveaway
  if (existingGiveaway && !giveawayData) {
    return (
      <div className="space-y-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
          <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
            Sorteio em andamento encontrado!
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
            {existingGiveaway.title} - {existingGiveaway.participants.length} participantes
          </p>
          <button
            onClick={onContinue}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-all"
          >
            Continuar sorteio anterior
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InstructionsPanel
        method="link"
        isOpen={showInstructions}
        onToggle={() => setShowInstructions(!showInstructions)}
      />

      {!giveawayData ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome do Sorteio
            </label>
            <input
              type="text"
              placeholder="Ex: Sorteio de Natal 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all"
              onKeyPress={(e) => e.key === 'Enter' && generateLink()}
            />
          </div>
          <button
            onClick={generateLink}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            <LinkIcon className="w-5 h-5" />
            Gerar Link de Participação
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Link público do sorteio:
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg p-3">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono outline-none"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={shareWhatsApp}
              className="bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </button>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Link criado! Compartilhe com os participantes - eles NÃO precisam fazer login!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// QR Code Generator
function QRCodeGeneratorComponent({
  onGenerate,
  existingGiveaway,
  onContinue
}: {
  onGenerate: (id: string, data: GiveawayData) => void;
  existingGiveaway?: GiveawayData | null;
  onContinue?: () => void;
}) {
  const [qrCode, setQrCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [giveawayData, setGiveawayData] = useState<GiveawayData | null>(existingGiveaway || null);
  const [title, setTitle] = useState(existingGiveaway?.title || "");

  useEffect(() => {
    if (existingGiveaway) {
      setGiveawayData(existingGiveaway);
      setTitle(existingGiveaway.title);
      // Regenerate QR code with PUBLIC URL
      const targetUrl = `${window.location.origin}/giveaway/${existingGiveaway.id}`;
      generateRealQRCode(targetUrl).then(setQrCode);
    }
  }, [existingGiveaway]);

  const generateQR = async () => {
    if (!title.trim()) {
      toast.error("Digite um nome para o sorteio!");
      return;
    }

    setIsGenerating(true);

    const newGiveaway: GiveawayData = {
      id: `qr_${Date.now()}`,
      title: title.trim(),
      participants: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      method: 'qrcode'
    };

    saveGiveaway(newGiveaway);
    setActiveGiveaway(newGiveaway.id);

    // Generate QR Code with PUBLIC URL
    const targetUrl = `${window.location.origin}/giveaway/${newGiveaway.id}`;
    const qrDataUrl = await generateRealQRCode(targetUrl);

    setQrCode(qrDataUrl);
    setGiveawayData(newGiveaway);
    setIsGenerating(false);
    onGenerate(newGiveaway.id, newGiveaway);
    toast.success("QR Code gerado com sucesso!");
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `qrcode-sorteio-${giveawayData?.id || 'novo'}.png`;
    link.href = qrCode;
    link.click();
    toast.success("QR Code baixado!");
  };

  // Show continue option if there's an existing giveaway
  if (existingGiveaway && !giveawayData && !qrCode) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
            Sorteio em andamento encontrado!
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            {existingGiveaway.title} - {existingGiveaway.participants.length} participantes
          </p>
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
          >
            Continuar sorteio anterior
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InstructionsPanel
        method="qrcode"
        isOpen={showInstructions}
        onToggle={() => setShowInstructions(!showInstructions)}
      />

      {!qrCode ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome do Sorteio
            </label>
            <input
              type="text"
              placeholder="Ex: Sorteio Evento 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
              onKeyPress={(e) => e.key === 'Enter' && generateQR()}
            />
          </div>
          <button
            onClick={generateQR}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                Gerar QR Code
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <Image
              src={qrCode}
              alt="QR Code"
              width={400}
              height={400}
              unoptimized
              className="w-full max-w-xs mx-auto bg-white"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 mb-4">
              QR Code público - Participantes NÃO precisam fazer login!
            </p>
            <button
              onClick={downloadQR}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Baixar QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Winner Display
function WinnerDisplay({
  winner,
  onNewDraw
}: {
  winner: NonNullable<Winner>;
  onNewDraw: () => void;
}) {
  const shareResult = () => {
    const text = `🏆 Resultado do Sorteio!\n\nVencedor: ${winner.name}\n${winner.identifier || ''}\n\nTotal de participantes: ${winner.total}`;
    navigator.clipboard.writeText(text);
    toast.success("Resultado copiado!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 p-8 rounded-3xl shadow-2xl text-center"
    >
      <Trophy className="w-20 h-20 text-yellow-600 mx-auto mb-4" />
      <h3 className="text-3xl font-bold mb-2">{winner.name}</h3>
      {winner.identifier && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">{winner.identifier}</p>
      )}
      <p className="text-sm text-gray-500 mb-6">
        Sorteado entre {winner.total} participantes
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onNewDraw}
          className="px-6 py-3 bg-white rounded-xl font-bold text-purple-600 hover:bg-purple-50 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Novo Sorteio
        </button>
        <button
          onClick={shareResult}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Compartilhar
        </button>
      </div>
    </motion.div>
  );
}

// Main component
export default function GiveawayTool() {
  const [selectedMethod, setSelectedMethod] = useState<GiveawayMethod>("link");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Winner>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGiveaway, setCurrentGiveaway] = useState<GiveawayData | null>(null);
  const [showParticipants, setShowParticipants] = useState(true);

  // Load saved state on mount - ONLY for creator
  useEffect(() => {
    // Load saved state for creator
    const savedState = getCurrentState();
    if (savedState) {
      setSelectedMethod(savedState.selectedMethod);
      if (savedState.currentGiveaway) {
        // Reload fresh data from storage
        const freshGiveaway = getGiveaway(savedState.currentGiveaway.id);
        if (freshGiveaway) {
          setCurrentGiveaway(freshGiveaway);
          setParticipants(freshGiveaway.participants);
          if (freshGiveaway.method) {
            setSelectedMethod(freshGiveaway.method);
          }
        }
      }
      if (savedState.winner) {
        setWinner(savedState.winner);
      }
    }

    // Check for active giveaway
    const activeGiveawayId = getActiveGiveawayId();
    if (activeGiveawayId && !savedState?.currentGiveaway) {
      const activeGiveaway = getGiveaway(activeGiveawayId);
      if (activeGiveaway) {
        setCurrentGiveaway(activeGiveaway);
        setParticipants(activeGiveaway.participants);
        if (activeGiveaway.method) {
          setSelectedMethod(activeGiveaway.method);
        }
      }
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (currentGiveaway || winner) {
      saveCurrentState({
        selectedMethod,
        currentGiveaway,
        participants,
        winner
      });
    }
  }, [selectedMethod, currentGiveaway, participants, winner]);

  // Real-time participants polling
  useEffect(() => {
    if (!currentGiveaway?.id) return;

    // Save current giveaway whenever participants change
    if (currentGiveaway) {
      const updatedGiveaway = { ...currentGiveaway, participants };
      saveGiveaway(updatedGiveaway);
    }

    const interval = setInterval(() => {
      const giveaway = getGiveaway(currentGiveaway.id);
      if (giveaway && giveaway.participants.length !== participants.length) {
        setParticipants(giveaway.participants);
        setCurrentGiveaway(giveaway);
        if (giveaway.participants.length > participants.length) {
          toast.success("Novo participante entrou!");
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentGiveaway, participants]);

  const handleGenerateGiveaway = (id: string, data: GiveawayData) => {
    setCurrentGiveaway(data);
    setActiveGiveaway(id);
    const giveaway = getGiveaway(id);
    if (giveaway) {
      setParticipants(giveaway.participants);
    }
  };

  const runGiveaway = () => {
    if (participants.length === 0) {
      toast.error("Nenhum participante ainda!");
      return;
    }

    if (participants.length < 2) {
      toast.error("Precisa de pelo menos 2 participantes!");
      return;
    }

    setIsLoading(true);
    setWinner(null);

    let count = 0;
    const drumRoll = setInterval(() => {
      count++;
      if (count > 15) {
        clearInterval(drumRoll);
        const randomIndex = Math.floor(Math.random() * participants.length);
        const selectedWinner = participants[randomIndex];

        const winnerData = {
          name: selectedWinner.name,
          identifier: selectedWinner.identifier,
          timestamp: new Date().toISOString(),
          method: selectedMethod,
          total: participants.length
        };

        setWinner(winnerData);
        launchConfetti();
        setIsLoading(false);
      }
    }, 150);
  };

  const resetGiveaway = () => {
    if (currentGiveaway) {
      deleteGiveaway(currentGiveaway.id);
    }
    clearCurrentState();
    setCurrentGiveaway(null);
    setParticipants([]);
    setWinner(null);
    toast.success("Sorteio excluído!");
  };

  const continueExistingGiveaway = () => {
    if (currentGiveaway) {
      const fresh = getGiveaway(currentGiveaway.id);
      if (fresh) {
        setCurrentGiveaway(fresh);
        setParticipants(fresh.participants);
        if (fresh.method) {
          setSelectedMethod(fresh.method);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
              Sorteios 100% Funcionais
            </h1>
            <p className="text-purple-100 mt-2 text-center text-sm sm:text-base">
              Links e QR Codes públicos - SEM LOGIN para participantes!
            </p>
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 max-w-xs mx-auto">
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter value={participants.length} />
                  </p>
                  <p className="text-xs">Participantes ao vivo</p>
                </div>
              </div>
            </div>
            {currentGiveaway && (
              <div className="mt-4 text-center">
                <p className="text-sm text-purple-200">Sorteio ativo:</p>
                <p className="font-bold">{currentGiveaway.title}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Method Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4">Escolha o método:</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedMethod("link")}
              className={clsx(
                "p-4 rounded-xl border-2 transition-all",
                selectedMethod === "link"
                  ? "border-purple-500 bg-purple-50 scale-105"
                  : "border-gray-200 hover:border-purple-300"
              )}
            >
              <LinkIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-bold text-sm">Link Único</h3>
              <p className="text-xs text-gray-600 mt-1">Compartilhável</p>
            </button>
            <button
              onClick={() => setSelectedMethod("qrcode")}
              className={clsx(
                "p-4 rounded-xl border-2 transition-all",
                selectedMethod === "qrcode"
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-200 hover:border-blue-300"
              )}
            >
              <QrCode className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-bold text-sm">QR Code</h3>
              <p className="text-xs text-gray-600 mt-1">Para eventos</p>
            </button>
          </div>
        </div>

        {/* Method Implementation */}
        <motion.div
          key={selectedMethod}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6"
        >
          {selectedMethod === "link" && (
            <SmartLinkGenerator
              onGenerate={handleGenerateGiveaway}
              existingGiveaway={currentGiveaway?.method === 'link' ? currentGiveaway : null}
              onContinue={continueExistingGiveaway}
            />
          )}
          {selectedMethod === "qrcode" && (
            <QRCodeGeneratorComponent
              onGenerate={handleGenerateGiveaway}
              existingGiveaway={currentGiveaway?.method === 'qrcode' ? currentGiveaway : null}
              onContinue={continueExistingGiveaway}
            />
          )}
        </motion.div>

        {/* Participants List */}
        {participants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                Participantes ({participants.length})
              </h3>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-sm text-purple-600"
              >
                {showParticipants ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {showParticipants && (
              <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.identifier}</p>
                    </div>
                    {p.verified && <Shield className="w-4 h-4 text-green-500" />}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={runGiveaway}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sorteando...</>
                ) : (
                  <><Trophy className="w-5 h-5" /> Sortear Vencedor</>
                )}
              </button>
              <button
                onClick={resetGiveaway}
                className="px-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-800"
                title="Excluir sorteio"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Winner Display */}
        {winner && (
          <WinnerDisplay
            winner={winner}
            onNewDraw={() => setWinner(null)}
          />
        )}
      </div>
    </div>
  );
}