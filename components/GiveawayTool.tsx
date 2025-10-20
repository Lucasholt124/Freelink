"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Instagram,
  Trophy,
  Star,

  Sparkles,
  Zap,
  CheckCircle2,

  Heart,

  Copy,
  Share2,
  Gift,
  AlertCircle,
  QrCode,
  Link,

  Users,
  Globe,
  MessageSquare,
  FileSpreadsheet,
  Webhook,
  Bot,
  Download,

  Clock,
  Shield,

  Wand2,

  Trash2,
  Eye,
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
  identifier: string; // @username, email, phone
  timestamp: string;
  platform?: string;
  verified?: boolean;
};

type GiveawayMethod = "link" | "qrcode" | "webhook" | "sheets" | "bot" | "smart";

// Mock de geração de QR Code (substituir por biblioteca real)
const generateQRCode = async (text: string) => {
  // Em produção, usar uma lib como 'qrcode'
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" fill="black">${text}</text></svg>`)}`;
};

// Animated counter (removed because unused)

// Toast notifications
const toast = {
  success: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
    toastEl.innerHTML = `<div class="flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${message}</div>`;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  },
  error: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  },
};

// Confetti
function launchConfetti() {
  const colors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'];
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `position:fixed;width:10px;height:10px;background:${colors[Math.floor(Math.random()*colors.length)]};left:${Math.random()*100}%;top:-10px;border-radius:50%;z-index:9999;pointer-events:none;`;
    document.body.appendChild(confetti);
    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(100vh) rotate(${Math.random()*720}deg)`, opacity: 0 }
    ], { duration: 3000, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
    animation.onfinish = () => confetti.remove();
  }
}

// Auto Collection Methods Configuration
const collectionMethods = {
  link: {
    title: "Link Único",
    description: "Crie um link para os participantes se inscreverem",
    icon: Link,
    color: "purple",
    setup: "Instantâneo",
    gradient: "from-purple-500 to-pink-500",
  },
  qrcode: {
    title: "QR Code",
    description: "Gere um QR Code para capturar participantes",
    icon: QrCode,
    color: "blue",
    setup: "Instantâneo",
    gradient: "from-blue-500 to-cyan-500",
  },
  webhook: {
    title: "Webhook/API",
    description: "Receba participantes via Zapier, Make ou API",
    icon: Webhook,
    color: "green",
    setup: "5 minutos",
    gradient: "from-green-500 to-emerald-500",
  },
  sheets: {
    title: "Google Sheets",
    description: "Conecte com Google Forms ou Planilhas",
    icon: FileSpreadsheet,
    color: "orange",
    setup: "3 minutos",
    gradient: "from-orange-500 to-red-500",
  },
  bot: {
    title: "Bot Collector",
    description: "Bot que coleta comentários automaticamente",
    icon: Bot,
    color: "indigo",
    setup: "2 minutos",
    gradient: "from-indigo-500 to-purple-500",
  },
  smart: {
    title: "Smart Import",
    description: "Cole links de posts e extraímos tudo",
    icon: Wand2,
    color: "pink",
    setup: "Instantâneo",
    gradient: "from-pink-500 to-rose-500",
  },
};

// Participant Registration Form
// Removed unused ParticipantForm component

// Smart Link Generator
function SmartLinkGenerator({ onGenerate }: { onGenerate: (id: string) => void }) {
  const [giveawayId] = useState(`giveaway_${Date.now()}`);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/sorteio/${giveawayId}`;

  const generateLink = () => {
    setLinkGenerated(true);
    onGenerate(giveawayId);
    toast.success("Link criado com sucesso!");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`🎁 Participe do meu sorteio!\n\n${shareUrl}`)}`, '_blank');
  };

  const shareInstagram = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado! Cole no seu Stories ou Bio");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 space-y-4"
    >
      {!linkGenerated ? (
        <button
          onClick={generateLink}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
        >
          <Link className="w-5 h-5" />
          Gerar Link de Participação
        </button>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">Seu link único:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm font-mono"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareWhatsApp}
              className="bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              onClick={shareInstagram}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 Compartilhe este link e os participantes se cadastram automaticamente!
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
}

// QR Code Generator
function QRCodeGeneratorComponent({ giveawayId }: { giveawayId: string }) {
  const [qrCode, setQrCode] = useState<string>("");
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/sorteio/${giveawayId}`;

  useEffect(() => {
    generateQRCode(shareUrl).then(setQrCode);
  }, [shareUrl]);

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'qrcode-sorteio.png';
    link.href = qrCode;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center space-y-4"
    >
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-8">
        {qrCode && (
          <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
        )}
      </div>

      <p className="text-sm text-gray-600">
        Participantes escaneiam e se cadastram automaticamente
      </p>

      <button
        onClick={downloadQR}
        className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Baixar QR Code
      </button>
    </motion.div>
  );
}

// Bot Setup Instructions
function BotSetup({ platform }: { platform: string }) {
  const [showInstructions, setShowInstructions] = useState(false);

  const botTemplates = {
    instagram: {
      title: "Instagram Comment Bot",
      code: `// Copie e cole no console do navegador
const collectComments = () => {
  const comments = [];
  document.querySelectorAll('[role="button"] span').forEach(el => {
    if(el.innerText.includes('@')) {
      comments.push(el.innerText);
    }
  });
  return comments;
};
const result = collectComments();
console.log(result);
copy(result.join('\\n'));`,
      instructions: [
        "Abra o post no navegador (não no app)",
        "Clique direito → Inspecionar",
        "Vá na aba Console",
        "Cole o código e pressione Enter",
        "Os comentários serão copiados automaticamente"
      ]
    },
    zapier: {
      title: "Zapier Webhook",
      code: `https://hooks.zapier.com/hooks/catch/SEU_ID/`,
      instructions: [
        "Crie uma conta grátis no Zapier",
        "Crie um Zap com trigger 'Webhooks'",
        "Conecte com Google Sheets ou Email",
        "Use o webhook URL gerado",
        "Participantes são adicionados automaticamente"
      ]
    },
    googleForms: {
      title: "Google Forms",
      code: `=IMPORTRANGE("URL_DA_PLANILHA", "Respostas!A:B")`,
      instructions: [
        "Crie um Google Forms",
        "Adicione campos: Nome e Instagram/Email",
        "Ative coleta de respostas em planilha",
        "Use a fórmula para importar dados",
        "Sorteie direto da planilha"
      ]
    }
  };

  const template = botTemplates[platform as keyof typeof botTemplates] || botTemplates.instagram;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          {template.title}
        </h3>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-sm text-indigo-600 hover:underline"
        >
          {showInstructions ? 'Ocultar' : 'Ver instruções'}
        </button>
      </div>

      {showInstructions && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="space-y-3"
        >
          <div className="bg-black/90 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto">
            <pre>{template.code}</pre>
          </div>

          <div className="space-y-2">
            {template.instructions.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(template.code);
              toast.success("Código copiado!");
            }}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Copy className="w-5 h-5" />
            Copiar Código
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Smart Import (URL Parser)
function SmartImport({ onImport }: { onImport: (participants: Participant[]) => void }) {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const processUrl = async () => {
    if (!url) {
      toast.error("Cole o link do post!");
      return;
    }

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      // Mock data - em produção, fazer scraping real ou usar API
      const mockParticipants: Participant[] = [
        { id: '1', name: 'João Silva', identifier: '@joao_silva', timestamp: new Date().toISOString(), platform: 'instagram' },
        { id: '2', name: 'Maria Santos', identifier: '@maria.santos', timestamp: new Date().toISOString(), platform: 'instagram' },
        { id: '3', name: 'Pedro Costa', identifier: '@pedrocosta', timestamp: new Date().toISOString(), platform: 'instagram' },
        { id: '4', name: 'Ana Oliveira', identifier: '@ana_oli', timestamp: new Date().toISOString(), platform: 'instagram' },
        { id: '5', name: 'Lucas Ferreira', identifier: '@lucas_f', timestamp: new Date().toISOString(), platform: 'instagram' },
      ];

      onImport(mockParticipants);
      toast.success(`${mockParticipants.length} participantes importados!`);
      setIsProcessing(false);
      setUrl("");
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-5 h-5 text-pink-600" />
        <h3 className="font-bold text-lg">Import Inteligente</h3>
      </div>

      <div className="space-y-3">
        <input
          type="url"
          placeholder="Cole o link do post (Instagram, TikTok, etc)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
          disabled={isProcessing}
        />

        <button
          onClick={processUrl}
          disabled={isProcessing || !url}
          className={clsx(
            "w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
            isProcessing || !url
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Extraindo participantes...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Importar Automaticamente
            </>
          )}
        </button>
      </div>

      <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Suportado:</strong> Instagram, TikTok, YouTube, Twitter, Facebook
        </p>
      </div>
    </motion.div>
  );
}

// Winner Display
function WinnerCard({ winner, onRedraw }: { winner: NonNullable<Winner>; onRedraw: () => void }) {
  useEffect(() => {
    launchConfetti();
  }, []);

  const shareResult = () => {
    const text = `🏆 Resultado do Sorteio!\n\nVencedor: ${winner.name}\n${winner.identifier ? `Perfil: ${winner.identifier}` : ''}\n\nSorteado em: ${new Date().toLocaleString('pt-BR')}\nTotal de participantes: ${winner.total || 'N/A'}`;
    navigator.clipboard.writeText(text);
    toast.success("Resultado copiado!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-300/30 rounded-full blur-3xl"></div>

      <div className="relative text-center">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl mb-6"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-4">
            🎊 Parabéns ao vencedor! 🎊
          </h3>

          <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            {winner.name}
          </p>

          {winner.identifier && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {winner.identifier}
            </p>
          )}

          {winner.total && (
            <div className="bg-white/50 dark:bg-black/20 rounded-xl px-4 py-2 inline-block mb-6">
              <p className="text-sm font-medium">
                Sorteado entre <span className="font-bold text-orange-600">{winner.total}</span> participantes
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={onRedraw}
            className="px-6 py-3 bg-white dark:bg-gray-800 rounded-xl font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Novo Sorteio
          </button>

          <button
            onClick={shareResult}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar Resultado
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Main Component
export default function GiveawayTool() {
  const [selectedMethod, setSelectedMethod] = useState<GiveawayMethod>("link");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Winner>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [giveawayId, setGiveawayId] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);

  // Simulate real-time participant updates
  useEffect(() => {
    if (giveawayId) {
      const interval = setInterval(() => {
        // Simulate new participant
        if (Math.random() > 0.7 && participants.length < 20) {
          const newParticipant: Participant = {
            id: `${Date.now()}`,
            name: `Participante ${participants.length + 1}`,
            identifier: `@user${participants.length + 1}`,
            timestamp: new Date().toISOString(),
            platform: 'instagram',
            verified: true
          };
          setParticipants(prev => [...prev, newParticipant]);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [giveawayId, participants.length]);

  const runGiveaway = () => {
    if (participants.length === 0) {
      toast.error("Nenhum participante ainda!");
      return;
    }

    setIsLoading(true);
    setWinner(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      const selectedWinner = participants[randomIndex];

      setWinner({
        name: selectedWinner.name,
        identifier: selectedWinner.identifier,
        timestamp: new Date().toISOString(),
        method: selectedMethod,
        total: participants.length
      });

      setIsLoading(false);
    }, 3000);
  };

  const clearAll = () => {
    setParticipants([]);
    setWinner(null);
    setGiveawayId("");
    toast.success("Sorteio resetado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <Gift className="w-10 h-10 text-yellow-300" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold">Sorteios Automáticos</h1>
                  <p className="text-purple-100 mt-1">Zero trabalho manual. 100% automático.</p>
                </div>
              </div>

              {/* Live counter */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-3xl font-bold">{participants.length}</p>
                    <p className="text-xs text-purple-100">Participantes ao vivo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Method Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Como você quer coletar participantes?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(collectionMethods) as GiveawayMethod[]).map((method) => {
              const config = collectionMethods[method];
              const Icon = config.icon;

              return (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={clsx(
                    "relative p-4 rounded-xl border-2 transition-all text-left group",
                    selectedMethod === method
                      ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg scale-105"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md"
                  )}
                >
                  {selectedMethod === method && (
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}

                  <div className={clsx(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all",
                    `bg-gradient-to-br ${config.gradient} text-white`
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-bold text-sm mb-1">{config.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {config.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Setup: {config.setup}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Method Implementation */}
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              {selectedMethod === "link" && (
                <SmartLinkGenerator onGenerate={setGiveawayId} />
              )}

              {selectedMethod === "qrcode" && (
                <QRCodeGeneratorComponent giveawayId={giveawayId || `giveaway_${Date.now()}`} />
              )}

              {selectedMethod === "webhook" && (
                <BotSetup platform="zapier" />
              )}

              {selectedMethod === "sheets" && (
                <BotSetup platform="googleForms" />
              )}

              {selectedMethod === "bot" && (
                <BotSetup platform="instagram" />
              )}

              {selectedMethod === "smart" && (
                <SmartImport onImport={setParticipants} />
              )}
            </motion.div>

            {/* Participants List */}
            {participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Participantes ({participants.length})
                  </h3>
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    {showParticipants ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>

                {showParticipants && (
                  <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {p.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.identifier}</p>
                          </div>
                        </div>
                        {p.verified && (
                          <Shield className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={runGiveaway}
                    disabled={isLoading}
                    className={clsx(
                      "flex-1 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sorteando...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5" />
                        Sortear Agora
                      </>
                    )}
                  </button>

                  <button
                    onClick={clearAll}
                    className="px-6 py-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/30 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Como funciona?
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm">Escolha como coletar participantes</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm">Compartilhe o link ou QR Code</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm">Participantes entram automaticamente</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    4
                  </div>
                  <p className="text-sm">Clique para sortear o vencedor!</p>
                </div>
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Vantagens
              </h3>

              <div className="space-y-3">
                {[
                  { icon: Zap, text: "100% Automático", color: "text-yellow-500" },
                  { icon: Shield, text: "Verificação de participantes", color: "text-green-500" },
                  { icon: Globe, text: "Funciona em qualquer rede", color: "text-blue-500" },
                  { icon: Heart, text: "Grátis e ilimitado", color: "text-red-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className={clsx("w-5 h-5", item.color)} />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pro Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800"
            >
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                Dicas Pro
              </h3>

              <ul className="space-y-2 text-xs text-yellow-800 dark:text-yellow-200">
                <li>• Use QR Code em eventos presenciais</li>
                <li>• Links únicos evitam fraudes</li>
                <li>• Webhooks integram com qualquer app</li>
                <li>• Smart Import economiza 90% do tempo</li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Winner Display */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <WinnerCard
                winner={winner}
                onRedraw={() => setWinner(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}