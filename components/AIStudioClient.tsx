'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Mic, MessageSquare, Upload, Download, Loader2, Wand2,
  Copy, Check, MoreVertical, Send,
  Camera, Bot, Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// =================================================================
// 🎯 CONFIGURAÇÃO DE DESIGN SYSTEM & TABS
// =================================================================
const tabs = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'enhance', label: 'Melhorar', icon: Wand2 },
  { id: 'stt', label: 'Transcrição', icon: Mic },
  { id: 'remove-bg', label: 'Recortar', icon: Camera },
];

const enhanceEffects = [
  { id: 'super-resolution', name: 'Super Resolução', icon: '🚀', description: '4K Ultra HD' },
  { id: 'ai-enhance', name: 'IA Magic', icon: '✨', description: 'Correção de cor e luz' },
  { id: 'professional', name: 'Estúdio', icon: '📸', description: 'Look profissional' },
  { id: 'restore', name: 'Restaurar', icon: '🔮', description: 'Fotos antigas' },
];

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

  // Estados do Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Estados de Imagem e Audio
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [enhancedImage, setEnhancedImage] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState('')
  const [removeBgImage, setRemoveBgImage] = useState('')
  const [removeBgResult, setRemoveBgResult] = useState('')

  // Refs de Input
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const removeBgInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Actions Convex
  const enhanceImageAction = useAction(api.aiStudio.enhanceImage)
  const chatWithAIAction = useAction(api.aiStudio.chatWithAI)
  const speechToTextAction = useAction(api.aiStudio.speechToText)
  const removeBackgroundAction = useAction(api.aiStudio.removeBackground)

  // =================================================================
  // 💾 LOCALSTORAGE
  // =================================================================
  const STORAGE_KEY = 'ai-studio-chat-messages-v2'

  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY)
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages)
        setChatMessages(parsed.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } else {
        setChatMessages([{
          id: '1', role: 'assistant', content: 'Olá! 👋 Como posso ajudar você hoje?', timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatMessages))
    }
  }, [chatMessages])

  // =================================================================
  // 💬 CHAT LOGIC
  // =================================================================
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => scrollToBottom(), [chatMessages, isTyping])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [chatInput]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user) return
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: new Date() }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsTyping(true)

    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const result = await chatWithAIAction({
        userId: user.id,
        message: chatInput,
        conversationHistory: chatMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      })
      if (result.success && result.response) {
        setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: result.response!, timestamp: new Date() }])
      } else {
        toast.error('Erro ao obter resposta')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = () => {
    if (window.confirm('Limpar histórico?')) {
      const initial = { id: '1', role: 'assistant' as const, content: 'Histórico limpo. Como posso ajudar?', timestamp: new Date() }
      setChatMessages([initial])
      localStorage.setItem(STORAGE_KEY, JSON.stringify([initial]))
    }
  }

  // =================================================================
  // 📸 & 🎤 MEDIA LOGIC
  // =================================================================
  const resizeImageBeforeUpload = (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width, height = img.height;
          const max = 1440;
          if (width > height && width > max) { height *= max / width; width = max; }
          else if (height > max) { width *= max / height; height = max; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageProcess = async (file: File | null, type: 'enhance' | 'removeBg') => {
    if (!file || !user) return toast.error('Selecione uma imagem');
    setLoading(true);
    const toastId = toast.loading('Processando...');

    try {
      const processedImg = await resizeImageBeforeUpload(file);
      let result;

      // Usando if/else explícito para garantir a tipagem correta de cada Action
      if (type === 'enhance') {
        result = await enhanceImageAction({
          userId: user.id,
          imageFile: processedImg,
          effect: selectedEffect
        });
      } else {
        result = await removeBackgroundAction({
          userId: user.id,
          imageUrl: processedImg
        });
      }

      toast.dismiss(toastId);

      if (result.success) {
        if (type === 'enhance') setEnhancedImage(result.url!);
        else setRemoveBgResult(result.url!);
        toast.success('Sucesso!');
      } else {
        toast.error(result.message || 'Erro');
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('Erro no processamento');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const handleTranscribe = async () => {
    if (!audioFile || !user) return toast.error('Sem áudio');
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioFile);
      reader.onload = async () => {
        const result = await speechToTextAction({ userId: user.id, audioUrl: reader.result as string });
        if (result.success) setTranscription(result.text!);
        setLoading(false);
      }
    } catch {
      setLoading(false);
      toast.error("Erro ao processar áudio");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado');
    setTimeout(() => setCopied(false), 2000);
  }

  const downloadAsset = (url: string) => {
     window.open(url, '_blank');
  }

  // =================================================================
  // 🎨 RENDER - UI CLEAN & PREMIUM
  // =================================================================
  return (
    <div className="min-h-screen bg-[#F7F7F7] text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">

      {/* 1) TOPBAR FIXA - ESTILO WHATSAPP/LINEAR */}
      <div className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 flex items-center justify-between px-4 lg:px-8 transition-all">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-gray-900 text-sm md:text-base">AI Studio Pro</h1>
            <p className="text-xs text-green-600 font-medium">Online • Rápido</p>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu / Actions */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
            <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
        <div className="hidden md:flex gap-2">
            <button onClick={clearChat} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" title="Limpar Chat">
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* 2) CONTEÚDO PRINCIPAL */}
      <main className="pt-20 pb-24 md:pb-8 container mx-auto max-w-4xl px-0 md:px-4">
        <AnimatePresence mode="wait">

          {/* --- CHAT VIEW --- */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col h-full min-h-[calc(100vh-140px)]"
            >
              {/* Área de Mensagens */}
              <div className="flex-1 px-4 space-y-6 pb-4">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex w-full",
                        isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "flex max-w-[85%] md:max-w-[70%] gap-2",
                        isUser ? "flex-row-reverse" : "flex-row"
                      )}>
                        {/* Avatar (Opcional para user, mas bom para AI) */}
                        {!isUser && (
                           <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center mt-1">
                             <Sparkles className="w-4 h-4 text-gray-600" />
                           </div>
                        )}

                        {/* Bubble */}
                        <div className={cn(
                          "relative px-4 py-3 shadow-sm text-[15px] leading-relaxed",
                          isUser
                            ? "bg-emerald-50 border border-emerald-100/50 text-gray-900 rounded-2xl rounded-tr-sm"
                            : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
                        )}>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          <div className={cn(
                            "text-[10px] mt-1 opacity-60 flex items-center gap-1",
                            isUser ? "justify-end" : "justify-start"
                          )}>
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {!isUser && (
                                <button onClick={() => handleCopy(msg.content)} className="ml-2 hover:text-emerald-600 transition-colors">
                                    {copied ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                                </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {isTyping && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full gap-2">
                       <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                           <Bot className="w-4 h-4 text-gray-500" />
                       </div>
                       <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                           <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                           <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                           <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                       </div>
                   </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Fixo Rodapé */}
              <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-3 md:p-4 z-50">
                <div className="max-w-4xl mx-auto relative flex items-end gap-2">
                  <div className="flex-1 bg-[#F0F2F5] rounded-3xl flex items-center px-4 py-2 border border-transparent focus-within:border-emerald-500/30 focus-within:bg-white transition-all">
                     <textarea
                        ref={textareaRef}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                        }}
                        placeholder="Digite sua mensagem..."
                        className="w-full bg-transparent border-none outline-none resize-none max-h-32 min-h-[24px] text-gray-800 placeholder:text-gray-400 py-1"
                        rows={1}
                     />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isTyping}
                    className="w-12 h-12 rounded-full bg-[#10b981] text-white flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- OUTRAS ABAS (Design Clean Unificado) --- */}
          {activeTab !== 'chat' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="px-4"
            >
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">

                  {/* Header da Ferramenta */}
                  <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                      {activeTab === 'enhance' && <Wand2 className="w-6 h-6 text-pink-500"/>}
                      {activeTab === 'stt' && <Mic className="w-6 h-6 text-blue-500"/>}
                      {activeTab === 'remove-bg' && <Camera className="w-6 h-6 text-purple-500"/>}
                      <h2 className="text-xl font-bold text-gray-800">
                          {activeTab === 'enhance' && 'Melhorar Imagem'}
                          {activeTab === 'stt' && 'Áudio para Texto'}
                          {activeTab === 'remove-bg' && 'Remover Fundo'}
                      </h2>
                  </div>

                  <div className="p-6 space-y-6">

                      {/* Controls Area */}
                      {activeTab === 'enhance' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                              {enhanceEffects.map(ef => (
                                  <button
                                      key={ef.id}
                                      onClick={() => setSelectedEffect(ef.id)}
                                      className={cn(
                                          "p-3 rounded-xl border text-left transition-all",
                                          selectedEffect === ef.id
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                            : "border-gray-200 hover:border-gray-300"
                                      )}
                                  >
                                      <div className="text-lg mb-1">{ef.icon}</div>
                                      <div className="text-xs font-bold">{ef.name}</div>
                                  </button>
                              ))}
                          </div>
                      )}

                      {/* Upload Area */}
                      <div className="grid md:grid-cols-2 gap-6">
                          {/* Input */}
                          <div
                             onClick={() => {
                                 if(activeTab === 'stt') audioInputRef.current?.click();
                                 else if(activeTab === 'enhance') imageInputRef.current?.click();
                                 else removeBgInputRef.current?.click();
                             }}
                             className="border-2 border-dashed border-gray-200 rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-emerald-400 transition-all group relative overflow-hidden"
                          >
                              {/* Preview Logic */}
                              {(activeTab === 'enhance' && imagePreview) || (activeTab === 'remove-bg' && removeBgImage) ? (
                                  <Image src={activeTab === 'enhance' ? imagePreview : removeBgImage} alt="Preview" fill className="object-cover" />
                              ) : activeTab === 'stt' && audioFile ? (
                                  <div className="text-center">
                                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                          <Mic className="w-8 h-8"/>
                                      </div>
                                      <p className="font-medium text-gray-700">{audioFile.name}</p>
                                  </div>
                              ) : (
                                  <div className="text-center text-gray-400 group-hover:text-emerald-500">
                                      <Upload className="w-10 h-10 mx-auto mb-3" />
                                      <p className="font-medium">Clique para enviar</p>
                                      <p className="text-xs mt-1">
                                          {activeTab === 'stt' ? 'MP3, WAV' : 'JPG, PNG'}
                                      </p>
                                  </div>
                              )}
                          </div>

                          {/* Output */}
                          <div className="bg-gray-50 rounded-2xl aspect-square border border-gray-100 flex items-center justify-center relative overflow-hidden">
                              {activeTab === 'stt' && transcription ? (
                                  <div className="absolute inset-0 p-4 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
                                      {transcription}
                                  </div>
                              ) : (activeTab === 'enhance' && enhancedImage) || (activeTab === 'remove-bg' && removeBgResult) ? (
                                  <>
                                    <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-20"></div>
                                    <Image
                                        src={activeTab === 'enhance' ? enhancedImage : removeBgResult}
                                        alt="Result"
                                        fill
                                        className="object-contain p-2 z-10"
                                    />
                                    <button
                                        onClick={() => downloadAsset(activeTab === 'enhance' ? enhancedImage : removeBgResult)}
                                        className="absolute bottom-4 right-4 bg-white shadow-lg p-3 rounded-full hover:scale-110 transition-transform z-20"
                                    >
                                        <Download className="w-5 h-5 text-gray-700"/>
                                    </button>
                                  </>
                              ) : (
                                  <div className="text-gray-300 text-center">
                                      <Sparkles className="w-10 h-10 mx-auto mb-2"/>
                                      <p>Resultado aqui</p>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Action Button */}
                      <button
                          onClick={() => {
                              if(activeTab === 'stt') handleTranscribe();
                              else if(activeTab === 'enhance') handleImageProcess(imageFile, 'enhance');
                              else handleImageProcess(imageFile, 'removeBg');
                          }}
                          disabled={loading}
                          className="w-full py-4 bg-[#10b981] hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                      >
                          {loading ? <Loader2 className="animate-spin"/> : 'Processar Agora'}
                      </button>

                  </div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation (Simulada para Tabs quando não estiver no chat) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-2 z-40 flex justify-around pb-safe">
        {tabs.map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
                 "p-2 rounded-lg flex flex-col items-center gap-1",
                 activeTab === tab.id ? "text-emerald-600" : "text-gray-400"
             )}
           >
               <tab.icon className="w-6 h-6" />
               <span className="text-[10px] font-medium">{tab.label}</span>
           </button>
        ))}
      </div>

      {/* Hidden Inputs */}
      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if(file) {
              setImageFile(file);
              const reader = new FileReader();
              reader.onload = (ev) => {
                  setImagePreview(ev.target?.result as string);
                  setRemoveBgImage(ev.target?.result as string); // Simplificação: usa preview para ambos
              };
              reader.readAsDataURL(file);
          }
      }} />
      <input type="file" ref={removeBgInputRef} className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if(file) {
              setImageFile(file); // Garante que imageFile esteja setado para a lógica funcionar
              setRemoveBgImage(URL.createObjectURL(file));
          }
      }}/>
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleAudioUpload} />

      <style jsx global>{`
        /* Ajuste para mobile notch */
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        body { background-color: #F7F7F7; }
      `}</style>
    </div>
  )
}