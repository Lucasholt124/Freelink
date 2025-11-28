"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Smartphone, Zap, Rocket, Copy, TrendingUp } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

// Tipagem simplificada baseada no que você já tem
interface LinkData {
  linkTitle: string;
  totalClicks: number;
  uniqueUsers: number;
}

export default function ViralLinkShareBanner({ data }: { data: LinkData }) {
    const [copied, setCopied] = useState(false);

    const shareUrl = "https://freelinnk.com";
    // Texto focado no sucesso deste link específico
    const shareText = `🔥 Olha isso! Meu link "${data.linkTitle}" no Freelinnk já bateu ${data.totalClicks.toLocaleString()} acessos! A ferramenta é surreal. 🚀 #Freelinnk #Marketing`;

    const handleCopy = () => {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: `Sucesso: ${data.linkTitle}`, text: shareText, url: shareUrl });
            } catch (err) { console.log(err); }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group w-full mb-6 sm:mb-8"
        >
            {/* Glow Effect Background */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

            <Card className="relative w-full border-0 bg-slate-900 overflow-hidden rounded-xl shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900"></div>

                <CardContent className="relative z-10 p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">

                    {/* ESQUERDA: Dados do Link e Hype */}
                    <div className="flex-grow space-y-3 text-center md:text-left w-full">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Link em Alta Performance</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                            Este link é um <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Imã de Cliques! 🧲
                            </span>
                        </h2>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                            <div className="text-left">
                                <p className="text-slate-400 text-xs font-medium uppercase">Link</p>
                                <p className="text-white font-bold text-sm sm:text-base truncate max-w-[200px]">{data.linkTitle}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-700 hidden sm:block"></div>
                            <div className="text-left">
                                <p className="text-slate-400 text-xs font-medium uppercase">Performance</p>
                                <p className="text-emerald-400 font-black text-sm sm:text-base flex items-center gap-1">
                                    <Rocket className="w-3 h-3" /> {data.totalClicks.toLocaleString()} cliques
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DIREITA: Preview Visual e Ações */}
                    <div className="flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-4 items-center w-full md:w-auto">

                        {/* O "Selo" Visual para postar */}
                        <div className="relative w-full sm:w-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-white/10 shadow-lg group/card hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white text-lg">F</div>
                                <Badge variant="secondary" className="bg-white/10 text-white text-[10px]">Viral Stats</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-[10px]">Total de acessos em</p>
                                <p className="text-white font-bold text-sm truncate">{data.linkTitle}</p>
                                <p className="text-3xl font-black text-white tracking-tighter">{data.totalClicks.toLocaleString()}</p>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 w-[85%]"></div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="w-full sm:w-64 grid grid-cols-2 gap-2">
                            <Button onClick={handleShare} className="col-span-2 bg-white text-slate-900 hover:bg-emerald-50 font-black h-10 rounded-lg shadow-lg">
                                <Share2 className="w-4 h-4 mr-2" />
                                Compartilhar Sucesso
                            </Button>
                            <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')} className="bg-[#25D366] hover:bg-[#128C7E] text-white border-0 h-9 rounded-lg">
                                <Smartphone className="w-4 h-4" />
                            </Button>
                            <Button onClick={handleCopy} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white h-9 rounded-lg bg-transparent">
                                {copied ? <Zap className="w-4 h-4 text-yellow-400" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </motion.div>
    );
}