import {
  Lock,
  Zap,
  BarChart3,
  MapPin,
  Clock,
  Smartphone,
  Activity,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Monitor
} from "lucide-react";
import Link from "next/link";

export function UpgradeCallToAction() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* HEADER: Autoridade & Status */}
        <div className="bg-gray-900 p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">Análise Profunda Detectada</span>
            </div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Relatório de Inteligência do Link
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Status da Conta</p>
              <p className="text-sm font-bold text-white leading-none">Básico</p>
            </div>
            <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              UPGRADE NECESSÁRIO
            </span>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* 1. Performance Real */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" /> Performance Real
              </h3>

              <div className="flex items-end justify-between mb-4">
                 <div>
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">16.9%</span>
                    <p className="text-xs text-gray-500 font-medium mt-1">Taxa de Conversão</p>
                 </div>
                 <div className="mb-1">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +70%
                    </span>
                 </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500" /> Taxa de Saída
                  </span>
                  <span className="font-bold text-gray-900 bg-red-50 px-1.5 py-0.5 rounded text-xs border border-red-100">60%</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Visitantes Recorrentes</span>
                  <span className="font-bold text-gray-900">20%</span>
               </div>
            </div>
          </div>

          {/* 2. Cidades & Regiões */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" /> Cidades & Regiões
            </h3>

            <div className="space-y-3 flex-1">
               <div className="flex justify-between items-center text-sm group">
                  <span className="flex items-center gap-2 text-gray-700 font-medium">
                     <span className="w-2 h-2 rounded-full bg-blue-500"></span> Aracaju, SE
                  </span>
                  <span className="font-bold text-gray-900">58</span>
               </div>
               <div className="flex justify-between items-center text-sm group opacity-75">
                  <span className="flex items-center gap-2 text-gray-700 font-medium">
                     <span className="w-2 h-2 rounded-full bg-gray-300"></span> Fortaleza, CE
                  </span>
                  <span className="font-bold text-gray-900">1</span>
               </div>
            </div>

            {/* Heatmap Bloqueado */}
            <div className="mt-4 pt-3 border-t border-gray-100">
               <p className="text-[10px] text-gray-400 mb-2">Mapa de calor regional:</p>
               <div className="relative h-8 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 opacity-30 blur-sm"></div>
                  <div className="relative z-10 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full shadow-sm text-[10px] font-bold text-gray-600">
                    <Lock className="w-2.5 h-2.5" /> Plano Pro
                  </div>
               </div>
            </div>
          </div>

          {/* 3. Horário & Dispositivos */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">

             {/* Horário */}
             <div>
                <h3 className="text-gray-500 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" /> Melhor Horário
                </h3>
                <div className="relative bg-gray-50 rounded-lg p-3 text-center border border-gray-100 mb-4">
                   <div className="blur-[4px] font-mono text-xl font-bold text-gray-800 opacity-60 select-none">14:00</div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-500" />
                   </div>
                </div>
                <p className="text-[11px] leading-tight text-green-700 font-medium">
                  Postar neste horário pode gerar até <span className="underline decoration-green-300 font-bold">2x mais cliques</span>.
                </p>
             </div>

             {/* Dispositivos */}
             <div className="pt-3 border-t border-gray-100">
                <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-2">Dispositivos</h3>
                <div className="flex justify-between text-xs">
                   <div className="flex items-center gap-1.5 text-gray-700">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile: <strong>22%</strong></span>
                   </div>
                   <div className="flex items-center gap-1.5 text-gray-700">
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Win</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* FOOTER: Inteligência & CTA */}
        <div className="bg-white px-8 py-8 border-t border-gray-100 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">

            {/* Esquerda: Insights */}
            <div className="text-left max-w-md">
               <div className="flex items-center gap-2 mb-2">
                 <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                 <h3 className="text-lg font-bold text-gray-900">Inteligência do Tráfego</h3>
               </div>

               <p className="text-sm text-gray-600 mb-3">
                 Você teve <span className="font-bold text-blue-600">59 interações</span> recentes. Detectamos padrões vindos de:
               </p>

               <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">Instagram</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">Acesso Direto</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-100">Usuários Recorrentes</span>
               </div>

               <p className="text-sm text-gray-500 italic flex items-start gap-2">
                 <Lock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                 <span>
                   Desbloqueie para ver a origem exata e <span className="text-red-600 font-medium">como reduzir os 60% que estão saindo</span>.
                 </span>
               </p>
            </div>

            {/* Direita: CTA */}
            <div className="flex flex-col items-center w-full md:w-auto">
               <Link
                 href="/dashboard/billing"
                 className="w-full md:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
               >
                 Liberar Relatório Completo
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
               <p className="text-xs text-gray-500 mt-3 font-medium">
                 A partir de <span className="text-gray-900 font-bold">R$ 34,90/mês</span>
               </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}