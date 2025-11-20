'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Mic, MessageSquare, Upload, Download, Loader2, Wand2,
  Copy, Check, Crown, FileAudio, Heart, Star, Send,
  Camera, Bot, Share2, Trash2, RotateCcw, User
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// =================================================================
// 🎯 CONFIGURAÇÃO DE ABAS
// =================================================================
const tabs = [
  {
    id: 'chat',
    label: 'Chat IA',
    icon: MessageSquare,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    description: 'Converse com inteligência artificial avançada'
  },
  {
    id: 'enhance',
    label: 'Aprimorar Imagem',
    icon: Wand2,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    description: 'Transforme imagens com IA de última geração'
  },
  {
    id: 'stt',
    label: 'Áudio → Texto',
    icon: Mic,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    description: 'Transcrição instantânea com precisão perfeita'
  },
  {
    id: 'remove-bg',
    label: 'Remover Fundo',
    icon: Camera,
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    description: 'Remoção de fundo profissional em segundos'
  },
];

// =================================================================
// 🎨 EFEITOS DE APRIMORAMENTO
// =================================================================
const enhanceEffects = [
  {
    id: 'super-resolution',
    name: 'Super Resolução 4K',
    icon: '🚀',
    description: 'Qualidade cinematográfica',
    power: 100
  },
  {
    id: 'ai-enhance',
    name: 'IA Total',
    icon: '✨',
    description: 'Aprimoramento completo',
    power: 95
  },
  {
    id: 'professional',
    name: 'Profissional',
    icon: '📸',
    description: 'Padrão de estúdio',
    power: 90
  },
  {
    id: 'restore',
    name: 'Restauração',
    icon: '🔮',
    description: 'Recupere fotos antigas',
    power: 88
  },
];

// =================================================================
// 💬 INTERFACE DE MENSAGEM
// =================================================================
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// =================================================================
// 🎯 COMPONENTE PRINCIPAL
// =================================================================
export function AIStudioClient() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('chat')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedEffect, setSelectedEffect] = useState('super-resolution')
  const [downloadingAssets, setDownloadingAssets] = useState<Set<string>>(new Set());

  // Estados do Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
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

  // Actions
  const enhanceImageAction = useAction(api.aiStudio.enhanceImage)
  const chatWithAIAction = useAction(api.aiStudio.chatWithAI)
  const speechToTextAction = useAction(api.aiStudio.speechToText)
  const removeBackgroundAction = useAction(api.aiStudio.removeBackground)

  // =================================================================
  // 💾 LOCALSTORAGE - SALVAR E CARREGAR MENSAGENS
  // =================================================================
  const STORAGE_KEY = 'ai-studio-chat-messages'

  // Carregar mensagens ao montar o componente
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY)
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages)
        // Converter strings de data de volta para objetos Date
        const messages = parsed.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setChatMessages(messages)
      } else {
        // Mensagem inicial se não houver histórico
        const initialMessage: ChatMessage = {
          id: '1',
          role: 'assistant',
          content: 'Olá! 👋 Sou sua assistente de IA. Posso ajudar com qualquer dúvida, criar conteúdo, resolver problemas e muito mais. Como posso ajudar você hoje?',
          timestamp: new Date()
        }
        setChatMessages([initialMessage])
      }
    } catch (error) {
      console.error('Erro ao carregar chat:', error)
      // Fallback para mensagem inicial
      setChatMessages([{
        id: '1',
        role: 'assistant',
        content: 'Olá! 👋 Sou sua assistente de IA. Posso ajudar com qualquer dúvida, criar conteúdo, resolver problemas e muito mais. Como posso ajudar você hoje?',
        timestamp: new Date()
      }])
    }
  }, [])

  // Salvar mensagens sempre que mudarem
  useEffect(() => {
    if (chatMessages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatMessages))
      } catch (error) {
        console.error('Erro ao salvar chat:', error)
      }
    }
  }, [chatMessages])

  // =================================================================
  // 💬 FUNÇÕES DO CHAT
  // =================================================================
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isTyping])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user) return

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
        conversationHistory: chatMessages.slice(-10).map(m => ({
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
        toast.error('Erro ao obter resposta')
      }
    } catch (error) {
      console.error('Erro no chat:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = () => {
    if (chatMessages.length <= 1) {
      toast.info('O chat já está vazio!')
      return
    }

    // Confirmação
    const confirmed = window.confirm('Deseja realmente limpar todo o histórico de conversa?')
    if (!confirmed) return

    const initialMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou sua assistente de IA. Posso ajudar com qualquer dúvida, criar conteúdo, resolver problemas e muito mais. Como posso ajudar você hoje?',
      timestamp: new Date()
    }

    setChatMessages([initialMessage])
    localStorage.setItem(STORAGE_KEY, JSON.stringify([initialMessage]))
    toast.success('✨ Chat limpo com sucesso!')
  }

  // =================================================================
  // 🎨 FUNÇÕES DE IMAGEM
  // =================================================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'enhance' | 'remove-bg' = 'enhance') => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande! Máximo 10MB.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        if (type === 'enhance') {
          setImageFile(file)
          setImagePreview(result)
          setEnhancedImage('')
          toast.success('📸 Imagem carregada!')
        } else {
          setRemoveBgImage(result)
          setRemoveBgResult('')
          toast.success('📸 Imagem carregada!')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const resizeImageBeforeUpload = (file: File, maxWidth: number = 1440, maxHeight: number = 1440): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = document.createElement('img') as HTMLImageElement;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * (maxHeight / height));
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

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          console.log(`✅ Imagem redimensionada: ${img.width}x${img.height} → ${width}x${height}`);
          resolve(resizedBase64);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleEnhanceImage = async () => {
    if (!imageFile || !user) {
      toast.error('📸 Envie uma imagem primeiro!')
      return
    }

    setLoading(true)
    const toastId = toast.loading('🎨 Processando com IA...')

    try {
      console.log('📏 Redimensionando imagem antes do upload...');
      const resizedImage = await resizeImageBeforeUpload(imageFile, 1440, 1440);

      const sizeKB = Math.round((resizedImage.length * 0.75) / 1024);
      console.log(`✅ Imagem redimensionada: ~${sizeKB}KB`);

      if (sizeKB > 5000) {
        toast.dismiss(toastId);
        toast.error('Imagem muito grande. Tente uma imagem menor ou com menos detalhes.');
        return;
      }

      const result = await enhanceImageAction({
        userId: user.id,
        imageFile: resizedImage,
        effect: selectedEffect
      })

      toast.dismiss(toastId)

      if (result.success) {
        setEnhancedImage(result.url!)

        if (result.message && result.message.includes('Usos restantes')) {
          toast.success(result.message, { duration: 5000 })
        } else {
          toast.success('🎉 Imagem aprimorada com sucesso!')
        }

        createConfetti()
      } else {
        if (result.message && result.message.includes('Limite Diário Atingido')) {
          toast.error(result.message, { duration: 6000 })
        } else {
          toast.error(result.message || 'Erro ao processar')
        }
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.dismiss(toastId)

      const errorMsg = error instanceof Error ? error.message : 'Erro ao processar imagem';
      if (errorMsg.includes('size') || errorMsg.includes('large')) {
        toast.error('Imagem muito grande. Use uma imagem menor (máx 2MB, 1920x1080)');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false)
    }
  }

  // =================================================================
  // 🎤 FUNÇÕES DE ÁUDIO
  // =================================================================
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error('Arquivo muito grande! Máximo 25MB.')
        return
      }
      setAudioFile(file)
      setTranscription('')
      toast.success('🎙️ Áudio carregado!')
    }
  }

  const handleSpeechToText = async () => {
    if (!audioFile || !user) {
      toast.error('🎤 Envie um áudio primeiro!')
      return
    }

    setLoading(true)
    const toastId = toast.loading('🎙️ Transcrevendo...')

    try {
      const result = await speechToTextAction({
        userId: user.id,
        audioUrl: await fileToBase64(audioFile)
      })

      toast.dismiss(toastId)

      if (result.success) {
        setTranscription(result.text!)
        toast.success('✅ Áudio transcrito!')
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
      toast.error('📸 Envie uma imagem primeiro!')
      return
    }

    setLoading(true)
    const toastId = toast.loading('✂️ Removendo fundo...')

    try {
      console.log('📏 Preparando imagem para remoção de fundo...');

      const response = await fetch(removeBgImage);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });

      const sizeMB = (blob.size / 1024 / 1024).toFixed(1);
      console.log(`📊 Tamanho original: ${sizeMB}MB`);

      const resizedImage = await resizeImageBeforeUpload(file, 1440, 1440);

      const resizedSizeKB = Math.round((resizedImage.length * 0.75) / 1024);
      console.log(`✅ Imagem redimensionada: ~${resizedSizeKB}KB`);

      if (resizedSizeKB > 5000) {
        toast.dismiss(toastId);
        toast.error('Imagem muito grande. Use uma imagem menor (máx 2MB)');
        return;
      }

      const result = await removeBackgroundAction({
        userId: user.id,
        imageUrl: resizedImage
      })

      toast.dismiss(toastId)

      if (result.success) {
        setRemoveBgResult(result.url!)

        if (result.message && result.message.includes('Usos restantes')) {
          toast.success(result.message, { duration: 5000 })
        } else {
          toast.success('✨ Fundo removido com sucesso!')
        }

        createConfetti()
      } else {
        if (result.message && result.message.includes('Limite Diário Atingido')) {
          toast.error(result.message, { duration: 6000 })
        } else {
          toast.error(result.message || 'Erro ao remover fundo')
        }
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.dismiss(toastId)

      const errorMsg = error instanceof Error ? error.message : 'Erro ao remover fundo';
      if (errorMsg.includes('size') || errorMsg.includes('large')) {
        toast.error('Imagem muito grande. Use uma menor (máx 2MB, 1920x1080)');
      } else {
        toast.error(errorMsg);
      }
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('📋 Copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsset = async (url: string, filename: string) => {
    if (downloadingAssets.has(url)) {
      toast.warning("Download em andamento!");
      return;
    }

    setDownloadingAssets(prev => new Set(prev).add(url));
    const toastId = toast.loading("⬇️ Baixando...");

    const isIOS =
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
      !(window as unknown as { MSStream: unknown }).MSStream;

    if (isIOS) {
      window.open(url, '_blank');
      toast.dismiss(toastId);
      toast.success("Aberto! Segure na imagem para salvar na Galeria.");
      setDownloadingAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
      return;
    }

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
      window.open(url, '_blank');
    } finally {
      setDownloadingAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    }
  };

  const createConfetti = () => {
    const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];
    for(let i = 0; i < 40; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 20);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 text-white relative overflow-hidden">

      {/* EFEITOS DE FUNDO */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* GRID PATTERN */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />

      {/* CONTAINER PRINCIPAL */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-4 sm:mb-6"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Powered by AI
            </span>
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
          </motion.div>

          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
          >
            AI Studio Pro
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4"
          >
            A ferramenta de IA mais avançada do mundo.
            <span className="block text-purple-400 font-semibold mt-1">
              Transforme suas ideias em realidade 🚀
            </span>
          </motion.p>
        </motion.div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex justify-start sm:justify-center gap-2 md:gap-3 mb-4 sm:mb-8 overflow-x-auto pb-2 sm:pb-4 px-2 scrollbar-hide">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm flex-shrink-0",
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl shadow-purple-500/50`
                  : "bg-white/5 backdrop-blur-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20"
              )}
            >
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/10 rounded-xl sm:rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
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
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 p-3 sm:p-6 md:p-8 shadow-2xl">

              {/* ========================================= */}
              {/* ABA CHAT IA - ESTILO CHATGPT MELHORADO */}
              {/* ========================================= */}
              {activeTab === 'chat' && (
                <div className="space-y-3 sm:space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl sm:rounded-2xl shadow-lg">
                        <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Chat com IA</h2>
                        <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Converse naturalmente sobre qualquer assunto</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearChat}
                      className="p-2 sm:p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all group"
                      title="Limpar conversa"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:text-red-300" />
                    </motion.button>
                  </div>

                  {/* ÁREA DO CHAT - ESTILO CHATGPT */}
                  <div className="bg-gradient-to-b from-black/40 to-black/20 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden shadow-inner">
                    {/* Mensagens */}
                    <div className="h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto chat-scrollbar">
                      {chatMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center p-4">
                          <div className="text-center space-y-3">
                            <Bot className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-purple-400 opacity-50" />
                            <p className="text-gray-400 text-sm sm:text-base">Nenhuma mensagem ainda. Comece a conversar!</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {chatMessages.map((message, index) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "px-3 sm:px-6 py-4 sm:py-6 hover:bg-white/5 transition-colors group",
                                message.role === 'assistant' && "bg-white/5"
                              )}
                            >
                              <div className="max-w-4xl mx-auto">
                                <div className="flex gap-3 sm:gap-4 items-start">
                                  {/* Avatar */}
                                  <div className={cn(
                                    "flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center",
                                    message.role === 'assistant'
                                      ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
                                      : "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
                                  )}>
                                    {message.role === 'assistant' ? (
                                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    ) : (
                                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    )}
                                  </div>

                                  {/* Conteúdo */}
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs sm:text-sm font-bold text-gray-300">
                                        {message.role === 'assistant' ? 'Assistente IA' : 'Você'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {message.timestamp.toLocaleTimeString('pt-BR', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>

                                    <div className="prose prose-invert max-w-none">
                                      <p className="text-sm sm:text-base text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
                                        {message.content}
                                      </p>
                                    </div>

                                    {/* Botão copiar */}
                                    {message.role === 'assistant' && (
                                      <button
                                        onClick={() => handleCopy(message.content)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                                      >
                                        {copied ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            <span>Copiado!</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>Copiar</span>
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}

                          {/* Indicador de digitação */}
                          {isTyping && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="px-3 sm:px-6 py-4 sm:py-6 bg-white/5"
                            >
                              <div className="max-w-4xl mx-auto">
                                <div className="flex gap-3 sm:gap-4 items-start">
                                  <div className="flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs sm:text-sm font-bold text-gray-300">Assistente IA</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          <div ref={chatEndRef} />
                        </div>
                      )}
                    </div>

                    {/* Input - Sticky no bottom */}
                    <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm p-3 sm:p-4">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex gap-2 sm:gap-3 items-end">
                          <div className="flex-1">
                            <textarea
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                              disabled={loading || isTyping}
                              rows={1}
                              className="w-full p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 resize-none text-sm sm:text-base min-h-[44px] max-h-32"
                              style={{
                                height: 'auto',
                                overflowY: chatInput.length > 100 ? 'auto' : 'hidden'
                              }}
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage}
                            disabled={loading || isTyping || !chatInput.trim()}
                            className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl sm:rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50 transition-all min-w-[44px] flex-shrink-0"
                          >
                            {loading || isTyping ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline text-sm">Enviar</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {chatMessages.length} mensagens salvas • Pressione Enter para enviar
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================= */}
              {/* ABA APRIMORAR IMAGEM */}
              {/* ========================================= */}
              {activeTab === 'enhance' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl shadow-lg">
                      <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Aprimorador de Imagens</h2>
                      <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Transforme imagens com IA de última geração</p>
                    </div>
                  </div>

                  {/* SELETOR DE EFEITOS */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3">
                      Escolha o efeito
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                      {enhanceEffects.map(effect => (
                        <motion.button
                          key={effect.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedEffect(effect.id)}
                          className={cn(
                            "p-3 sm:p-4 rounded-xl border-2 transition-all text-left",
                            selectedEffect === effect.id
                              ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          )}
                        >
                          <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{effect.icon}</div>
                          <div className="font-semibold text-xs sm:text-sm mb-1">{effect.name}</div>
                          <div className="text-xs text-gray-400 hidden sm:block">{effect.description}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* ÁREA DE UPLOAD E RESULTADO */}
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-300">
                        Imagem Original
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() => imageInputRef.current?.click()}
                        className="relative aspect-square rounded-xl sm:rounded-2xl border-2 border-dashed border-white/20 hover:border-pink-500 transition-all cursor-pointer group overflow-hidden bg-black/20"
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
                                <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                                <p className="font-semibold text-sm sm:text-base">Trocar imagem</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-pink-400 transition-colors p-4">
                            <Upload className="w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-3" />
                            <p className="font-semibold text-sm sm:text-base">Clique para enviar</p>
                            <p className="text-xs mt-1">JPG, PNG até 10MB</p>
                          </div>
                        )}
                      </motion.div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'enhance')}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-300">
                        Resultado Aprimorado
                      </label>
                      <div className="relative aspect-square rounded-xl sm:rounded-2xl border-2 border-white/10 bg-black/20 overflow-hidden">
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
                              onClick={() => downloadAsset(enhancedImage, 'enhanced-image.png')}
                              disabled={downloadingAssets.has(enhancedImage)}
                              className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-2 sm:p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-50"
                            >
                              {downloadingAssets.has(enhancedImage) ? (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </motion.button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            <div className="text-center p-4">
                              <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
                              <p className="text-xs sm:text-sm">Resultado aparecerá aqui</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTÃO */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnhanceImage}
                    disabled={loading || !imageFile}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-2xl hover:shadow-pink-500/50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        <span className="text-sm sm:text-base">Processando...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-base">Aprimorar Imagem</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* ========================================= */}
              {/* ABA ÁUDIO PARA TEXTO */}
              {/* ========================================= */}
              {activeTab === 'stt' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl shadow-lg">
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Áudio para Texto</h2>
                      <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Transcrição instantânea com precisão perfeita</p>
                    </div>
                  </div>

                  {/* UPLOAD */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3">
                      Arquivo de áudio
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      onClick={() => audioInputRef.current?.click()}
                      className="rounded-xl sm:rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-500 transition-all cursor-pointer p-6 sm:p-10 text-center bg-black/20 group"
                    >
                      {audioFile ? (
                        <div className="space-y-2">
                          <FileAudio className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-emerald-400" />
                          <p className="font-semibold text-sm sm:text-base break-all">{audioFile.name}</p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-gray-400 group-hover:text-emerald-400 transition-colors">
                          <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" />
                          <p className="font-semibold text-sm sm:text-base">Clique para enviar áudio</p>
                          <p className="text-xs sm:text-sm">MP3, WAV, M4A até 25MB</p>
                        </div>
                      )}
                    </motion.div>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </div>

                  {/* TRANSCRIÇÃO */}
                  {transcription && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/30"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                          <FileAudio className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                          Transcrição
                        </h3>
                        <button
                          onClick={() => handleCopy(transcription)}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-300 text-sm sm:text-base">
                        {transcription}
                      </p>
                    </motion.div>
                  )}

                  {/* BOTÃO */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSpeechToText}
                    disabled={loading || !audioFile}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-2xl hover:shadow-emerald-500/50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        <span className="text-sm sm:text-base">Transcrevendo...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-base">Transcrever Áudio</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* ========================================= */}
              {/* ABA REMOVER FUNDO */}
              {/* ========================================= */}
              {activeTab === 'remove-bg' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg">
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Remover Fundo</h2>
                      <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Remoção profissional em segundos</p>
                    </div>
                  </div>

                  {/* UPLOAD E RESULTADO */}
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-300">
                        Imagem Original
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() => removeBgInputRef.current?.click()}
                        className="relative aspect-square rounded-xl sm:rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500 transition-all cursor-pointer group overflow-hidden bg-black/20"
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
                                <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                                <p className="font-semibold text-sm sm:text-base">Trocar imagem</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors p-4">
                            <Upload className="w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-3" />
                            <p className="font-semibold text-sm sm:text-base">Clique para enviar</p>
                            <p className="text-xs mt-1">JPG, PNG até 10MB</p>
                          </div>
                        )}
                      </motion.div>
                      <input
                        ref={removeBgInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'remove-bg')}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-300">
                        Sem Fundo
                      </label>
                      <div className="relative aspect-square rounded-xl sm:rounded-2xl border-2 border-white/10 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 overflow-hidden">
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
                              className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white shadow-2xl hover:shadow-blue-500/50 transition-all disabled:opacity-50"
                            >
                              {downloadingAssets.has(removeBgResult) ? (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </motion.button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            <div className="text-center p-4">
                              <Camera className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
                              <p className="text-xs sm:text-sm">Resultado aparecerá aqui</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTÃO */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemoveBackground}
                    disabled={loading || !removeBgImage}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-2xl hover:shadow-blue-500/50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        <span className="text-sm sm:text-base">Removendo...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-base">Remover Fundo</span>
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
          className="text-center mt-8 sm:mt-12 space-y-4"
        >
          <div className="flex justify-center gap-2 sm:gap-3">
            {[
              { icon: Share2, color: 'hover:text-blue-400' },
              { icon: Heart, color: 'hover:text-red-400' },
              { icon: Star, color: 'hover:text-yellow-400' }
            ].map((item, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className={cn("p-2 sm:p-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 transition-all", item.color)}
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Feito com 💜 por AI Studio Pro
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
        }

        /* SCROLLBAR CUSTOMIZADO ESTILO CHATGPT */
        .chat-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }

        .chat-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: content-box;
        }

        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
          background-clip: content-box;
        }

        /* HIDE SCROLLBAR */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
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

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.6);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .hover-float:hover {
          animation: float 2s ease-in-out infinite;
        }

        .glow-effect {
          animation: glow 3s ease-in-out infinite;
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        html {
          scroll-behavior: smooth;
        }

        button, .cursor-pointer {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        /* RESPONSIVIDADE MOBILE PERFEITA */
        @media (max-width: 640px) {
          .text-3xl {
            font-size: 1.875rem !important;
            line-height: 2.25rem !important;
          }

          .text-5xl {
            font-size: 2.5rem !important;
            line-height: 1.2 !important;
          }

          .text-7xl {
            font-size: 3rem !important;
            line-height: 1.2 !important;
          }

          /* Ajustes de toque para mobile */
          button, a, input, textarea {
            min-height: 44px;
            min-width: 44px;
          }

          /* Prevenir zoom em input focus no iOS */
          input, textarea, select {
            font-size: 16px !important;
          }
        }

        /* ANIMAÇÃO SUAVE PARA MENSAGENS */
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* MELHOR SELEÇÃO DE TEXTO */
        ::selection {
          background-color: rgba(139, 92, 246, 0.3);
          color: white;
        }

        ::-moz-selection {
          background-color: rgba(139, 92, 246, 0.3);
          color: white;
        }
      `}</style>
    </div>
  )
}