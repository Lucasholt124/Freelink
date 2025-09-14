
"use client";

import { useState } from "react";
import type { Geo } from "@vercel/functions"; // Importa o tipo Geo

// Define uma interface para a resposta que esperamos da nossa API de debug
interface DebugResult {
  message: string;
  timestamp_utc: string;
  timestamp_brasilia: string;
  ip_detectado: string;
  geo_da_vercel: Geo;
  todos_os_headers: Record<string, string>;
}

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  // CORREÇÃO: Usa o tipo explícito 'DebugResult' em vez de 'any'
  const [result, setResult] = useState<DebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/debug');
      if (!res.ok) {
        throw new Error(`O servidor respondeu com o status: ${res.status}`);
      }
      const data: DebugResult = await res.json();
      setResult(data);
    } catch (err) {
      // CORREÇÃO: Trata o erro de forma segura sem usar 'any'
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold">Página de Diagnóstico</h1>
      <p className="text-gray-600 mb-6">Este teste verifica o que o servidor da Vercel realmente vê.</p>

      <button
        onClick={runTest}
        disabled={loading}
        className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg disabled:bg-gray-400"
      >
        {loading ? "Executando..." : "Executar Teste de Diagnóstico"}
      </button>

      {result && (
        <div className="mt-8 p-4 bg-green-100 border border-green-300 rounded-lg">
          <h2 className="text-xl font-bold text-green-800">Sucesso! Resultado do Diagnóstico:</h2>
          <pre className="text-sm whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-100 border border-red-300 rounded-lg">
          <h2 className="text-xl font-bold text-red-800">Erro!</h2>
          <pre className="text-sm">{error}</pre>
        </div>
      )}
    </div>
  );
}