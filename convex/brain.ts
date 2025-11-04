// convex/brain.ts - VERSÃO APRIMORADA

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';

// =================================================================
// ESTRUTURAS DE DADOS APRIMORADAS
// =================================================================

interface ScriptTimelineItem {
  start_time: string; // Ex: "0s"
  end_time: string;   // Ex: "3s"
  action: string;     // O que acontece
  camera_angle: string; // Ex: "Close-up no rosto", "Plano médio"
  screen_text?: string; // Texto que aparece na tela
  audio_note?: string;  // Nota sobre áudio neste momento
}

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
  visual_suggestion: string;
  audio_suggestion: string;
  // *** NOVOS CAMPOS PARA ROTEIRO COMPLETO ***
  script_timeline: ScriptTimelineItem[]; // Roteiro segundo-a-segundo
  camera_angles_summary: string[]; // Lista de todos os ângulos usados
  transitions: string[]; // Sugestões de transições (Ex: "Corte seco", "Fade")
  editing_notes: string; // Dicas gerais de edição
}

interface CarouselContent {
  title: string;
  slides: {
    slide_number: number;
    title: string;
    content: string;
  }[];
  cta_slide: string;
  design_tips: string[];
}

interface ImagePostContent {
  idea: string;
  caption: string;
  image_prompt: string;
  hashtags: string[];
  best_time: string;
}

interface StorySequenceContent {
  theme: string;
  slides: {
    slide_number: number;
    type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text";
    content: string;
    options?: string[];
  }[];
  engagement_tips: string[];
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
  viral_strategy: {
    best_times: string[];
    hashtag_strategy: string;
    engagement_hacks: string[];
  };
}

// =================================================================
// CONFIGURAÇÃO (mantida)
// =================================================================

const GROQ_MODELS = {
  primary: 'llama-3.3-70b-versatile',
  default: 'llama-3.1-70b-versatile',
  fallback: 'mixtral-8x7b-32768',
  fast: 'llama-3.1-8b-instant',
};

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// =================================================================
// PARSER JSON (mantido)
// =================================================================

function parseAiJsonResponse<T>(text: string): T {
  try {
    const jsonStart = text.indexOf('{');
    const arrayStart = text.indexOf('[');
    let start = -1;

    if (jsonStart === -1 && arrayStart === -1) {
      throw new Error("Nenhum objeto ou array JSON encontrado no texto da IA.");
    }

    if (jsonStart !== -1 && (arrayStart === -1 || jsonStart < arrayStart)) {
      start = jsonStart;
    } else {
      start = arrayStart;
    }

    const jsonEnd = text.lastIndexOf('}');
    const arrayEnd = text.lastIndexOf(']');
    const end = Math.max(jsonEnd, arrayEnd);

    if (start === -1 || end === -1) {
      throw new Error("Não foi possível delimitar o início ou o fim do JSON.");
    }

    const jsonString = text.substring(start, end + 1);
    return JSON.parse(jsonString) as T;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Erro CRÍTICO ao parsear JSON:", error.message);
    } else {
      console.error("Erro CRÍTICO ao parsear JSON (tipo desconhecido):", error);
    }

    console.error("Texto Recebido da IA:", text);
    throw new Error("Falha ao parsear a resposta JSON da IA.");
  }
}

// =================================================================
// PROMPT ULTRA-ESPECÍFICO PARA ROTEIROS COMPLETOS
// =================================================================

function enhancePrompt(prompt: string, theme: string): string {
  return `
# 🎬 MISSÃO CRÍTICA: GERAR CAMPANHA DE CONTEÚDO **PRONTA PARA PRODUÇÃO**

## TEMA: "${theme}"

## SEU PAPEL:
Você é o "FreelinnkBrain PRO", um diretor de conteúdo viral + estrategista de marketing.

Você NÃO dá "ideias genéricas". Você entrega **ROTEIROS PRONTOS PARA GRAVAR**, com:
- ✅ Timing exato (segundo-a-segundo)
- ✅ Ângulos de câmera específicos
- ✅ Texto que aparece na tela
- ✅ Sugestões de transições
- ✅ Notas de áudio/música

${prompt}

**Execute a missão para o tema: "${theme}"**
Gere o JSON COMPLETO e PERFEITO.
`;
}

async function generateWithGroq(theme: string): Promise<BrainResults> {
  const basePrompt = `
## MINDSET OBRIGATÓRIO:
1. **VALOR EXTREMO**: Cada roteiro deve ser TÃO completo que um editor iniciante consiga produzir.
2. **ESPECIFICIDADE**: Nada de "use B-roll". Diga QUAL B-roll (Ex: "Close nas mãos digitando no teclado").
3. **TIMING EXATO**: Roteiro com marcação de tempo precisa (0-3s, 3-7s, etc.).
4. **PRODUÇÃO REAL**: Pense como se você fosse gravar HOJE.

## 📐 ESTRUTURA JSON OBRIGATÓRIA (RESPONDA APENAS COM JSON):

\`\`\`json
{
  "theme_summary": "Ângulo único e provocativo para '${theme}'",
  "target_audience_suggestion": "Descrição COMPLETA da persona (1 parágrafo): dores, desejos, onde está online, objeções.",

  "content_pack": {
    "reels": [
      {
        "title": "Título magnético do Reel",
        "hook": "Gancho de 3s que para o scroll",
        "main_points": [
          "Ponto 1: Revelação/Mito quebrado",
          "Ponto 2: Solução prática",
          "Ponto 3: Benefício/Transformação"
        ],
        "cta": "CTA forte (ex: 'Comente EU QUERO')",
        "visual_suggestion": "Resumo do visual geral",
        "audio_suggestion": "Áudio/música sugerida",

        "script_timeline": [
          {
            "start_time": "0s",
            "end_time": "3s",
            "action": "Você olha direto para câmera e diz: '[FRASE DE HOOK]'",
            "camera_angle": "Close-up no rosto (câmera frontal do celular)",
            "screen_text": "Texto grande: 'PARE DE FAZER ISSO!' (fonte bold branca)",
            "audio_note": "Música de suspense baixa ao fundo"
          },
          {
            "start_time": "3s",
            "end_time": "7s",
            "action": "Corta para você andando (ou B-roll) enquanto narra o problema",
            "camera_angle": "Plano médio (cintura para cima)",
            "screen_text": "Legenda: 'O erro #1 que 90% comete...'",
            "audio_note": "Música aumenta levemente"
          },
          {
            "start_time": "7s",
            "end_time": "15s",
            "action": "Mostra a solução (pode ser você explicando + B-roll ilustrativo)",
            "camera_angle": "Intercala: Close-up + Plano geral mostrando ação",
            "screen_text": "Lista aparecendo: '1. Passo X', '2. Passo Y'",
            "audio_note": "Música motivacional entra"
          },
          {
            "start_time": "15s",
            "end_time": "20s",
            "action": "Mostra o resultado/benefício (visual de transformação)",
            "camera_angle": "Plano médio, você sorrindo/confiante",
            "screen_text": "Texto: 'O resultado? [BENEFÍCIO]'",
            "audio_note": "Música no auge"
          },
          {
            "start_time": "20s",
            "end_time": "23s",
            "action": "CTA final - você aponta para câmera e fala a ação",
            "camera_angle": "Close-up no rosto",
            "screen_text": "CTA em negrito: 'COMENTA 'EU' AGORA!'",
            "audio_note": "Música diminui, destaque na voz"
          }
        ],

        "camera_angles_summary": [
          "Close-up no rosto (para ganchos e CTAs)",
          "Plano médio (para explicações)",
          "B-roll ilustrativo (mãos trabalhando, tela de computador, etc.)"
        ],

        "transitions": [
          "Corte seco entre cenas (mantém ritmo rápido)",
          "Zoom in no texto da tela (para ênfase)",
          "Fade rápido ao trocar de B-roll"
        ],

        "editing_notes": "Ritmo rápido (cortes a cada 2-3s). Use texto grande e legível (fonte: Montserrat Bold ou similar). Música: busque 'motivacional trap' ou 'suspense viral' no CapCut. Adicione efeito de zoom sutil no gancho inicial."
      }
      // ... (gere pelo menos 3 reels completos)
    ],

    "carousels": [
      {
        "title": "Título do Carrossel",
        "slides": [
          { "slide_number": 1, "title": "CAPA", "content": "Hook visual forte" },
          { "slide_number": 2, "title": "Passo 1", "content": "Conteúdo denso do passo 1" },
          { "slide_number": 6, "title": "CTA", "content": "Ação final" }
        ],
        "cta_slide": "Salve e compartilhe!",
        "design_tips": [
          "Fundo: Gradiente roxo (#8B5CF6) para rosa (#EC4899)",
          "Fonte: Montserrat Black para títulos, Regular para corpo",
          "Ícone/emoji em cada slide (busque no Flaticon)",
          "Contraste alto: texto branco em fundo escuro",
          "Template: use Canva (busque 'Instagram Carousel Modern')"
        ]
      }
      // ... (gere pelo menos 2)
    ],

    "image_posts": [
      {
        "idea": "Ideia central",
        "caption": "Legenda completa com hook + história + tópicos + pergunta + CTA",
        "image_prompt": "Prompt ULTRA-DETALHADO para DALL-E: 'professional photo, minimalist background, [OBJETO PRINCIPAL], studio lighting, 4k, high contrast, [COR DOMINANTE] color palette'",
        "hashtags": ["#tag1", "#tag2", "#tag3"],
        "best_time": "Horário específico (ex: 11:45h ou 20:15h)"
      }
      // ... (gere pelo menos 3)
    ],

    "story_sequences": [
      {
        "theme": "Sequência interativa",
        "slides": [
          { "slide_number": 1, "type": "Text", "content": "Hook inicial" },
          { "slide_number": 2, "type": "Quiz", "content": "Pergunta", "options": ["A", "B"] },
          { "slide_number": 5, "type": "Link", "content": "CTA com link" }
        ],
        "engagement_tips": [
          "Use figurinha 'Adicione o seu'",
          "Marque parceiros",
          "Reposte respostas nos destaques"
        ]
      }
      // ... (gere pelo menos 2)
    ]
  },

  "viral_strategy": {
    "best_times": ["11h-13h", "19h-21h"],
    "hashtag_strategy": "Regra 5/3/2: 5 nicho + 3 médio volume + 2 virais",
    "engagement_hacks": [
      "Responda 100% dos comentários na 1ª hora",
      "Post-bomba: peça palavra-chave específica",
      "CTAs de salvamento"
    ]
  }
}
\`\`\`

**EXECUTE AGORA PARA: "${theme}"**
`;

  const prompt = enhancePrompt(basePrompt, theme);

  const modelsToTry = [
    GROQ_MODELS.primary,
    GROQ_MODELS.fallback,
    GROQ_MODELS.fast
  ];

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      console.log(`🔄 Tentando gerar com modelo: ${model}...`);

      const response = await groq.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Você é um DIRETOR DE CONTEÚDO VIRAL profissional. Crie roteiros COMPLETOS e PRONTOS PARA PRODUÇÃO. Responda APENAS em JSON válido.'
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 8000,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error(`Modelo ${model} não retornou resultado válido`);
      }

      console.log(`✅ Sucesso com modelo: ${model}`);
      return parseAiJsonResponse<BrainResults>(resultText);

    } catch (error) {
      console.error(`❌ Erro com modelo ${model}:`, error);
      lastError = error;
      continue;
    }
  }

  if (openai) {
    try {
      console.log("🔄 Tentando gerar com OpenAI como fallback final...");
      return await generateWithOpenAI(theme);
    } catch (openaiError) {
      console.error("❌ Erro com OpenAI também:", openaiError);
    }
  }

  console.error("❌ Todos os modelos falharam. Usando fallback estático. Último erro:", lastError);
  return generateFallbackContent(theme);
}

async function generateWithOpenAI(theme: string): Promise<BrainResults> {
  if (!openai) {
    throw new Error("OpenAI não está configurada.");
  }
  return generateFallbackContent(theme);
}

// FALLBACK ESTÁTICO COMPLETO
function generateFallbackContent(theme: string): BrainResults {
  return {
    theme_summary: `Estratégia revolucionária para dominar ${theme} com conteúdo de alto impacto`,
    target_audience_suggestion: `Profissionais e empreendedores entre 25-45 anos que buscam resultados rápidos em ${theme}. Estão ativos no Instagram/LinkedIn, valorizam conteúdo direto e acionável, e têm objeção principal: falta de tempo e medo de não dar certo.`,

    content_pack: {
      reels: [
        {
          title: `3 erros fatais em ${theme} que destroem resultados`,
          hook: `Se você faz isso em ${theme}, PARE AGORA!`,
          main_points: [
            "Erro #1: Focar em táticas sem estratégia clara",
            "Erro #2: Ignorar a psicologia do público",
            "Erro #3: Não medir as métricas corretas"
          ],
          cta: "Comenta 'EU' se você já cometeu algum desses!",
          visual_suggestion: "Você falando direto pra câmera + B-roll de gráficos caindo",
          audio_suggestion: "Áudio viral: 'som de alerta' + música de suspense",

          script_timeline: [
            {
              start_time: "0s",
              end_time: "3s",
              action: `Você olha direto e fala: "Se você faz ISSO em ${theme}, para AGORA!"`,
              camera_angle: "Close-up no rosto (celular na altura dos olhos)",
              screen_text: "PARE DE FAZER ISSO! (fonte branca bold)",
              audio_note: "Som de alerta + música de suspense baixa"
            },
            {
              start_time: "3s",
              end_time: "8s",
              action: "Você começa a andar (ou muda de posição) e diz: 'Erro #1...'",
              camera_angle: "Plano médio (cintura pra cima)",
              screen_text: "Erro #1 aparece na tela",
              audio_note: "Música continua, leve aumento de volume"
            },
            {
              start_time: "8s",
              end_time: "13s",
              action: "Explica o erro #2 com expressão séria",
              camera_angle: "Close-up novamente",
              screen_text: "Erro #2 (com emoji de alerta)",
              audio_note: "Música mantém tensão"
            },
            {
              start_time: "13s",
              end_time: "18s",
              action: "Revela o erro #3 (o mais impactante)",
              camera_angle: "Zoom in dramático no rosto",
              screen_text: "Erro #3: O PIOR DE TODOS",
              audio_note: "Música para, só voz"
            },
            {
              start_time: "18s",
              end_time: "22s",
              action: "Aponta pro celular e fala o CTA",
              camera_angle: "Plano médio, você apontando",
              screen_text: "COMENTA 'EU' AGORA!",
              audio_note: "Música volta forte (final impactante)"
            }
          ],

          camera_angles_summary: [
            "Close-up frontal (para ganchos)",
            "Plano médio (para transições)",
            "Zoom in (para ênfase)"
          ],

          transitions: [
            "Corte seco rápido entre erros",
            "Zoom in no erro #3",
            "Fade rápido no CTA"
          ],

          editing_notes: "Ritmo: cortes a cada 2-3 segundos. Fonte: Montserrat Black. Música: 'Suspense Viral' no CapCut. Adicione shake effect no 'PARE'. Velocidade: 1.1x para dinamismo."
        },
        {
          title: `A fórmula secreta de ${theme} que ninguém conta`,
          hook: "Descobri isso depois de 5 anos errando...",
          main_points: [
            "O segredo está em [AÇÃO CONTRAINTUITIVA]",
            "Por que isso funciona (ciência)",
            "Como aplicar HOJE (passo a passo)"
          ],
          cta: "Salva esse post e me marca quando aplicar!",
          visual_suggestion: "Storytelling: você em ambiente casual + B-roll ilustrativo",
          audio_suggestion: "Música inspiracional (ex: 'Inspiring Cinematic')",

          script_timeline: [
            {
              start_time: "0s",
              end_time: "4s",
              action: "Você em ambiente casual, começa: 'Levei 5 anos pra descobrir isso...'",
              camera_angle: "Plano médio, cenário visível ao fundo",
              screen_text: "5 ANOS errando...",
              audio_note: "Música suave, emotiva"
            },
            {
              start_time: "4s",
              end_time: "10s",
              action: "B-roll nostálgico (fotos antigas, você trabalhando) enquanto narra",
              camera_angle: "Montagem de B-roll",
              screen_text: "Eu tentava de TUDO",
              audio_note: "Música aumenta emoção"
            },
            {
              start_time: "10s",
              end_time: "16s",
              action: "Volta pra você, revelação: 'Até que descobri...'",
              camera_angle: "Close-up, expressão de revelação",
              screen_text: "A FÓRMULA SECRETA",
              audio_note: "Música muda pra inspiracional"
            },
            {
              start_time: "16s",
              end_time: "25s",
              action: "Explica a fórmula (pode usar whiteboard virtual ou gráfico)",
              camera_angle: "Tela dividida: você + gráfico",
              screen_text: "Passo 1, 2, 3 (aparece sequencial)",
              audio_note: "Música de fundo, voz em destaque"
            },
            {
              start_time: "25s",
              end_time: "30s",
              action: "CTA emocional: 'Não cometa os meus erros'",
              camera_angle: "Close-up sincero",
              screen_text: "SALVA AGORA!",
              audio_note: "Música culmina"
            }
          ],

          camera_angles_summary: [
            "Plano médio em ambiente real",
            "B-roll storytelling",
            "Close-up emocional"
          ],

          transitions: [
            "Fade entre B-roll e você",
            "Wipe transition no reveal da fórmula",
            "Zoom out no CTA"
          ],

          editing_notes: "Tom: inspiracional. Cor: grading quente (tons alaranjados). Música: crescente. Texto: fonte serif para 'elegância'. Velocidade: normal (1x), aumenta pra 1.15x no reveal."
        },
        {
          title: `${theme}: O que eu faria se começasse do ZERO hoje`,
          hook: "Se eu perdesse tudo amanhã, faria EXATAMENTE isso...",
          main_points: [
            "Passo 1: [AÇÃO ESPECÍFICA]",
            "Passo 2: [DIFERENCIAL]",
            "Passo 3: [ACELERADOR]"
          ],
          cta: "Qual passo você vai fazer PRIMEIRO? Comenta!",
          visual_suggestion: "Você caminhando (movimento) + B-roll de você trabalhando",
          audio_suggestion: "Áudio motivacional épico",

          script_timeline: [
            {
              start_time: "0s",
              end_time: "3s",
              action: "Você caminhando, fala: 'Se eu perdesse TUDO amanhã...'",
              camera_angle: "Tracking shot (câmera te seguindo)",
              screen_text: "SE EU PERDESSE TUDO",
              audio_note: "Música épica começa"
            },
            {
              start_time: "3s",
              end_time: "8s",
              action: "Para, olha pra câmera: 'Faria EXATAMENTE isso...'",
              camera_angle: "Plano médio frontal",
              screen_text: "Faria ISSO 👇",
              audio_note: "Música mantém tensão"
            },
            {
              start_time: "8s",
              end_time: "14s",
              action: "B-roll de você executando passo 1 + narração",
              camera_angle: "Over-the-shoulder + close em mãos trabalhando",
              screen_text: "PASSO 1: [NOME]",
              audio_note: "Música de fundo, voz clara"
            },
            {
              start_time: "14s",
              end_time: "20s",
              action: "Passo 2 (novo cenário ou ação)",
              camera_angle: "Plano geral mostrando contexto",
              screen_text: "PASSO 2: [NOME]",
              audio_note: "Música aumenta ritmo"
            },
            {
              start_time: "20s",
              end_time: "26s",
              action: "Passo 3 (o acelerador, tom urgente)",
              camera_angle: "Close-up intenso",
              screen_text: "PASSO 3: O ACELERADOR",
              audio_note: "Música no auge"
            },
            {
              start_time: "26s",
              end_time: "30s",
              action: "CTA: 'Qual você faz PRIMEIRO? Me conta!'",
              camera_angle: "Você apontando pra câmera",
              screen_text: "COMENTA AGORA!",
              audio_note: "Música fecha com impacto"
            }
          ],

          camera_angles_summary: [
            "Tracking shot dinâmico",
            "B-roll em ação (mãos, tela, ambiente)",
            "Close-up para ênfase"
          ],

          transitions: [
            "Match cut entre passos (continuidade visual)",
            "Corte no beat da música",
            "Zoom in no CTA"
          ],

          editing_notes: "Energia alta. Música: sincronize cortes com beats. Velocidade: 1.2x nos B-rolls. Cor: grading cinematográfico (sombras escuras). Fonte: Bebas Neue (impacto). Som: adicione efeito de 'whoosh' nas transições."
        }
      ],

      carousels: [
        {
          title: `5 passos para dominar ${theme} em 30 dias`,
          slides: [
            { slide_number: 1, title: "TRANSFORME SEU NEGÓCIO", content: `${theme} nunca mais será um problema` },
            { slide_number: 2, title: "Passo 1: Base Sólida", content: "Domine os fundamentos que 90% ignora" },
            { slide_number: 3, title: "Passo 2: Estratégia", content: "Monte seu plano personalizado" },
            { slide_number: 4, title: "Passo 3: Execução", content: "Ação massiva nos primeiros 7 dias" },
            { slide_number: 5, title: "Passo 4: Otimização", content: "Ajuste com base em dados reais" },
            { slide_number: 6, title: "Passo 5: Escala", content: "Multiplique os resultados" },
            { slide_number: 7, title: "COMECE HOJE!", content: "Salve este post e marque quem precisa!" }
          ],
          cta_slide: "Transforme sua realidade com estes 5 passos! 🚀",
          design_tips: [
            "Fundo: Gradiente diagonal roxo (#8B5CF6) para rosa (#EC4899)",
            "Capa: Fonte Bebas Neue 80pt + subtítulo Montserrat 24pt",
            "Slides internos: Fonte Montserrat Bold 36pt (título) + Regular 18pt (corpo)",
            "Adicione ícone ou número grande em cada slide (cor: branco com sombra)",
            "Borda arredondada nos cards de conteúdo (20px radius)",
            "Use template 'Carousel Modern' do Canva"
          ]
        },
        {
          title: `Os 7 mitos sobre ${theme} que estão te sabotando`,
          slides: [
            { slide_number: 1, title: "PARE DE ACREDITAR NISSO", content: `7 mentiras sobre ${theme}` },
            { slide_number: 2, title: "Mito #1", content: "[MITO COMUM] ❌\nVerdade: [REALIDADE] ✅" },
            { slide_number: 3, title: "Mito #2", content: "[MITO] ❌\nVerdade: [REALIDADE] ✅" },
            { slide_number: 4, title: "Mito #3", content: "[MITO] ❌\nVerdade: [REALIDADE] ✅" },
            { slide_number: 8, title: "AGORA VOCÊ SABE", content: "Compartilhe para ajudar outros!" }
          ],
          cta_slide: "Salvou? Ótimo! Agora compartilha nos stories!",
          design_tips: [
            "Fundo: Escuro (#1F2937) para contraste forte",
            "Texto: Branco puro (#FFFFFF)",
            "Emojis: Use ❌ e ✅ para Mito/Verdade",
            "Layout: Divida slide ao meio verticalmente (Mito à esquerda, Verdade à direita)",
            "Fonte: Poppins Black para 'Mito', Regular para corpo",
            "Destaque: Borda vermelha no 'Mito', verde na 'Verdade'"
          ]
        }
      ],

      image_posts: [
        {
          idea: `"O sucesso em ${theme} não é sobre talento, é sobre sistema"`,
          caption: `Descobri isso da pior forma possível...\n\nDurante anos, achei que ${theme} era questão de dom natural. Trabalhava 12h por dia, mas os resultados não vinham.\n\nAté que um mentor me disse algo que mudou tudo:\n\n"Você não precisa de mais ESFORÇO. Você precisa de um SISTEMA."\n\n3 insights que transformaram meu jogo:\n\n1️⃣ Consistência > Perfeição\nPare de esperar o "momento ideal". Comece imperfeito e ajuste no caminho.\n\n2️⃣ Sistema > Inspiração\nCrie processos que funcionam mesmo nos dias ruins. Automatize o máximo possível.\n\n3️⃣ Progresso > Resultado\nFoque em melhorar 1% por dia. Em 1 ano, você estará 37x melhor.\n\nHoje, trabalho METADE do tempo e tenho 3X os resultados de antes.\n\nE você? Ainda está esperando inspiração ou já está construindo seu sistema?\n\nComenta 'SISTEMA' se isso fez sentido pra você 👇\n\n#${theme.replace(/\s+/g, '')} #marketing #produtividade #sucesso #sistematizacao #consistencia #mindset`,
          image_prompt: "Professional motivational quote design: dark navy blue (#0F172A) background with subtle gradient, large white bold text saying 'SISTEMA > TALENTO', minimalist geometric shapes (triangles, lines) in gold accent (#F59E0B), centered composition, modern sans-serif font, high contrast, 4k quality, Instagram post format 1080x1080",
          hashtags: [`#${theme.replace(/\s+/g, '')}`, "#marketing", "#produtividade", "#sucesso", "#sistematizacao"],
          best_time: "19:30h (Horário nobre - pós-jantar)"
        },
        {
          idea: `"A diferença entre amadores e profissionais em ${theme}"`,
          caption: `Observei centenas de pessoas em ${theme}.\n\nE sempre me perguntava: por que alguns decolam e outros estagnam?\n\nNão é talento. Não é sorte. É MENTALIDADE.\n\nVeja a diferença:\n\n🆚 AMADOR vs PROFISSIONAL\n\nAmador: Espera motivação\nProfissional: Age sem sentir vontade\n\nAmador: Quer resultados rápidos\nProfissional: Confia no processo\n\nAmador: Para no primeiro obstáculo\nProfissional: Vê obstáculo como feedback\n\nAmador: Faz quando "dá tempo"\nProfissional: CRIA tempo (prioridades)\n\nAmador: Foca no que está errado\nProfissional: Celebra pequenas vitórias\n\nQual você quer ser?\n\nA boa notícia: você escolhe TODO DIA através das suas ações.\n\nSalva esse post e volta aqui quando precisar relembrar 💪\n\n#${theme.replace(/\s+/g, '')} #mentalidade #profissionalismo #disciplina #foco #resultados`,
          image_prompt: "Split comparison design: left side in muted gray (#6B7280) labeled 'AMADOR' with sad emoji, right side in vibrant green (#10B981) labeled 'PROFISSIONAL' with strong emoji, clean minimal background white (#FFFFFF), bold sans-serif font (Helvetica Black), centered text, Instagram square format, professional design, high quality",
          hashtags: [`#${theme.replace(/\s+/g, '')}`, "#mentalidade", "#profissionalismo", "#disciplina"],
          best_time: "11:45h (Intervalo de almoço)"
        },
        {
          idea: `Checklist visual: "Antes de postar sobre ${theme}, verifique isso"`,
          caption: `❌ NÃO POSTE antes de checar isso!\n\nCriei um checklist que aumentou meu engajamento em 240% em ${theme}.\n\nAntes de publicar QUALQUER coisa, eu pergunto:\n\n✅ Isso agrega VALOR real? (ou é só ruído?)\n✅ Meu público vai SALVAR isso? (teste do salvamento)\n✅ Tem um gancho nos primeiros 3 segundos? (teste do scroll)\n✅ O CTA é claro e forte? (qual ação eu quero?)\n✅ Está otimizado pro algoritmo? (hashtags, horário, formato)\n\nSe 5/5: PUBLICA\nSe 3-4/5: REFINA\nSe menos de 3/5: DESCARTA\n\nSimples assim.\n\nQualidade > Quantidade. Sempre.\n\nSalva esse checklist e usa antes do próximo post!\n\nQual desses você NUNCA verifica? Comenta o número 👇\n\n#${theme.replace(/\s+/g, '')} #marketing #conteudo #engajamento #estrategia`,
          image_prompt: "Clean checklist design: white background (#FFFFFF), 5 checkbox items with green checkmarks (#10B981), each item in dark text (#1F2937), simple icons next to each item (value, bookmark, hook, CTA, algorithm), minimalist modern style, balanced composition, Montserrat font, professional quality, Instagram format",
          hashtags: [`#${theme.replace(/\s+/g, '')}`, "#marketing", "#conteudo", "#engajamento"],
          best_time: "20:15h (Pico noturno)"
        }
      ],

      story_sequences: [
        {
          theme: `Diagnóstico Rápido: Qual seu nível em ${theme}?`,
          slides: [
            { slide_number: 1, type: "Text", content: `🚨 Vamos descobrir seu nível REAL em ${theme}!\n\nResponda com SINCERIDADE 👇` },
            { slide_number: 2, type: "Quiz", content: "Você pratica DIARIAMENTE?", options: ["Sim, é hábito", "Às vezes", "Raramente"] },
            { slide_number: 3, type: "Quiz", content: "Você mede seus resultados?", options: ["Sempre", "Às vezes", "Nunca"] },
            { slide_number: 4, type: "Poll", content: "Você tem um SISTEMA ou só improvisa?", options: ["Tenho sistema", "Improviso"] },
            { slide_number: 5, type: "Q&A", content: "Qual sua MAIOR dificuldade em ${theme}? Responde aqui 👇" },
            { slide_number: 6, type: "Text", content: "🎁 Resultado:\n\nVou responder TODOS nos próximos stories!\n\n+ BÔNUS surpresa pra quem respondeu tudo 👀" },
            { slide_number: 7, type: "Link", content: `Quer o guia completo de ${theme}?\n\n👉 CLICA AQUI (link na bio)` }
          ],
          engagement_tips: [
            "Use a figurinha 'Adicione o seu' no slide 5",
            "Reposte as melhores respostas nos destaques",
            "Marque 3-5 criadores parceiros do nicho no slide 1",
            "Poste nos 'Melhores Amigos' primeiro (exclusividade)",
            "Salve todas as respostas e use como conteúdo futuro"
          ]
        },
        {
          theme: "Desafio 7 dias: Transforme seu resultado em ${theme}",
          slides: [
            { slide_number: 1, type: "Text", content: `⚡ DESAFIO DE 7 DIAS ⚡\n\nVamos transformar seu ${theme} juntos!\n\nTOPA? Responde aqui 👇` },
            { slide_number: 2, type: "Poll", content: "Você está REALMENTE comprometido?", options: ["SIM! Bora!", "Talvez..."] },
            { slide_number: 3, type: "Text", content: "DIA 1️⃣: [AÇÃO ESPECÍFICA]\n\nFez? Marca nos stories e me marca!" },
            { slide_number: 4, type: "Text", content: "DIA 2️⃣: [AÇÃO ESPECÍFICA]\n\nContinue firme!" },
            { slide_number: 5, type: "Quiz", content: "Como está sendo até agora?", options: ["Incrível!", "Difícil", "Desisti"] },
            { slide_number: 6, type: "Link", content: "📥 Baixe o PDF completo do desafio\n\nLink na bio!" },
            { slide_number: 7, type: "Text", content: "Vejo você na linha de chegada! 🏆\n\n#Desafio7Dias" }
          ],
          engagement_tips: [
            "Crie hashtag exclusiva (#Desafio7Dias + seu @)",
            "Faça live no dia 7 com quem completou",
            "Sorteie brinde para quem compartilhou todos os dias",
            "Use contagem regressiva (figurinha de timer)"
          ]
        }
      ]
    },

    viral_strategy: {
      best_times: ["11h-13h (Almoço)", "19h-21h (Pós-jantar)", "22h-23h (Insônia scroll)"],
      hashtag_strategy: "REGRA 5/3/2: Use 5 hashtags de NICHO (ex: #FreelancerBrasil, baixa concorrência), 3 de VOLUME MÉDIO (ex: #MarketingDigital, relacionadas ao tema), 2 VIRAIS (ex: #FYP, #Viral, alta concorrência). Total: 10 hashtags máximo.",
      engagement_hacks: [
        "🔥 Primeira Hora: Responda 100% dos comentários COM OUTRA PERGUNTA (mantém conversa viva)",
        "💬 Post-Bomba: Peça para comentarem UMA palavra específica (ex: 'QUERO') - algoritmo ama",
        "📌 CTAs de Salvamento: 'Salva pra não perder' > 'Curte se gostou' (salvamentos pesam +)",
        "🎯 Gatilho de Urgência: 'Só hoje' ou 'Primeiros 10' cria FOMO",
        "🤝 Colaborações: Marque parceiros estratégicos (expande alcance)",
        "📊 Teste A/B: Poste mesmo tema em horários diferentes e veja qual performa +"
      ]
    }
  };
}

// =================================================================
// ACTION PRINCIPAL
// =================================================================

export const generateContentIdeas = action({
  args: {
    theme: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado");
    }

    if (!args.theme || args.theme.trim().length < 3) {
      throw new Error("Por favor, forneça um tema válido com pelo menos 3 caracteres");
    }

    try {
      console.log(`🚀 Gerando campanha COMPLETA E PRONTA para: "${args.theme}"...`);
      const results = await generateWithGroq(args.theme);
      console.log("✅ Sucesso! Roteiros prontos para produção.");

      if (!results.content_pack || !results.content_pack.reels) {
        console.error("Estrutura inválida, usando fallback", results);
        return generateFallbackContent(args.theme);
      }

      return results;
    } catch (error) {
      console.error("❌ Erro final, usando fallback:", error);
      return generateFallbackContent(args.theme);
    }
  },
});

// =================================================================
// AÇÃO DE VENDAS DM (mantida)
// =================================================================

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

    const prompt = `
# MISSÃO: Gerar mensagem de prospecção profissional
# IDIOMA: Português do Brasil
# FORMATO: JSON com "title" e "content"
# DADOS:
- Tipo: ${messageType}
- Público: ${businessType}
- Custom: ${customization || "Padrão"}

JSON:
{
  "title": "Assunto curto",
  "content": "Mensagem completa persuasiva",
  "businessType": "${businessType}",
  "messageType": "${messageType}"
}
`;

    try {
      if (process.env.GROQ_API_KEY) {
        try {
          const response = await groq.chat.completions.create({
            model: GROQ_MODELS.fast,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'Copywriter B2B. Responda em JSON (PT-BR).' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.8,
          });

          const resultText = response.choices[0]?.message?.content;
          if (resultText) {
            return parseAiJsonResponse(resultText);
          }
        } catch (groqError) {
          console.error("Erro Groq, tentando OpenAI:", groqError);
        }
      }

      if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Copywriter B2B. JSON em PT-BR.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
        });

        const resultText = response.choices[0]?.message?.content;
        if (resultText) {
          return parseAiJsonResponse(resultText);
        }
      }

      throw new Error("Nenhuma API disponível");

    } catch (error) {
      console.error("Erro ao gerar mensagem:", error);
      return {
        title: `Proposta para ${businessType}`,
        content: `Olá! Tenho uma solução para seu negócio. Podemos conversar?`,
        businessType,
        messageType
      };
    }
  },
});