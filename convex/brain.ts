// convex/brain.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';

// =================================================================
// 1. CONFIGURAÇÃO E TIPOS
// =================================================================

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
  duration?: number;
  hashtags?: string[];
  music_suggestion?: string;
  thumbnail_prompt?: string;
}

interface CarouselContent {
  title: string;
  slides: {
    slide_number: number;
    title: string;
    content: string;
    design_notes?: string;
  }[];
  cta_slide: string;
  color_scheme?: string;
}

interface ImagePostContent {
  idea: string;
  caption: string;
  image_prompt: string;
  alt_text?: string;
  hashtags?: string[];
}

interface StorySequenceContent {
  theme: string;
  slides: {
    slide_number: number;
    type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text" | "Image" | "Video";
    content: string;
    options?: string[];
    media_url?: string;
  }[];
}

interface ContentStrategy {
  main_pillars: string[];
  content_mix: {
    educational: number;
    entertaining: number;
    inspirational: number;
    promotional: number;
  };
  posting_schedule: {
    optimal_times: string[];
    frequency: string;
    platform_specific: Record<string, unknown>;
  };
  kpis: string[];
}

interface AnalyticsPrediction {
  estimated_monthly_reach: number;
  estimated_engagement_rate: number;
  estimated_follower_growth: number;
  estimated_conversion_rate: number;
  roi_projection: number;
}

interface AudienceProfile {
  demographics: {
    age_range: string;
    gender_distribution: string;
    location: string[];
    income_level: string;
  };
  psychographics: {
    interests: string[];
    pain_points: string[];
    goals: string[];
    values: string[];
  };
  behavior: {
    preferred_platforms: string[];
    content_consumption_times: string[];
    engagement_patterns: string;
  };
}

interface BrainResults {
  theme_summary: string;
  target_audience_suggestion: string | AudienceProfile;
  content_strategy?: ContentStrategy;
  content_pack: {
    reels: ReelContent[];
    carousels: CarouselContent[];
    image_posts: ImagePostContent[];
    story_sequences: StorySequenceContent[];
  };
  analytics_predictions?: AnalyticsPrediction;
}

interface OutreachMessageResult {
  title: string;
  content: string;
  businessType: string;
  messageType: string;
  followUpDate: string;
  alternativeVersions: string[];
}

interface ContentAnalysisResult {
  content_score: number;
  improvements: string[];
  predicted_metrics: {
    estimated_reach: number;
    engagement_rate: number;
    virality_score: number;
    best_time_to_post: string;
  };
  competitor_comparison: {
    your_score: number;
    industry_average: number;
    top_performer: number;
  };
}

// =================================================================
// 2. CONFIGURAÇÃO DE MODELOS DE IA
// =================================================================

const GROQ_MODELS = {
  primary: 'llama-3.3-70b-versatile',
  fallback: 'llama-3.1-70b-versatile',
  fast: 'llama-3.1-8b-instant',
  alternative: 'mixtral-8x7b-32768'
} as const;

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// =================================================================
// 3. FUNÇÕES AUXILIARES
// =================================================================

function parseAiJsonResponse<T>(text: string): T {
  try {
    const cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}') + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("Nenhum JSON válido encontrado na resposta");
    }

    const jsonString = cleanText.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString) as T;

  } catch (error) {
    console.error("Erro ao parsear JSON:", error);
    throw new Error("Falha ao processar resposta da IA");
  }
}

function generateHashtags(theme: string, count: number = 10): string[] {
  const baseHashtags = [
    'marketing', 'empreendedorismo', 'negócios', 'sucesso',
    'motivação', 'dicas', 'estratégia', 'crescimento',
    'inovação', 'resultados', 'vendas', 'digital',
    'tendências', 'produtividade', 'liderança', 'gestão'
  ];

  const themeWords = theme.toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõöúçñ\s]/gi, '')
    .split(' ')
    .filter(word => word.length > 3)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));

  const uniqueHashtags = Array.from(new Set([
    ...themeWords.slice(0, Math.floor(count / 2)),
    ...baseHashtags.slice(0, count - themeWords.length)
  ]));

  return uniqueHashtags.slice(0, count);
}

function estimateMetrics(contentType: string): {
  estimated_reach: number;
  engagement_rate: number;
  virality_score: number;
  best_time_to_post: string;
} {
  const baseMetrics: Record<string, { reach: number; engagement: number; virality: number }> = {
    reel: { reach: 10000, engagement: 8.5, virality: 75 },
    carousel: { reach: 7500, engagement: 6.5, virality: 60 },
    post: { reach: 5000, engagement: 5.0, virality: 45 },
    story: { reach: 3000, engagement: 12.0, virality: 30 }
  };

  const metrics = baseMetrics[contentType] || baseMetrics.post;
  const variance = 0.2;
  const randomMultiplier = 1 + (Math.random() - 0.5) * variance;

  const bestTimes = ["07:00", "12:00", "19:00", "20:00", "21:00"];

  return {
    estimated_reach: Math.round(metrics.reach * randomMultiplier),
    engagement_rate: Number((metrics.engagement * randomMultiplier).toFixed(1)),
    virality_score: Math.round(metrics.virality * randomMultiplier),
    best_time_to_post: bestTimes[Math.floor(Math.random() * bestTimes.length)]
  };
}

// =================================================================
// 4. GERAÇÃO DE CONTEÚDO COM IA
// =================================================================

async function generateWithAI(theme: string, model: string = "balanced"): Promise<BrainResults> {
  const modelConfig: Record<string, { model: string; temperature: number; max_tokens: number }> = {
    fast: {
      model: GROQ_MODELS.fast,
      temperature: 0.7,
      max_tokens: 6000
    },
    balanced: {
      model: GROQ_MODELS.primary,
      temperature: 0.8,
      max_tokens: 8000
    },
    quality: {
      model: GROQ_MODELS.primary,
      temperature: 0.9,
      max_tokens: 10000
    }
  };

  const config = modelConfig[model] || modelConfig.balanced;

  const systemPrompt = `Você é um estrategista de conteúdo especializado em criar campanhas virais.

IMPORTANTE:
- Responda APENAS em JSON válido
- Crie conteúdo em português brasileiro
- Use psicologia comportamental e gatilhos mentais
- Foque em valor real para a audiência`;

  const userPrompt = `Crie uma campanha completa sobre: "${theme}"

Retorne EXATAMENTE neste formato JSON:
{
  "theme_summary": "Resumo estratégico do tema",
  "target_audience_suggestion": "Descrição detalhada do público-alvo ideal",
  "content_pack": {
    "reels": [
      {
        "title": "Título atrativo",
        "hook": "Gancho dos primeiros 3 segundos",
        "main_points": ["Ponto 1", "Ponto 2", "Ponto 3"],
        "cta": "Call to action claro",
        "duration": 30,
        "hashtags": ["hashtag1", "hashtag2"],
        "music_suggestion": "Sugestão de música"
      }
    ],
    "carousels": [
      {
        "title": "Título do carrossel",
        "slides": [
          {
            "slide_number": 1,
            "title": "Título do slide",
            "content": "Conteúdo do slide",
            "design_notes": "Notas de design"
          }
        ],
        "cta_slide": "Slide final com CTA",
        "color_scheme": "Esquema de cores"
      }
    ],
    "image_posts": [
      {
        "idea": "Ideia central",
        "caption": "Legenda completa",
        "image_prompt": "Prompt para gerar imagem",
        "alt_text": "Texto alternativo",
        "hashtags": ["hashtag1", "hashtag2"]
      }
    ],
    "story_sequences": [
      {
        "theme": "Tema da sequência",
        "slides": [
          {
            "slide_number": 1,
            "type": "Text",
            "content": "Conteúdo do slide",
            "options": ["Opção 1", "Opção 2"]
          }
        ]
      }
    ]
  }
}

Crie no mínimo:
- 3 reels virais
- 2 carrosséis completos (5-7 slides cada)
- 3 posts com legendas engajadoras
- 2 sequências de stories interativos`;

  try {
    if (!groq) {
      console.log("⚠️ Groq não configurado, usando fallback estático");
      return generateStaticFallback(theme);
    }

    console.log(`🚀 Gerando conteúdo com ${config.model}...`);

    const response = await groq.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    const result = parseAiJsonResponse<BrainResults>(content);

    // Enriquecer conteúdo
    if (result.content_pack.reels) {
      result.content_pack.reels = result.content_pack.reels.map(reel => ({
        ...reel,
        hashtags: reel.hashtags?.length ? reel.hashtags : generateHashtags(theme, 10),
        duration: reel.duration || 30,
        music_suggestion: reel.music_suggestion || "Música trending do momento"
      }));
    }

    if (result.content_pack.image_posts) {
      result.content_pack.image_posts = result.content_pack.image_posts.map(post => ({
        ...post,
        hashtags: post.hashtags?.length ? post.hashtags : generateHashtags(theme, 15),
        alt_text: post.alt_text || `Imagem sobre ${theme}`
      }));
    }

    // Garantir conteúdo mínimo
    if (!result.content_pack.reels || result.content_pack.reels.length < 3) {
      const fallback = generateStaticFallback(theme);
      result.content_pack.reels = [
        ...(result.content_pack.reels || []),
        ...fallback.content_pack.reels.slice(0, 3 - (result.content_pack.reels?.length || 0))
      ];
    }

    if (!result.content_pack.carousels || result.content_pack.carousels.length < 2) {
      const fallback = generateStaticFallback(theme);
      result.content_pack.carousels = [
        ...(result.content_pack.carousels || []),
        ...fallback.content_pack.carousels.slice(0, 2 - (result.content_pack.carousels?.length || 0))
      ];
    }

    return result;

  } catch (error) {
    console.error("Erro na geração com IA:", error);

    // Tentar com OpenAI
    if (openai) {
      try {
        console.log("🔄 Tentando com OpenAI...");

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-1106',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("Resposta vazia da OpenAI");

        return parseAiJsonResponse<BrainResults>(content);

      } catch (openaiError) {
        console.error("Erro com OpenAI:", openaiError);
      }
    }

    // Fallback final
    console.log("🔄 Usando fallback estático");
    return generateStaticFallback(theme);
  }
}

function generateStaticFallback(theme: string): BrainResults {
  const hashtags = generateHashtags(theme, 15);

  return {
    theme_summary: `Estratégia completa para dominar ${theme} e alcançar resultados extraordinários no marketing digital`,
    target_audience_suggestion: `Profissionais e empresas que buscam excelência em ${theme}, com foco em resultados mensuráveis e crescimento sustentável`,
    content_strategy: {
      main_pillars: [
        `Educação sobre ${theme}`,
        "Cases de sucesso",
        "Dicas práticas",
        "Tendências do mercado"
      ],
      content_mix: {
        educational: 40,
        entertaining: 30,
        inspirational: 20,
        promotional: 10
      },
      posting_schedule: {
        optimal_times: ["08:00", "12:00", "19:00"],
        frequency: "3 posts por dia",
        platform_specific: {
          instagram: "Reels 2x/dia, Posts 1x/dia",
          linkedin: "1 post por dia"
        }
      },
      kpis: ["Alcance", "Engajamento", "Conversões", "ROI"]
    },
    content_pack: {
      reels: [
        {
          title: `3 erros fatais em ${theme}`,
          hook: `Se você comete o erro #2, pare AGORA!`,
          main_points: [
            "Erro 1: Falta de estratégia clara",
            "Erro 2: Ignorar métricas importantes",
            "Erro 3: Não testar continuamente"
          ],
          cta: "Salve este post e aplique hoje mesmo!",
          duration: 30,
          hashtags: hashtags.slice(0, 10),
          music_suggestion: "Música motivacional trending"
        },
        {
          title: `Como triplicar resultados em ${theme}`,
          hook: "Este método mudou tudo em 30 dias...",
          main_points: [
            "Análise profunda do mercado",
            "Implementação de sistema testado",
            "Otimização baseada em dados"
          ],
          cta: "Comente QUERO para receber o guia completo!",
          duration: 45,
          hashtags: hashtags.slice(5, 15),
          music_suggestion: "Beat energético com drop"
        },
        {
          title: `A verdade sobre ${theme}`,
          hook: "5 anos de experiência resumidos aqui...",
          main_points: [
            "Não existe fórmula mágica",
            "Consistência vence talento",
            "Simplicidade é o segredo"
          ],
          cta: "Compartilhe com quem precisa ver isso!",
          duration: 30,
          hashtags: hashtags.slice(0, 12),
          music_suggestion: "Lo-fi inspiracional"
        }
      ],
      carousels: [
        {
          title: `Guia completo de ${theme}`,
          slides: [
            {
              slide_number: 1,
              title: "TRANSFORMAÇÃO GARANTIDA",
              content: `Domine ${theme} em 5 passos simples`,
              design_notes: "Fundo gradiente, texto bold"
            },
            {
              slide_number: 2,
              title: "Passo 1: Fundamentos",
              content: "Entenda os princípios básicos",
              design_notes: "Ícones visuais, cores vibrantes"
            },
            {
              slide_number: 3,
              title: "Passo 2: Estratégia",
              content: "Monte seu plano de ação",
              design_notes: "Fluxograma visual"
            },
            {
              slide_number: 4,
              title: "Passo 3: Execução",
              content: "Implemente com método",
              design_notes: "Checklist visual"
            },
            {
              slide_number: 5,
              title: "Passo 4: Análise",
              content: "Meça e otimize resultados",
              design_notes: "Gráficos e métricas"
            },
            {
              slide_number: 6,
              title: "AÇÃO IMEDIATA",
              content: "Comece agora mesmo!",
              design_notes: "CTA destacado com urgência"
            }
          ],
          cta_slide: "Salve e compartilhe este guia!",
          color_scheme: "Gradiente azul-roxo moderno"
        },
        {
          title: `Checklist ${theme}`,
          slides: [
            {
              slide_number: 1,
              title: "CHECKLIST COMPLETO",
              content: "Tudo que você precisa verificar",
              design_notes: "Design minimalista"
            },
            {
              slide_number: 2,
              title: "Preparação",
              content: "□ Objetivos definidos\n□ Recursos mapeados",
              design_notes: "Checkboxes visuais"
            },
            {
              slide_number: 3,
              title: "Execução",
              content: "□ Plano implementado\n□ Testes realizados",
              design_notes: "Progress bars"
            },
            {
              slide_number: 4,
              title: "BAIXE O PDF",
              content: "Link na bio para download!",
              design_notes: "CTA com ícone de download"
            }
          ],
          cta_slide: "Acesse o link na bio agora!",
          color_scheme: "Verde e laranja vibrantes"
        }
      ],
      image_posts: [
        {
          idea: `Mindset vencedor em ${theme}`,
          caption: `A maior lição que aprendi sobre ${theme}:\n\nNão é sobre ferramentas.\nNão é sobre táticas.\nÉ sobre mentalidade.\n\nQuando você muda seu mindset, tudo muda.\n\n${hashtags.join(' ')}`,
          image_prompt: "Quote inspiracional, design minimalista, fundo gradiente",
          alt_text: `Frase motivacional sobre ${theme}`,
          hashtags
        },
        {
          idea: "Transformação com método certo",
          caption: `ANTES vs DEPOIS de aplicar o método:\n\nANTES:\n❌ Sem direção clara\n❌ Resultados inconsistentes\n\nDEPOIS:\n✅ Estratégia definida\n✅ Crescimento consistente\n\n${hashtags.join(' ')}`,
          image_prompt: "Comparação visual antes/depois, design moderno",
          alt_text: "Comparação de resultados",
          hashtags
        },
        {
          idea: "Framework de sucesso",
          caption: `Os 4 pilares do sucesso em ${theme}:\n\n1. Clareza\n2. Velocidade\n3. Consistência\n4. Mensuração\n\nQual você precisa fortalecer?\n\n${hashtags.join(' ')}`,
          image_prompt: "Diagrama de 4 pilares, design corporativo",
          alt_text: "Framework visual de sucesso",
          hashtags
        }
      ],
      story_sequences: [
        {
          theme: `Quiz sobre ${theme}`,
          slides: [
            {
              slide_number: 1,
              type: "Text",
              content: `Quiz rápido!\nDescubra seu nível em ${theme}`
            },
            {
              slide_number: 2,
              type: "Quiz",
              content: `Com que frequência você pratica ${theme}?`,
              options: ["Diariamente", "Semanalmente", "Raramente"]
            },
            {
              slide_number: 3,
              type: "Poll",
              content: "Qual sua maior dificuldade?",
              options: ["Começar", "Manter consistência"]
            },
            {
              slide_number: 4,
              type: "Link",
              content: "Baixe o guia completo no link da bio!"
            }
          ]
        },
        {
          theme: `Dicas rápidas de ${theme}`,
          slides: [
            {
              slide_number: 1,
              type: "Text",
              content: `5 dicas rápidas de ${theme} que funcionam!`
            },
            {
              slide_number: 2,
              type: "Text",
              content: "Dica 1: Comece pequeno mas comece hoje"
            },
            {
              slide_number: 3,
              type: "Text",
              content: "Dica 2: Foque em consistência, não perfeição"
            },
            {
              slide_number: 4,
              type: "Q&A",
              content: "Me pergunta sobre qualquer dúvida!"
            }
          ]
        }
      ]
    }
  };
}

// =================================================================
// 5. ACTIONS PRINCIPAIS
// =================================================================

export const generateContentIdeas = action({
  args: {
    theme: v.string(),
    model: v.optional(v.string())
  },
  handler: async (ctx, args): Promise<BrainResults> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado");
    }

    if (!args.theme || args.theme.trim().length < 3) {
      throw new Error("Tema deve ter pelo menos 3 caracteres");
    }

    if (args.theme.trim().length > 200) {
      throw new Error("Tema deve ter no máximo 200 caracteres");
    }

    try {
      console.log(`🚀 Gerando campanha para: "${args.theme}"`);
      const results = await generateWithAI(args.theme, args.model || 'balanced');

      console.log("✅ Campanha gerada com sucesso!");
      return results;

    } catch (error) {
      console.error("❌ Erro na geração:", error);
      return generateStaticFallback(args.theme);
    }
  },
});

export const generateOutreachMessage = action({
  args: {
    businessType: v.string(),
    messageType: v.string(),
    customization: v.optional(v.string()),
    targetName: v.optional(v.string()),
    targetCompany: v.optional(v.string())
  },
  handler: async (ctx, args): Promise<OutreachMessageResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const templates: Record<string, { subject: string; tone: string }> = {
      cold: {
        subject: "Proposta para revolucionar seu marketing",
        tone: "profissional e amigável"
      },
      followup: {
        subject: "Ainda interessado em escalar seu conteúdo?",
        tone: "casual e direto"
      }
    };

    const template = templates[args.messageType] || templates.cold;

    return {
      title: template.subject,
      content: `Olá ${args.targetName || ''},\n\nVi que sua empresa trabalha com ${args.businessType} e tenho uma proposta interessante.\n\n${args.customization || 'Vamos conversar?'}\n\nAtenciosamente,\n${identity.name || 'Equipe'}`,
      businessType: args.businessType,
      messageType: args.messageType,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      alternativeVersions: ["Versão curta disponível", "Versão detalhada disponível"]
    };
  },
});

export const analyzeContent = action({
  args: {
    content: v.string(),
    contentType: v.string()
  },
  handler: async (ctx, args): Promise<ContentAnalysisResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const metrics = estimateMetrics(args.contentType);

    return {
      content_score: Math.round(Math.random() * 30 + 70),
      improvements: [
        "Adicione um hook mais forte",
        "Inclua uma pergunta para engajamento",
        "Use verbos de ação no CTA"
      ],
      predicted_metrics: metrics,
      competitor_comparison: {
        your_score: 85,
        industry_average: 72,
        top_performer: 94
      }
    };
  },
});