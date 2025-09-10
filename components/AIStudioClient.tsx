'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Mic, Volume2, Video, Upload, Download, Loader2, Wand2, Copy, Check,
  Play, Pause, Zap, Crown
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'enhance', label: 'Aprimorar Imagem', icon: Wand2, color: 'from-purple-600 to-pink-600' },
  { id: 'tts', label: 'Texto para Áudio', icon: Volume2, color: 'from-blue-600 to-cyan-600' },
  { id: 'stt', label: 'Áudio para Texto', icon: Mic, color: 'from-green-600 to-emerald-600' },
  { id: 'video', label: 'Buscar Vídeo', icon: Video, color: 'from-orange-600 to-red-600' },
];

const ttsVoices = [
  { id: 'https://translate.google.com/translate_tts?ie=UTF-8&q={text}&tl=pt-BR&client=tw-ob', name: 'Google (Português)' },
  { id: 'https://translate.google.com/translate_tts?ie=UTF-8&q={text}&tl=en-US&client=tw-ob', name: 'Google (Inglês)' },
  { id: 'https://translate.google.com/translate_tts?ie=UTF-8&q={text}&tl=es-ES&client=tw-ob', name: 'Google (Espanhol)' },
];

export function AIStudioClient() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('enhance')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Estados
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

  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const audioPlayerRef = useRef<HTMLAudioElement>(null)

  // Actions
  const enhanceImageAction = useAction(api.aiStudio.enhanceImage)
  const textToSpeechAction = useAction(api.aiStudio.textToSpeech)
  const speechToTextAction = useAction(api.aiStudio.speechToText)
  const generateVideoAction = useAction(api.aiStudio.generateVideo)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleEnhanceImage = async () => {
    if (!imagePreview || !user) return toast.error('Envie uma imagem.');
    setLoading(true)
    try {
      const result = await enhanceImageAction({ userId: user.id, imageUrl: imagePreview, prompt: "" });
      if (result.success) {
        setEnhancedImage(result.url!);
        toast.success('Imagem aprimorada!');
      } else {
        toast.error(`Erro: ${result.message}`);
      }
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
      else toast.error("Ocorreu um erro desconhecido.");
    } finally { setLoading(false) }
  }

  const handleTextToSpeech = async () => {
    if (!ttsText || !user) return toast.error('Digite um texto.');
    setLoading(true)
    try {
      const result = await textToSpeechAction({ userId: user.id, text: ttsText, voiceId: selectedVoice });
      if (result.success) {
        setAudioUrl(result.url!);
        toast.success('Áudio gerado!');
      } else {
        toast.error(`Erro: ${result.message}`);
      }
    } catch (e: unknown) {
        if (e instanceof Error) toast.error(e.message);
        else toast.error("Ocorreu um erro desconhecido.");
    } finally { setLoading(false) }
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) return toast.error("Arquivo de áudio muito grande (max 25MB).");
      setAudioFile(file);
    }
  };

  const handleSpeechToText = async () => {
    if (!audioFile || !user) return toast.error('Envie um arquivo de áudio.');
    setLoading(true)
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const result = await speechToTextAction({ userId: user.id, audioUrl: reader.result as string });
        if (result.success) {
          setTranscription(result.text!);
          toast.success('Áudio transcrito!');
        } else {
          toast.error(`Erro: ${result.message}`);
        }
      } catch (e: unknown) {
          if (e instanceof Error) toast.error(e.message);
          else toast.error("Ocorreu um erro desconhecido.");
      } finally { setLoading(false) }
    }
    reader.readAsDataURL(audioFile);
  }

  const handleGenerateVideo = async () => {
    if (!videoPrompt || !user) return toast.error('Descreva o vídeo.');
    setLoading(true)
    try {
      const result = await generateVideoAction({ userId: user.id, prompt: videoPrompt });
      if (result.success) {
        setVideoUrl(result.url!);
        toast.success('Vídeo encontrado!');
      } else {
        toast.error(`Erro: ${result.message}`);
      }
    } catch (e: unknown) {
        if (e instanceof Error) toast.error(e.message);
        else toast.error("Ocorreu um erro desconhecido.");
    } finally { setLoading(false) }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  }

  const toggleAudio = () => {
    if (audioPlayerRef.current) {
        if (isPlaying) audioPlayerRef.current.pause();
        else audioPlayerRef.current.play();
    }
  }

  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (audio) {
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onPause);
      return () => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onPause);
      };
    }
  }, [audioUrl]);

  const downloadAsset = (url: string, filename: string) => {
    fetch(url).then(res => res.blob()).then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        a.remove();
    }).catch(() => toast.error("Falha ao iniciar o download."));
  }

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white -m-8 -mt-2 p-4 rounded-2xl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-6">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">AI Studio</span>
            <Crown className="w-4 h-4 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">Suíte Criativa</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Ferramentas de IA para potencializar seu conteúdo.</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <motion.button key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={cn("flex items-center gap-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300",
                activeTab === tab.id ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700")}>
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-800 p-8">
              {activeTab === 'enhance' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white mb-2">Aprimorar Imagem</h2>
                    <p className="text-gray-400">Melhore a qualidade da sua imagem com um clique.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sua Imagem</label>
                      <div onClick={() => imageInputRef.current?.click()} className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-700 hover:border-purple-500 transition-colors cursor-pointer group flex items-center justify-center">
                        {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" /> : <Upload className="w-12 h-12 text-gray-500" />}
                      </div>
                      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Resultado</label>
                      <div className="relative aspect-square rounded-2xl border-2 border-gray-700 flex items-center justify-center">
                        {enhancedImage ? <img src={enhancedImage} alt="Enhanced" className="w-full h-full object-cover rounded-xl" /> : <Sparkles className="w-12 h-12 text-gray-600" />}
                        {enhancedImage && <button onClick={() => downloadAsset(enhancedImage, 'enhanced.png')} className="absolute bottom-4 right-4 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700"><Download className="w-5 h-5" /></button>}
                      </div>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleEnhanceImage} disabled={loading || !imagePreview} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Wand2 />} Aprimorar
                  </motion.button>
                </div>
              )}
              {activeTab === 'tts' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Volume2 className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white mb-2">Texto para Áudio</h2>
                    <p className="text-gray-400">Converta textos em áudio com vozes de diferentes idiomas.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Voz / Idioma</label>
                    <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white">
                      {ttsVoices.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
                    </select>
                  </div>
                  <textarea value={ttsText} onChange={(e) => setTtsText(e.target.value)} placeholder="Digite o texto..."
                    className="w-full h-40 p-4 bg-gray-800/50 border border-gray-700 rounded-xl resize-none" />
                  {audioUrl && (
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center gap-4">
                      <button onClick={toggleAudio} className="p-3 bg-blue-600 rounded-full text-white">{isPlaying ? <Pause /> : <Play />}</button>
                      <p className="flex-1 text-sm text-gray-300">Seu áudio está pronto.</p>
                      <button onClick={() => downloadAsset(audioUrl, 'audio.mp3')} className="p-2 text-gray-400 hover:text-white"><Download /></button>
                      <audio ref={audioPlayerRef} src={audioUrl} />
                    </div>
                  )}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleTextToSpeech} disabled={loading || !ttsText} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Volume2 />} Gerar Áudio
                  </motion.button>
                </div>
              )}
              {activeTab === 'stt' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Mic className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <h2 className="text-2xl font-bold text-white mb-2">Áudio para Texto</h2>
                    <p className="text-gray-400">Transcreva arquivos de áudio.</p>
                  </div>
                  <div onClick={() => audioInputRef.current?.click()} className="rounded-xl border-2 border-dashed border-gray-700 hover:border-green-500 cursor-pointer p-8 text-center">
                    {audioFile ? <p>{audioFile.name}</p> : <p>Clique para enviar áudio (MP3, WAV...)</p>}
                  </div>
                  <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                  {transcription && (
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 relative">
                      <p className="whitespace-pre-wrap">{transcription}</p>
                      <button onClick={() => handleCopy(transcription)} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white">
                        {copied ? <Check className="text-green-400" /> : <Copy />}
                      </button>
                    </div>
                  )}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSpeechToText} disabled={loading || !audioFile} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Mic />} Transcrever
                  </motion.button>
                </div>
              )}
              {activeTab === 'video' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Video className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                    <h2 className="text-2xl font-bold text-white mb-2">Buscador de Vídeos</h2>
                    <p className="text-gray-400">Encontre vídeos de alta qualidade por descrição.</p>
                  </div>
                  <textarea value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} placeholder="Ex: Pôr do sol na praia, drone..."
                    className="w-full h-32 p-4 bg-gray-800/50 border border-gray-700 rounded-xl resize-none" />
                  {videoUrl && (
                    <div className="rounded-xl border border-gray-700 p-2">
                      <video controls key={videoUrl} className="w-full rounded-lg" src={videoUrl} />
                      <button onClick={() => downloadAsset(videoUrl, 'video.mp4')} className="w-full mt-2 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Baixar
                      </button>
                    </div>
                  )}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerateVideo} disabled={loading || !videoPrompt} className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Video />} Buscar
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}