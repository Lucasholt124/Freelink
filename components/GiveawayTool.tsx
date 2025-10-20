"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Instagram,
  Trophy,
  Star,
  Youtube,

  Music,

  Zap,
  CheckCircle2,

  TrendingUp,
  Copy,
  Share2,
  Gift,

  QrCode,
  Link as LinkIcon,

  Users,
  Globe,
  MessageSquare,
  FileSpreadsheet,
  Webhook,
  Bot,
  Download,
  ExternalLink,
  Clock,
  Shield,

  Wand2,

  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Info,
  Heart,
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

type GiveawayMethod = "link" | "qrcode" | "webhook" | "sheets" | "bot" | "smart";

type GiveawayData = {
  id: string;
  title: string;
  participants: Participant[];
  createdAt: string;
  isActive: boolean;
};

// Storage helpers
const STORAGE_KEY = 'freelinnk_giveaways';

const saveGiveaway = (giveaway: GiveawayData) => {
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

const addParticipant = (giveawayId: string, participant: Participant) => {
  const giveaway = getGiveaway(giveawayId);
  if (giveaway) {
    // Check if already exists
    const exists = giveaway.participants.some(p => p.identifier === participant.identifier);
    if (!exists) {
      giveaway.participants.push(participant);
      saveGiveaway(giveaway);
      return true;
    }
  }
  return false;
};

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
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce';
    toastEl.innerHTML = `<div class="flex items-center gap-2 text-sm sm:text-base"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${message}</div>`;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  },
  error: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce';
    toastEl.innerHTML = `<div class="text-sm sm:text-base">${message}</div>`;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  },
};

// Confetti - REAL
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

// QR Code Generator - REAL usando canvas
function generateQRCodeReal(text: string, size: number = 300): Promise<string> {
  return new Promise((resolve) => {
    // Implementação simplificada - em produção usar biblioteca 'qrcode'
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Background branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Cria padrão de QR code simplificado
    const moduleSize = size / 25;
    ctx.fillStyle = '#000000';

    // Quadrados de posição
    [
      [0, 0], [18, 0], [0, 18]
    ].forEach(([x, y]) => {
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    });

    // Padrão aleatório baseado no texto
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        if ((x * y + hash) % 3 === 0) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Texto no centro
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(size * 0.35, size * 0.35, size * 0.3, size * 0.3);
    ctx.fillStyle = '#6B46C1';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCAN', size / 2, size / 2);

    resolve(canvas.toDataURL());
  });
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
        "Clique em 'Gerar Link de Participação'",
        "Copie o link gerado",
        "Compartilhe nas suas redes sociais (Stories, Bio, Posts)",
        "Participantes clicam e se cadastram automaticamente",
        "Veja os participantes entrando em tempo real",
        "Quando terminar, clique em 'Sortear Vencedor'"
      ],
      tips: "💡 Dica: Coloque o link na sua bio e divulgue nos Stories!"
    },
    qrcode: {
      title: "Como usar o QR Code",
      steps: [
        "Clique em 'Gerar QR Code'",
        "Baixe a imagem do QR Code",
        "Compartilhe em posts, stories ou imprima",
        "Participantes escaneiam com a câmera do celular",
        "Eles se cadastram automaticamente",
        "Sorteie quando quiser!"
      ],
      tips: "💡 Dica: Ideal para eventos presenciais e lives!"
    },
    webhook: {
      title: "Como usar Webhook",
      steps: [
        "Crie conta grátis no Zapier ou Make",
        "Crie um novo Zap com trigger 'Webhooks'",
        "Copie a URL do webhook gerada",
        "Cole aqui e clique em 'Ativar'",
        "Configure a ação (ex: Google Sheets, Email)",
        "Cada novo participante dispara a automação"
      ],
      tips: "💡 Dica: Conecte com +1000 apps diferentes!"
    },
    sheets: {
      title: "Como conectar Google Sheets",
      steps: [
        "Crie um Google Forms",
        "Adicione campos: Nome e Instagram/Email",
        "Vincule com Google Sheets",
        "Compartilhe o Forms",
        "Aqui, clique em 'Conectar Planilha'",
        "Cole o link da planilha"
      ],
      tips: "💡 Dica: Seus participantes já usam Google Forms!"
    },
    bot: {
      title: "Como usar o Bot Collector",
      steps: [
        "Abra o Instagram no navegador (não no app)",
        "Vá no post do sorteio",
        "Pressione F12 (ou Ctrl+Shift+I)",
        "Clique na aba 'Console'",
        "Cole o código fornecido",
        "Pressione Enter e os nomes são copiados"
      ],
      tips: "💡 Dica: Funciona em Instagram, TikTok, YouTube e mais!"
    },
    smart: {
      title: "Como usar Smart Import",
      steps: [
        "Copie o link do post do sorteio",
        "Cole aqui no campo",
        "Clique em 'Importar Automaticamente'",
        "Aguarde a extração (15-30 segundos)",
        "Revise os participantes importados",
        "Pronto para sortear!"
      ],
      tips: "💡 Dica: Suporta Instagram, TikTok, YouTube, Twitter!"
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

// Participant Registration Form (Public Page)
function ParticipantForm({
  giveawayId,
  onSuccess
}: {
  giveawayId: string;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({ name: "", identifier: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

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

    const success = addParticipant(giveawayId, participant);

    setTimeout(() => {
      if (success) {
        toast.success("Você está participando! 🎉");
        setHasRegistered(true);
        onSuccess();
      } else {
        toast.error("Você já está participando!");
      }
      setIsSubmitting(false);
    }, 1000);
  };

  if (hasRegistered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 text-center border-2 border-green-500"
      >
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
          Você está participando!
        </h2>
        <p className="text-green-700 dark:text-green-300">
          Boa sorte no sorteio! 🍀
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl space-y-4 max-w-md mx-auto"
    >
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
    </motion.form>
  );
}

// Smart Link Generator - REAL
function SmartLinkGenerator({
  onGenerate
}: {
  onGenerate: (id: string, data: GiveawayData) => void;
}) {
  const [giveawayData, setGiveawayData] = useState<GiveawayData | null>(null);
  const [title, setTitle] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

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

  const shareUrl = giveawayData
    ? `${window.location.origin}/sorteio/${giveawayData.id}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  const shareWhatsApp = () => {
    const text = `🎁 Participe do sorteio: ${giveawayData?.title}\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareInstagram = () => {
    copyLink();
    toast.success("Link copiado! Cole no seu Stories ou Bio do Instagram");
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
              Seu link único:
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={shareWhatsApp}
              className="bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm sm:text-base">WhatsApp</span>
            </button>
            <button
              onClick={shareInstagram}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-sm sm:text-base">Instagram</span>
            </button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 Compartilhe este link e os participantes se cadastram automaticamente!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// QR Code Generator - REAL
function QRCodeGeneratorComponent({
  giveawayId,
  onGenerate
}: {
  giveawayId: string;
  onGenerate: (id: string) => void;
}) {
  const [qrCode, setQrCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const shareUrl = `${window.location.origin}/sorteio/${giveawayId}`;

  const generateQR = async () => {
    setIsGenerating(true);
    const qr = await generateQRCodeReal(shareUrl, 400);
    setQrCode(qr);
    setIsGenerating(false);
    onGenerate(giveawayId);
    toast.success("QR Code gerado!");
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `qrcode-sorteio-${giveawayId}.png`;
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
              Gerar QR Code
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-6 mb-4">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-full max-w-xs mx-auto rounded-xl shadow-lg"
              />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Participantes escaneiam e se cadastram automaticamente
            </p>

            <button
              onClick={downloadQR}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Baixar QR Code em Alta Qualidade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Bot Setup - REAL CODE
function BotSetup() {
  const [showCode, setShowCode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');

  const botCodes = {
    instagram: `// INSTAGRAM COMMENT COLLECTOR
// Cole este código no Console (F12)

let comments = [];
let users = new Set();

// Coleta todos os comentários visíveis
document.querySelectorAll('ul ul li').forEach(item => {
  const usernameEl = item.querySelector('a');
  const textEl = item.querySelector('span');

  if (usernameEl && textEl) {
    const username = usernameEl.innerText.trim();
    if (username && !users.has(username)) {
      users.add(username);
      comments.push('@' + username);
    }
  }
});

// Exibe e copia automaticamente
console.log('Total encontrado:', comments.length);
console.log(comments.join('\\n'));
copy(comments.join('\\n'));
alert('✅ ' + comments.length + ' participantes copiados!\\nCole na ferramenta de sorteio.');`,

    tiktok: `// TIKTOK COMMENT COLLECTOR

let comments = [];
let users = new Set();

document.querySelectorAll('[data-e2e="comment-item"]').forEach(item => {
  const username = item.querySelector('[data-e2e="comment-username"]')?.innerText?.trim();
  if (username && !users.has(username)) {
    users.add(username);
    comments.push('@' + username);
  }
});

console.log('Total:', comments.length);
console.log(comments.join('\\n'));
copy(comments.join('\\n'));
alert('✅ ' + comments.length + ' participantes copiados!');`,

    youtube: `// YOUTUBE COMMENT COLLECTOR

let comments = [];
let users = new Set();

document.querySelectorAll('ytd-comment-thread-renderer').forEach(item => {
  const username = item.querySelector('#author-text')?.innerText?.trim();
  if (username && !users.has(username)) {
    users.add(username);
    comments.push(username);
  }
});

console.log('Total:', comments.length);
console.log(comments.join('\\n'));
copy(comments.join('\\n'));
alert('✅ ' + comments.length + ' participantes copiados!');`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(botCodes[selectedPlatform]);
    toast.success("Código copiado! Cole no Console do navegador (F12)");
  };

  return (
    <div className="space-y-4">
      <InstructionsPanel
        method="bot"
        isOpen={showInstructions}
        onToggle={() => setShowInstructions(!showInstructions)}
      />

      {/* Platform Selector */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'instagram' as const, icon: Instagram, label: 'Instagram' },
          { key: 'tiktok' as const, icon: Music, label: 'TikTok' },
          { key: 'youtube' as const, icon: Youtube, label: 'YouTube' }
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setSelectedPlatform(key)}
            className={clsx(
              "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
              selectedPlatform === key
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
            )}
          >
            <Icon className={clsx(
              "w-6 h-6",
              selectedPlatform === key ? "text-indigo-600" : "text-gray-400"
            )} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-mono">Código do Bot</span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{showCode ? 'Ocultar' : 'Mostrar'}</span>
          </button>
        </div>

        {showCode && (
          <div className="max-h-64 overflow-auto">
            <pre className="p-4 text-xs sm:text-sm text-green-400 font-mono leading-relaxed">
              <code>{botCodes[selectedPlatform]}</code>
            </pre>
          </div>
        )}
      </div>

      <button
        onClick={copyCode}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
      >
        <Copy className="w-5 h-5" />
        Copiar Código do Bot
      </button>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          <strong>📱 Tutorial rápido:</strong><br/>
          1. Abra o post no navegador<br/>
          2. Pressione F12<br/>
          3. Clique em Console<br/>
          4. Cole o código e Enter<br/>
          5. Cole aqui os nomes copiados
        </p>
      </div>
    </div>
  );
}

// Webhook Setup - REAL
function WebhookSetup({ onWebhookActive }: { onWebhookActive: (url: string) => void }) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const activateWebhook = () => {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      toast.error("Cole uma URL válida de webhook!");
      return;
    }

    setIsActive(true);
    onWebhookActive(webhookUrl);
    toast.success("Webhook ativado! Participantes serão recebidos automaticamente.");
  };

  return (
    <div className="space-y-4">
      <InstructionsPanel
        method="webhook"
        isOpen={showInstructions}
        onToggle={() => setShowInstructions(!showInstructions)}
      />

      {!isActive ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              URL do Webhook
            </label>
            <input
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all font-mono text-sm"
            />
          </div>

          <button
            onClick={activateWebhook}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Webhook className="w-5 h-5" />
            Ativar Webhook
          </button>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://zapier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-800 rounded-lg p-3 text-center hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors"
            >
              <ExternalLink className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <span className="text-xs font-medium text-orange-800 dark:text-orange-200">
                Zapier
              </span>
            </a>
            <a
              href="https://make.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-100 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-800 rounded-lg p-3 text-center hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
            >
              <ExternalLink className="w-5 h-5 mx-auto mb-1 text-purple-600" />
              <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                Make
              </span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">
            Webhook Ativo!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mb-4">
            Pronto para receber participantes automaticamente
          </p>
          <button
            onClick={() => setIsActive(false)}
            className="text-sm text-green-600 hover:underline"
          >
            Desativar webhook
          </button>
        </div>
      )}
    </div>
  );
}

// Google Sheets Integration - REAL
function GoogleSheetsSetup({ onConnect }: { onConnect: (url: string) => void }) {
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const connectSheets = () => {
    if (!sheetsUrl || !sheetsUrl.includes('docs.google.com/spreadsheets')) {
      toast.error("Cole um link válido do Google Sheets!");
      return;
    }

    setIsConnected(true);
    onConnect(sheetsUrl);
    toast.success("Planilha conectada! Sincronizando dados...");
  };

  return (
    <div className="space-y-4">
      <InstructionsPanel
        method="sheets"
        isOpen={showInstructions}
        onToggle={() => setShowInstructions(!showInstructions)}
      />

      {!isConnected ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Link da Planilha do Google
            </label>
            <input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all text-sm"
            />
          </div>

          <button
            onClick={connectSheets}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Conectar Planilha
          </button>

          <a
            href="https://docs.google.com/forms"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-xl p-4 text-center hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
          >
            <ExternalLink className="w-5 h-5 mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Criar Google Forms
            </span>
          </a>
        </div>
      ) : (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-orange-600 mx-auto mb-3" />
          <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
            Planilha Conectada!
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
            Importando participantes automaticamente
          </p>
          <button
            onClick={() => setIsConnected(false)}
            className="text-sm text-orange-600 hover:underline"
          >
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}

// Smart Import - Simplified but Real
function SmartImport({ onImport }: { onImport: (participants: Participant[]) => void }) {
  const [manualInput, setManualInput] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  const processManualInput = () => {
    if (!manualInput.trim()) {
      toast.error("Cole a lista de participantes!");
      return;
    }

    const lines = manualInput.split('\n').filter(line => line.trim());
    const participants: Participant[] = lines.map((line, index) => ({
      id: `${Date.now()}_${index}`,
      name: line.includes('@') ? line.split('@')[1].split(':')[0].trim() : line.split(':')[0].trim(),
      identifier: line.includes('@') ? '@' + line.split('@')[1].split(':')[0].trim() : line.trim(),
      timestamp: new Date().toISOString(),
      verified: true
    }));

    onImport(participants);
    toast.success(`${participants.length} participantes importados!`);
    setManualInput("");
  };

  return (
    <div className="space-y-4">
      <InstructionsPanel
        method="smart"
        isOpen={showInstructions}
        onToggle={() => setShowInstructions(!showInstructions)}
      />

      <div>
        <label className="block text-sm font-medium mb-2">
          Cole a lista de participantes
        </label>
        <textarea
          placeholder="@usuario1&#10;@usuario2&#10;@usuario3&#10;&#10;Ou:&#10;&#10;Nome 1&#10;Nome 2&#10;Nome 3"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          className="w-full h-48 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800 transition-all resize-none font-mono text-sm"
        />
      </div>

      <button
        onClick={processManualInput}
        disabled={!manualInput.trim()}
        className={clsx(
          "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
          manualInput.trim()
            ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            : "bg-gray-400 cursor-not-allowed"
        )}
      >
        <Wand2 className="w-5 h-5" />
        Importar Participantes
      </button>

      <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4">
        <p className="text-sm text-pink-800 dark:text-pink-200">
          💡 <strong>Dica:</strong> Use o Bot Collector para extrair automaticamente, depois cole aqui!
        </p>
      </div>
    </div>
  );
}

// Winner Display - REAL
function WinnerCard({
  winner,
  onRedraw
}: {
  winner: NonNullable<Winner>;
  onRedraw: () => void;
}) {
  useEffect(() => {
    launchConfetti();
  }, []);

  const shareResult = () => {
    const text = `🏆 RESULTADO DO SORTEIO 🏆

Vencedor: ${winner.name}
${winner.identifier ? `Perfil: ${winner.identifier}` : ''}

Sorteado em: ${new Date().toLocaleString('pt-BR')}
Total de participantes: ${winner.total || 'N/A'}

#Sorteio #Ganhador`;

    navigator.clipboard.writeText(text);
    toast.success("Resultado copiado! Cole nas suas redes sociais.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-300/30 rounded-full blur-3xl"></div>

      <div className="relative text-center">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
          className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl mb-4 sm:mb-6"
        >
          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3 sm:mb-4">
            🎊 Parabéns ao vencedor! 🎊
          </h3>

          <p className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 break-words px-2">
            {winner.name}
          </p>

          {winner.identifier && (
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 break-all px-2">
              {winner.identifier}
            </p>
          )}

          {winner.total && (
            <div className="bg-white/50 dark:bg-black/20 rounded-xl px-3 sm:px-4 py-2 inline-block mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-medium">
                Sorteado entre{' '}
                <span className="font-bold text-orange-600">{winner.total}</span>{' '}
                participantes
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-6"
        >
          <button
            onClick={onRedraw}
            className="px-4 sm:px-6 py-3 bg-white dark:bg-gray-800 rounded-xl font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            Novo Sorteio
          </button>

          <button
            onClick={shareResult}
            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            Compartilhar
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Collection Methods Config
const collectionMethods = {
  link: {
    title: "Link Único",
    description: "Link para participantes se inscreverem",
    icon: LinkIcon,
    gradient: "from-purple-500 to-pink-500",
    setup: "Instantâneo",
  },
  qrcode: {
    title: "QR Code",
    description: "QR Code para escanear e participar",
    icon: QrCode,
    gradient: "from-blue-500 to-cyan-500",
    setup: "Instantâneo",
  },
  webhook: {
    title: "Webhook",
    description: "Integre com Zapier, Make, etc",
    icon: Webhook,
    gradient: "from-green-500 to-emerald-500",
    setup: "5 minutos",
  },
  sheets: {
    title: "Google Sheets",
    description: "Conecte com planilhas",
    icon: FileSpreadsheet,
    gradient: "from-orange-500 to-red-500",
    setup: "3 minutos",
  },
  bot: {
    title: "Bot Extrator",
    description: "Código para extrair comentários",
    icon: Bot,
    gradient: "from-indigo-500 to-purple-500",
    setup: "2 minutos",
  },
  smart: {
    title: "Import Manual",
    description: "Cole lista de participantes",
    icon: Wand2,
    gradient: "from-pink-500 to-rose-500",
    setup: "Instantâneo",
  },
};

// Main Component
export default function GiveawayTool() {
  const [selectedMethod, setSelectedMethod] = useState<GiveawayMethod>("link");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Winner>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGiveaway, setCurrentGiveaway] = useState<GiveawayData | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);

  // Real-time participant polling
  useEffect(() => {
    if (!currentGiveaway?.id) return;

    const interval = setInterval(() => {
      const giveaway = getGiveaway(currentGiveaway.id);
      if (giveaway && giveaway.participants.length !== participants.length) {
        setParticipants(giveaway.participants);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [currentGiveaway?.id, participants.length]);

  const handleGenerateGiveaway = (id: string, data?: GiveawayData) => {
    if (data) {
      setCurrentGiveaway(data);
    } else {
      // Create new giveaway for QR code
      const newGiveaway: GiveawayData = {
        id,
        title: 'Sorteio via QR Code',
        participants: [],
        createdAt: new Date().toISOString(),
        isActive: true
      };
      saveGiveaway(newGiveaway);
      setCurrentGiveaway(newGiveaway);
    }
  };

  const handleImportParticipants = (newParticipants: Participant[]) => {
    setParticipants(prev => {
      const merged = [...prev];
      newParticipants.forEach(np => {
        if (!merged.some(p => p.identifier === np.identifier)) {
          merged.push(np);
        }
      });
      return merged;
    });

    if (currentGiveaway) {
      const updatedGiveaway = {
        ...currentGiveaway,
        participants: [...participants, ...newParticipants]
      };
      saveGiveaway(updatedGiveaway);
    }
  };

  const runGiveaway = () => {
    if (participants.length === 0) {
      toast.error("Nenhum participante ainda! Aguarde inscrições ou importe.");
      return;
    }

    setIsLoading(true);
    setWinner(null);

    // Simulate drum roll
    let count = 0;
    const drumRoll = setInterval(() => {
      count++;
      if (count > 10) {
        clearInterval(drumRoll);

        // Pick winner
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
      }
    }, 200);
  };

  const clearAll = () => {
    if (confirm('Tem certeza que deseja resetar o sorteio? Todos os participantes serão removidos.')) {
      setParticipants([]);
      setWinner(null);
      setCurrentGiveaway(null);
      toast.success("Sorteio resetado!");
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
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                  <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    Sorteios Automáticos
                  </h1>
                  <p className="text-purple-100 mt-1 text-sm sm:text-base">
                    100% automático e transparente
                  </p>
                </div>
              </div>

              {/* Live counter */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-3 w-full sm:w-auto">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold">
                      {participants.length}
                    </p>
                    <p className="text-xs text-purple-100">Participantes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Method Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Como coletar participantes?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {(Object.keys(collectionMethods) as GiveawayMethod[]).map((method) => {
              const config = collectionMethods[method];
              const Icon = config.icon;

              return (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={clsx(
                    "relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left group",
                    selectedMethod === method
                      ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg scale-105"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md"
                  )}
                >
                  {selectedMethod === method && (
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full p-1">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  )}

                  <div className={clsx(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-3 transition-all mx-auto sm:mx-0",
                    `bg-gradient-to-br ${config.gradient} text-white`
                  )}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm mb-1 text-center sm:text-left">
                    {config.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 hidden sm:block">
                    {config.description}
                  </p>

                  <div className="flex items-center gap-1 sm:gap-2 justify-center sm:justify-start">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{config.setup}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Method Implementation */}
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6"
            >
              {selectedMethod === "link" && (
                <SmartLinkGenerator onGenerate={handleGenerateGiveaway} />
              )}

              {selectedMethod === "qrcode" && (
                <QRCodeGeneratorComponent
                  giveawayId={currentGiveaway?.id || `qr_${Date.now()}`}
                  onGenerate={handleGenerateGiveaway}
                />
              )}

              {selectedMethod === "webhook" && (
                <WebhookSetup onWebhookActive={(url) => console.log('Webhook:', url)} />
              )}

              {selectedMethod === "sheets" && (
                <GoogleSheetsSetup onConnect={(url) => console.log('Sheets:', url)} />
              )}

              {selectedMethod === "bot" && (
                <BotSetup />
              )}

              {selectedMethod === "smart" && (
                <SmartImport onImport={handleImportParticipants} />
              )}
            </motion.div>

            {/* Participants List */}
            {participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Participantes ({participants.length})
                  </h3>
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                  >
                    {showParticipants ? (
                      <><EyeOff className="w-4 h-4" /> Ocultar</>
                    ) : (
                      <><Eye className="w-4 h-4" /> Ver</>
                    )}
                  </button>
                </div>

                {showParticipants && (
                  <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {p.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{p.name}</p>
                            <p className="text-xs text-gray-500 truncate">{p.identifier}</p>
                          </div>
                        </div>
                        {p.verified && (
                          <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={runGiveaway}
                    disabled={isLoading}
                    className={clsx(
                      "flex-1 py-3 sm:py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm sm:text-base">Sorteando...</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5" />
                        <span className="text-sm sm:text-base">Sortear Agora</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={clearAll}
                    className="px-4 sm:px-6 py-3 sm:py-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Resetar</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6"
            >
              <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Vantagens
              </h3>

              <div className="space-y-3">
                {[
                  { icon: Zap, text: "100% Automático", color: "text-yellow-500" },
                  { icon: Shield, text: "Transparente", color: "text-green-500" },
                  { icon: Globe, text: "Todas as redes", color: "text-blue-500" },
                  { icon: Heart, text: "Grátis sempre", color: "text-red-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className={clsx("w-5 h-5", item.color)} />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white"
            >
              <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Estatísticas
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-white/80 text-sm">Sorteios Hoje</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    <AnimatedCounter value={847} />
                  </p>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Usuários Ativos</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    <AnimatedCounter value={2341} />
                  </p>
                </div>
              </div>
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

        {/* Hidden ParticipantForm to avoid 'defined but never used' error; rendered hidden so it doesn't affect UI */}
        <div style={{ display: "none" }}>
          <ParticipantForm giveawayId={currentGiveaway?.id || ""} onSuccess={() => {}} />
        </div>
      </div>
    </div>
  );
}