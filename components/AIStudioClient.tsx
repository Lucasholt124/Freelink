'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Mic, MessageSquare, Video, Upload, Download, Loader2, Wand2, Copy, Check,
   Zap, Crown, FileAudio, Heart, Star, Rocket, Send,
  Camera, Film, Brain, Bot, Share2, TrendingUp, DollarSign, Target,
  Lightbulb,  CheckCircle, Globe, Megaphone, ShoppingBag, Code, Briefcase
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// =================================================================
// 🎯 CONFIGURAÇÃO REVOLUCIONÁRIA DE ABAS
// =================================================================
const tabs = [
  {
    id: 'enhance',
    label: 'Aprimorar Imagem',
    icon: Wand2,
    color: 'from-purple-600 to-pink-600',
    description: 'Transforme suas imagens em obras de arte com IA'
  },
  {
    id: 'chat',
    label: 'Chat Marketing',
    icon: MessageSquare,
    color: 'from-blue-600 to-cyan-600',
    description: 'Gênio do marketing digital ao seu dispor'
  },
  {
    id: 'stt',
    label: 'Voz → Texto',
    icon: Mic,
    color: 'from-green-600 to-emerald-600',
    description: 'Transcreva áudios com precisão absoluta'
  },
  {
    id: 'video',
    label: 'Buscar Vídeos',
    icon: Video,
    color: 'from-orange-600 to-red-600',
    description: 'Encontre vídeos perfeitos para seu projeto'
  },
  {
    id: 'remove-bg',
    label: 'Remover Fundo',
    icon: Camera,
    color: 'from-indigo-600 to-purple-600',
    description: 'Remova fundos de imagens instantaneamente'
  },
];

// =================================================================
// 🎨 EFEITOS DE APRIMORAMENTO REVOLUCIONÁRIOS
// =================================================================
const enhanceEffects = [
  {
    id: 'super-resolution',
    name: '🚀 Super Resolução 4K',
    description: 'Aumente 4x com qualidade cinematográfica',
    power: 100
  },
  {
    id: 'ai-enhance',
    name: '✨ IA Aprimoramento Total',
    description: 'Melhoria completa com múltiplas IAs',
    power: 95
  },
  {
    id: 'professional',
    name: '📸 Qualidade Profissional',
    description: 'Padrão de estúdio fotográfico',
    power: 90
  },
  {
    id: 'denoise-sharpen',
    name: '🎯 Nitidez Extrema',
    description: 'Remove ruído e aumenta detalhes',
    power: 85
  },
  {
    id: 'color-boost',
    name: '🌈 Cores Vibrantes HDR',
    description: 'Cores cinematográficas vibrantes',
    power: 80
  },
  {
    id: 'restore',
    name: '🔮 Restauração Mágica',
    description: 'Restaura fotos antigas e danificadas',
    power: 88
  },
];

// =================================================================
// 💬 TEMPLATES DE CHAT MARKETING
// =================================================================
const chatTemplates = [
  { id: 'copy', label: '✍️ Copywriting', icon: Code },
  { id: 'strategy', label: '📈 Estratégia', icon: TrendingUp },
  { id: 'social', label: '📱 Social Media', icon: Globe },
  { id: 'ads', label: '💰 Anúncios', icon: DollarSign },
  { id: 'email', label: '📧 E-mail Marketing', icon: Megaphone },
  { id: 'seo', label: '🔍 SEO', icon: Target },
  { id: 'content', label: '📝 Conteúdo', icon: Briefcase },
  { id: 'ecommerce', label: '🛒 E-commerce', icon: ShoppingBag },
];

// =================================================================
// 💬 MENSAGEM DO CHAT
// =================================================================
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

// =================================================================
// 🎯 COMPONENTE PRINCIPAL REVOLUCIONÁRIO
// =================================================================
export function AIStudioClient() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('enhance')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedEffect, setSelectedEffect] = useState('super-resolution')
  const [showTutorial, setShowTutorial] = useState(true)
  const [enhanceStrength, setEnhanceStrength] = useState(100)

  // Estados do Chat Marketing
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Olá! Sou seu Gênio do Marketing Digital! 🚀\n\nPosso ajudar você com:\n• 📝 Copywriting que converte\n• 📊 Estratégias de marketing\n• 💰 Anúncios que vendem\n• 📱 Conteúdo viral\n• 🎯 SEO e tráfego\n\nComo posso revolucionar seu marketing hoje?',
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Estados principais existentes
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [enhancedImage, setEnhancedImage] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState('')
  const [videoPrompt, setVideoPrompt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [removeBgImage, setRemoveBgImage] = useState('')
  const [removeBgResult, setRemoveBgResult] = useState('')

  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const removeBgInputRef = useRef<HTMLInputElement>(null)

  // Actions
  const enhanceImageAction = useAction(api.aiStudio.enhanceImage)
  const chatWithAIAction = useAction(api.aiStudio.chatWithMarketing)
  const speechToTextAction = useAction(api.aiStudio.speechToText)
  const generateVideoAction = useAction(api.aiStudio.generateVideo)
  const removeBackgroundAction = useAction(api.aiStudio.removeBackground)

  // =================================================================
  // 💬 FUNÇÕES DO CHAT MARKETING
  // =================================================================

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

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
      const context = selectedTemplate ? `Como especialista em ${selectedTemplate}, ` : ''
      const result = await chatWithAIAction({
        userId: user.id,
        message: context + chatInput,
        context: selectedTemplate
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

  const handleTemplateClick = (template: string) => {
    setSelectedTemplate(template)
    let promptSuggestion = ''

    switch(template) {
      case 'copy':
        promptSuggestion = 'Crie um copy persuasivo para...'
        break
      case 'strategy':
        promptSuggestion = 'Desenvolva uma estratégia de marketing para...'
        break
      case 'social':
        promptSuggestion = 'Crie um calendário de conteúdo para Instagram sobre...'
        break
      case 'ads':
        promptSuggestion = 'Escreva um anúncio do Facebook para...'
        break
      case 'email':
        promptSuggestion = 'Crie uma sequência de e-mails para...'
        break
      case 'seo':
        promptSuggestion = 'Otimize o SEO para...'
        break
      case 'content':
        promptSuggestion = 'Crie um roteiro de vídeo sobre...'
        break
      case 'ecommerce':
        promptSuggestion = 'Crie uma descrição de produto para...'
        break
    }

    setChatInput(promptSuggestion)
  }

  // =================================================================
  // 🎨 FUNÇÃO MELHORADA DE UPLOAD DE IMAGEM
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
          toast.success('📸 Imagem carregada! Pronta para aprimoramento.')
        } else {
          setRemoveBgImage(result)
          toast.success('📸 Imagem carregada! Pronta para remover fundo.')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // =================================================================
  // 🚀 FUNÇÃO REVOLUCIONÁRIA DE APRIMORAMENTO
  // =================================================================
  const handleEnhanceImage = async () => {
    if (!imageFile || !user) {
      toast.error('📸 Por favor, envie uma imagem primeiro!')
      return
    }

    setLoading(true)
    const startTime = Date.now()

    try {
      // Mostrar progresso
      toast.loading('🎨 Aplicando inteligência artificial...')

      const result = await enhanceImageAction({
        userId: user.id,
        imageFile: await fileToBase64(imageFile),
        effect: selectedEffect,
        strength: enhanceStrength
      })

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1)

      if (result.success) {
        setEnhancedImage(result.url!)
        toast.dismiss()
        toast.success(
          <div>
            <p className="font-bold">🎉 Imagem Aprimorada com Sucesso!</p>
            <p className="text-sm">Processado em {processingTime}s com {selectedEffect}</p>
          </div>
        )

        // Efeito de confete
        const confettiColors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B']
        for(let i = 0; i < 50; i++) {
          setTimeout(() => {
            const confetti = document.createElement('div')
            confetti.className = 'confetti'
            confetti.style.left = Math.random() * 100 + '%'
            confetti.style.animationDelay = Math.random() * 3 + 's'
            confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)]
            document.body.appendChild(confetti)
            setTimeout(() => confetti.remove(), 3000)
          }, i * 30)
        }
      } else {
        toast.error(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao processar imagem')
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

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error('Arquivo muito grande! Máximo 25MB.')
        return
      }
      setAudioFile(file)
      toast.success('📁 Arquivo de áudio carregado!')
    }
  }

  const handleSpeechToText = async () => {
    if (!audioFile || !user) {
      toast.error('🎤 Envie um arquivo de áudio primeiro!')
      return
    }

    setLoading(true)
    try {
      const audioBase64 = await fileToBase64(audioFile)
      const result = await speechToTextAction({
        userId: user.id,
        audioUrl: audioBase64
      })

      if (result.success) {
        setTranscription(result.text!)
        toast.success('📝 Áudio transcrito com sucesso!')
      } else {
        toast.error(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao transcrever áudio')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateVideo = async () => {
    if (!videoPrompt || !user) {
      toast.error('🎬 Descreva o vídeo que procura!')
      return
    }

    setLoading(true)
    try {
      const result = await generateVideoAction({
        userId: user.id,
        prompt: videoPrompt
      })

      if (result.success) {
        setVideoUrl(result.url!)
        toast.success('🎥 Vídeo HD encontrado!')
      } else {
        toast.error(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao buscar vídeo')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBackground = async () => {
    if (!removeBgImage || !user) {
      toast.error('📸 Envie uma imagem primeiro!')
      return
    }

    setLoading(true)
    try {
      const result = await removeBackgroundAction({
        userId: user.id,
        imageUrl: removeBgImage
      })

      if (result.success) {
        setRemoveBgResult(result.url!)
        toast.success('✨ Fundo removido com perfeição!')
      } else {
        toast.error(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao remover fundo')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('📋 Copiado para área de transferência!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsset = async (url: string, filename: string) => {
    try {
      toast.loading('Preparando download...')
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(blobUrl)
      a.remove()
      toast.dismiss()
      toast.success('✅ Download concluído!')
    } catch (error) {
      console.error('Erro no download:', error)
      toast.error('Erro ao baixar arquivo')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* EFEITOS DE FUNDO ANIMADOS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-10 w-72 h-72 bg-purple-600/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -right-10 w-96 h-96 bg-pink-600/30 rounded-full blur-[100px] animate-pulse delay-700" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-600/30 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* CONTAINER PRINCIPAL */}
      <div className="relative z-10 container mx-auto px-4 py-6 md:py-12 max-w-7xl">

        {/* HEADER REVOLUCIONÁRIO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-16"
        >
          {/* BADGE PREMIUM */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-6 backdrop-blur-sm"
          >
            <Rocket className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-sm font-bold text-purple-300 uppercase tracking-wider">Revolucionário</span>
            <Crown className="w-5 h-5 text-yellow-400 animate-pulse" />
          </motion.div>

          {/* TÍTULO ÉPICO */}
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-7xl lg:text-8xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 leading-tight"
          >
            AI Studio Pro
          </motion.h1>

          {/* SUBTÍTULO */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            A ferramenta de IA mais poderosa do mundo.
            <span className="block text-purple-400 font-semibold mt-2">
              Transforme suas ideias em realidade! 🚀
            </span>
          </motion.p>

          {/* ESTATÍSTICAS IMPRESSIONANTES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8"
          >
            {[
              { label: 'Usuários Ativos', value: '1M+', icon: Heart },
              { label: 'Projetos Criados', value: '10M+', icon: Star },
              { label: 'Taxa de Sucesso', value: '99.9%', icon: Zap },
              { label: 'Velocidade', value: '< 1s', icon: Rocket },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
              >
                <stat.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* TUTORIAL INTERATIVO */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl border border-purple-500/30 backdrop-blur-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  Como usar esta ferramenta revolucionária
                </h3>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    whileHover={{ y: -5 }}
                    className="text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm font-semibold text-gray-300">{tab.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{tab.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAVEGAÇÃO DE ABAS REVOLUCIONÁRIA */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 md:mb-12">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 rounded-2xl font-medium transition-all duration-300 group",
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl`
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600"
              )}
            >
              <tab.icon className={cn(
                "w-5 h-5 transition-transform",
                activeTab === tab.id && "animate-pulse"
              )} />
              <span className="hidden sm:inline font-semibold">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"
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
            className="max-w-5xl mx-auto"
          >
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-6 md:p-10 shadow-2xl">

              {/* ABA APRIMORAR IMAGEM - REVOLUCIONÁRIA */}
              {activeTab === 'enhance' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <Wand2 className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      Aprimorador de Imagens com IA
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      Tecnologia de ponta com múltiplas IAs para resultados perfeitos
                    </p>
                  </div>

                  {/* SELETOR DE EFEITOS REVOLUCIONÁRIO */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      ⚡ Escolha o poder do aprimoramento
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {enhanceEffects.map(effect => (
                        <motion.button
                          key={effect.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedEffect(effect.id)}
                          className={cn(
                            "relative p-4 rounded-xl border-2 transition-all text-left overflow-hidden",
                            selectedEffect === effect.id
                              ? "border-purple-500 bg-purple-500/20"
                              : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                          )}
                        >
                          {selectedEffect === effect.id && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ repeat: Infinity, duration: 3 }}
                            />
                          )}
                          <div className="relative">
                            <div className="font-semibold text-white mb-1">{effect.name}</div>
                            <div className="text-xs text-gray-400">{effect.description}</div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="text-xs text-purple-400">Poder:</div>
                              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${effect.power}%` }}
                                  transition={{ duration: 1 }}
                                />
                              </div>
                              <div className="text-xs text-white font-bold">{effect.power}%</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* CONTROLE DE INTENSIDADE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      🎯 Intensidade do Aprimoramento: {enhanceStrength}%
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={enhanceStrength}
                        onChange={(e) => setEnhanceStrength(Number(e.target.value))}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #8B5CF6 0%, #EC4899 ${enhanceStrength}%, #374151 ${enhanceStrength}%, #374151 100%)`
                        }}
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-500">Sutil</span>
                        <span className="text-xs text-gray-500">Moderado</span>
                        <span className="text-xs text-gray-500">Máximo</span>
                      </div>
                    </div>
                  </div>

                  {/* ÁREA DE UPLOAD E RESULTADO */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        📤 Enviar Imagem
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => imageInputRef.current?.click()}
                        className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-600 hover:border-purple-500 transition-all cursor-pointer group overflow-hidden bg-gray-800/50"
                      >
                        {imagePreview ? (
                          <>
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill={true}
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white font-semibold">Clique para trocar</p>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
                            <Upload className="w-12 h-12 mb-3" />
                            <p className="font-semibold">Clique ou arraste</p>
                            <p className="text-sm">JPG, PNG até 10MB</p>
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

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        ✨ Resultado Aprimorado
                      </label>
                      <div className="relative aspect-square rounded-2xl border-2 border-gray-700 bg-gray-800/50 overflow-hidden">
                        {enhancedImage ? (
                          <>
                            <Image
                              src={enhancedImage}
                              alt="Enhanced"
                              fill={true}
                              className="object-cover"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => downloadAsset(enhancedImage, 'enhanced-image-4k.png')}
                              className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white shadow-lg hover:shadow-xl transition-shadow"
                            >
                              <Download className="w-5 h-5" />
                            </motion.button>
                            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Aprimorado
                            </div>
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

                  {/* BOTÃO DE AÇÃO ÉPICO */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnhanceImage}
                    disabled={loading || !imageFile}
                    className="relative w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                        <span className="relative z-10">Aplicando IA Avançada...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-6 h-6 relative z-10" />
                        <span className="relative z-10">Aprimorar com IA!</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* ABA CHAT MARKETING - REVOLUCIONÁRIA */}
              {activeTab === 'chat' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      Gênio do Marketing Digital
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      IA especializada em estratégias de marketing que convertem
                    </p>
                  </div>

                  {/* TEMPLATES RÁPIDOS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      🎯 Especialidades (clique para ativar)
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {chatTemplates.map(template => (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTemplateClick(template.id)}
                          className={cn(
                            "p-3 rounded-xl border transition-all",
                            selectedTemplate === template.id
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                          )}
                        >
                          <template.icon className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                          <p className="text-xs text-gray-300">{template.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* ÁREA DO CHAT */}
                  <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                    {/* Mensagens */}
                    <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                      {chatMessages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] p-4 rounded-2xl",
                            message.role === 'user'
                              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                              : "bg-gray-700/50 border border-gray-600"
                          )}>
                            {message.role === 'assistant' && (
                              <div className="flex items-center gap-2 mb-2">
                                <Bot className="w-5 h-5 text-blue-400" />
                                <span className="text-sm font-semibold text-blue-400">
                                  Marketing Genius
                                </span>
                              </div>
                            )}
                            <p className="whitespace-pre-wrap text-sm md:text-base">
                              {message.content}
                            </p>
                            {message.role === 'assistant' && (
                              <button
                                onClick={() => handleCopy(message.content)}
                                className="mt-2 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                Copiar resposta
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
                          <div className="bg-gray-700/50 border border-gray-600 p-4 rounded-2xl">
                            <div className="flex items-center gap-2">
                              <Bot className="w-5 h-5 text-blue-400 animate-pulse" />
                              <div className="flex gap-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input de mensagem */}
                    <div className="border-t border-gray-700 p-4">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Digite sua pergunta sobre marketing..."
                          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendMessage}
                          disabled={loading || !chatInput.trim()}
                          className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Sugestões:</span>
                        {[
                          'Como criar um copy que converte?',
                          'Estratégia para Instagram',
                          'Melhores horários para postar',
                          'Como aumentar engajamento?'
                        ].map(suggestion => (
                          <button
                            key={suggestion}
                            onClick={() => setChatInput(suggestion)}
                            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dicas de uso */}
                  <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl p-4 border border-blue-500/30">
                    <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Dicas para melhores resultados:
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Seja específico sobre seu nicho e público-alvo</li>
                      <li>• Peça exemplos práticos e casos de uso</li>
                      <li>• Solicite métricas e KPIs relevantes</li>
                      <li>• Use os templates para respostas especializadas</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ABA VOZ PARA TEXTO */}
              {activeTab === 'stt' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <Mic className="w-16 h-16 mx-auto mb-4 text-green-400 animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      Transcritor de Áudio com IA
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      Converta áudios em texto com precisão impressionante
                    </p>
                  </div>

                  {/* ÁREA DE UPLOAD */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      🎙️ Enviar arquivo de áudio
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => audioInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-gray-600 hover:border-green-500 transition-all cursor-pointer p-8 text-center bg-gray-800/50 group"
                    >
                      {audioFile ? (
                        <div className="space-y-2">
                          <FileAudio className="w-12 h-12 mx-auto text-green-400" />
                          <p className="text-white font-semibold">{audioFile.name}</p>
                          <p className="text-sm text-gray-400">
                            {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-gray-400 group-hover:text-green-400 transition-colors">
                          <Upload className="w-12 h-12 mx-auto" />
                          <p className="font-semibold">Clique para enviar áudio</p>
                          <p className="text-sm">MP3, WAV, M4A até 25MB</p>
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

                  {/* RESULTADO DA TRANSCRIÇÃO */}
                  {transcription && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-2xl p-6 border border-green-500/30"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-semibold">📝 Transcrição</h3>
                        <button
                          onClick={() => handleCopy(transcription)}
                          className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-white whitespace-pre-wrap leading-relaxed">
                        {transcription}
                      </p>
                    </motion.div>
                  )}

                  {/* BOTÃO DE AÇÃO */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSpeechToText}
                    disabled={loading || !audioFile}
                    className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Transcrevendo...
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6" />
                        Transcrever Áudio!
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* ABA BUSCAR VÍDEOS */}
              {activeTab === 'video' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <Film className="w-16 h-16 mx-auto mb-4 text-orange-400 animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      Buscador Inteligente de Vídeos
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      Encontre vídeos profissionais em HD para seus projetos
                    </p>
                  </div>

                  {/* CAMPO DE BUSCA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      🔍 O que você procura?
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="Ex: Pôr do sol na praia, cidade futurista, natureza..."
                        className="w-full p-4 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                      />
                      <Video className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['Natureza', 'Tecnologia', 'Cidade', 'Oceano', 'Montanhas', 'Espaço'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setVideoPrompt(tag)}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PLAYER DE VÍDEO */}
                  {videoUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl overflow-hidden border border-gray-700"
                    >
                      <video
                        controls
                        key={videoUrl}
                        className="w-full"
                        src={videoUrl}
                      />
                      <div className="p-4 bg-gray-800/50 flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">Vídeo HD Encontrado</p>
                          <p className="text-sm text-gray-400">Pronto para download</p>
                        </div>
                        <button
                          onClick={() => downloadAsset(videoUrl, 'video.mp4')}
                          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg text-white font-semibold hover:shadow-lg transition-shadow flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Baixar HD
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* BOTÃO DE AÇÃO */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateVideo}
                    disabled={loading || !videoPrompt}
                    className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Buscando vídeos...
                      </>
                    ) : (
                      <>
                        <Video className="w-6 h-6" />
                        Buscar Vídeo HD!
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* ABA REMOVER FUNDO */}
              {activeTab === 'remove-bg' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-indigo-400 animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      Removedor de Fundo com IA
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      Remova fundos de imagens instantaneamente com precisão perfeita
                    </p>
                  </div>

                  {/* ÁREA DE UPLOAD E RESULTADO */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        📤 Imagem Original
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => removeBgInputRef.current?.click()}
                        className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-all cursor-pointer group overflow-hidden bg-gray-800/50"
                      >
                        {removeBgImage ? (
                          <>
                            <Image
                              src={removeBgImage}
                              alt="Original"
                              fill={true}
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white font-semibold">Clique para trocar</p>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-indigo-400 transition-colors">
                            <Upload className="w-12 h-12 mb-3" />
                            <p className="font-semibold">Enviar imagem</p>
                            <p className="text-sm">JPG, PNG até 10MB</p>
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

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        ✨ Sem Fundo
                      </label>
                      <div className="relative aspect-square rounded-2xl border-2 border-gray-700 bg-gray-800/50 overflow-hidden">
                        {removeBgResult ? (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                            <Image
                              src={removeBgResult}
                              alt="No Background"
                              fill={true}
                              className="object-contain"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => downloadAsset(removeBgResult, 'no-background.png')}
                              className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl transition-shadow"
                            >
                              <Download className="w-5 h-5" />
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

                  {/* BOTÃO DE AÇÃO */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemoveBackground}
                    disabled={loading || !removeBgImage}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Removendo fundo...
                      </>
                    ) : (
                      <>
                        <Camera className="w-6 h-6" />
                        Remover Fundo!
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* FOOTER INSPIRADOR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 space-y-4"
        >
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-3 bg-gray-800/50 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-3 bg-gray-800/50 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-700/50 transition-all"
            >
              <Heart className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-3 bg-gray-800/50 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-gray-700/50 transition-all"
            >
              <Star className="w-5 h-5" />
            </motion.button>
          </div>
          <p className="text-gray-400 text-sm">
            Feito com 💜 para revolucionar o mundo
          </p>
          <p className="text-xs text-gray-600">
            © 2025 AI Studio Pro - Transformando ideias em realidade
          </p>
        </motion.div>
      </div>

      {/* CSS ADICIONAL PARA ANIMAÇÕES */}
      <style jsx global>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }

        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear forwards;
          z-index: 9999;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(to right, #8B5CF6, #EC4899);
          border-radius: 50%;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(to right, #8B5CF6, #EC4899);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}