"use client";

import React from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/Animaçoes/Animations";
import {
  BarChart3, Calculator, Component, Gift, Link2, Megaphone,
  Palette, Smartphone, Target, TrendingUp, Users, Zap, CheckCircle2
} from "lucide-react";
import { BRAND } from "@/app/constants/landing-data";

const mockups = [
  {
    id: "vitrine",
    title: "Sua Vitrine em 2 Minutos",
    desc: "Crie uma página profissional, adicione seus produtos e personalize com a sua cara. Feito para carregar rápido e converter.",
    tag: "Visual & Link na Bio",
    icon: <Palette className="w-6 h-6 text-pink-500" />,
    color: "from-pink-500 to-rose-500",
    reverse: false,
    mockup: (
      <div className="relative w-full max-w-[280px] mx-auto bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl border-4 border-gray-800 h-[450px] overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-4 bg-gray-900 rounded-b-xl w-32 mx-auto z-20"></div>
        {/* Screen */}
        <div className="flex-1 bg-white rounded-[2rem] overflow-hidden relative flex flex-col items-center pt-8 pb-4 px-4">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-100 to-white"></div>

          <div className="w-20 h-20 rounded-full border-4 border-white bg-indigo-500 shadow-lg relative z-10 flexItems-center justify-center p-1">
            <img src="https://i.pravatar.cc/150?img=47" alt="Profile" className="w-full h-full rounded-full object-cover" />
          </div>

          <h3 className="text-gray-900 font-bold mt-3 relative z-10">@sualoja</h3>
          <p className="text-gray-500 text-xs text-center mb-6 relative z-10">Tudo que você precisa em um só lugar 👇</p>

          <div className="w-full space-y-3 relative z-10">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="w-full bg-white border border-gray-200 shadow-sm rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 hover:scale-[1.02] transition-transform cursor-pointer">
                {i === 0 && <span className="text-indigo-600 font-bold text-sm">Meu Produto Principal</span>}
                {i === 1 && <span className="text-gray-700 font-medium text-sm">Fale no WhatsApp</span>}
                {i === 2 && <span className="text-gray-700 font-medium text-sm">Nosso Site</span>}
              </div>
            ))}
          </div>

          <div className="mt-auto relative z-10 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><div className="w-4 h-4 bg-pink-500 rounded text-transparent" /></div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><div className="w-4 h-4 bg-blue-500 rounded text-transparent" /></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "pixels",
    title: "Rastreio e Pixel em 1 Clique",
    desc: "Pluge seu Facebook Pixel e Google Analytics apenas copiando e colando o ID. Nada de códigos difíceis.",
    tag: "Automação",
    icon: <Target className="w-6 h-6 text-blue-500" />,
    color: "from-blue-500 to-cyan-500",
    reverse: true,
    mockup: (
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Integrações de Tracking</h4>
            <p className="text-xs text-gray-500">Conecte suas ferramentas favoritas</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs">f</div>
                <span className="font-bold text-sm text-gray-800">Meta Pixel</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">ATIVO</span>
            </div>
            <div className="w-full bg-white border border-gray-200 rounded text-xs px-3 py-2 text-gray-400 font-mono">
              ID: 80927318371...
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 text-white rounded flex items-center justify-center font-bold text-xs">G</div>
                <span className="font-bold text-sm text-gray-800">Google Analytics 4</span>
              </div>
              <div className="w-10 h-6 bg-gray-200 rounded-full cursor-pointer relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
              </div>
            </div>
            <div className="w-full bg-white border border-gray-200 rounded text-xs px-3 py-2 text-gray-400">
              Cole seu G-ID aqui...
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "crm",
    title: "Calculadora de Lucro & Gestão",
    desc: "Cante vitória sabendo exatamente quanto faturou. Controle despesas, calcule o preço do seu produto e veja o lucro real.",
    tag: "Financeiro PRO",
    icon: <Calculator className="w-6 h-6 text-emerald-500" />,
    color: "from-emerald-500 to-teal-500",
    reverse: false,
    mockup: (
      <div className="w-full bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20"></div>

        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-slate-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            Lucro do Dia
          </h4>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold">+12% hj</span>
        </div>

        <div className="mb-6">
          <p className="text-3xl font-black text-white">R$ 1.240<span className="text-slate-400 text-xl">,50</span></p>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Vendas: R$ 1.500</span>
            <span className="text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Custos: R$ 259</span>
          </div>
        </div>

        {/* Fake Mini Graph */}
        <div className="h-16 flex items-end gap-2 mb-6 opacity-80">
          {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-emerald-600/50 to-emerald-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
          ))}
        </div>

        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-300">Últimos Leads (CRM)</span>
          </div>
          <div className="space-y-2">
            {[1, 2].map((_, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">👤</div>
                  <span className="text-slate-300">Cliente {i + 1}</span>
                </div>
                <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px]">🔥 Novo</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: "ads",
    title: "Hub de Tráfego",
    desc: "Coloque seus anúncios para rodar de parceiros da rede. Assim, você ganha milhares de visualizações reais na sua vitrine.",
    tag: "Exclusivo AdsHub",
    icon: <Megaphone className="w-6 h-6 text-purple-500" />,
    color: "from-purple-500 to-indigo-500",
    reverse: true,
    mockup: (
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-bold text-sm text-gray-900">Seus Anúncios Rodando</h4>
          </div>
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
        </div>

        <div className="w-full h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-4 relative overflow-hidden group cursor-pointer transition-colors hover:bg-gray-100">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-10 group-hover:opacity-20 transition-opacity" />
          <Megaphone className="w-8 h-8 text-gray-400 mb-2 group-hover:text-purple-500 transition-colors" />
          <p className="text-xs font-bold text-gray-500">🖼️ Criativo do seu Produto</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <p className="text-[10px] uppercase font-bold text-purple-600 mb-1">Visualizações</p>
            <p className="text-xl font-black text-gray-900">12.450</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <p className="text-[10px] uppercase font-bold text-indigo-600 mb-1">Cliques no Ad</p>
            <p className="text-xl font-black text-gray-900">842</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "sorteio",
    title: "Sorteadeira Integrada",
    desc: "Quer fazer aquele sorteio matador no Instagram? Nossa ferramenta puxa os comentários e sorteia de forma auditável e explosiva.",
    tag: "Engajamento",
    icon: <Gift className="w-6 h-6 text-yellow-500" />,
    color: "from-yellow-400 to-orange-500",
    reverse: false,
    mockup: (
      <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl border border-orange-100 p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>

        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl rounded-2xl flex items-center justify-center mb-4 text-white">
            <Gift className="w-8 h-8" />
          </div>

          <div className="bg-white rounded-full px-4 py-1 border border-orange-200 shadow-sm mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-gray-700">Conectado a @sualoja (354 comentários)</span>
          </div>

          <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-orange-100 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-pulse"></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sorteando Vencedor...</p>

            <div className="h-10 overflow-hidden relative">
              <motion.div
                animate={{ y: [0, -40, -80, -120, -160, -200] }}
                transition={{ duration: 0.5, ease: "linear", repeat: Infinity }}
                className="flex flex-col text-sm font-bold text-gray-800"
              >
                <div className="h-10 flex items-center justify-center">@marcos_silva</div>
                <div className="h-10 flex items-center justify-center">@ana.vendas</div>
                <div className="h-10 flex items-center justify-center">@lucas_dev</div>
                <div className="h-10 flex items-center justify-center">@juliana_doces</div>
                <div className="h-10 flex items-center justify-center">@carlos_fit</div>
                <div className="h-10 flex items-center justify-center">@marcos_silva</div>
              </motion.div>
            </div>
          </div>

          <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-black shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all">
            SORTEAR AGORA
          </button>
        </div>
      </div>
    )
  }
];

export default function FeatureMockupShowcase() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-24 py-10">
      {mockups.map((section, idx) => (
        <ScrollReveal key={section.id}>
          <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${section.reverse ? 'lg:flex-row-reverse' : ''}`}>
            {/* TEXT COPY */}
            <div className={`flex-1 text-center ${section.reverse ? 'lg:text-right' : 'lg:text-left'}`}>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 shadow-sm bg-gradient-to-r ${section.color} text-white`}>
                {section.icon}
                <span className="drop-shadow-sm">{section.tag}</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                {section.title}
              </h3>

              <p className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                {section.desc}
              </p>
            </div>

            {/* VISUAL MOCKUP */}
            <div className="flex-1 w-full flex justify-center perspective-1000 relative">
              <motion.div
                className="w-full max-w-sm lg:max-w-md relative z-10"
                whileHover={{ scale: 1.02, rotateY: section.reverse ? -5 : 5, rotateX: 2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Decoration blob behind mockup */}
                <div className={`absolute -inset-4 rounded-full blur-[80px] bg-gradient-to-br ${section.color} opacity-20 -z-10`} />
                {section.mockup}
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
