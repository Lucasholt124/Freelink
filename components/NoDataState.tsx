import { BarChart3, Share2 } from "lucide-react";

/**
 * Componente profissional para estados vazios de análise.
 * Foca em um design limpo, texto encorajador e uma ação clara para o usuário.
 */
export function NoDataState() {
  return (
    <div className="text-center p-8 sm:p-16 max-w-4xl mx-auto bg-gray-50/80 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-2xl">
      {/* Ícone com estilo mais suave */}
      <div className="mx-auto w-fit bg-gray-200/80 p-5 rounded-full mb-6">
        <BarChart3 className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
      </div>

      {/* Textos aprimorados */}
      <h3 className="text-2xl font-bold text-gray-800">
        Seu painel de análise está pronto!
      </h3>
      <p className="text-gray-600 mt-2 max-w-lg mx-auto">
        As métricas de cliques, visitantes e origens aparecerão aqui assim que você compartilhar seu link e receber a primeira visita.
      </p>

      {/* Chamada para Ação (Call-to-Action) */}
      <div className="mt-8">
        <button
          onClick={() => {
            // Lógica para copiar a URL do perfil do usuário
            // (Esta lógica pode ser abstraída para um hook ou passada via props)
            const profileUrl = "https://www.freelinnk.com/u/seu_username"; // Exemplo
            navigator.clipboard.writeText(profileUrl);
            alert("Link do seu perfil copiado para a área de transferência!"); // Um toast seria ainda melhor
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity transform hover:-translate-y-0.5"
        >
          <Share2 className="w-5 h-5" />
          Compartilhar meu Link
        </button>
      </div>
    </div>
  );
}