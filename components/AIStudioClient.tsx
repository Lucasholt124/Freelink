'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { useAction, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Mic, MessageSquare, Upload, Download, Loader2, Wand2,
  Copy, Check,  FileAudio, Send,
  Camera, Bot, Trash2, RotateCcw, AlertCircle, Info
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import DOMPurify from 'dompurify'


// =================================================================
// 🎯 CONFIGURAÇÃO E CONSTANTES
// =================================================================
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB máximo para economizar
const MAX_IMAGE_DIMENSION = 1024; // Reduzido para 1024px para economizar
const COMPRESSION_QUALITY = 0.7; // 70% de qualidade para economizar

const tabs = [
  {
    id: 'chat',
    label: 'Chat IA',
    icon: MessageSquare,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    description: 'Converse com inteligência artificial avançada',
    free: true
  },
  {
    id: 'enhance',
    label: 'Aprimorar Imagem',
    icon: Wand2,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    description: 'Melhore a qualidade das suas imagens',
    free: false,
    cost: '$0.0005/imagem'
  },
  {
    id: 'stt',
    label: 'Áudio → Texto',
    icon: Mic,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    description: 'Transcreva áudios instantaneamente',
    free: true
  },
  {
    id: 'remove-bg',
    label: 'Remover Fundo',
    icon: Camera,
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    description: 'Remova fundos profissionalmente',
    free: false,
    cost: '$0.0005/imagem'
  },
];

// Efeitos mais baratos
const enhanceEffects = [
  {
    id: 'basic',
    name: 'Básico (Grátis)',
    icon: '⚡',
    description: 'Melhoria rápida',
    cost: 0
  },
  {
    id: 'real-esrgan',
    name: 'HD 2x',
    icon: '✨',
    description: 'Dobra resolução',
    cost: 0.0005
  },
  {
    id: 'face-enhance',
    name: 'Rostos',
    icon: '👤',
    description: 'Melhora faces',
    cost: 0.001
  },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// =================================================================
// 🛡️ FUNÇÕES DE SEGURANÇA E OTIMIZAÇÃO
// =================================================================
const sanitizeContent = (content: string): string => {
  // Se DOMPurify não estiver disponível no cliente, use uma versão simples
  if (typeof window !== 'undefined' && DOMPurify) {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li', 'ol'],
      ALLOWED_ATTR: []
    });
  }
  // Fallback simples para SSR
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Compressão agressiva de imagem
const compressImage = async (
  file: File,
  maxWidth: number = MAX_IMAGE_DIMENSION,
  maxHeight: number = MAX_IMAGE_DIMENSION,
  quality: number = COMPRESSION_QUALITY
): Promise<{ base64: string; size: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image(); // Usar window.Image explicitamente

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calcula novo tamanho mantendo proporção
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Aplica compressão
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium'; // Reduzido para economizar
        ctx.drawImage(img, 0, 0, width, height);

        // Converte para JPEG com qualidade baixa
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        const sizeInBytes = Math.round((compressedBase64.length - 22) * 0.75);

        console.log(`✅ Compressão: ${img.width}x${img.height} → ${width}x${height} | ${(file.size/1024).toFixed(1)}KB → ${(sizeInBytes/1024).toFixed(1)}KB`);

        resolve({
          base64: compressedBase64,
          size: sizeInBytes
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// =================================================================
// 🎯 COMPONENTE PRINCIPAL
// =================================================================
export function AIStudioClient() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('chat')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedEffect, setSelectedEffect] = useState('basic')
  const [downloadingAssets, setDownloadingAssets] = useState<Set<string>>(new Set())

  // Sistema de rate limiting local
  const [requestCount, setRequestCount] = useState(0)
  const [lastRequestTime, setLastRequestTime] = useState(0)

  // Estados do Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou sua assistente de IA gratuita. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Estados de Imagem
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [enhancedImage, setEnhancedImage] = useState('')

  // Estados de Áudio
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState('')

  // Estados de Remover Fundo
  const [removeBgImage, setRemoveBgImage] = useState('')
  const [removeBgResult, setRemoveBgResult] = useState('')

  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const removeBgInputRef = useRef<HTMLInputElement>(null)
  const confettiTimeouts = useRef<NodeJS.Timeout[]>([])

  // Query para obter estatísticas do usuário (getUserStats ao invés de getUserUsage)
  const userStats = useQuery(api.aiStudio.getUserStats,
    user ? { userId: user.id } : "skip"
  )

  // Actions
  const enhanceImageAction = useAction(api.aiStudio.enhanceImage)
  const chatWithAIAction = useAction(api.aiStudio.chatWithAI)
  const speechToTextAction = useAction(api.aiStudio.speechToText)
  const removeBackgroundAction = useAction(api.aiStudio.removeBackground)

  // Cleanup de confetti ao desmontar
  useEffect(() => {
    return () => {
      confettiTimeouts.current.forEach(clearTimeout);
      // Limpar todos os confetti existentes
      document.querySelectorAll('.confetti').forEach(el => el.remove());
    };
  }, []);

  // =================================================================
  // 🛡️ RATE LIMITING LOCAL
  // =================================================================
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    // Reset contador após 1 minuto
    if (timeSinceLastRequest > 60000) {
      setRequestCount(1);
      setLastRequestTime(now);
      return true;
    }

    // Máximo 10 requests por minuto
    if (requestCount >= 10) {
      toast.error('⏱️ Limite de requisições atingido. Aguarde 1 minuto.');
      return false;
    }

    setRequestCount(prev => prev + 1);
    setLastRequestTime(now);
    return true;
  }, [lastRequestTime, requestCount]);

  // =================================================================
  // 💬 FUNÇÕES DO CHAT
  // =================================================================
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, []);

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, scrollToBottom])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user) {
      if (!user) toast.error('Faça login para usar o chat');
      return;
    }

    if (!checkRateLimit()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsTyping(true)

    try {
      const result = await chatWithAIAction({
        userId: user.id,
        message: chatInput,
        conversationHistory: chatMessages.slice(-6).map(m => ({
          role: m.role,
          content: m.content
        }))
      })

      if (result.success && result.response) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, assistantMessage])
      } else {
        toast.error(result.message || 'Erro ao obter resposta')
      }
    } catch (error) {
      console.error('Erro no chat:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = useCallback(() => {
    setChatMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Olá! 👋 Sou sua assistente de IA gratuita. Como posso ajudar você hoje?',
        timestamp: new Date()
      }
    ])
    toast.success('Chat limpo!')
  }, []);

  // =================================================================
  // 🎨 FUNÇÕES DE IMAGEM
  // =================================================================
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'enhance' | 'remove-bg' = 'enhance'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return;

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`📏 Arquivo muito grande! Máximo ${(MAX_FILE_SIZE/1024/1024).toFixed(0)}MB para economizar custos.`)
      return
    }

    try {
      setLoading(true);
      const toastId = toast.loading('🗜️ Comprimindo imagem...');

      // Comprime a imagem
      const compressed = await compressImage(file);

      toast.dismiss(toastId);

      if (compressed.size > MAX_FILE_SIZE) {
        toast.error('Imagem ainda muito grande após compressão. Use uma imagem menor.');
        return;
      }

      if (type === 'enhance') {
        setImageFile(file)
        setImagePreview(compressed.base64)
        setEnhancedImage('')
        toast.success(`📸 Imagem carregada! (${(compressed.size/1024).toFixed(1)}KB)`)
      } else {
        setRemoveBgImage(compressed.base64)
        setRemoveBgResult('')
        toast.success(`📸 Imagem carregada! (${(compressed.size/1024).toFixed(1)}KB)`)
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem');
    } finally {
      setLoading(false);
    }
  }

  const handleEnhanceImage = async () => {
    if (!imagePreview || !user) {
      toast.error(!user ? '🔐 Faça login primeiro!' : '📸 Envie uma imagem primeiro!')
      return
    }

    if (!checkRateLimit()) return;

    // Verifica uso mensal usando userStats
    const effect = enhanceEffects.find(e => e.id === selectedEffect);
    if (effect && effect.cost > 0 && userStats) {
      if (userStats.today.images >= 5) {
        toast.error('📊 Limite diário de 5 imagens atingido!');
        return;
      }

      if (userStats.month.cost + effect.cost > userStats.costLimits.maxMonthlyCost) {
        toast.error(`💰 Limite de custo mensal ($${userStats.costLimits.maxMonthlyCost}) seria excedido!`);
        return;
      }
    }

    setLoading(true)
    const toastId = toast.loading(
      effect?.cost === 0
        ? '🎨 Processando localmente...'
        : `🎨 Processando com IA... (Custo: $${effect?.cost})`
    )

    try {
      const result = await enhanceImageAction({
        userId: user.id,
        imageFile: imagePreview,
        effect: selectedEffect
      })

      toast.dismiss(toastId)

      if (result.success) {
        setEnhancedImage(result.url!)
        toast.success(
          effect?.cost === 0
            ? '🎉 Imagem processada!'
            : `🎉 Imagem aprimorada! (Custo: $${effect?.cost})`
        )
        createConfetti()
      } else {
        toast.error(result.message || 'Erro ao processar')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.dismiss(toastId)
      toast.error('Erro ao processar imagem')
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // 🎤 FUNÇÕES DE ÁUDIO
  // =================================================================
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;

    // Limite de 5MB para áudio
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande! Máximo 5MB.')
      return
    }

    setAudioFile(file)
    setTranscription('')
    toast.success(`🎙️ Áudio carregado! (${(file.size/1024/1024).toFixed(1)}MB)`)
  }

  const handleSpeechToText = async () => {
    if (!audioFile || !user) {
      toast.error(!user ? '🔐 Faça login primeiro!' : '🎤 Envie um áudio primeiro!')
      return
    }

    if (!checkRateLimit()) return;

    setLoading(true)
    const toastId = toast.loading('🎙️ Transcrevendo com Whisper...')

    try {
      const result = await speechToTextAction({
        userId: user.id,
        audioUrl: await fileToBase64(audioFile)
      })

      toast.dismiss(toastId)

      if (result.success) {
        setTranscription(result.text!)
        toast.success('✅ Áudio transcrito com sucesso!')
        createConfetti()
      } else {
        toast.error(result.message || 'Erro ao transcrever')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.dismiss(toastId)
      toast.error('Erro ao transcrever áudio')
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // 📸 FUNÇÕES DE REMOVER FUNDO
  // =================================================================
  const handleRemoveBackground = async () => {
    if (!removeBgImage || !user) {
      toast.error(!user ? '🔐 Faça login primeiro!' : '📸 Envie uma imagem primeiro!')
      return
    }

    if (!checkRateLimit()) return;

    // Verifica uso mensal
    if (userStats && userStats.today.removeBg >= 3) {
      toast.error('📊 Limite diário de 3 remoções atingido!');
      return;
    }

    setLoading(true)
    const toastId = toast.loading('✂️ Removendo fundo... (Custo: $0.0005)')

    try {
      const result = await removeBackgroundAction({
        userId: user.id,
        imageUrl: removeBgImage
      })

      toast.dismiss(toastId)

      if (result.success) {
        setRemoveBgResult(result.url!)
        toast.success('✨ Fundo removido! (Custo: $0.0005)')
        createConfetti()
      } else {
        toast.error(result.message || 'Erro ao remover fundo')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.dismiss(toastId)
      toast.error('Erro ao remover fundo')
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // 🔧 FUNÇÕES AUXILIARES
  // =================================================================
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('📋 Copiado!')
    setTimeout(() => setCopied(false), 2000)
  }, []);

  const downloadAsset = useCallback(async (url: string, filename: string) => {
    if (downloadingAssets.has(url)) {
      toast.warning("Download em andamento!");
      return;
    }

    setDownloadingAssets(prev => new Set(prev).add(url));
    const toastId = toast.loading("⬇️ Baixando...");

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Falha ao baixar");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      toast.dismiss(toastId);
      toast.success("✅ Download concluído!");
      createConfetti();
    } catch (error) {
      console.error('Erro:', error);
      toast.dismiss(toastId);
      toast.error('Erro ao baixar');
    } finally {
      setDownloadingAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    }
  }, [downloadingAssets]);

  const createConfetti = useCallback(() => {
    const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];
    confettiTimeouts.current = [];

    for(let i = 0; i < 20; i++) { // Reduzido de 40 para 20
      const timeout = setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 30);

      confettiTimeouts.current.push(timeout);
    }
  }, []);

  // =================================================================
  // 📊 COMPONENTE DE USO
  // =================================================================
  const UsageDisplay = useMemo(() => {
    if (!userStats) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20 mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Uso Mensal</span>
          </div>
          <span className="text-xs text-gray-400">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{userStats.month.images}</p>
            <p className="text-xs text-gray-400">Imagens</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{userStats.month.chat}</p>
            <p className="text-xs text-gray-400">Chats</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">${userStats.month.cost.toFixed(3)}</p>
            <p className="text-xs text-gray-400">Custo Est.</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Limite de segurança:</span>
            <span className="text-xs font-semibold text-orange-400">${userStats.costLimits.maxMonthlyCost.toFixed(2)}/mês</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2 mt-1">
            <div
              className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((userStats.month.cost / userStats.costLimits.maxMonthlyCost) * 100, 100)}%` }}
            />
          </div>
        </div>
      </motion.div>
    );
  }, [userStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 text-white relative overflow-hidden">

      {/* EFEITOS DE FUNDO */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Otimizado para Baixo Custo
            </span>
          </motion.div>

          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
          >
            AI Studio Pro
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Ferramentas de IA com custo controlado
            <span className="block text-purple-400 font-semibold mt-1">
              Economize até 90% com nossa otimização 🚀
            </span>
          </motion.p>
        </motion.div>

        {/* DISPLAY DE USO */}
        {user && UsageDisplay}

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex justify-center gap-2 md:gap-3 mb-8 overflow-x-auto pb-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap",
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl shadow-purple-500/50`
                  : "bg-white/5 backdrop-blur-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {!tab.free && (
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                  {tab.cost}
                </span>
              )}
              {tab.free && (
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                  Grátis
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl">

              {/* ========================================= */}
              {/* ABA CHAT IA */}
              {/* ========================================= */}
              {activeTab === 'chat' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Chat com IA</h2>
                        <p className="text-sm text-gray-400">Gratuito e ilimitado</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearChat}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                      title="Limpar conversa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {!user && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-orange-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Faça login para usar o chat</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="h-[500px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                      {chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div className={cn(
                            "max-w-[85%] md:max-w-[75%] rounded-2xl p-4 relative group",
                            message.role === 'user'
                              ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                              : "bg-white/10 backdrop-blur-sm border border-white/10"
                          )}>
                            {message.role === 'assistant' && (
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                <Bot className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-semibold text-purple-400">Assistente IA</span>
                              </div>
                            )}
                            <div
                              className="text-sm md:text-base whitespace-pre-wrap leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: sanitizeContent(message.content)
                              }}
                            />
                            {message.role === 'assistant' && (
                              <button
                                onClick={() => handleCopy(message.content)}
                                className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Copiar"
                              >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                              <div className="flex gap-1">
                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="border-t border-white/10 p-4 bg-black/20">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder={user ? "Digite sua mensagem..." : "Faça login para usar o chat"}
                          disabled={loading || !user}
                          className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendMessage}
                          disabled={loading || !chatInput.trim() || !user}
                          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                          <Send className="w-5 h-5" />
                          <span className="hidden sm:inline">Enviar</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================= */}
              {/* ABA APRIMORAR IMAGEM */}
              {/* ========================================= */}
              {activeTab === 'enhance' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl">
                      <Wand2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Aprimorador de Imagens</h2>
                      <p className="text-sm text-gray-400">Otimizado para baixo custo</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-300">
                        <p className="font-semibold mb-1">💡 Dicas para economizar:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Use imagens menores que 1024x1024px</li>
                          <li>• Escolha o modo Básico para processamento gratuito</li>
                          <li>• Imagens JPEG são mais econômicas que PNG</li>
                          <li>• Máximo de 2MB por imagem</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Escolha o efeito
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {enhanceEffects.map(effect => (
                        <motion.button
                          key={effect.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedEffect(effect.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left",
                            selectedEffect === effect.id
                              ? "border-pink-500 bg-pink-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          )}
                        >
                          <div className="text-2xl mb-2">{effect.icon}</div>
                          <div className="font-semibold text-sm mb-1">{effect.name}</div>
                          <div className="text-xs text-gray-400">{effect.description}</div>
                          {effect.cost > 0 && (
                            <div className="text-xs text-yellow-400 mt-1">
                              ${effect.cost}/img
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-300">
                        Imagem Original
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() => imageInputRef.current?.click()}
                        className="relative aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-pink-500 transition-all cursor-pointer group overflow-hidden bg-black/20"
                      >
                        {imagePreview ? (
                          <>
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-center">
                                <RotateCcw className="w-8 h-8 mx-auto mb-2" />
                                <p className="font-semibold">Trocar imagem</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-pink-400 transition-colors">
                            <Upload className="w-12 h-12 mb-3" />
                            <p className="font-semibold">Clique para enviar</p>
                            <p className="text-xs mt-1">JPG, PNG até 2MB</p>
                            <p className="text-xs mt-1 text-yellow-400">Max: 1024x1024px</p>
                          </div>
                        )}
                      </motion.div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'enhance')}
                        disabled={loading}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-300">
                        Resultado Aprimorado
                      </label>
                      <div className="relative aspect-square rounded-2xl border-2 border-white/10 bg-black/20 overflow-hidden">
                        {enhancedImage ? (
                          <>
                            <Image
                              src={enhancedImage}
                              alt="Enhanced"
                              fill
                              className="object-cover"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => downloadAsset(enhancedImage, 'enhanced-image.jpg')}
                              disabled={downloadingAssets.has(enhancedImage)}
                              className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-50"
                            >
                              {downloadingAssets.has(enhancedImage) ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Download className="w-5 h-5" />
                              )}
                            </motion.button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            <div className="text-center">
                              <Sparkles className="w-12 h-12 mx-auto mb-3" />
                              <p className="text-sm">Resultado aparecerá aqui</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnhanceImage}
                    disabled={loading || !imageFile || !user}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl hover:shadow-pink-500/50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-6 h-6" />
                        Aprimorar Imagem
                        {selectedEffect !== 'basic' && (
                          <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                            ${enhanceEffects.find(e => e.id === selectedEffect)?.cost}
                          </span>
                        )}
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* ========================================= */}
              {/* ABA ÁUDIO PARA TEXTO */}
              {/* ========================================= */}
              {activeTab === 'stt' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Áudio para Texto</h2>
                      <p className="text-sm text-gray-400">Transcrição gratuita com Whisper</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Arquivo de áudio
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      onClick={() => audioInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-500 transition-all cursor-pointer p-10 text-center bg-black/20 group"
                    >
                      {audioFile ? (
                        <div className="space-y-2">
                          <FileAudio className="w-12 h-12 mx-auto text-emerald-400" />
                          <p className="font-semibold">{audioFile.name}</p>
                          <p className="text-sm text-gray-400">
                            {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-gray-400 group-hover:text-emerald-400 transition-colors">
                          <Upload className="w-12 h-12 mx-auto" />
                          <p className="font-semibold">Clique para enviar áudio</p>
                          <p className="text-sm">MP3, WAV, M4A até 5MB</p>
                        </div>
                      )}
                    </motion.div>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      disabled={loading}
                      className="hidden"
                    />
                  </div>

                  {transcription && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/30"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <FileAudio className="w-5 h-5 text-emerald-400" />
                          Transcrição
                        </h3>
                        <button
                          onClick={() => handleCopy(transcription)}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-300">
                        {transcription}
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSpeechToText}
                    disabled={loading || !audioFile || !user}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl hover:shadow-emerald-500/50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Transcrevendo...
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6" />
                        Transcrever Áudio (Grátis)
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* ========================================= */}
              {/* ABA REMOVER FUNDO */}
              {/* ========================================= */}
              {activeTab === 'remove-bg' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Remover Fundo</h2>
                      <p className="text-sm text-gray-400">Remoção profissional por $0.0005</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-300">
                        <p>💡 <strong>Economia:</strong> Com $1 você remove fundo de 2.000 imagens!</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-300">
                        Imagem Original
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() => removeBgInputRef.current?.click()}
                        className="relative aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500 transition-all cursor-pointer group overflow-hidden bg-black/20"
                      >
                        {removeBgImage ? (
                          <>
                            <Image
                              src={removeBgImage}
                              alt="Original"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-center">
                                <RotateCcw className="w-8 h-8 mx-auto mb-2" />
                                <p className="font-semibold">Trocar imagem</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors">
                            <Upload className="w-12 h-12 mb-3" />
                            <p className="font-semibold">Clique para enviar</p>
                            <p className="text-xs mt-1">JPG, PNG até 2MB</p>
                            <p className="text-xs mt-1 text-yellow-400">Max: 1024x1024px</p>
                          </div>
                        )}
                      </motion.div>
                      <input
                        ref={removeBgInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'remove-bg')}
                        disabled={loading}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-300">
                        Sem Fundo
                      </label>
                      <div className="relative aspect-square rounded-2xl border-2 border-white/10 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 overflow-hidden">
                        {removeBgResult ? (
                          <>
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundImage: 'repeating-conic-gradient(#80808020 0% 25%, transparent 0% 50%) 50% / 20px 20px'
                              }}
                            />
                            <Image
                              src={removeBgResult}
                              alt="No Background"
                              fill
                              className="object-contain"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => downloadAsset(removeBgResult, 'no-background.png')}
                              disabled={downloadingAssets.has(removeBgResult)}
                              className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white shadow-2xl hover:shadow-blue-500/50 transition-all disabled:opacity-50"
                            >
                              {downloadingAssets.has(removeBgResult) ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Download className="w-5 h-5" />
                              )}
                            </motion.button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            <div className="text-center">
                              <Camera className="w-12 h-12 mx-auto mb-3" />
                              <p className="text-sm">Resultado aparecerá aqui</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemoveBackground}
                    disabled={loading || !removeBgImage || !user}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Removendo...
                      </>
                    ) : (
                      <>
                        <Camera className="w-6 h-6" />
                        Remover Fundo
                        <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                          $0.0005
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 space-y-4"
        >
          <p className="text-sm text-gray-500">
            Otimizado para máxima economia • Feito com 💜
          </p>
        </motion.div>
      </div>

      {/* ESTILOS GLOBAIS */}
      <style jsx global>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall 3s linear forwards;
          z-index: 9999;
          pointer-events: none;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thumb-purple-500\/50::-webkit-scrollbar-thumb {
          background-color: rgba(168, 85, 247, 0.5);
          border-radius: 3px;
        }

        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  )
}