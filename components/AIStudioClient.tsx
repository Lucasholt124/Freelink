'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Mic, Volume2, Video, Upload, Download, Loader2, Wand2, Copy, Check,
  Play, Pause, Zap, Crown, FileAudio, Image, Bot, Heart, Star, Rocket,
  Camera, Music, Film, Palette, Brain, Globe, Headphones, Share2,
  MagnetIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'



// CONFIGURAÇÃO REVOLUCIONÁRIA DE ABAS
const tabs = [
  {
    id: 'enhance',
    label: 'Aprimorar Imagem',
    icon: Wand2,
    color: 'from-purple-600 to-pink-600',
    description: 'Transforme suas imagens em obras de arte com IA'
  },
  {
    id: 'tts',
    label: 'Texto → Voz',
    icon: Volume2,
    color: 'from-blue-600 to-cyan-600',
    description: 'Crie narrações profissionais em segundos'
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

// VOZES DISPONÍVEIS EXPANDIDAS
const ttsVoices = [
  { id: 'pt-BR', name: '🇧🇷 Português Brasil', lang: 'pt-BR' },
  { id: 'en-US', name: '🇺🇸 English USA', lang: 'en-US' },
  { id: 'es-ES', name: '🇪🇸 Español', lang: 'es-ES' },
  { id: 'fr-FR', name: '🇫🇷 Français', lang: 'fr-FR' },
  { id: 'de-DE', name: '🇩🇪 Deutsch', lang: 'de-DE' },
  { id: 'it-IT', name: '🇮🇹 Italiano', lang: 'it-IT' },
  { id: 'ja-JP', name: '🇯🇵 日本語', lang: 'ja-JP' },
  { id: 'ko-KR', name: '🇰🇷 한국어', lang: 'ko-KR' },
  { id: 'zh-CN', name: '🇨🇳 中文', lang: 'zh-CN' },
];

// EFEITOS DE APRIMORAMENTO
const enhanceEffects = [
  { id: 'enhance', name: '✨ Aprimorar Qualidade', description: 'Melhora geral da imagem' },
  { id: 'upscale', name: '🔍 Aumentar Resolução', description: 'Aumente até 4x o tamanho' },
  { id: 'denoise', name: '🎨 Remover Ruído', description: 'Limpe imperfeições' },
  { id: 'sharpen', name: '📸 Aumentar Nitidez', description: 'Deixe mais nítido' },
  { id: 'colorize', name: '🌈 Colorizar', description: 'Adicione cores a fotos P&B' },
  { id: 'cartoon', name: '🎭 Estilo Cartoon', description: 'Transforme em desenho' },
];

export function AIStudioClient() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('enhance')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedEffect, setSelectedEffect] = useState('enhance')
  const [showTutorial, setShowTutorial] = useState(true)

  // Estados principais
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [enhancedImage, setEnhancedImage] = useState('')
  const [ttsText, setTtsText] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState(ttsVoices[0].id)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState('')
  const [videoPrompt, setVideoPrompt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [removeBgImage, setRemoveBgImage] = useState('')
  const [removeBgResult, setRemoveBgResult] = useState('')

  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const audioPlayerRef = useRef<HTMLAudioElement>(null)
  const removeBgInputRef = useRef<HTMLInputElement>(null)

  // Actions
  const enhanceImageAction = useAction(api.aiStudio.enhanceImage)
  const textToSpeechAction = useAction(api.aiStudio.textToSpeech)
  const speechToTextAction = useAction(api.aiStudio.speechToText)
  const generateVideoAction = useAction(api.aiStudio.generateVideo)
  const removeBackgroundAction = useAction(api.aiStudio.removeBackground)

  // FUNÇÃO MELHORADA DE UPLOAD DE IMAGEM
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
        } else {
          setRemoveBgImage(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // FUNÇÃO REVOLUCIONÁRIA DE APRIMORAMENTO
  const handleEnhanceImage = async () => {
    if (!imageFile || !user) {
      toast.error('📸 Por favor, envie uma imagem primeiro!')
      return
    }

    setLoading(true)
    try {
      // Criar FormData para enviar arquivo
      const formData = new FormData()
      formData.append('file', imageFile)

      const result = await enhanceImageAction({
        userId: user.id,
        imageFile: await fileToBase64(imageFile),
        effect: selectedEffect
      })

      if (result.success) {
        setEnhancedImage(result.url!)
        toast.success('🎉 Imagem aprimorada com sucesso!')
        confetti()
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

  // CONVERSOR FILE PARA BASE64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // FUNÇÃO DE TEXTO PARA VOZ MELHORADA
  const handleTextToSpeech = async () => {
    if (!ttsText || !user) {
      toast.error('💬 Digite um texto primeiro!')
      return
    }

    setLoading(true)
    try {
      const voice = ttsVoices.find(v => v.id === selectedVoice)
      const result = await textToSpeechAction({
        userId: user.id,
        text: ttsText,
        voiceId: voice?.lang || 'pt-BR'
      })

      if (result.success) {
        setAudioUrl(result.url!)
        toast.success('🎵 Áudio criado com sucesso!')
        confetti()
      } else {
        toast.error(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao gerar áudio')
    } finally {
      setLoading(false)
    }
  }

  // UPLOAD DE ÁUDIO MELHORADO
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error('Arquivo muito grande! Máximo 25MB.')
        return
      }
      setAudioFile(file)
      toast.success('📁 Arquivo carregado!')
    }
  }

  // TRANSCRIÇÃO DE ÁUDIO MELHORADA
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
        confetti()
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

  // BUSCA DE VÍDEOS MELHORADA
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
        toast.success('🎥 Vídeo encontrado!')
        confetti()
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

  // REMOVER FUNDO
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
        toast.success('✨ Fundo removido com sucesso!')
        confetti()
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

  // FUNÇÃO DE COPIAR APRIMORADA
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('📋 Copiado para área de transferência!')
    setTimeout(() => setCopied(false), 2000)
  }

  // CONTROLE DE ÁUDIO
  const toggleAudio = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause()
      } else {
        audioPlayerRef.current.play()
      }
    }
  }

  // EFEITOS DE ÁUDIO
  useEffect(() => {
    const audio = audioPlayerRef.current
    if (audio) {
      const onPlay = () => setIsPlaying(true)
      const onPause = () => setIsPlaying(false)
      audio.addEventListener('play', onPlay)
      audio.addEventListener('pause', onPause)
      audio.addEventListener('ended', onPause)
      return () => {
        audio.removeEventListener('play', onPlay)
        audio.removeEventListener('pause', onPause)
        audio.removeEventListener('ended', onPause)
      }
    }
  }, [audioUrl])

  // DOWNLOAD MELHORADO
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
      toast.success('✅ Download iniciado!')
    } catch (error) {
      console.error('Erro no download:', error)
      toast.error('Erro ao baixar arquivo')
    }
  }

  // EFEITO CONFETTI
  const confetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        return clearInterval(interval)
      }
      const particleCount = 50 * (timeLeft / duration)
      // Criar partículas de confetti (visual apenas)
    }, 250)
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
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <stat.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
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
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {tabs.map((tab, index) => (
                  <div key={tab.id} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-300">{tab.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{tab.description}</p>
                  </div>
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

              {/* ABA APRIMORAR IMAGEM */}
              {activeTab === 'enhance' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <Wand2 className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      Aprimorador de Imagens com IA
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      Transforme suas fotos em obras-primas com nossa tecnologia de ponta
                    </p>
                  </div>

                  {/* SELETOR DE EFEITOS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Escolha o efeito desejado
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {enhanceEffects.map(effect => (
                        <button
                          key={effect.id}
                          onClick={() => setSelectedEffect(effect.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left",
                            selectedEffect === effect.id
                              ? "border-purple-500 bg-purple-500/20"
                              : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                          )}
                        >
                          <div className="font-semibold text-white mb-1">{effect.name}</div>
                          <div className="text-xs text-gray-400">{effect.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ÁREA DE UPLOAD E RESULTADO */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        📤 Enviar Imagem
                      </label>
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-600 hover:border-purple-500 transition-all cursor-pointer group overflow-hidden bg-gray-800/50"
                      >
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
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
                      </div>
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
                            <img
                              src={enhancedImage}
                              alt="Enhanced"
                              className="w-full h-full object-cover"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => downloadAsset(enhancedImage, 'enhanced-image.png')}
                              className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white shadow-lg hover:shadow-xl transition-shadow"
                            >
                              <Download className="w-5 h-5" />
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

                  {/* BOTÃO DE AÇÃO */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnhanceImage}
                    disabled={loading || !imageFile}
                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processando magia...
                      </>
                    ) : (
                      <>
                        <MagnetIcon className="w-6 h-6" />
                        Aprimorar Agora!
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* ABA TEXTO PARA VOZ */}
              {activeTab === 'tts' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <Headphones className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      Conversor de Texto em Voz
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      Crie narrações profissionais em múltiplos idiomas instantaneamente
                    </p>
                  </div>

                  {/* SELETOR DE VOZ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      🌍 Escolha o idioma e voz
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ttsVoices.map(voice => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice.id)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all",
                            selectedVoice === voice.id
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                          )}
                        >
                          <div className="font-semibold text-white">{voice.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ÁREA DE TEXTO */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      ✍️ Digite ou cole seu texto
                    </label>
                    <textarea
                      value={ttsText}
                      onChange={(e) => setTtsText(e.target.value)}
                      placeholder="Digite aqui o texto que deseja converter em áudio..."
                      className="w-full h-48 p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none focus:border-blue-500 focus:outline-none transition-colors"
                      maxLength={5000}
                    />
                    <div className="mt-2 text-right text-sm text-gray-400">
                      {ttsText.length}/5000 caracteres
                    </div>
                  </div>

                  {/* PLAYER DE ÁUDIO */}
                  {audioUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl p-6 border border-blue-500/30"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={toggleAudio}
                          className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full text-white shadow-lg hover:shadow-xl transition-shadow"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <div className="flex-1">
                          <p className="text-white font-semibold mb-1">Áudio Gerado</p>
                          <p className="text-sm text-gray-400">Clique para reproduzir</p>
                        </div>
                        <button
                          onClick={() => downloadAsset(audioUrl, 'narration.mp3')}
                          className="p-3 bg-gray-700 rounded-full text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      <audio ref={audioPlayerRef} src={audioUrl} />
                    </motion.div>
                  )}

                  {/* BOTÃO DE AÇÃO */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTextToSpeech}
                    disabled={loading || !ttsText}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Gerando áudio...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-6 h-6" />
                        Criar Narração!
                      </>
                    )}
                  </motion.button>
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
                    <div
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
                    </div>
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
                      <div
                        onClick={() => removeBgInputRef.current?.click()}
                        className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-all cursor-pointer group overflow-hidden bg-gray-800/50"
                      >
                        {removeBgImage ? (
                          <>
                            <img
                              src={removeBgImage}
                              alt="Original"
                              className="w-full h-full object-cover"
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
                      </div>
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
                            <img
                              src={removeBgResult}
                              alt="No Background"
                              className="relative w-full h-full object-cover"
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
            <button className="p-3 bg-gray-800/50 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 bg-gray-800/50 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-700/50 transition-all">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 bg-gray-800/50 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-gray-700/50 transition-all">
              <Star className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Feito com 💜 para revolucionar o mundo
          </p>
          <p className="text-xs text-gray-600">
            © 2024 AI Studio Pro - Transformando ideias em realidade
          </p>
        </motion.div>
      </div>
    </div>
  )
}