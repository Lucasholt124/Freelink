// Em convex/brain.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';

// =================================================================
// 1. ESTRUTURAS DE DADOS
// =================================================================

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
}

interface CarouselContent {
  title: string;
  slides: {
    slide_number: number;
    title: string;
    content: string;
  }[];
  cta_slide: string;
}

interface ImagePostContent {
    idea: string;
    caption: string;
    image_prompt: string;
}

interface StorySequenceContent {
    theme: string;
    slides: {
        slide_number: number;
        type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text";
        content: string;
        options?: string[];
    }[];
}

interface BrainResults {
  theme_summary: string;
  target_audience_suggestion: string;
  content_pack: {
    reels: ReelContent[];
    carousels: CarouselContent[];
    image_posts: ImagePostContent[];
    story_sequences: StorySequenceContent[];
  }
}

// =================================================================
// 2. CONFIGURAÇÃO E FUNÇÕES HELPERS
// =================================================================

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// JSON parsing e helpers (mantidos como estavam)
function extractJsonFromText(text: string): string {
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const arrayStart = cleaned.indexOf('[');
    const objectStart = cleaned.indexOf('{');
    if (arrayStart === -1 && objectStart === -1) { throw new Error("Não foi possível encontrar o início de um JSON válido na resposta."); }
    let start = -1;
    if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) { start = arrayStart; } else { start = objectStart; }
    if (start !== -1) { cleaned = cleaned.substring(start); }
    const openChar = cleaned.startsWith('[') ? '[' : '{';
    const closeChar = cleaned.startsWith('[') ? ']' : '}';
    let balance = 0; let inString = false; let escape = false;
    for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        if (inString) { if (char === '"' && !escape) { inString = false; } else if (char === '\\') { escape = !escape; } else { escape = false; } }
        else { if (char === '"') { inString = true; } else if (char === openChar) { balance++; } else if (char === closeChar) { balance--; } }
        if (balance === 0 && i > 0) { return cleaned.substring(0, i + 1); }
    }
    return cleaned;
}
function cleanAndFixJson(text: string): string {
    let cleaned = extractJsonFromText(text);
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    cleaned = cleaned.replace(/}\s*{/g, '},{');
    cleaned = cleaned.replace(/:(\s*)"((?:\\.|[^"])*)"/g, (match, whitespace, content) => {
        const escapedContent = content.replace(/(?<!\\)"/g, '\\"');
        return `:${whitespace}"${escapedContent}"`;
    });
    return cleaned;
}
function extractJson<T>(text: string): T {
    try {
        const cleanedText = cleanAndFixJson(text);
        return JSON.parse(cleanedText) as T;
    } catch (error) {
        console.error("Erro CRÍTICO ao parsear JSON:", error, "Texto Recebido:", text);
        throw new Error("Falha ao parsear o JSON da IA.");
    }
}


// =================================================================
// 3. LÓGICA DE GERAÇÃO DE CONTEÚDO
// =================================================================

async function generateWithGroq(theme: string): Promise<BrainResults> {
  const prompt = `
# MISSÃO: CRIAR UM PACOTE DE CONTEÚDO VIRAL E COMPLETO PARA INSTAGRAM

## TEMA CENTRAL: "${theme}"

## PERSONA DA IA:
Você é o "BrainStorm Viral", um diretor criativo de elite, mestre em marketing de conteúdo para o público brasileiro. Sua especialidade é transformar um único tema em uma mini-campanha de conteúdo coesa e de alto impacto.

## TAREFA:
Crie um "Pacote de Conteúdo" completo sobre o tema fornecido. O pacote deve incluir diferentes formatos que trabalham juntos para atrair, nutrir e engajar a audiência.

## REGRAS INQUEBRÁVEIS:
- **SAÍDA EXCLUSIVAMENTE JSON:** Sua resposta DEVE ser um único objeto JSON válido, sem introduções, comentários ou qualquer texto fora do JSON.
- **PROFUNDIDADE E VALOR:** Fuja do óbvio. Gere ideias e textos que ensinem algo novo, quebrem uma crença comum ou ofereçam uma perspectiva única sobre o tema.
- **CONTEXTO BRASILEIRO:** Use linguagem, gírias e referências culturais que ressoem com o público do Brasil.
- **COESÃO:** Os diferentes formatos de conteúdo devem se complementar. Um Reel pode introduzir um conceito, um Carrossel aprofundá-lo e uma Story gerar discussão sobre ele.

## ESTRUTURA DE RESPOSTA JSON (OBRIGATÓRIA):
{
  "theme_summary": "Um resumo de 1-2 frases sobre o ângulo que você escolheu para o tema.",
  "target_audience_suggestion": "Uma sugestão de público-alvo específico para este conteúdo.",
  "content_pack": {
    "reels": [
      {
        "title": "Título magnético para o Reel",
        "hook": "Gancho de 3 segundos que prende a atenção. Ex: 'Você está fazendo [tema] do jeito errado...'",
        "main_points": [
          "Primeiro ponto chave (rápido e direto).",
          "Segundo ponto surpreendente.",
          "Terceiro ponto que entrega o maior valor."
        ],
        "cta": "Chamada para ação clara. Ex: 'Salve este post e comente 'EU QUERO' para mais dicas.'"
      }
    ],
    "carousels": [
      {
        "title": "Título para o Carrossel que promete um guia completo",
        "slides": [
          { "slide_number": 1, "title": "Capa Impactante", "content": "Título principal que reforça o benefício." },
          { "slide_number": 2, "title": "O Problema", "content": "Descreva a dor da audiência que este conteúdo resolve." },
          { "slide_number": 3, "title": "Passo 1: A Base", "content": "Primeira dica acionável e explicada de forma simples." }
        ],
        "cta_slide": "Gostou? Salve para consultar depois e compartilhe com um amigo que precisa ver isso!"
      }
    ],
    "image_posts": [
      {
        "idea": "Ideia para um post de imagem única (ex: Frase de impacto, dica rápida, mito vs. verdade).",
        "caption": "Uma legenda completa para o post, com storytelling e CTA.",
        "image_prompt": "Um prompt detalhado para uma IA de geração de imagem (Midjourney, DALL-E) para criar o visual. Ex: 'foto minimalista de um cérebro com lâmpadas brilhantes, fundo azul pastel, estilo 3D, alta resolução.'"
      }
    ],
    "story_sequences": [
      {
        "theme": "Tema da sequência de stories (ex: Testando a técnica X)",
        "slides": [
          { "slide_number": 1, "type": "Poll", "content": "Você já tentou usar [técnica do tema]?", "options": ["Sim, sempre!", "Nunca, me ensina!"] },
          { "slide_number": 2, "type": "Text", "content": "Ok, a maioria nunca tentou! O maior erro é começar por X... O jeito certo é Y." }
        ]
      }
    ]
  }
}
`;

  const response = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Você é um assistente de IA que é um diretor criativo de marketing de conteúdo, e responde estritamente no formato JSON solicitado.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 8000,
  });

  const resultText = response.choices[0]?.message?.content;
  if (!resultText) {
    throw new Error("A IA (Groq) não retornou um resultado válido.");
  }

  try {
    return extractJson<BrainResults>(resultText);
  } catch  {
    console.error("Erro ao fazer parse do JSON do Groq:", resultText);
    throw new Error("O Groq retornou uma resposta em um formato JSON inválido.");
  }
}

function generateFallbackContent(theme: string): BrainResults {
  return {
    theme_summary: `Uma abordagem prática para iniciantes em ${theme}, focada em resultados rápidos.`,
    target_audience_suggestion: `Pessoas que já ouviram falar sobre ${theme} mas se sentem travadas para começar.`,
    content_pack: {
      reels: [{
        title: `3 Mitos sobre ${theme} que te Impedem de Começar`,
        hook: `Você provavelmente acredita em um desses 3 mitos sobre ${theme}...`,
        main_points: ["Mito 1: Precisa ser perfeito.", "Mito 2: Leva muito tempo.", "Mito 3: É apenas para especialistas."],
        cta: `Gostou? Salve este post e comece hoje mesmo!`
      }],
      carousels: [{
        title: `Guia de 5 Passos Para Seu Primeiro Sucesso com ${theme}`,
        slides: [
          { slide_number: 1, title: "Capa", content: `Seu Guia Rápido de ${theme}` },
          { slide_number: 2, title: "Passo 1: Defina UM objetivo.", content: "Não tente fazer tudo. Escolha uma única meta para começar." },
        ],
        cta_slide: "Salve para consultar e compartilhe com um amigo!"
      }],
      image_posts: [{
        idea: `Frase de impacto sobre ${theme}`,
        caption: `A jornada em ${theme} começa com um único passo. O importante não é ser perfeito, é começar. #motivacao #${theme}`,
        image_prompt: `frase de impacto '${"A jornada começa com um passo"}' em uma tipografia moderna e elegante, fundo gradiente suave, minimalista`
      }],
      story_sequences: [{
        theme: `Seu primeiro dia com ${theme}`,
        slides: [{ slide_number: 1, type: "Poll", content: `Quem aqui já começou em ${theme}?`, options: ["Eu!", "Ainda não"] }]
      }]
    }
  };
}

// =================================================================
// 4. ACTION PRINCIPAL
// =================================================================

export const generateContentIdeas = action({
  args: { theme: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    if (!args.theme.trim()) throw new Error("Tema não pode estar vazio.");
    if (args.theme.length > 150) throw new Error("Tema deve ter no máximo 150 caracteres.");
    if (!process.env.GROQ_API_KEY) {
        throw new Error("A API da Groq (GROQ_API_KEY) não está configurada no ambiente.");
    }

    try {
      console.log(`Gerando campanha de conteúdo para: "${args.theme}" usando Groq (Llama3-70b)`);
      const results = await generateWithGroq(args.theme);
      console.log("Sucesso ao gerar com Groq");

      if (!results.content_pack || !results.content_pack.reels) {
        throw new Error("Estrutura de resultados da IA está inválida");
      }
      return results;

    } catch (error) {
      console.error("Erro primário com Groq, usando fallback:", error);
      return generateFallbackContent(args.theme);
    }
  },
});