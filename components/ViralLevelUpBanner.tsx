"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Smartphone, Zap, Trophy, Copy } from "lucide-react";
import { useState } from "react";

export default function ViralLevelUpBanner({ clicksUsed, plan }: { clicksUsed: number; plan: string }) {
    const [copied, setCopied] = useState(false);

    // Lógica de Gamificação
    const nextLevel = Math.ceil((clicksUsed + 1) / 1000) * 1000;
    // Agora o progress é usado na barra visualmente
    const progress = Math.min(100, (clicksUsed / nextLevel) * 100);

    const shareUrl = "https://freelinnk.com";
    const shareText = `🚀 Estou voando alto com meu Freelinnk! Já são ${clicksUsed.toLocaleString()} cliques. Crie seu império digital também! #Freelinnk`;

    // Define o rótulo baseado no plano (Usando a variável 'plan' para corrigir o erro)
    const planLabel = plan === 'ultra' ? 'ULTRA MEMBER' : plan === 'pro' ? 'PRO MEMBER' : 'MEMBER';

    const handleCopy = () => {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Minha Conquista Freelinnk', text: shareText, url: shareUrl });
            } catch (err) { console.log(err); }
        }
    };

    return (
        <div className="relative group w-full mb-8">
            {/* Efeito de brilho de fundo pulsante */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

            <Card className="relative w-full border-0 bg-slate-950 overflow-hidden rounded-2xl shadow-2xl">
                {/* Background Artístico */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                <CardContent className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">

                    {/* LADO ESQUERDO: A Conquista (Texto e Emoção) */}
                    <div className="flex-grow space-y-4 text-center md:text-left w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/50 backdrop-blur-md animate-bounce">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-black text-xs uppercase tracking-wider">Nova Conquista Desbloqueada</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                            Você é uma Lenda <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                do Digital!
                            </span>
                        </h2>

                        <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto md:mx-0 font-medium">
                            Você superou <span className="text-white font-bold">{clicksUsed.toLocaleString()} pessoas</span> hoje. Sua marca está explodindo. Não guarde isso só para você!
                        </p>

                        {/* Barra de Progresso Gamificada */}
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10 backdrop-blur-sm max-w-md mx-auto md:mx-0">
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                <span>Nível Atual</span>
                                <span className="text-purple-400">Próximo: {nextLevel.toLocaleString()} cliques</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                {/* CORREÇÃO AQUI: Usando style width com a variável progress */}
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[shimmer_2s_infinite]"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 text-[10px] text-center text-slate-500 font-mono">
                                +500 XP AO COMPARTILHAR AGORA
                            </div>
                        </div>
                    </div>

                    {/* LADO DIREITO: Ação Visual (O "Card" do Instagram) */}
                    <div className="flex-shrink-0 relative w-full md:w-auto flex flex-col items-center gap-4">

                        {/* Preview do Story (Visualmente Bonito) */}
                        <div className="relative w-64 h-40 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 border-2 border-white/20 flex flex-col items-center justify-center overflow-hidden group/preview">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)] opacity-0 group-hover/preview:opacity-100 transition-opacity"></div>

                            {/* Logo F */}
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-2 shadow-lg">
                                <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 text-xl">F</span>
                            </div>

                            <p className="text-white font-black text-xl drop-shadow-md">{clicksUsed.toLocaleString()}</p>

                            {/* CORREÇÃO AQUI: Mostrando o plano dinamicamente */}
                            <p className="text-white/80 text-[10px] font-bold tracking-widest uppercase mt-1">
                                {planLabel}
                            </p>

                            <div className="absolute bottom-2 left-0 w-full flex justify-center">
                                <Badge className="bg-white/20 hover:bg-white/30 text-[8px] backdrop-blur-sm border-0">Freelinnk.com</Badge>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col w-64 gap-2">
                            <Button onClick={handleShare} className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-black h-12 rounded-xl shadow-lg shadow-pink-500/20 transform hover:scale-105 transition-all">
                                <Instagram className="w-5 h-5 mr-2" />
                                Postar no Story
                            </Button>

                            <div className="grid grid-cols-2 gap-2">
                                <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank')} className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl h-10">
                                    <Smartphone className="w-4 h-4 mr-2" /> Zap
                                </Button>
                                <Button onClick={handleCopy} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold rounded-xl h-10 bg-slate-900/50">
                                    {copied ? <Zap className="w-4 h-4 mr-2 text-yellow-400" /> : <Copy className="w-4 h-4 mr-2" />}
                                    {copied ? "Copiado!" : "Copiar"}
                                </Button>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}