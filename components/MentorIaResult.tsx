"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import CalendarView from "./CalendarView";

import type { PlanItem, PlanFormat, AnalysisResults } from "@/lib/types";

type AnalysisDashboardProps = {
  analysis: AnalysisResults;
  onRegenerate: () => void;
};

export default function AnalysisDashboard({
  analysis,
  onRegenerate,
}: AnalysisDashboardProps) {
  const dateStr = new Date(analysis.updatedAt || analysis._creationTime).toLocaleDateString(
    "pt-BR"
  );

  // Convertendo content_plan para PlanItem[] do tipo correto
  const normalizedPlan: PlanItem[] = (analysis.content_plan || []).map((item) => ({
    ...item,
    format: item.format as PlanFormat,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-tr from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">Seu Plano de Ação Estratégico</h2>
          <p className="opacity-80">Gerado em: {dateStr}</p>
          {(analysis.username || analysis.offer) && (
            <p className="opacity-80 mt-1">
              @{analysis.username} • {analysis.offer}
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={onRegenerate}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Aprimorar Plano
        </Button>
      </div>

      {/* Abas */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="strategy">Estratégia</TabsTrigger>
          <TabsTrigger value="suggestions">Bios</TabsTrigger>
          <TabsTrigger value="grid">Feed Ideal</TabsTrigger>
        </TabsList>

        {/* Calendário */}
        <TabsContent value="calendar" className="mt-6">
          <CalendarView plan={normalizedPlan} />
        </TabsContent>

        {/* Estratégia */}
        <TabsContent value="strategy" className="mt-6 p-6 bg-white rounded-lg border shadow-sm">
          <h3 className="text-xl font-bold mb-4">Sua Estratégia de Conteúdo</h3>
          <div className="prose prose-lg max-w-none whitespace-pre-line text-gray-700">
            {analysis.strategy}
          </div>
        </TabsContent>

        {/* Bios sugeridas */}
        <TabsContent value="suggestions" className="mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.suggestions?.map((s, i) => (
              <div key={i} className="p-6 border rounded-lg bg-white shadow-sm">
                <p className="font-semibold mb-2">Opção {i + 1}</p>
                <p className="text-gray-700">{s}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Grid ideal */}
        <TabsContent value="grid" className="mt-6 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4">Grid Harmônico Sugerido</h3>
          <div className="grid grid-cols-3 gap-2 p-2 bg-gray-100 rounded-xl max-w-sm">
            {analysis.grid?.map((idea, i) => (
              <div
                key={i}
                className="aspect-square bg-white rounded-lg flex items-center justify-center p-2 text-center text-xs font-medium text-gray-700 shadow-sm"
              >
                {idea}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
