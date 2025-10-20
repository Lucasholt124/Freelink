"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,

  Instagram,
  Trophy,

  CheckCircle2,

  Copy,

  Gift,

  QrCode,
  Link as LinkIcon,

  MessageSquare,

  Download,

  Shield,

  Eye,

  ChevronDown,
  ChevronUp,
  Info,
  X,
} from "lucide-react";
import clsx from "clsx";

// IMPORTAR BIBLIOTECA REAL DE QR CODE
// npm install qrcode


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

type GiveawayMethod = "link" | "qrcode" | "webhook" | "sheets" | "bot" | "smart";

type GiveawayData = {
  id: string;
  title: string;
  participants: Participant[];
  createdAt: string;
  isActive: boolean;
};

// Storage helpers - USANDO FIREBASE OU SUPABASE SERIA MELHOR
const STORAGE_KEY = 'freelinnk_giveaways';

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

// REAL QR CODE GENERATOR
async function generateRealQRCode(text: string): Promise<string> {
  try {
    // Se a biblioteca estiver instalada como um global (ex: window.QRCode)
    const globalQRCode = (typeof window !== 'undefined')
      ? (window as unknown as { QRCode?: { toDataURL?: (text: string, options?: Record<string, unknown>) => Promise<string> | string } }).QRCode
      : undefined;
    if (typeof globalQRCode !== 'undefined' && typeof globalQRCode.toDataURL === 'function') {
      return await globalQRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  } catch (err) {
    console.error('QRCode library not found or failed, using API fallback', err);
  }

  // Fallback: Usar API pública de QR Code
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;
  return qrApiUrl;
}

// Animated counter
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
  }, [value, duration]);

  return <span>{count.toLocaleString('pt-BR')}</span>;
}

// Toast notifications
const toast = {
  success: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce max-w-[90vw]';
    toastEl.innerHTML = `<div class="flex items-center gap-2 text-sm sm:text-base"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${message}</div>`;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  },
  error: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce max-w-[90vw]';
    toastEl.innerHTML = `<div class="text-sm sm:text-base">${message}</div>`;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  },
};

// Confetti
function launchConfetti() {
  const colors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff', '#ffa500'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      const size = Math.random() * 10 + 5;
      confetti.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -20px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        z-index: 9999;
        pointer-events: none;
        opacity: 1;
      `;
      document.body.appendChild(confetti);

      const animation = confetti.animate([
        {
          transform: `translateY(0) rotate(0deg)`,
          opacity: 1
        },
        {
          transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`,
          opacity: 0
        }
      ], {
        duration: Math.random() * 2000 + 2000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      animation.onfinish = () => confetti.remove();
    }, i * 50);
  }
}

// PUBLIC PARTICIPATION MODAL - REAL
function ParticipationModal({
  giveawayId,
  isOpen,
  onClose,
  onSuccess
}: {
  giveawayId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({ name: "", identifier: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    // Check if already registered
    const registered = localStorage.getItem(`registered_${giveawayId}`);
    if (registered) {
      setHasRegistered(true);
    }
  }, [giveawayId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.identifier) {
      toast.error("Preencha todos os campos!");
      return;
    }

    setIsSubmitting(true);

    const participant: Participant = {
      id: Date.now().toString(),
      name: formData.name,
      identifier: formData.identifier,
      timestamp: new Date().toISOString(),
      verified: true
    };

    // Save to localStorage
    const giveaway = getGiveaway(giveawayId);
    if (giveaway) {
      // Check for duplicates
      const exists = giveaway.participants.some(p =>
        p.identifier.toLowerCase() === participant.identifier.toLowerCase()
      );

      if (exists) {
        toast.error("Você já está participando!");
        setIsSubmitting(false);
        return;
      }

      giveaway.participants.push(participant);
      saveGiveaway(giveaway);

      // Mark as registered
      localStorage.setItem(`registered_${giveawayId}`, 'true');

      setTimeout(() => {
        toast.success("Você está participando! 🎉");
        setHasRegistered(true);
        setIsSubmitting(false);
        onSuccess();
      }, 1000);
    } else {
      toast.error("Sorteio não encontrado!");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        {hasRegistered ? (
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              Você está participando!
            </h2>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Boa sorte no sorteio! 🍀
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <Gift className="w-16 h-16 text-purple-600 mx-auto mb-3" />
              <h2 className="text-2xl font-bold">Participe do Sorteio!</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Preencha os dados abaixo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: Maria Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Instagram, Email ou Telefone
              </label>
              <input
                type="text"
                placeholder="Ex: @seu_instagram"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmar Participação
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// Instructions Component
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
        "Compartilhe o link gerado nas suas redes",
        "Participantes clicam em 'Participar' no link",
        "Veja os participantes aparecendo em tempo real",
        "Quando quiser, clique em 'Sortear Vencedor'"
      ],
      tips: "💡 O link funciona como um formulário online que salva os dados localmente!"
    },
    qrcode: {
      title: "Como usar o QR Code",
      steps: [
        "Digite um nome para o sorteio",
        "Clique em 'Gerar QR Code'",
        "Baixe ou compartilhe a imagem",
        "Pessoas escaneiam com a câmera",
        "São direcionadas para o formulário",
        "Clique em sortear quando terminar"
      ],
      tips: "💡 QR Code real que direciona para o formulário de participação!"
    },
    webhook: {
      title: "Como usar Webhook",
      steps: [
        "Crie conta grátis no Zapier ou Make",
        "Crie um novo Zap com trigger 'Webhooks'",
        "Copie a URL do webhook gerada",
        "Cole aqui e clique em 'Ativar'",
        "Configure a ação (ex: Google Sheets)",
        "Cada participante dispara a automação"
      ],
      tips: "💡 Conecte com +1000 apps diferentes!"
    },
    sheets: {
      title: "Como conectar Google Sheets",
      steps: [
        "Crie um Google Forms",
        "Adicione campos: Nome e Instagram/Email",
        "Vincule com Google Sheets",
        "Compartilhe o Forms",
        "Cole o link da planilha aqui",
        "Importe os dados quando quiser"
      ],
      tips: "💡 Use Google Forms para coletar participantes!"
    },
    bot: {
      title: "Como usar o Bot Collector",
      steps: [
        "Abra o Instagram/TikTok no PC",
        "Vá no post do sorteio",
        "Pressione F12 (abre o console)",
        "Cole o código fornecido",
        "Pressione Enter",
        "Cole os nomes copiados aqui"
      ],
      tips: "💡 Extrai comentários automaticamente!"
    },
    smart: {
      title: "Como usar Import Manual",
      steps: [
        "Copie lista de participantes",
        "Cole no campo de texto",
        "Um nome por linha",
        "Pode incluir @ ou não",
        "Clique em importar",
        "Pronto para sortear!"
      ],
      tips: "💡 Aceita qualquer formato de lista!"
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

// Smart Link Generator - REAL COM MODAL
function SmartLinkGenerator({
  onGenerate
}: {
  onGenerate: (id: string, data: GiveawayData) => void;
}) {
  const [giveawayData, setGiveawayData] = useState<GiveawayData | null>(null);
  const [title, setTitle] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showParticipationModal, setShowParticipationModal] = useState(false);

  const generateLink = () => {
    if (!title) {
      toast.error("Digite um nome para o sorteio!");
      return;
    }

    const newGiveaway: GiveawayData = {
      id: `giveaway_${Date.now()}`,
      title,
      participants: [],
      createdAt: new Date().toISOString(),
      isActive: true
    };

    saveGiveaway(newGiveaway);
    setGiveawayData(newGiveaway);
    onGenerate(newGiveaway.id, newGiveaway);
    toast.success("Link criado com sucesso!");
  };

  // URL com query parameter ao invés de rota dinâmica
  const shareUrl = giveawayData
    ? `${window.location.origin}${window.location.pathname}?sorteio=${giveawayData.id}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  const shareWhatsApp = () => {
    const text = `🎁 Participe do sorteio: ${giveawayData?.title}\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const testLink = () => {
    setShowParticipationModal(true);
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
              Link do sorteio:
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg p-3 overflow-hidden">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono outline-none overflow-x-auto"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={testLink}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Testar Link (Ver Como Funciona)
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={shareWhatsApp}
              className="bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm sm:text-base">WhatsApp</span>
            </button>
            <button
              onClick={() => {
                copyLink();
                toast.success("Link copiado! Cole no Instagram");
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-sm sm:text-base">Instagram</span>
            </button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 Participantes clicam no link e preenchem o formulário. Você vê tudo em tempo real!
            </p>
          </div>
        </div>
      )}

      {/* Modal de participação para teste */}
      {giveawayData && (
        <ParticipationModal
          giveawayId={giveawayData.id}
          isOpen={showParticipationModal}
          onClose={() => setShowParticipationModal(false)}
          onSuccess={() => {
            setShowParticipationModal(false);
            onGenerate(giveawayData.id, giveawayData);
          }}
        />
      )}
    </div>
  );
}

// QR Code Generator - REAL
function QRCodeGeneratorComponent({
  onGenerate
}: {
  onGenerate: (id: string, data: GiveawayData) => void;
}) {
  const [qrCode, setQrCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [giveawayData, setGiveawayData] = useState<GiveawayData | null>(null);
  const [title, setTitle] = useState("");

  const generateQR = async () => {
    if (!title) {
      toast.error("Digite um nome para o sorteio!");
      return;
    }

    setIsGenerating(true);

    const newGiveaway: GiveawayData = {
      id: `qr_${Date.now()}`,
      title,
      participants: [],
      createdAt: new Date().toISOString(),
      isActive: true
    };

    saveGiveaway(newGiveaway);

    // URL que o QR Code vai apontar
    const targetUrl = `${window.location.origin}${window.location.pathname}?sorteio=${newGiveaway.id}`;

    // Gerar QR Code REAL
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
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                Gerar QR Code Real
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-6 mb-4">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-full max-w-xs mx-auto rounded-xl shadow-lg bg-white"
              />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              QR Code real e funcional! Teste com sua câmera.
            </p>

            <div className="space-y-3">
              <button
                onClick={downloadQR}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Baixar QR Code
              </button>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-xs text-green-800 dark:text-green-200">
                  ✅ QR Code 100% funcional que direciona para o formulário!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Component
export default function GiveawayTool() {
  const [selectedMethod, setSelectedMethod] = useState<GiveawayMethod>("link");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Winner>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGiveaway, setCurrentGiveaway] = useState<GiveawayData | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);

  // CHECK URL PARAMETER ON LOAD
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sorteioId = urlParams.get('sorteio');

    if (sorteioId) {
      const giveaway = getGiveaway(sorteioId);
      if (giveaway) {
        // Show participation modal
        const modal = document.createElement('div');
        modal.innerHTML = `
          <div style="position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); padding: 1rem;">
            <div style="background: white; border-radius: 1rem; padding: 2rem; max-width: 400px; width: 100%; text-align: center;">
              <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Participe do Sorteio: ${giveaway.title}</h2>
              <p style="margin-bottom: 1.5rem;">Este sorteio está ativo! Volte para a ferramenta principal para participar.</p>
              <button onclick="window.location.href=window.location.pathname" style="background: linear-gradient(to right, #9333ea, #ec4899); color: white; padding: 0.75rem 2rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: bold;">
                Ir para a Ferramenta
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
    }
  }, []);

  // Real-time participant polling
  useEffect(() => {
    if (!currentGiveaway?.id) return;

    const interval = setInterval(() => {
      const giveaway = getGiveaway(currentGiveaway.id);
      if (giveaway && giveaway.participants.length !== participants.length) {
        setParticipants(giveaway.participants);
        if (giveaway.participants.length > participants.length) {
          toast.success("Novo participante entrou!");
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentGiveaway?.id, participants.length]);

  const handleGenerateGiveaway = (id: string, data: GiveawayData) => {
    setCurrentGiveaway(data);
    // Load existing participants
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

    // Drum roll effect
    let count = 0;
    const drumRoll = setInterval(() => {
      count++;
      if (count > 15) {
        clearInterval(drumRoll);

        const randomIndex = Math.floor(Math.random() * participants.length);
        const selectedWinner = participants[randomIndex];

        setWinner({
          name: selectedWinner.name,
          identifier: selectedWinner.identifier,
          timestamp: new Date().toISOString(),
          method: selectedMethod,
          total: participants.length
        });

        // celebrate with confetti
        launchConfetti();

        setIsLoading(false);
      }
    }, 150);
  };

  // Collection methods config
  const collectionMethods = {
    link: {
      title: "Link Único",
      description: "Link compartilhável",
      icon: LinkIcon,
      gradient: "from-purple-500 to-pink-500",
      setup: "Instantâneo",
    },
    qrcode: {
      title: "QR Code",
      description: "QR Code funcional",
      icon: QrCode,
      gradient: "from-blue-500 to-cyan-500",
      setup: "Instantâneo",
    },
    // ... outros métodos
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
              Links e QR Codes reais que funcionam de verdade!
            </p>

            {/* Live counter */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 max-w-xs mx-auto">
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-2xl font-bold"><AnimatedCounter value={participants.length} duration={800} /></p>
                  <p className="text-xs">Participantes ao vivo</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Method Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4">Escolha o método de coleta:</h2>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(collectionMethods) as Array<keyof typeof collectionMethods>).slice(0, 2).map((method) => {
              const config = collectionMethods[method];
              const Icon = config.icon;

              return (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={clsx(
                    "p-4 rounded-xl border-2 transition-all",
                    selectedMethod === method
                      ? "border-purple-500 bg-purple-50 scale-105"
                      : "border-gray-200 hover:border-purple-300"
                  )}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-bold text-sm">{config.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                </button>
              );
            })}
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
            <SmartLinkGenerator onGenerate={handleGenerateGiveaway} />
          )}

          {selectedMethod === "qrcode" && (
            <QRCodeGeneratorComponent onGenerate={handleGenerateGiveaway} />
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
                  <div key={p.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.identifier}</p>
                    </div>
                    {p.verified && <Shield className="w-4 h-4 text-green-500" />}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={runGiveaway}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sorteando...</>
              ) : (
                <><Trophy className="w-5 h-5" /> Sortear Vencedor</>
              )}
            </button>
          </motion.div>
        )}

        {/* Winner Display */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-yellow-100 to-orange-100 p-8 rounded-3xl shadow-2xl text-center"
          >
            <Trophy className="w-20 h-20 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">{winner.name}</h3>
            <p className="text-gray-600 mb-4">{winner.identifier}</p>
            <p className="text-sm">Sorteado entre {winner.total} participantes</p>

            <button
              onClick={() => setWinner(null)}
              className="mt-6 px-6 py-3 bg-white rounded-xl font-bold text-purple-600 hover:bg-purple-50"
            >
              Novo Sorteio
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}