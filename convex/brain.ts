// convex/brain.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';

// =================================================================
// 1. ESTRUTURAS DE DADOS COMPLETAS
// =================================================================

interface ScriptTimelineItem {
  timestamp: string;
  duration_seconds: number;
  action_description: string;
  spoken_text: string;
  camera_movement: string;
  camera_angle: string;
  screen_text_overlay: string;
  sound_effect: string;
  music_cue: string;
  visual_effect: string;
  emotion_tone: string;
  retention_technique: string;
}

interface ReelContent {
  title: string;
  concept: string;
  hook_type: string;
  hook_text: string;
  hook_visual: string;
  total_duration: string;
  format: string;
  main_narrative: string;
  key_messages: string[];
  cta_text: string;
  cta_timing: string;
  script_timeline: ScriptTimelineItem[];
  camera_equipment: string[];
  lighting_setup: string;
  location_suggestions: string[];
  wardrobe_props: string[];
  audio_track_style: string;
  audio_bpm_suggestion: string;
  sound_effects_list: string[];
  transitions_used: string[];
  text_animations: string[];
  color_grading: string;
  aspect_ratio: string;
  posting_caption: string;
  hashtags: string[];
  best_posting_time: string;
  expected_retention_curve: string;
  viral_score_prediction: number;
  improvement_notes: string;
}

interface CarouselSlide {
  slide_number: number;
  headline: string;
  body_text: string;
  visual_description: string;
  design_elements: string[];
  color_scheme: string;
  font_suggestion: string;
  cta_on_slide: string;
  transition_to_next: string;
}

interface CarouselContent {
  title: string;
  concept: string;
  total_slides: number;
  hook_slide: string;
  slides: CarouselSlide[];
  final_cta_slide: string;
  design_style: string;
  brand_colors_suggestion: string[];
  typography_guide: string;
  image_style: string;
  posting_caption: string;
  hashtags: string[];
  engagement_prediction: string;
  swipe_triggers: string[];
}

interface ImagePostContent {
  concept: string;
  visual_description: string;
  image_generation_prompt: string;
  style_reference: string;
  composition: string;
  color_palette: string[];
  text_overlay: string;
  caption_hook: string;
  caption_body: string;
  caption_cta: string;
  full_caption: string;
  hashtags: string[];
  alt_text: string;
  best_posting_time: string;
  engagement_triggers: string[];
}

interface StorySlide {
  slide_number: number;
  type: "Text" | "Poll" | "Quiz" | "Question" | "Countdown" | "Link" | "Mention" | "Music" | "GIF";
  duration_seconds: number;
  background_type: string;
  background_description: string;
  main_text: string;
  text_animation: string;
  sticker_type?: string;
  poll_question?: string;
  poll_options?: string[];
  quiz_question?: string;
  quiz_options?: string[];
  quiz_correct_answer?: number;
  question_prompt?: string;
  link_url?: string;
  link_label?: string;
  music_suggestion?: string;
  engagement_goal: string;
}

interface StorySequenceContent {
  theme: string;
  narrative_arc: string;
  total_stories: number;
  slides: StorySlide[];
  posting_schedule: string;
  engagement_hooks: string[];
  response_strategy: string;
  highlight_worthy: boolean;
  highlight_cover_idea: string;
}

interface ViralStrategy {
  content_pillars: string[];
  posting_frequency: string;
  best_times_detailed: {
    day: string;
    times: string[];
    reasoning: string;
  }[];
  hashtag_sets: {
    category: string;
    hashtags: string[];
    reach_estimate: string;
  }[];
  engagement_tactics: {
    tactic: string;
    implementation: string;
    expected_result: string;
  }[];
  growth_hacks: string[];
  collaboration_ideas: string[];
  trend_adaptation_tips: string[];
  algorithm_optimization: string[];
  community_building: string[];
  monetization_path: string[];
}

interface ContentAnalysis {
  user_intent: string;
  identified_niche: string;
  target_audience_profile: {
    demographics: string;
    psychographics: string;
    pain_points: string[];
    desires: string[];
    content_preferences: string[];
  };
  content_opportunities: string[];
  competitive_advantage: string;
  unique_angle: string;
}

interface BrainResults {
  analysis: ContentAnalysis;
  theme_summary: string;
  optimized_strategy: string;
  content_pack: {
    reels: ReelContent[];
    carousels: CarouselContent[];
    image_posts: ImagePostContent[];
    story_sequences: StorySequenceContent[];
  };
  viral_strategy: ViralStrategy;
  weekly_content_calendar: {
    day: string;
    content_type: string;
    content_title: string;
    posting_time: string;
    goal: string;
  }[];
  success_metrics: {
    metric: string;
    target: string;
    tracking_method: string;
  }[];
  final_recommendations: string[];
}

// =================================================================
// 2. CONFIGURAÇÃO DOS MODELOS DE IA
// =================================================================

const GROQ_MODELS = {
  analyzer: 'llama-3.1-8b-instant',      // Rápido para análise inicial
  optimizer: 'llama-3.1-8b-instant',     // Otimização de contexto
  generator_pro: 'llama-3.3-70b-versatile', // Geração PRO
  generator_ultra: 'llama-3.3-70b-versatile', // Geração ULTRA (mesmo modelo, prompt diferente)
  fallback: 'mixtral-8x7b-32768',        // Backup
};

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// =================================================================
// 3. SISTEMA DE ANÁLISE E COMPREENSÃO DO PROMPT
// =================================================================

interface PromptAnalysis {
  original_prompt: string;
  detected_language: string;
  user_intent: string;
  content_type_requested: string[];
  niche_identified: string;
  specific_requirements: string[];
  tone_desired: string;
  urgency_level: string;
  experience_level: string;
  key_topics: string[];
  optimized_prompt: string;
}

async function analyzeAndUnderstandPrompt(rawPrompt: string): Promise<PromptAnalysis> {
  const analysisPrompt = `
Você é um especialista em análise de linguagem natural e marketing digital.

TAREFA: Analise profundamente o seguinte pedido do usuário e extraia todas as informações relevantes.

PEDIDO DO USUÁRIO: "${rawPrompt}"

Responda em JSON com a seguinte estrutura:
{
  "original_prompt": "o prompt original",
  "detected_language": "pt-BR",
  "user_intent": "o que o usuário realmente quer alcançar",
  "content_type_requested": ["reels", "carrosséis", "posts", "stories"] // os tipos que fazem sentido
  "niche_identified": "nicho específico identificado",
  "specific_requirements": ["requisitos específicos mencionados"],
  "tone_desired": "tom de voz desejado ou sugerido",
  "urgency_level": "baixa/média/alta",
  "experience_level": "iniciante/intermediário/avançado baseado no pedido",
  "key_topics": ["tópicos chave para abordar"],
  "optimized_prompt": "versão otimizada e expandida do pedido para gerar melhor conteúdo"
}

REGRAS:
- Se o usuário for vago, INFIRA o máximo possível baseado no contexto
- Se não mencionar tipo de conteúdo, assuma que quer TODOS os tipos
- Identifique subtextos e necessidades não explícitas
- O optimized_prompt deve ser rico em detalhes e contexto
`;

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODELS.analyzer,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Você é uma API de análise. Retorne apenas JSON válido.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Análise vazia");

    return JSON.parse(content);
  } catch (error) {
    console.warn("⚠️ Fallback na análise:", error);
    return {
      original_prompt: rawPrompt,
      detected_language: "pt-BR",
      user_intent: "Criar conteúdo viral para redes sociais",
      content_type_requested: ["reels", "carousels", "image_posts", "story_sequences"],
      niche_identified: rawPrompt,
      specific_requirements: [],
      tone_desired: "profissional e engajante",
      urgency_level: "média",
      experience_level: "intermediário",
      key_topics: [rawPrompt],
      optimized_prompt: `Criar estratégia completa de conteúdo viral para: ${rawPrompt}`
    };
  }
}

// =================================================================
// 4. SISTEMA DE APRIMORAMENTO DO CONTEXTO
// =================================================================

async function enhanceAndExpandContext(analysis: PromptAnalysis): Promise<string> {
  const enhancementPrompt = `
Você é um estrategista de conteúdo viral de elite.

ANÁLISE DO PEDIDO:
- Intenção: ${analysis.user_intent}
- Nicho: ${analysis.niche_identified}
- Tópicos: ${analysis.key_topics.join(', ')}
- Tom: ${analysis.tone_desired}
- Nível: ${analysis.experience_level}

TAREFA: Crie um briefing estratégico expandido que será usado para gerar conteúdo viral.

O briefing deve incluir:
1. Definição clara do público-alvo (idade, interesses, dores, desejos)
2. Proposta de valor única para o conteúdo
3. Ganchos emocionais a explorar
4. Tendências atuais relevantes ao nicho
5. Diferenciais competitivos sugeridos
6. Formatos de conteúdo mais eficazes para este nicho
7. Gatilhos mentais recomendados

Escreva o briefing em formato de texto corrido, rico e detalhado.
Máximo 500 palavras. Seja específico e acionável.
`;

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODELS.optimizer,
      messages: [
        { role: 'system', content: 'Você é um estrategista de conteúdo viral. Seja específico e detalhado.' },
        { role: 'user', content: enhancementPrompt }
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content || analysis.optimized_prompt;
  } catch {
    return analysis.optimized_prompt;
  }
}

// =================================================================
// 5. PROMPTS MESTRES PARA PRO E ULTRA
// =================================================================

function getProMasterPrompt(context: string, analysis: PromptAnalysis): string {
  return `
# MODO PRO - GERADOR DE IDEIAS E DICAS ESTRATÉGICAS

## CONTEXTO ESTRATÉGICO
${context}

## PERFIL DO PEDIDO
- Nicho: ${analysis.niche_identified}
- Público: Pessoas interessadas em ${analysis.key_topics.join(', ')}
- Tom de voz: ${analysis.tone_desired}

## SUA MISSÃO
Você é um consultor de marketing digital experiente. Gere IDEIAS SÓLIDAS e DICAS PRÁTICAS.
O usuário PRO quer saber O QUE postar e POR QUE funciona.

## DIRETRIZES PRO

### REELS (Gere 3)
- Foco em CONTEÚDO EDUCATIVO e valor agregado
- Roteiros simples: Gancho → Conteúdo → CTA
- Script timeline básico (não precisa ser segundo a segundo)
- Sugestões de áudio e visual práticas
- Dicas de melhores horários

### CARROSSÉIS (Gere 2)
- Listas, tutoriais, dicas numeradas
- 7-10 slides por carrossel
- Foco em informação de valor
- Design limpo e legível

### POSTS DE IMAGEM (Gere 2)
- Ideias de posts únicos impactantes
- Legendas que geram comentários
- Hashtags estratégicas

### STORIES (Gere 1 sequência)
- Sequência de 5-7 stories
- Mix de formatos (enquetes, perguntas, etc)
- Foco em conexão com a audiência

## ESTRUTURA JSON OBRIGATÓRIA
${getJsonStructure()}

Gere conteúdo PRÁTICO e APLICÁVEL. Não seja genérico.
`;
}

function getUltraMasterPrompt(context: string, analysis: PromptAnalysis): string {
  return `
# MODO ULTRA - SISTEMA COMPLETO DE VIRALIZAÇÃO

## BRIEFING ESTRATÉGICO COMPLETO
${context}

## DADOS DO PROJETO
- Nicho Identificado: ${analysis.niche_identified}
- Intenção do Usuário: ${analysis.user_intent}
- Tópicos Centrais: ${analysis.key_topics.join(', ')}
- Tom de Marca: ${analysis.tone_desired}
- Nível de Experiência: ${analysis.experience_level}

## SUA MISSÃO ULTRA
Você é um DIRETOR DE CONTEÚDO VIRAL de Hollywood combinado com um NEUROCIENTISTA DO MARKETING.
Seu trabalho é criar um PLANO COMPLETO, TÉCNICO e INFALÍVEL para viralizar.

O usuário ULTRA não quer dicas. Ele quer um MANUAL DE PRODUÇÃO PROFISSIONAL.

## DIRETRIZES ULTRA ABSOLUTAS

### 🎬 REELS (Gere 5 roteiros completos)

Cada Reel deve ter:

1. **HOOK DESTRUIDOR (0-3 segundos)**
   - Técnica de pattern interrupt visual
   - Frase que gera curiosidade irresistível
   - Movimento de câmera que prende atenção

2. **SCRIPT TIMELINE SEGUNDO A SEGUNDO**
   Para CADA momento do vídeo, especifique:
   - Timestamp exato (00:00 - 00:03)
   - Texto falado PALAVRA POR PALAVRA
   - Ação do apresentador
   - Movimento de câmera (Zoom in, Dolly, Chicote, Estático)
   - Ângulo de câmera (Close, Medium, Wide, POV)
   - Texto na tela (posição, animação, fonte)
   - Efeito sonoro específico
   - Música/BPM naquele momento
   - Efeito visual (Corte seco, Transição, Flash)
   - Tom emocional
   - Técnica de retenção usada

3. **ESPECIFICAÇÕES TÉCNICAS**
   - Duração total otimizada
   - Equipamento necessário
   - Iluminação setup
   - Localização ideal
   - Figurino/Props
   - Estilo de música com BPM
   - Lista de efeitos sonoros
   - Paleta de cores
   - Tipografia para textos
   - Color grading style

4. **COPY COMPLETA**
   - Legenda com gancho
   - Corpo com storytelling
   - CTA estratégico
   - 30 hashtags categorizadas
   - Melhor horário específico

5. **MÉTRICAS ESPERADAS**
   - Curva de retenção esperada
   - Score viral (1-10)
   - Pontos de possível drop
   - Sugestões de melhoria

### 📱 CARROSSÉIS (Gere 3 completos)

Para cada carrossel:
- 10 slides detalhados
- Cada slide com: headline, corpo, visual, cores, fonte, CTA
- Gatilhos de swipe entre slides
- Design system completo
- Legenda otimizada
- Estratégia de engajamento

### 🖼️ POSTS DE IMAGEM (Gere 3)

Para cada post:
- Prompt detalhado para gerar a imagem (DALL-E/Midjourney style)
- Composição visual específica
- Paleta de cores exata
- Overlay de texto
- Legenda completa com storytelling
- Hashtags estratégicas
- Alt text para SEO

### 📲 STORIES (Gere 2 sequências de 8+ stories)

Para cada sequência:
- Arco narrativo completo
- Cada story com tipo, duração, fundo, texto, stickers
- Estratégia de resposta para interações
- Técnicas de retenção story-to-story

### 📊 ESTRATÉGIA VIRAL COMPLETA

Inclua:
1. **Calendário semanal** com horários exatos
2. **Estratégia de hashtags** por categoria
3. **Táticas de engajamento** com implementação passo a passo
4. **Growth hacks** específicos para o nicho
5. **Algoritmo tips** atualizados
6. **Métricas de sucesso** e como trackear

## ESTRUTURA JSON OBRIGATÓRIA
${getJsonStructure()}

## REGRAS INVIOLÁVEIS
1. NUNCA seja genérico - cada instrução deve ser específica e acionável
2. Escreva como se estivesse instruindo um editor profissional
3. Inclua TODOS os detalhes técnicos necessários
4. Pense em retenção a cada segundo do conteúdo
5. Use técnicas de neuromarketing em cada elemento
6. O usuário deve conseguir produzir EXATAMENTE o que você descrever

GERE O CONTEÚDO MAIS COMPLETO E PROFISSIONAL POSSÍVEL.
`;
}

// =================================================================
// 6. ESTRUTURA JSON DETALHADA
// =================================================================

function getJsonStructure(): string {
  return `
{
  "analysis": {
    "user_intent": "string - o que o usuário quer alcançar",
    "identified_niche": "string - nicho específico",
    "target_audience_profile": {
      "demographics": "string",
      "psychographics": "string",
      "pain_points": ["string"],
      "desires": ["string"],
      "content_preferences": ["string"]
    },
    "content_opportunities": ["string"],
    "competitive_advantage": "string",
    "unique_angle": "string"
  },
  "theme_summary": "string - resumo do tema",
  "optimized_strategy": "string - estratégia otimizada",
  "content_pack": {
    "reels": [
      {
        "title": "string",
        "concept": "string - conceito geral do reel",
        "hook_type": "string - tipo de gancho (curiosidade, choque, promessa, etc)",
        "hook_text": "string - texto exato do gancho",
        "hook_visual": "string - descrição visual do gancho",
        "total_duration": "string - ex: 45 segundos",
        "format": "string - talking head, b-roll, misto, etc",
        "main_narrative": "string - narrativa principal",
        "key_messages": ["string"],
        "cta_text": "string",
        "cta_timing": "string - quando aparece o CTA",
        "script_timeline": [
          {
            "timestamp": "string - ex: 00:00-00:03",
            "duration_seconds": 3,
            "action_description": "string - o que acontece",
            "spoken_text": "string - texto falado exato",
            "camera_movement": "string - movimento da câmera",
            "camera_angle": "string - ângulo",
            "screen_text_overlay": "string - texto na tela",
            "sound_effect": "string - efeito sonoro",
            "music_cue": "string - indicação musical",
            "visual_effect": "string - efeito visual/transição",
            "emotion_tone": "string - tom emocional",
            "retention_technique": "string - técnica de retenção usada"
          }
        ],
        "camera_equipment": ["string"],
        "lighting_setup": "string",
        "location_suggestions": ["string"],
        "wardrobe_props": ["string"],
        "audio_track_style": "string",
        "audio_bpm_suggestion": "string",
        "sound_effects_list": ["string"],
        "transitions_used": ["string"],
        "text_animations": ["string"],
        "color_grading": "string",
        "aspect_ratio": "string",
        "posting_caption": "string - legenda completa",
        "hashtags": ["string"],
        "best_posting_time": "string",
        "expected_retention_curve": "string - descrição da curva de retenção",
        "viral_score_prediction": 8,
        "improvement_notes": "string"
      }
    ],
    "carousels": [
      {
        "title": "string",
        "concept": "string",
        "total_slides": 10,
        "hook_slide": "string - descrição do primeiro slide",
        "slides": [
          {
            "slide_number": 1,
            "headline": "string",
            "body_text": "string",
            "visual_description": "string",
            "design_elements": ["string"],
            "color_scheme": "string",
            "font_suggestion": "string",
            "cta_on_slide": "string",
            "transition_to_next": "string - gatilho para próximo slide"
          }
        ],
        "final_cta_slide": "string",
        "design_style": "string",
        "brand_colors_suggestion": ["string - hex codes"],
        "typography_guide": "string",
        "image_style": "string",
        "posting_caption": "string",
        "hashtags": ["string"],
        "engagement_prediction": "string",
        "swipe_triggers": ["string"]
      }
    ],
    "image_posts": [
      {
        "concept": "string",
        "visual_description": "string",
        "image_generation_prompt": "string - prompt detalhado para IA gerar a imagem",
        "style_reference": "string",
        "composition": "string",
        "color_palette": ["string"],
        "text_overlay": "string",
        "caption_hook": "string",
        "caption_body": "string",
        "caption_cta": "string",
        "full_caption": "string",
        "hashtags": ["string"],
        "alt_text": "string",
        "best_posting_time": "string",
        "engagement_triggers": ["string"]
      }
    ],
    "story_sequences": [
      {
        "theme": "string",
        "narrative_arc": "string",
        "total_stories": 8,
        "slides": [
          {
            "slide_number": 1,
            "type": "Text",
            "duration_seconds": 5,
            "background_type": "string - cor sólida, imagem, vídeo",
            "background_description": "string",
            "main_text": "string",
            "text_animation": "string",
            "sticker_type": "string",
            "poll_question": "string",
            "poll_options": ["string"],
            "quiz_question": "string",
            "quiz_options": ["string"],
            "quiz_correct_answer": 1,
            "question_prompt": "string",
            "link_url": "string",
            "link_label": "string",
            "music_suggestion": "string",
            "engagement_goal": "string"
          }
        ],
        "posting_schedule": "string",
        "engagement_hooks": ["string"],
        "response_strategy": "string",
        "highlight_worthy": true,
        "highlight_cover_idea": "string"
      }
    ]
  },
  "viral_strategy": {
    "content_pillars": ["string"],
    "posting_frequency": "string",
    "best_times_detailed": [
      {
        "day": "string",
        "times": ["string"],
        "reasoning": "string"
      }
    ],
    "hashtag_sets": [
      {
        "category": "string",
        "hashtags": ["string"],
        "reach_estimate": "string"
      }
    ],
    "engagement_tactics": [
      {
        "tactic": "string",
        "implementation": "string",
        "expected_result": "string"
      }
    ],
    "growth_hacks": ["string"],
    "collaboration_ideas": ["string"],
    "trend_adaptation_tips": ["string"],
    "algorithm_optimization": ["string"],
    "community_building": ["string"],
    "monetization_path": ["string"]
  },
  "weekly_content_calendar": [
    {
      "day": "string",
      "content_type": "string",
      "content_title": "string",
      "posting_time": "string",
      "goal": "string"
    }
  ],
  "success_metrics": [
    {
      "metric": "string",
      "target": "string",
      "tracking_method": "string"
    }
  ],
  "final_recommendations": ["string"]
}`;
}

// =================================================================
// 7. PARSER JSON ROBUSTO
// =================================================================

function cleanAndParseJson<T>(text: string): T {
  // Remove markdown code blocks
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');

  // Remove qualquer texto antes do primeiro {
  const firstBrace = clean.indexOf('{');
  if (firstBrace > 0) {
    clean = clean.substring(firstBrace);
  }

  // Remove qualquer texto depois do último }
  const lastBrace = clean.lastIndexOf('}');
  if (lastBrace > -1 && lastBrace < clean.length - 1) {
    clean = clean.substring(0, lastBrace + 1);
  }

  // Tenta corrigir JSONs malformados comuns
  clean = clean
    .replace(/,\s*}/g, '}')      // Remove vírgulas antes de }
    .replace(/,\s*]/g, ']')      // Remove vírgulas antes de ]
    .replace(/'/g, '"')          // Troca aspas simples por duplas
    .replace(/\n/g, '\\n')       // Escapa quebras de linha em strings
    .replace(/\r/g, '')          // Remove carriage returns
    .replace(/\t/g, '  ');       // Substitui tabs por espaços

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error("Erro parsing JSON:", e);
    console.log("JSON problemático (primeiros 500 chars):", clean.substring(0, 500));
    throw new Error("Falha ao processar resposta da IA. Tente novamente.");
  }
}

// =================================================================
// 8. GERADOR DE FALLBACK INTELIGENTE
// =================================================================

function generateIntelligentFallback(theme: string, plan: string): BrainResults {
  const isUltra = plan === 'ultra';

  return {
    analysis: {
      user_intent: `Criar conteúdo viral sobre ${theme}`,
      identified_niche: theme,
      target_audience_profile: {
        demographics: "18-45 anos, interessados em " + theme,
        psychographics: "Pessoas buscando soluções e inspiração",
        pain_points: ["Falta de tempo", "Falta de conhecimento", "Busca por resultados"],
        desires: ["Sucesso", "Reconhecimento", "Crescimento"],
        content_preferences: ["Vídeos curtos", "Conteúdo prático", "Dicas rápidas"]
      },
      content_opportunities: ["Tutoriais", "Bastidores", "Dicas rápidas"],
      competitive_advantage: "Autenticidade e conhecimento prático",
      unique_angle: "Abordagem pessoal e acessível"
    },
    theme_summary: `Estratégia de conteúdo para: ${theme}`,
    optimized_strategy: "Foco em consistência e valor agregado para a audiência",
    content_pack: {
      reels: [{
        title: `Dica sobre ${theme}`,
        concept: "Reel educativo com dica prática",
        hook_type: "curiosidade",
        hook_text: "Você sabia disso?",
        hook_visual: "Close no rosto com expressão de surpresa",
        total_duration: "30 segundos",
        format: "talking head",
        main_narrative: "Apresentação de uma dica valiosa",
        key_messages: ["Dica principal sobre o tema"],
        cta_text: "Siga para mais dicas!",
        cta_timing: "Últimos 3 segundos",
        script_timeline: isUltra ? [
          {
            timestamp: "00:00-00:03",
            duration_seconds: 3,
            action_description: "Aparecer na tela com energia",
            spoken_text: "Você precisa saber disso!",
            camera_movement: "Zoom in rápido",
            camera_angle: "Medium shot",
            screen_text_overlay: "🔥 DICA IMPORTANTE",
            sound_effect: "Whoosh",
            music_cue: "Beat drop",
            visual_effect: "Flash transition",
            emotion_tone: "Energético",
            retention_technique: "Pattern interrupt"
          }
        ] : [],
        camera_equipment: ["Smartphone com boa câmera", "Tripé"],
        lighting_setup: "Luz natural ou ring light frontal",
        location_suggestions: ["Home office", "Local relacionado ao nicho"],
        wardrobe_props: ["Roupa alinhada com a marca pessoal"],
        audio_track_style: "Upbeat, motivacional",
        audio_bpm_suggestion: "120-130 BPM",
        sound_effects_list: ["Whoosh", "Pop", "Ding"],
        transitions_used: ["Corte seco", "Zoom"],
        text_animations: ["Typewriter", "Pop in"],
        color_grading: "Vibrante e acolhedor",
        aspect_ratio: "9:16",
        posting_caption: `💡 Dica valiosa sobre ${theme}!\n\nSalva esse post para não esquecer!\n\n#${theme.replace(/\s+/g, '')} #dicas #viral`,
        hashtags: [`#${theme.replace(/\s+/g, '')}`, "#dicas", "#viral", "#fyp", "#trending"],
        best_posting_time: "19:00",
        expected_retention_curve: "Alta nos primeiros 3s, estável até o final",
        viral_score_prediction: 7,
        improvement_notes: "Teste diferentes hooks para otimizar"
      }],
      carousels: [{
        title: `Guia sobre ${theme}`,
        concept: "Carrossel educativo com dicas práticas",
        total_slides: 7,
        hook_slide: "Headline impactante sobre o tema",
        slides: [
          {
            slide_number: 1,
            headline: `Tudo sobre ${theme}`,
            body_text: "Deslize para aprender →",
            visual_description: "Design limpo com cores da marca",
            design_elements: ["Ícone relacionado ao tema"],
            color_scheme: "Cores vibrantes",
            font_suggestion: "Sans-serif moderna",
            cta_on_slide: "Arraste →",
            transition_to_next: "Curiosidade sobre o próximo ponto"
          }
        ],
        final_cta_slide: "Salve e compartilhe com quem precisa!",
        design_style: "Minimalista e moderno",
        brand_colors_suggestion: ["#3B82F6", "#10B981", "#F59E0B"],
        typography_guide: "Títulos em bold, corpo em regular",
        image_style: "Flat design ou fotos de alta qualidade",
        posting_caption: `📚 Guia completo sobre ${theme}\n\nSalva esse post!\n\n#${theme.replace(/\s+/g, '')} #guia #dicas`,
        hashtags: [`#${theme.replace(/\s+/g, '')}`, "#guia", "#dicas", "#conhecimento"],
        engagement_prediction: "Alto potencial de saves",
        swipe_triggers: ["Numeração clara", "Curiosidade progressiva"]
      }],
      image_posts: [{
        concept: `Post motivacional sobre ${theme}`,
        visual_description: "Imagem impactante com texto overlay",
        image_generation_prompt: `Professional photo related to ${theme}, clean background, warm lighting, inspirational mood`,
        style_reference: "Estilo editorial moderno",
        composition: "Regra dos terços, elemento principal centralizado",
        color_palette: ["#3B82F6", "#FFFFFF", "#1F2937"],
        text_overlay: "Frase impactante sobre o tema",
        caption_hook: "Você já parou pra pensar nisso?",
        caption_body: "Reflexão sobre a importância do tema",
        caption_cta: "Comenta aí o que você acha!",
        full_caption: `💭 Você já parou pra pensar nisso?\n\nReflexão sobre ${theme}...\n\nComenta aí o que você acha!\n\n#${theme.replace(/\s+/g, '')} #reflexao`,
        hashtags: [`#${theme.replace(/\s+/g, '')}`, "#reflexao", "#motivacao"],
        alt_text: `Imagem motivacional sobre ${theme}`,
        best_posting_time: "12:00",
        engagement_triggers: ["Pergunta na legenda", "CTA para comentar"]
      }],
      story_sequences: [{
        theme: `Dia a dia com ${theme}`,
        narrative_arc: "Mostrar rotina e dicas rápidas",
        total_stories: 5,
        slides: [
          {
            slide_number: 1,
            type: "Text",
            duration_seconds: 5,
            background_type: "cor sólida",
            background_description: "Cor vibrante da marca",
            main_text: "Bom dia! Vem ver a dica de hoje ✨",
            text_animation: "Typewriter",
            engagement_goal: "Criar expectativa"
          },
          {
            slide_number: 2,
            type: "Poll",
            duration_seconds: 10,
            background_type: "imagem",
            background_description: "Foto relacionada ao tema",
            main_text: "O que você quer aprender hoje?",
            poll_question: "Escolhe aí:",
            poll_options: ["Opção A", "Opção B"],
            text_animation: "Pop in",
            engagement_goal: "Gerar interação via enquete"
          }
        ],
        posting_schedule: "Manhã e final da tarde",
        engagement_hooks: ["Enquetes", "Perguntas", "Contagem regressiva"],
        response_strategy: "Responder todas as interações",
        highlight_worthy: true,
        highlight_cover_idea: "Ícone representando o tema"
      }]
    },
    viral_strategy: {
      content_pillars: ["Educação", "Entretenimento", "Inspiração"],
      posting_frequency: "1 reel + 1 carrossel + 3-5 stories por dia",
      best_times_detailed: [
        { day: "Segunda a Sexta", times: ["7:00", "12:00", "19:00"], reasoning: "Horários de pico de uso" },
        { day: "Sábado e Domingo", times: ["10:00", "20:00"], reasoning: "Audiência mais relaxada" }
      ],
      hashtag_sets: [
        { category: "Nicho", hashtags: [`#${theme.replace(/\s+/g, '')}`], reach_estimate: "Médio" },
        { category: "Trending", hashtags: ["#fyp", "#viral", "#trending"], reach_estimate: "Alto" }
      ],
      engagement_tactics: [
        { tactic: "Responder comentários em 1h", implementation: "Ativar notificações", expected_result: "+30% engajamento" }
      ],
      growth_hacks: ["Colaborações com criadores do nicho", "Trends adaptadas ao tema"],
      collaboration_ideas: ["Lives conjuntas", "Duetos", "Menções mútuas"],
      trend_adaptation_tips: ["Monitorar trending audios", "Adaptar memes ao nicho"],
      algorithm_optimization: ["Postar nos horários de pico", "Usar todas as features da plataforma"],
      community_building: ["Criar série de conteúdo", "Responder DMs", "Criar grupo/comunidade"],
      monetization_path: ["Parcerias de marca", "Produtos digitais", "Consultorias"]
    },
    weekly_content_calendar: [
      { day: "Segunda", content_type: "Reel", content_title: "Dica da semana", posting_time: "19:00", goal: "Educar" },
      { day: "Terça", content_type: "Carrossel", content_title: "Tutorial", posting_time: "12:00", goal: "Valor" },
      { day: "Quarta", content_type: "Stories", content_title: "Bastidores", posting_time: "10:00", goal: "Conexão" },
      { day: "Quinta", content_type: "Reel", content_title: "Trend adaptada", posting_time: "19:00", goal: "Alcance" },
      { day: "Sexta", content_type: "Post", content_title: "Reflexão", posting_time: "18:00", goal: "Engajamento" },
      { day: "Sábado", content_type: "Stories", content_title: "Interativo", posting_time: "11:00", goal: "Comunidade" },
      { day: "Domingo", content_type: "Carrossel", content_title: "Resumo semanal", posting_time: "20:00", goal: "Recapitular" }
    ],
    success_metrics: [
      { metric: "Taxa de retenção", target: ">50% até o final", tracking_method: "Insights do Reel" },
      { metric: "Taxa de engajamento", target: ">5%", tracking_method: "Curtidas + Comentários / Alcance" },
      { metric: "Crescimento de seguidores", target: "+10% ao mês", tracking_method: "Analytics semanal" }
    ],
    final_recommendations: [
      "Seja consistente - poste todos os dias",
      "Responda todos os comentários na primeira hora",
      "Teste diferentes horários e analise os resultados",
      "Adapte trends ao seu nicho rapidamente",
      "Invista em qualidade de áudio e iluminação"
    ]
  };
}

// =================================================================
// 9. ACTION PRINCIPAL - FLUXO COMPLETO
// =================================================================

export const generateContentIdeas = action({
  args: {
    theme: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args): Promise<BrainResults> => {
    // ========== AUTENTICAÇÃO ==========
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado. Faça login para continuar.");
    }

    // ========== VALIDAÇÃO ==========
    if (!args.theme || args.theme.trim().length < 3) {
      throw new Error("Por favor, descreva melhor o que você precisa (mínimo 3 caracteres).");
    }

    const userPlan = args.plan === 'ultra' ? 'ultra' : 'pro';
    const rawTheme = args.theme.trim();

    console.log(`\n🧠 ========== BRAIN INICIADO ==========`);
    console.log(`📋 Plano: ${userPlan.toUpperCase()}`);
    console.log(`💬 Input do usuário: "${rawTheme}"`);

    try {
      // ========== ETAPA 1: ANÁLISE E COMPREENSÃO ==========
      console.log(`\n🔍 Etapa 1: Analisando e compreendendo o pedido...`);
      const analysis = await analyzeAndUnderstandPrompt(rawTheme);
      console.log(`✅ Análise completa:`);
      console.log(`   - Intenção: ${analysis.user_intent}`);
      console.log(`   - Nicho: ${analysis.niche_identified}`);
      console.log(`   - Tópicos: ${analysis.key_topics.join(', ')}`);

      // ========== ETAPA 2: APRIMORAMENTO DO CONTEXTO ==========
      console.log(`\n🚀 Etapa 2: Aprimorando e expandindo contexto...`);
      const enhancedContext = await enhanceAndExpandContext(analysis);
      console.log(`✅ Contexto expandido (${enhancedContext.length} chars)`);

      // ========== ETAPA 3: SELEÇÃO DO PROMPT MESTRE ==========
      console.log(`\n📝 Etapa 3: Preparando prompt mestre para ${userPlan.toUpperCase()}...`);
      const masterPrompt = userPlan === 'ultra'
        ? getUltraMasterPrompt(enhancedContext, analysis)
        : getProMasterPrompt(enhancedContext, analysis);

      // ========== ETAPA 4: GERAÇÃO DE CONTEÚDO ==========
      console.log(`\n⚡ Etapa 4: Gerando conteúdo com IA...`);

      const systemInstruction = `Você é uma API de geração de conteúdo viral.
REGRAS ABSOLUTAS:
1. Retorne APENAS JSON válido, sem texto adicional
2. Não use markdown (sem \`\`\`)
3. Siga EXATAMENTE a estrutura solicitada
4. Preencha TODOS os campos obrigatórios
5. Use \\n para quebras de linha dentro de strings
6. Seja específico e detalhado em cada campo
7. Para o plano ULTRA, cada script_timeline deve ter múltiplos itens detalhados
8. Gere a quantidade de conteúdos solicitada (PRO: 3 reels, 2 carrosséis, 2 posts, 1 story | ULTRA: 5 reels, 3 carrosséis, 3 posts, 2 stories)`;

      try {
        const response = await groq.chat.completions.create({
          model: userPlan === 'ultra' ? GROQ_MODELS.generator_ultra : GROQ_MODELS.generator_pro,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: masterPrompt }
          ],
          temperature: userPlan === 'ultra' ? 0.7 : 0.8,
          max_tokens: 8000,
        });

        const jsonContent = response.choices[0]?.message?.content;

        if (!jsonContent) {
          throw new Error("Resposta vazia da IA");
        }

        console.log(`✅ Resposta recebida (${jsonContent.length} chars)`);

        // ========== ETAPA 5: PARSING E VALIDAÇÃO ==========
        console.log(`\n🔧 Etapa 5: Processando resposta...`);
        const result = cleanAndParseJson<BrainResults>(jsonContent);

        console.log(`\n✅ ========== BRAIN FINALIZADO ==========`);
        console.log(`📊 Conteúdos gerados:`);
        console.log(`   - Reels: ${result.content_pack?.reels?.length || 0}`);
        console.log(`   - Carrosséis: ${result.content_pack?.carousels?.length || 0}`);
        console.log(`   - Posts: ${result.content_pack?.image_posts?.length || 0}`);
        console.log(`   - Stories: ${result.content_pack?.story_sequences?.length || 0}`);

        return result;

      } catch (primaryError) {
        console.warn(`\n⚠️ Erro na geração primária:`, primaryError);
        console.log(`🔄 Tentando modelo de fallback...`);

        // Tentativa com modelo de fallback
        try {
          const fallbackResponse = await groq.chat.completions.create({
            model: GROQ_MODELS.fallback,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'Retorne apenas JSON válido.' },
              { role: 'user', content: masterPrompt }
            ],
            temperature: 0.7,
            max_tokens: 6000,
          });

          const fallbackContent = fallbackResponse.choices[0]?.message?.content;
          if (!fallbackContent) throw new Error("Fallback vazio");

          console.log(`✅ Fallback bem-sucedido`);
          return cleanAndParseJson<BrainResults>(fallbackContent);

        } catch (fallbackError) {
          console.error(`❌ Fallback também falhou:`, fallbackError);
          throw fallbackError;
        }
      }

    } catch (error) {
      console.error(`\n❌ ========== ERRO FATAL ==========`);
      console.error(error);

      // Retorna conteúdo de fallback gerado localmente
      console.log(`🆘 Gerando conteúdo de fallback local...`);
      return generateIntelligentFallback(rawTheme, userPlan);
    }
  },
});

// =================================================================
// 10. ACTIONS AUXILIARES (OPCIONAL)
// =================================================================

// Action para apenas analisar o prompt (útil para debug ou UI)
export const analyzePrompt = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    return await analyzeAndUnderstandPrompt(args.prompt);
  },
});

// Action para regenerar apenas um tipo de conteúdo
export const regenerateContent = action({
  args: {
    theme: v.string(),
    plan: v.string(),
    contentType: v.union(
      v.literal("reels"),
      v.literal("carousels"),
      v.literal("image_posts"),
      v.literal("story_sequences")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    // Reutiliza a lógica principal mas pode ser otimizado
    // para gerar apenas o tipo específico solicitado
    const result = await ctx.runAction(
      // @ts-expect-error - internal action call
      "brain:generateContentIdeas",
      { theme: args.theme, plan: args.plan }
    );

    return {
      contentType: args.contentType,
      content: result.content_pack[args.contentType]
    };
  },
});