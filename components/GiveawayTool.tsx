"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useConvex, useMutation, useQuery } from "convex/react";
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
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw,
  Share2,
  Trash2,
  AlertCircle,
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
      tips: "💡 Dados salvos na nuvem! Acesse de qualquer dispositivo."
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
      tips: "💡 Dados salvos na nuvem! Acesse de qualquer dispositivo."
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
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-3 mt-3">
                <p className="text-xs text-green-800 dark:text-green-200 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
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
  existingGiveaway
}: {
  onGenerate: (data: GiveawayData) => void;
  existingGiveaway?: GiveawayData | null;
}) {
  const [giveawayData, setGiveawayData] = useState<GiveawayData | null>(existingGiveaway || null);
  const [title, setTitle] = useState(existingGiveaway?.title || "");
  const [showInstructions, setShowInstructions] = useState(false);
  const saveGiveawayMutation = useMutation(api.publicGiveaways.saveGiveaway);

  useEffect(() => {
    if (existingGiveaway) {
      setGiveawayData(existingGiveaway);
      setTitle(existingGiveaway.title);
    }
  }, [existingGiveaway]);

  const generateLink = async () => {
    if (!title.trim()) {
      toast.error("Digite um nome para o sorteio!");
      return;
    }

    const newGiveaway: GiveawayData = {
      id: `giveaway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      participants: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      method: 'link'
    };

    try {
      // Salvar no banco de dados Convex
      await saveGiveawayMutation({
        giveawayId: newGiveaway.id,
        title: newGiveaway.title,
        participants: [],
        isActive: true,
        method: 'link'
      });

      setGiveawayData(newGiveaway);
      onGenerate(newGiveaway);
      toast.success("Link criado e salvo na nuvem!");
    } catch (error) {
      console.error("Erro ao salvar sorteio:", error);
      toast.error("Erro ao criar sorteio. Tente novamente.");
    }
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
              ✅ Dados salvos na nuvem! Acesse de qualquer dispositivo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// QR Code Generator Component
function QRCodeGeneratorComponent({
  onGenerate,
  existingGiveaway
}: {
  onGenerate: (data: GiveawayData) => void;
  existingGiveaway?: GiveawayData | null;
}) {
  const [qrCode, setQrCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [giveawayData, setGiveawayData] = useState<GiveawayData | null>(existingGiveaway || null);
  const [title, setTitle] = useState(existingGiveaway?.title || "");
  const saveGiveawayMutation = useMutation(api.publicGiveaways.saveGiveaway);

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
      id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      participants: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      method: 'qrcode'
    };

    try {
      // Salvar no banco de dados Convex
      await saveGiveawayMutation({
        giveawayId: newGiveaway.id,
        title: newGiveaway.title,
        participants: [],
        isActive: true,
        method: 'qrcode'
      });

      // Generate QR Code with PUBLIC URL
      const targetUrl = `${window.location.origin}/giveaway/${newGiveaway.id}`;
      const qrDataUrl = await generateRealQRCode(targetUrl);

      setQrCode(qrDataUrl);
      setGiveawayData(newGiveaway);
      onGenerate(newGiveaway);
      toast.success("QR Code gerado e salvo na nuvem!");
    } catch (error) {
      console.error("Erro ao salvar sorteio:", error);
      toast.error("Erro ao criar sorteio. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `qrcode-sorteio-${giveawayData?.id || 'novo'}.png`;
    link.href = qrCode;
    link.click();
    toast.success("QR Code baixado!");
  };

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
              QR Code salvo na nuvem - Acesse de qualquer lugar!
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

// Main component
export default function GiveawayTool() {
  const { user } = useUser();
  const [selectedMethod, setSelectedMethod] = useState<GiveawayMethod>("link");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Winner>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGiveaway, setCurrentGiveaway] = useState<GiveawayData | null>(null);
  const [showParticipants, setShowParticipants] = useState(true);
  const [selectedGiveaway, setSelectedGiveaway] = useState<string | null>(null);

  const convex = useConvex();

  // Buscar todos os sorteios do usuário do banco de dados
  const userGiveaways = useQuery(api.publicGiveaways.getUserGiveaways);

  // Buscar detalhes do sorteio selecionado
  const giveawayDetails = useQuery(
    api.publicGiveaways.getGiveaway,
    selectedGiveaway ? { giveawayId: selectedGiveaway } : "skip"
  );

  const deleteGiveawayMutation = useMutation(api.publicGiveaways.deleteGiveaway);
  const endGiveawayMutation = useMutation(api.publicGiveaways.endGiveaway);

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      toast.error("Faça login para criar sorteios!");
    }
  }, [user]);

  // Carregar sorteio ativo mais recente do banco de dados
  useEffect(() => {
    if (userGiveaways && userGiveaways.length > 0) {
      const activeGiveaway = userGiveaways.find(g => g.isActive);
      if (activeGiveaway) {
        setSelectedGiveaway(activeGiveaway.id);
        setCurrentGiveaway(activeGiveaway as GiveawayData);
        setParticipants(activeGiveaway.participants as Participant[]);
        if (activeGiveaway.method) {
          setSelectedMethod(activeGiveaway.method as GiveawayMethod);
        }
      }
    }
  }, [userGiveaways]);

  // Atualizar participantes quando o sorteio selecionado mudar
  useEffect(() => {
    if (giveawayDetails) {
      setCurrentGiveaway(giveawayDetails as GiveawayData);
      setParticipants(giveawayDetails.participants as Participant[]);
    }
  }, [giveawayDetails]);

  // Poll para atualizações de participantes em tempo real
  useEffect(() => {
    if (!selectedGiveaway) return;

    const pollParticipants = async () => {
      try {
        const data = await convex.query(api.publicGiveaways.getGiveaway, {
          giveawayId: selectedGiveaway
        });

        if (data && data.participants.length !== participants.length) {
          setParticipants(data.participants as Participant[]);
          if (data.participants.length > participants.length) {
            toast.success("Novo participante entrou!");
          }
        }
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);
      }
    };

    const interval = setInterval(pollParticipants, 2000); // Poll a cada 2 segundos
    return () => clearInterval(interval);
  }, [selectedGiveaway, participants.length, convex]);

  const handleGenerateGiveaway = (data: GiveawayData) => {
    setCurrentGiveaway(data);
    setSelectedGiveaway(data.id);
  };
const pickWinnerMutation = useMutation(api.publicGiveaways.pickWinner);
  const runGiveaway = async () => { // Note o async
    if (participants.length < 2) {
      toast.error("Precisa de pelo menos 2 participantes!");
      return;
    }

    setIsLoading(true);
    setWinner(null);

    try {
      // ✅ MUDANÇA: Pegar vencedor do servidor (Segurança)
      // O array 'participants' já existe no banco, então o servidor consegue escolher.
      const secureWinner = await pickWinnerMutation({
          giveawayId: currentGiveaway!.id // ou selectedGiveaway
      });

      // Efeito visual (Tambores)
      let count = 0;
      const drumRoll = setInterval(() => {
        count++;
        if (count > 15) {
          clearInterval(drumRoll);
          // ✅ MUDANÇA: Usar o vencedor que veio do servidor
          setWinner(secureWinner);
          launchConfetti();
          setIsLoading(false);
        }
      }, 150);
    } catch (error) {
        console.error(error);
        toast.error("Erro ao realizar sorteio");
        setIsLoading(false);
    }
};

  const resetGiveaway = async () => {
    if (currentGiveaway) {
      try {
        await deleteGiveawayMutation({ giveawayId: currentGiveaway.id });
        setCurrentGiveaway(null);
        setSelectedGiveaway(null);
        setParticipants([]);
        setWinner(null);
        toast.success("Sorteio excluído!");
      } catch {
        toast.error("Erro ao excluir sorteio");
      }
    }
  };

  const endGiveaway = async () => {
    if (currentGiveaway) {
      try {
        await endGiveawayMutation({ giveawayId: currentGiveaway.id });
        toast.success("Sorteio finalizado!");
      } catch {
        toast.error("Erro ao finalizar sorteio");
      }
    }
  };

  // Lista de sorteios anteriores
  const GiveawaysList = () => {
    if (!userGiveaways || userGiveaways.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6">
        <h3 className="font-bold text-lg mb-4">Seus Sorteios</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {userGiveaways.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setSelectedGiveaway(g.id);
                setCurrentGiveaway(g as GiveawayData);
                setParticipants(g.participants as Participant[]);
                if (g.method) setSelectedMethod(g.method as GiveawayMethod);
              }}
              className={clsx(
                "w-full p-3 rounded-lg text-left transition-all",
                selectedGiveaway === g.id
                  ? "bg-purple-100 dark:bg-purple-900 border-2 border-purple-500"
                  : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{g.title}</p>
                  <p className="text-xs text-gray-500">
                    {g.participantsCount} participantes • {g.method}
                  </p>
                </div>
                {g.isActive && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Ativo
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-3 sm:p-4 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Necessário</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Faça login para criar e gerenciar seus sorteios. Os dados são salvos na nuvem!
          </p>
          <a
            href="/sign-in"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

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
              Sorteios 100% Seguros na Nuvem
            </h1>
            <p className="text-purple-100 mt-2 text-center text-sm sm:text-base">
              Dados salvos no servidor - Acesse de qualquer dispositivo!
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

        {/* Lista de Sorteios */}
        <GiveawaysList />

        {/* Method Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4">Criar novo sorteio:</h2>
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
            />
          )}
          {selectedMethod === "qrcode" && (
            <QRCodeGeneratorComponent
              onGenerate={handleGenerateGiveaway}
              existingGiveaway={currentGiveaway?.method === 'qrcode' ? currentGiveaway : null}
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
                onClick={endGiveaway}
                className="px-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-xl font-bold hover:bg-yellow-200 dark:hover:bg-yellow-800"
                title="Finalizar sorteio"
              >
                Finalizar
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

// Winner Display Component (mantém o mesmo)
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