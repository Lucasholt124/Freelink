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
  };
}

// =================================================================
// 2. CONFIGURAÇÃO E FUNÇÕES HELPERS
// =================================================================

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Configuração da OpenAI como fallback
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// JSON parsing e helpers (mantidos como estavam)
function extractJsonFromText(text: string): string {
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const arrayStart = cleaned.indexOf('[');
  const objectStart = cleaned.indexOf('{');
  if (arrayStart === -1 && objectStart === -1) {
    throw new Error("Não foi possível encontrar o início de um JSON válido na resposta.");
  }

  let start = -1;
  if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
    start = arrayStart;
  } else {
    start = objectStart;
  }

  if (start !== -1) {
    cleaned = cleaned.substring(start);
  }

  const openChar = cleaned.startsWith('[') ? '[' : '{';
  const closeChar = cleaned.startsWith('[') ? ']' : '}';
  let balance = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (inString) {
      if (char === '"' && !escape) {
        inString = false;
      } else if (char === '\\') {
        escape = !escape;
      } else {
        escape = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === openChar) {
        balance++;
      } else if (char === closeChar) {
        balance--;
      }
    }

    if (balance === 0 && i > 0) {
      return cleaned.substring(0, i + 1);
    }
  }

  return cleaned;
}

function cleanAndFixJson(text: string): string {
  let cleaned = extractJsonFromText(text);
  cleaned = cleaned.replace(/,\s*([}```])/g, '$1');
  cleaned = cleaned.replace(/}\s*{/g, '},{');
  cleaned = cleaned.replace(/:(\s*)"((?:\\.|[^"])*)"/g, (match, whitespace, content) => {
    // Escapar aspas dentro de strings
    const escapedContent = content.replace(/(?<!\KATEX_INLINE_CLOSE")/g, '\\"');
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
// 3. LÓGICA DE GERAÇÃO DE CONTEÚDO REVOLUCIONÁRIA
// =================================================================

async function generateWithGroq(theme: string): Promise<BrainResults> {
  const prompt = `
# MISSÃO CRÍTICA: CRIAR CONTEÚDO QUE TRANSFORME VIDAS E NEGÓCIOS

## TEMA: "${theme}"

## SEU PAPEL:
Você é um GÊNIO CRIATIVO que combina:
- Psicologia comportamental avançada
- Técnicas de storytelling de Hollywood
- Gatilhos mentais comprovados cientificamente
- Estratégias de viralização do TikTok/Instagram
- Copywriting de conversão de 8 figuras

## MINDSET OBRIGATÓRIO:
1. **VALOR EXTREMO**: Cada peça de conteúdo deve ser tão valiosa que as pessoas pagariam para ter acesso
2. **EMOÇÃO PROFUNDA**: Faça as pessoas SENTIREM algo - medo de perder, esperança, urgência, transformação
3. **AÇÃO IMEDIATA**: Cada conteúdo deve gerar uma ação específica AGORA
4. **MEMORÁVEL**: Use histórias, analogias e exemplos que grudem na mente
5. **COMPARTILHÁVEL**: Crie conteúdo que as pessoas se ORGULHEM de compartilhar

## FÓRMULAS DE SUCESSO COMPROVADAS:

### Para REELS (15-30 segundos de puro impacto):
- Hook: Use a fórmula AIDA turbinada - capture atenção em 0.5 segundos
- Estrutura: Problema → Agitação → Solução Inesperada → Prova → CTA
- Linguagem: Direta, visual, com pausas dramáticas
- Final: Plot twist ou revelação que force replay

### Para CARROSSÉIS (Jornada de transformação):
- Slide 1: Promessa GRANDE e ESPECÍFICA com número
- Slides 2-3: Construa tensão mostrando o problema REAL
- Slides 4-7: Entregue valor ACIONÁVEL passo a passo
- Slide 8-9: Prova social ou case de sucesso
- Slide 10: CTA irresistível com urgência

### Para POSTS (Impacto visual + copy matadora):
- Visual: Contraste forte, texto grande, cores que param o scroll
- Copy: História pessoal → Lição universal → Pergunta provocativa
- Hashtags: Mix de alta competição + nicho específico

### Para STORIES (Engajamento em tempo real):
- Interatividade: Polls que revelam insights
- Sequência: Curiosidade → Conteúdo → Conversão
- Urgência: "Só hoje", "Últimas horas", "Exclusive"

## TÉCNICAS PSICOLÓGICAS AVANÇADAS:
1. **Efeito Zeigarnik**: Deixe loops abertos que forcem consumo
2. **Prova Social**: "9 em cada 10 pessoas não sabem isso..."
3. **Escassez**: "Só os primeiros 100 vão conseguir..."
4. **Autoridade**: "Método usado por [referência famosa]"
5. **Reciprocidade**: Dê tanto valor que sintam obrigação de retribuir

## GATILHOS EMOCIONAIS BRASILEIROS:
- Jeitinho brasileiro (soluções criativas)
- Superação (de pobre a rico)
- Família (proteção e provisão)
- Status social (o que os outros vão pensar)
- Economia (como economizar/ganhar mais)
- Praticidade (sem complicação)

## ESTRUTURA JSON OBRIGATÓRIA:
{
  "theme_summary": "Ângulo ÚNICO e PROVOCATIVO que ninguém está falando sobre ${theme}",
  "target_audience_suggestion": "Persona ULTRA específica com dores e desejos profundos",
  "content_pack": {
    "reels": [
      {
        "title": "Título que gera FOMO instantâneo",
        "hook": "Primeiros 3 segundos que PARAM o scroll. Use: pergunta chocante, estatística impossível, ou contradição",
        "main_points": [
          "Revelação 1: Quebre uma crença limitante",
          "Revelação 2: Mostre o caminho oculto",
          "Revelação 3: Dê a chave da transformação"
        ],
        "cta": "CTA que gera ação IMEDIATA com recompensa clara"
      },
      {
        "title": "Segundo Reel com ângulo complementar",
        "hook": "Hook diferente mas igualmente poderoso",
        "main_points": [
          "Ponto 1 com exemplo visual forte",
          "Ponto 2 com analogia memorável",
          "Ponto 3 com resultado tangível"
        ],
        "cta": "CTA com urgência e escassez"
      }
    ],
    "carousels": [
      {
        "title": "Promessa GRANDE com número específico (ex: 7 passos para...)",
        "slides": [
          { "slide_number": 1, "title": "CAPA MATADORA", "content": "Título principal + subtítulo que amplifica a promessa + elemento visual sugerido" },
          { "slide_number": 2, "title": "A GRANDE MENTIRA", "content": "Exponha o mito que todos acreditam sobre ${theme}" },
          { "slide_number": 3, "title": "A DOR OCULTA", "content": "Mostre a consequência real de continuar no erro" },
          { "slide_number": 4, "title": "A DESCOBERTA", "content": "Revele o insight transformador que muda tudo" },
          { "slide_number": 5, "title": "PASSO 1: [Ação Específica]", "content": "Primeiro passo ULTRA detalhado e fácil de implementar HOJE" },
          { "slide_number": 6, "title": "PASSO 2: [Ação Específica]", "content": "Segundo passo que constrói momentum" },
          { "slide_number": 7, "title": "PASSO 3: [Ação Específica]", "content": "Terceiro passo que consolida a transformação" },
          { "slide_number": 8, "title": "PROVA SOCIAL", "content": "Case real ou estatística que prova que funciona" },
          { "slide_number": 9, "title": "BÔNUS SECRETO", "content": "Dica extra que multiplica resultados" },
          { "slide_number": 10, "title": "AÇÃO AGORA", "content": "CTA específico com próximo passo claro" }
        ],
        "cta_slide": "Transforme sua vida com ${theme} HOJE! Salve e compartilhe com quem precisa ver isso 🚀"
      }
    ],
    "image_posts": [
      {
        "idea": "Frase de impacto que PARA o scroll e gera reflexão profunda",
        "caption": "História pessoal emocionante (3-4 parágrafos) → Transição para lição universal → Lista de 3-5 insights práticos → Pergunta que gera engajamento → CTA claro com benefício → Hashtags estratégicas",
        "image_prompt": "Design minimalista impactante: fundo gradiente vibrante (cores complementares), tipografia bold sans-serif, hierarquia visual clara, elemento gráfico que amplifica a mensagem, proporção 1:1 ou 4:5, estilo premium"
      },
      {
        "idea": "Comparação ANTES x DEPOIS sobre ${theme}",
        "caption": "Copy que conta a jornada de transformação com detalhes emocionais e práticos",
        "image_prompt": "Split screen dramático: lado esquerdo (antes) em tons frios/escuros, lado direito (depois) em tons quentes/vibrantes, ícones representativos, texto de impacto, setas de transformação"
      }
    ],
    "story_sequences": [
      {
        "theme": "Diagnóstico Rápido: Descubra seu nível em ${theme}",
        "slides": [
          { "slide_number": 1, "type": "Text", "content": "🚨 ATENÇÃO: 87% das pessoas estão fazendo ${theme} ERRADO. Vamos descobrir se você é uma delas?" },
          { "slide_number": 2, "type": "Poll", "content": "Primeira pergunta diagnóstica sobre ${theme}", "options": ["Opção que revela problema", "Opção que mostra potencial"] },
          { "slide_number": 3, "type": "Quiz", "content": "Teste rápido: Complete a frase sobre ${theme}...", "options": ["Resposta comum (errada)", "Resposta correta (surpreendente)"] },
          { "slide_number": 4, "type": "Text", "content": "REVELAÇÃO: Se você respondeu X, você está no caminho certo! Mas se respondeu Y... (explicação + solução rápida)" },
          { "slide_number": 5, "type": "Q&A", "content": "Me conta: qual sua maior dificuldade com ${theme}? Vou responder pessoalmente os melhores!" },
          { "slide_number": 6, "type": "Link", "content": "BÔNUS EXCLUSIVO 24H: Baixe meu guia gratuito '${theme} Descomplicado' → Link na bio! 🎁" }
        ]
      }
    ]
  }
}

LEMBRE-SE:
- Cada palavra deve ter um PROPÓSITO
- Cada conteúdo deve gerar uma TRANSFORMAÇÃO
- Cada CTA deve criar MOVIMENTO
- Use números, dados e especificidade SEMPRE
- Crie conteúdo que as pessoas SALVEM e COMPARTILHEM

Agora, REVOLUCIONE o tema "${theme}" com conteúdo que vai MUDAR VIDAS!
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Você é um GÊNIO do marketing de conteúdo viral. Crie conteúdo TRANSFORMADOR que gera resultados REAIS. Responda APENAS em JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9, // Aumentado para mais criatividade
      max_tokens: 8000,
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) {
      throw new Error("A IA (Groq) não retornou um resultado válido.");
    }

    return extractJson<BrainResults>(resultText);
  } catch (error) {
    console.error("Erro ao gerar com Groq:", error);

    // Tenta OpenAI como fallback se configurado
    if (openai) {
      try {
        console.log("Tentando gerar com OpenAI como fallback...");
        return await generateWithOpenAI(theme);
      } catch (openaiError) {
        console.error("Erro com OpenAI:", openaiError);
        throw new Error("Falha ao gerar conteúdo com ambas as APIs. Tente novamente mais tarde.");
      }
    } else {
      throw new Error(`Falha ao gerar conteúdo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  }
}

// Função de fallback com OpenAI
async function generateWithOpenAI(theme: string): Promise<BrainResults> {
  if (!openai) {
    throw new Error("OpenAI não está configurada.");
  }

  // Versão simplificada do prompt para economizar tokens
  const prompt = `
Crie um pacote completo de conteúdo para Instagram sobre "${theme}" que inclua:
- Um resumo estratégico do tema
- Identificação do público-alvo
- Reels com gancho viral, pontos principais e call-to-action
- Carrosséis com vários slides educativos
- Posts com legenda e prompt para imagem
- Sequências de stories interativas

Siga a estrutura JSON exata como mostrada abaixo:
{
  "theme_summary": "Resumo estratégico",
  "target_audience_suggestion": "Público-alvo",
  "content_pack": {
    "reels": [array de objetos com title, hook, main_points, cta],
    "carousels": [array de objetos com title, slides (array), cta_slide],
    "image_posts": [array de objetos com idea, caption, image_prompt],
    "story_sequences": [array de objetos com theme, slides (array)]
  }
}

Crie conteúdo disruptivo, acionável e emocional que gere compartilhamentos e conversões.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Você é um diretor criativo especializado em marketing de conteúdo viral. Responda EXCLUSIVAMENTE em JSON válido.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) {
      throw new Error("A OpenAI não retornou um resultado válido.");
    }

    return extractJson<BrainResults>(resultText);
  } catch (error) {
    console.error("Erro ao gerar com OpenAI:", error);
    return generateFallbackContent(theme);
  }
}

// Conteúdo de fallback caso ambas as APIs falhem
function generateFallbackContent(theme: string): BrainResults {
  return {
    theme_summary: `A verdade chocante sobre ${theme} que 97% das pessoas ignoram - e como usar isso a seu favor em 7 dias`,
    target_audience_suggestion: `Profissionais ambiciosos de 25-40 anos que sabem que ${theme} é importante mas estão frustrados com a falta de resultados reais e procuram um método comprovado`,
    content_pack: {
      reels: [
        {
          title: `O Erro Fatal em ${theme} que Está Destruindo Seus Resultados`,
          hook: `PARE TUDO! Se você faz ${theme} assim, está jogando tempo e dinheiro no lixo...`,
          main_points: [
            "O método tradicional foi criado em 1990 e está OBSOLETO",
            "3 empresas bilionárias mudaram a regra do jogo (e ninguém te contou)",
            "A técnica secreta que multiplica resultados em 10x com 80% menos esforço"
          ],
          cta: `Comenta "EU QUERO" e te mando o guia completo GRÁTIS por 24h! ⏰`
        },
        {
          title: `Como Dominar ${theme} em 30 Dias (Método Validado por 10.000+ Pessoas)`,
          hook: `De 0 a especialista em ${theme} em 30 dias? Sim, é possível. Vou provar...`,
          main_points: [
            "Dia 1-10: A base sólida que 90% pula (e se arrepende)",
            "Dia 11-20: O salto quântico com a técnica do 'Efeito Dominó'",
            "Dia 21-30: Automatização e escala exponencial"
          ],
          cta: `Salva esse post! Amanhã eu sumo com ele e você vai se arrepender 📌`
        }
      ],
      carousels: [
        {
          title: `Os 10 Mandamentos de ${theme} que Separam Amadores de Profissionais`,
          slides: [
            { slide_number: 1, title: "REVELAÇÃO CHOCANTE", content: `99% das pessoas fracassam em ${theme} por ignorar estas 10 regras de ouro` },
            { slide_number: 2, title: "A GRANDE ILUSÃO", content: `Você acha que ${theme} é sobre talento? ERRADO! É sobre sistema e execução` },
            { slide_number: 3, title: "MANDAMENTO #1", content: `Comece pelo FIM: Defina seu resultado ideal em ${theme} com clareza cirúrgica` },
            { slide_number: 4, title: "MANDAMENTO #2", content: `A Regra 80/20: Foque nas 20% das ações que geram 80% dos resultados` },
            { slide_number: 5, title: "MANDAMENTO #3", content: `Teste RÁPIDO: Lance imperfeito em 24h ao invés de perfeito em 6 meses` },
            { slide_number: 6, title: "MANDAMENTO #4", content: `Meça TUDO: "O que não é medido, não é melhorado" - Peter Drucker` },
            { slide_number: 7, title: "MANDAMENTO #5", content: `Automatize ou MORRA: Use ferramentas para multiplicar seu tempo em 10x` },
            { slide_number: 8, title: "O SEGREDO DOS TOPS", content: `Os top 1% em ${theme} aplicam TODOS esses mandamentos DIARIAMENTE` },
            { slide_number: 9, title: "SEU PRÓXIMO PASSO", content: `Escolha 1 mandamento e aplique HOJE. Resultados em 48h garantidos!` },
            { slide_number: 10, title: "BÔNUS EXCLUSIVO", content: `Arrasta pra cima para meu checklist completo de ${theme} (some em 24h!)` }
          ],
          cta_slide: "Você acabou de economizar 5 ANOS de tentativa e erro! Salve e aplique AGORA! 🚀"
        }
      ],
      image_posts: [
        {
          idea: `Frase controversa que desafia o senso comum sobre ${theme}`,
          caption: `Vou ser direto: ${theme} não é o que você pensa.\n\nPor 3 anos, eu segui todos os "gurus". Resultado? ZERO.\n\nAté que descobri uma verdade inconveniente: tudo que ensinam sobre ${theme} é baseado em um mundo que não existe mais.\n\nHoje, depois de [resultado específico], posso afirmar:\n\n✅ Não é sobre trabalhar mais duro\n✅ Não é sobre ter mais recursos  \n✅ Não é sobre sorte ou timing\n\nÉ sobre entender a nova regra do jogo.\n\nQuer saber qual é? Comenta "REGRA" que eu explico nos stories.\n\n#${theme} #transformação #mindset #sucesso #empreendedorismo`,
          image_prompt: `Design ultra-moderno: frase "${theme} é um jogo - aprenda as novas regras ou seja eliminado" em tipografia bold branca, fundo gradiente escuro (preto para roxo), elementos geométricos abstratos dourados, estilo premium minimalista, 1080x1080px`
        },
        {
          idea: `Comparação visual impactante: Método Antigo vs Método Novo em ${theme}`,
          caption: `A diferença entre fracassar e ter sucesso em ${theme}? Um SISTEMA.\n\nVeja a diferença:\n\nMÉTODO ANTIGO ❌\n• 8h por dia de esforço\n• Resultados em 2 anos\n• 90% desistem\n• ROI negativo\n\nMÉTODO NOVO ✅\n• 2h por dia focadas\n• Resultados em 30 dias\n• 90% continuam\n• ROI de 500%+\n\nQual você está usando?\n\n#${theme} #produtividade #resultado #método`,
          image_prompt: `Split screen dramático: lado esquerdo em vermelho/cinza mostrando caos e confusão, lado direito em verde/dourado mostrando clareza e sucesso, ícones minimalistas, dados e gráficos, ultra profissional`
        }
      ],
      story_sequences: [
        {
          theme: `Diagnóstico Relâmpago: Seu Nível Real em ${theme}`,
          slides: [
            { slide_number: 1, type: "Text", content: `⚡ ALERTA: 9 em cada 10 pessoas ACHAM que sabem ${theme}, mas estão no nível iniciante. E você?` },
            { slide_number: 2, type: "Poll", content: `Teste rápido: Quanto tempo você dedica para ${theme} por semana?`, options: ["Menos de 2h", "Mais de 10h"] },
            { slide_number: 3, type: "Quiz", content: `Qual desses é o MAIOR erro em ${theme}?`, options: ["Fazer sem estratégia", "Não fazer nada"] },
            { slide_number: 4, type: "Text", content: `PLOT TWIST: Se você escolheu "fazer sem estratégia", PARABÉNS! Você já está à frente de 70% 🎯` },
            { slide_number: 5, type: "Q&A", content: `Qual seu MAIOR desafio com ${theme} hoje? Respondendo todos com dicas personalizadas! 💪` },
            { slide_number: 6, type: "Link", content: `🎁 PRESENTE: Meu framework completo de ${theme} GRÁTIS por 24h! Corre no link da bio!` }
          ]
        }
      ]
    }
  };
}

// =================================================================
// 4. ACTION PRINCIPAL
// =================================================================

export const generateContentIdeas = action({
  args: {
    theme: v.string(),
    model: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    const { theme } = args;
    if (!theme.trim()) throw new Error("Tema não pode estar vazio.");
    if (theme.length > 150) throw new Error("Tema deve ter no máximo 150 caracteres.");

    // Verifica API keys
    if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
      throw new Error("Nenhuma API de IA está configurada no ambiente.");
    }

    try {
      console.log(`Gerando campanha revolucionária para: "${theme}" usando Groq (Llama3-70b)`);
      const results = await generateWithGroq(theme);
      console.log("Sucesso ao gerar conteúdo transformador com Groq");

      if (!results.content_pack || !results.content_pack.reels) {
        throw new Error("Estrutura de resultados da IA está inválida");
      }

      return results;
    } catch (error) {
      console.error("Erro primário com Groq, usando fallback otimizado:", error);
      return generateFallbackContent(theme);
    }
  },
});

// Action para gerar mensagens de outreach (sem dependência do banco de dados)
export const generateOutreachMessage = action({
  args: {
    businessType: v.string(),
    messageType: v.string(),
    customization: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    const { businessType, messageType, customization } = args;

    // Prompt simplificado para gerar mensagens de outreach
    const prompt = `
Crie uma mensagem de ${messageType} para um cliente do tipo ${businessType}.
${customization ? `Customizações: ${customization}` : ''}

Formato esperado:
{
  "title": "Título da mensagem",
  "content": "Conteúdo completo da mensagem",
  "businessType": "${businessType}",
  "messageType": "${messageType}"
}
`;

    try {
      // Usa Groq se disponível, caso contrário tenta OpenAI
      const ai = process.env.GROQ_API_KEY ? groq : (openai || null);
      if (!ai) throw new Error("Nenhuma API de IA configurada");

      const response = await ai.chat.completions.create({
        model: process.env.GROQ_API_KEY ? 'llama3-8b-8192' : 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Você é um especialista em vendas B2B e copywriting. Crie mensagens persuasivas e profissionais.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error("A IA não retornou um resultado válido.");
      }

      return extractJson(resultText);
    } catch (error) {
      console.error("Erro ao gerar mensagem:", error);

      // Retorna um fallback genérico
      return {
        title: `Mensagem de ${messageType} para ${businessType}`,
        content: "Não foi possível gerar a mensagem personalizada. Por favor, tente novamente mais tarde.",
        businessType,
        messageType
      };
    }
  },
});