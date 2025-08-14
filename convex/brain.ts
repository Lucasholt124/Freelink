// Em convex/brain.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Definição de tipos
interface ReelScript {
  title: string;
  script: string;
}

interface BrainResults {
  viral_titles: string[];
  reel_scripts: ReelScript[];
}

// Configuração das APIs de IA
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Configuração do Gemini como modelo de backup
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Função para gerar conteúdo usando Groq (principal)
async function generateWithGroq(theme: string): Promise<BrainResults> {
  const prompt = `
# MISSÃO: GERAR IDEIAS VIRAIS DE CONTEÚDO PARA INSTAGRAM

## TEMA: "${theme}"

## INSTRUÇÕES:
Você é o "FreelinkBrain", um gênio de marketing de conteúdo especializado em criar ideias virais para criadores de conteúdo brasileiros no Instagram.

Sua tarefa é criar:

1. Títulos virais que geram curiosidade e alto CTR
2. Roteiros de Reels prontos para uso que poderiam viralizar facilmente

## REGRAS OBRIGATÓRIAS:
- RESPONDA APENAS com o JSON solicitado, sem introduções ou explicações
- Use linguagem conversacional, natural e persuasiva
- Inclua gatilhos de curiosidade, números específicos e promessas de valor
- Adapte os títulos e roteiros para o contexto brasileiro e tendências atuais
- Use formato nativo do Instagram (sem menções a TikTok)
- Cada roteiro deve ter entre 15-20 segundos de duração quando falado

## FORMATO DE RESPOSTA:
{
  "viral_titles": [
    "5 Maneiras de [benefício relacionado ao tema] que Ninguém te Conta (a #3 mudou meu jogo)",
    "O Método [tema] que me Fez Ganhar [resultado impressionante] em Apenas 30 Dias",
    "NUNCA Faça [erro comum relacionado ao tema] Antes de Ver Esse Vídeo!",
    "Seu [tema] Não Funciona? Esse Truque Secreto Resolve em 5 Minutos"
  ],
  "reel_scripts": [
    {
      "title": "3 Segredos de [tema] que os Especialistas Escondem",
      "script": "Você está cometendo esses erros de [tema]?\n\n[Hook forte que menciona um problema comum]\n\nSegredo #1: [Dica rápida e valiosa]\n\nSegredo #2: [Segunda dica surpreendente]\n\nSegredo #3: [Dica mais poderosa com resultado específico]\n\nCurta e salve para não perder! ✨\nComentário = + dicas exclusivas"
    },
    {
      "title": "Técnica de [tema] que Viralizou no Brasil",
      "script": "[Começar com uma afirmação controversa ou surpreendente]\n\nA maioria das pessoas faz [tema] assim: [mostrar forma comum]\n\nMas existe uma forma MUITO melhor: [revelar técnica diferenciada]\n\nResultado? [Benefício específico com números]\n\nExperimente hoje mesmo e me conte nos comentários! 👇"
    }
  ]
}
`;

  const response = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Você é um assistente especializado em marketing de conteúdo para Instagram que retorna exclusivamente respostas no formato JSON solicitado.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.9,
    max_tokens: 2000,
  });

  const resultText = response.choices[0]?.message?.content;
  if (!resultText) {
    throw new Error("A IA não retornou um resultado válido.");
  }

  try {
    return JSON.parse(resultText) as BrainResults;
  } catch  {
    console.error("Erro ao fazer parse do JSON da IA:", resultText);
    throw new Error("A IA retornou uma resposta em um formato inválido.");
  }
}

// Função para gerar conteúdo usando Gemini (backup)
async function generateWithGemini(theme: string): Promise<BrainResults> {
  if (!genAI) {
    throw new Error("API do Gemini não configurada");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
    ],
  });

  const prompt = `
Crie ideias de conteúdo viral para Instagram sobre o tema: "${theme}"

Retorne APENAS um objeto JSON com este formato exato, sem texto adicional:
{
  "viral_titles": [array de 4 títulos virais e persuasivos],
  "reel_scripts": [
    {
      "title": "Título do roteiro 1",
      "script": "Roteiro completo para um reel viral"
    },
    {
      "title": "Título do roteiro 2",
      "script": "Roteiro completo para um segundo reel viral"
    }
  ]
}

Os títulos devem ter gatilhos de curiosidade e os roteiros devem ser feitos para vídeos curtos de 15-20 segundos.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    if (!text) {
      throw new Error("Gemini retornou uma resposta vazia");
    }

    // Tenta extrair JSON válido da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch || !jsonMatch[0]) {
      throw new Error("Não foi possível encontrar um JSON válido na resposta do Gemini");
    }

    return JSON.parse(jsonMatch[0]) as BrainResults;
  } catch (error) {
    console.error("Erro ao gerar com Gemini:", error);
    throw error;
  }
}

// Gerar conteúdo de fallback quando tudo falhar
function generateFallbackContent(theme: string): BrainResults {
  // Conteúdo genérico mas útil para caso de falha total
  return {
    viral_titles: [
      `5 Maneiras de Revolucionar ${theme} que Ninguém te Conta`,
      `O Segredo para Dominar ${theme} em Apenas 30 Dias`,
      `Por que Seu ${theme} Não Funciona e Como Resolver Isso`,
      `Esse Truque de ${theme} Mudou Completamente Meus Resultados`
    ],
    reel_scripts: [
      {
        title: `3 Segredos de ${theme} que os Especialistas Escondem`,
        script: `Você está cometendo esses erros de ${theme}?\n\nA maioria das pessoas faz tudo errado.\n\nSegredo #1: Foco na qualidade, não na quantidade.\n\nSegredo #2: Consistência é mais importante que perfeição.\n\nSegredo #3: Adapte para seu público específico e veja resultados 3x melhores.\n\nCurta e salve para não perder! ✨\nComentário = + dicas exclusivas`
      },
      {
        title: `Técnica de ${theme} que Está Viralizando`,
        script: `98% das pessoas falha em ${theme} por um motivo simples.\n\nA maioria faz assim: segue o básico e espera resultados diferentes.\n\nMas existe uma forma MUITO melhor: teste, meça e adapte constantemente.\n\nResultado? 3x mais engajamento em apenas 14 dias.\n\nExperimente hoje mesmo e me conte nos comentários! 👇`
      }
    ]
  };
}

// Action principal
export const generateContentIdeas = action({
  args: { theme: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    // Validações
    if (!args.theme.trim()) {
      throw new Error("Tema não pode estar vazio.");
    }

    if (args.theme.length > 150) {
      throw new Error("Tema deve ter no máximo 150 caracteres.");
    }

    // Verificar configurações de API
    if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
      throw new Error("Nenhuma API de IA está configurada no ambiente.");
    }

    // Tentativa com modelo principal (Groq)
    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`Gerando ideias para tema: "${args.theme}" usando Groq`);
        const results = await generateWithGroq(args.theme);
        console.log("Sucesso ao gerar com Groq");

        // Validação básica dos resultados
        if (!results.viral_titles || !Array.isArray(results.viral_titles) ||
            !results.reel_scripts || !Array.isArray(results.reel_scripts)) {
          throw new Error("Estrutura de resultados inválida");
        }

        return results;
      } catch (groqError) {
        console.error("Erro ao gerar com Groq:", groqError);

        // Fallback para Gemini se estiver configurado
        if (process.env.GEMINI_API_KEY) {
          try {
            console.log("Tentando fallback com Gemini");
            const results = await generateWithGemini(args.theme);
            console.log("Sucesso ao gerar com Gemini (fallback)");
            return results;
          } catch (geminiError) {
            console.error("Erro no fallback com Gemini:", geminiError);
            // Se ambos falharem, usamos o conteúdo de fallback
            console.log("Usando conteúdo de fallback");
            return generateFallbackContent(args.theme);
          }
        } else {
          // Se não tiver Gemini configurado, vai direto para o fallback
          console.log("Sem Gemini configurado, usando conteúdo de fallback");
          return generateFallbackContent(args.theme);
        }
      }
    }
    // Se Groq não estiver configurado mas Gemini estiver
    else if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`Gerando ideias para tema: "${args.theme}" usando Gemini como primário`);
        const results = await generateWithGemini(args.theme);
        console.log("Sucesso ao gerar com Gemini");
        return results;
      } catch (geminiError) {
        console.error("Erro ao gerar com Gemini:", geminiError);
        // Fallback para conteúdo estático
        console.log("Usando conteúdo de fallback");
        return generateFallbackContent(args.theme);
      }
    }

    // Nunca deve chegar aqui devido às verificações anteriores, mas por segurança
    return generateFallbackContent(args.theme);
  },
});