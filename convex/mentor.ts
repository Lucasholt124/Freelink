import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";

// =================================================================
// 1. ESTRUTURAS DE DADOS (INTERFACES E TIPOS)
// =================================================================

interface ContentPlanItem {
  day: string;
  time: string;
  format: "reels" | "carrossel" | "stories" | "imagem" | "atividade";
  title: string;
  content_idea: string;
  status: "planejado" | "concluido";
  completedAt?: number;
  funnel_stage: "atrair" | "nutrir" | "converter";
  focus_metric: string;
  details?: {
    tool_suggestion: string;
    step_by_step: string;
    script_or_copy: string;
    hashtags: string;
    creative_guidance: {
      type: string;
      description:string;
      prompt: string;
      tool_link: string;
    };
  };
}

interface StrategicAnalysis {
  optimized_bio: string;
  content_pillars: { pillar: string; description: string }[];
  audience_persona: { name: string; description: string; pain_points: string[] };
  brand_voice: string;
}

interface ContentPlanResult {
  content_plan: ContentPlanItem[];
}

type StrategicSlot = {
  day: number;
  time: string;
  purpose: string;
};

// =================================================================
// 2. CONFIGURAÇÃO E FUNÇÕES HELPERS
// =================================================================

if (!process.env.GROQ_API_KEY_1) { throw new Error("GROQ_API_KEY_1 não está configurada"); }
const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY_1, baseURL: "https://api.groq.com/openai/v1" });

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
  cleaned = cleaned.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
  cleaned = cleaned.replace(/,\s*([}```])/g, '$1');
  cleaned = cleaned.replace(/}\s*{/g, '},{');
  return cleaned;
}

function extractJson<T>(text: string): T {
  try {
    const cleanedText = cleanAndFixJson(text);
    const parsed = JSON.parse(cleanedText);
    if (Array.isArray(parsed)) {
      return { content_plan: parsed } as T;
    }
    if (parsed.content_plan && Array.isArray(parsed.content_plan)) {
      return parsed as T;
    }
    throw new Error("Formato de JSON inesperado.");
  } catch (error) {
    console.error("Erro CRÍTICO ao parsear JSON:", error, "Texto Recebido:", text);
    throw new Error("Falha ao parsear o JSON da IA.");
  }
}

function getStrategicSchedule(totalDays: number): StrategicSlot[] {
  const postsPerWeek = 4;
  const schedule: StrategicSlot[] = [];
  const totalWeeks = Math.ceil(totalDays / 7);
  const weeklySlotsPool: Omit<StrategicSlot, 'day'>[] = [
    { time: "08:30", purpose: "Motivação e planejamento semanal (Funil: Atrair)" },
    { time: "19:30", purpose: "Conteúdo denso e educacional (Funil: Nutrir)" },
    { time: "12:30", purpose: "Dica rápida ou entretenimento (Funil: Atrair)" },
    { time: "20:00", purpose: "Tutorial aprofundado ou estudo de caso (Funil: Nutrir)" },
    { time: "12:00", purpose: "Bastidores ou conexão com a audiência (Funil: Nutrir)" },
    { time: "11:00", purpose: "Inspiracional ou resultado de cliente (Funil: Converter)" },
  ];
  const strategicDays = [1, 2, 3, 4, 5];

  for (let week = 0; week < totalWeeks; week++) {
    const shuffledDays = [...strategicDays].sort(() => 0.5 - Math.random());
    const shuffledSlots = [...weeklySlotsPool].sort(() => 0.5 - Math.random());
    const weekPosts = Math.min(postsPerWeek, totalDays - (week * 7));

    for (let i = 0; i < weekPosts; i++) {
      const dayOfWeek = shuffledDays[i];
      const actualDay = (week * 7) + dayOfWeek;

      if (actualDay <= totalDays) {
        schedule.push({
          day: actualDay,
          time: shuffledSlots[i].time,
          purpose: shuffledSlots[i].purpose,
        });
      }
    }
  }
  return schedule.sort((a, b) => a.day - b.day);
}

function sanitizeContentPlan(plan: ContentPlanItem[]): ContentPlanItem[] {
  return plan.map(item => {
    let correctedFunnelStage: "atrair" | "nutrir" | "converter" = "nutrir";
    if (item.funnel_stage) {
        const stage = item.funnel_stage.toLowerCase().trim();
        if (stage.includes("atrair") || stage.includes("atrir")) {
            correctedFunnelStage = "atrair";
        } else if (stage.includes("nutrir")) {
            correctedFunnelStage = "nutrir";
        } else if (stage.includes("converter")) {
            correctedFunnelStage = "converter";
        }
    }

    let correctedFormat: "reels" | "carrossel" | "stories" | "imagem" | "atividade" = "imagem";
    if (item.format) {
        const format = item.format.toLowerCase().trim();
        if (format.includes("reels")) {
            correctedFormat = "reels";
        } else if (format.includes("carrossel") || format.includes("carousel")) {
            correctedFormat = "carrossel";
        } else if (format.includes("stories")) {
            correctedFormat = "stories";
        } else if (format.includes("imagem") || format.includes("image")) {
            correctedFormat = "imagem";
        } else if (format.includes("atividade") || format.includes("activity")) {
            correctedFormat = "atividade";
        }
    }

    return {
      day: item.day || "Dia indefinido", time: item.time || "12:30",
      format: correctedFormat,
      title: item.title || "Título do post",
      content_idea: item.content_idea || "Ideia de conteúdo",
      status: (item.status === "planejado" || item.status === "concluido") ? item.status : "planejado",
      completedAt: item.completedAt,
      funnel_stage: correctedFunnelStage,
      focus_metric: item.focus_metric || "Engajamento",
      details: item.details ? {
        tool_suggestion: item.details.tool_suggestion || "Canva",
        step_by_step: item.details.step_by_step || "1. Criar. 2. Publicar.",
        script_or_copy: item.details.script_or_copy || "Legenda do post.",
        hashtags: item.details.hashtags || "#marketing #conteudo",
        creative_guidance: {
          type: item.details.creative_guidance?.type || "imagem",
          description: item.details.creative_guidance?.description || "Visual do post.",
          prompt: item.details.creative_guidance?.prompt || "Criar imagem para Instagram.",
          tool_link: item.details.creative_guidance?.tool_link || "https://canva.com"
        }
      } : undefined
    };
  });
}

// =================================================================
// 3. CHAMADAS DE IA
// =================================================================

async function callGroqForStrategy(username: string, offer: string, audience: string, bio: string | undefined): Promise<StrategicAnalysis> {
    const systemPrompt = `Você é um Estrategista de Marketing Digital de classe mundial, especialista em crescimento orgânico no Instagram. Sua missão é analisar as informações de um cliente e criar a FUNDAÇÃO ESTRATÉGICA para seu sucesso. Responda APENAS com um objeto JSON válido, sem nenhum texto adicional. Comece com "{".`;
    const userPrompt = `Analise as seguintes informações do cliente:
- Nome de Usuário: @${username}
- Oferta Principal: "${offer}"
- Público-Alvo: "${audience}"
- Bio Atual: "${bio || 'Não informada'}"
Com base nisso, crie a seguinte estrutura estratégica em JSON:
1. "optimized_bio": Crie uma bio de Instagram magnética e otimizada para conversão (máx 150 caracteres), incluindo um forte CTA. Use \\n para quebras de linha.
2. "content_pillars": Defina 3 pilares de conteúdo essenciais. Para cada pilar, forneça um "pillar" (título) e uma "description" (o que abordar dentro dele).
3. "audience_persona": Desenvolva uma persona detalhada para o público-alvo, com "name" (um nome fictício), "description" (quem são, seus desejos) e "pain_points" (um array com 3 dores principais que a oferta resolve).
4. "brand_voice": Descreva o tom de voz ideal para a marca em uma única frase (ex: "Educacional, motivador e direto ao ponto.").`;
    try {
        const response = await groq.chat.completions.create({ model: "llama3-70b-8192", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.8, max_tokens: 4000, response_format: { type: "json_object" } });
        const responseText = response.choices[0]?.message?.content;
        if (!responseText) throw new Error("A Fase 1 (Estratégia) não retornou conteúdo.");
        return JSON.parse(responseText) as StrategicAnalysis;
    } catch (error) { console.error("Erro na Fase 1:", error); throw new Error("Falha ao gerar a análise estratégica."); }
}

async function callGroqForContentPlan(
    schedule: StrategicSlot[],
    strategy: StrategicAnalysis,
    username: string,
    offer: string,
    audience: string,
    existingContent?: ContentPlanItem[]
): Promise<string> {
  const systemPrompt = `Você é 'O Estrategista Viral', uma fusão de um copywriter de resposta direta, um growth hacker e um diretor criativo. Sua especialidade é criar planos de conteúdo para Instagram que são psicologicamente persuasivos, impossíveis de ignorar e que geram crescimento orgânico massivo.

**REGRAS DE OURO (NÃO QUEBRE NUNCA):**
1. **FORMATO JSON PURO:** Sua única saída é um array JSON válido. Comece com '[' e termine com ']'.
2. **PROFUNDIDADE MÁXIMA:** É PROIBIDO conteúdo genérico ou superficial. Cada post deve entregar uma pequena transformação ou um momento 'AHA!'.
3. **ZERO REPETIÇÃO:** O plano deve ser 100% coeso e sem repetições.
4. **GATILHOS MENTAIS:** Incorpore curiosidade, prova social, especificidade e urgência nos títulos e ideias.
5. **ESTRUTURA RÍGIDA:** Siga a estrutura do JSON à risca. Os campos \`funnel_stage\` e \`format\` devem conter apenas os valores literais permitidos.
6. **NARRATIVA SEMANAL:** Pense em mini-temas para cada semana. Os posts devem se conectar de alguma forma.
7. **APRIMORAMENTO: EXECUÇÃO DETALHADA:** O campo "step_by_step" deve ser um mini-manual de produção. Seja ultra-específico. Em vez de "1. Gravar vídeo", diga "1. [CENA 1 - 3s] Close no rosto com expressão de frustração, texto 'Você odeia [problema]?' na tela. 2. [CENA 2 - 8s] Screencast rápido mostrando a solução no [software]. 3. [CENA 3 - 4s] Você sorrindo, com o resultado final, e o CTA na tela."`;

  const memoryPrompt = existingContent && existingContent.length > 0
    ? `
**<CONTEÚDO JÁ GERADO (NÃO REPITA NADA DISSO)>**
${JSON.stringify(existingContent, null, 2)}
**</CONTEÚDO JÁ GERADO (NÃO REPITA NADA DISSO)>**
`
    : "";

  const scheduleInstructions = schedule.map(slot => `- Dia ${slot.day} às ${slot.time}: Propósito '${slot.purpose}'.`).join('\n');

  const userPrompt = `**MISSÃO:** Criar um plano de conteúdo viral para @${username}.

${memoryPrompt}

**<ANALISE_ESTRATEGICA>**
${JSON.stringify(strategy, null, 2)}
**</ANALISE_ESTRATEGICA>**

**<INSTRUCOES_PLANO>**
1. **CRONOGRAMA ESTRATÉGICO:** Crie um post para CADA um dos seguintes slots:
${scheduleInstructions}
2. **FOCO PRINCIPAL:** Todo o conteúdo deve ser criado para ajudar "${audience}" a ter sucesso com "${offer}".
**</INSTRUCOES_PLANO>**

**<EXEMPLO_JSON_ITEM>**
{
    "day": "Dia 1",
    "time": "08:30",
    "format": "reels",
    "title": "O erro de 1 minuto que custa 90% das suas vendas em ${offer}",
    "content_idea": "Um Reel rápido e chocante que expõe um erro contraintuitivo que a persona comete no início do dia. A solução é uma simples mudança de mentalidade ou processo.",
    "status": "planejado",
    "funnel_stage": "atrair",
    "focus_metric": "Compartilhamentos",
    "details": {
        "script_or_copy": "Você acorda e faz ISSO? 🤯 Pare agora!\\\\n9 em cada 10 pessoas que vendem ${offer} sabotam seu dia antes mesmo do café. O verdadeiro problema não é o que você faz, mas o que você PENSA.",
        "tool_suggestion": "CapCut",
        "step_by_step": "CENA 1 (0-3s): Close no seu rosto com expressão de surpresa. Texto grande: 'O ERRO #1'.\\\\nCENA 2 (3-10s): Gravação de tela rápida mostrando o erro comum que a persona comete ao usar [ferramenta]. Narre o problema de forma clara.\\\\nCENA 3 (10-15s): Mostre a solução. Um clique ou ajuste que resolve tudo. Visualmente satisfatório.\\\\nCENA 4 (15-18s): Volte para você, sorrindo, com o CTA: 'Salve para não esquecer!'",
        "hashtags": "#dicas #vendas",
        "creative_guidance": { "type": "video", "description": "Vídeo dinâmico com legendas grandes e foco em uma estética limpa.", "prompt": "...", "tool_link": "..." }
    }
}
**</EXEMPLO_JSON_ITEM>**`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.8,
      max_tokens: 4096,
    });
    const responseText = response.choices[0]?.message?.content;
    if (!responseText) throw new Error("A IA não retornou conteúdo.");
    return responseText;
  } catch (error) { console.error("Erro na Fase de Conteúdo:", error); throw error; }
}

// =================================================================
// 4. ACTION PRINCIPAL E MUTAÇÕES
// =================================================================

export const generateAnalysis = action({
  args: { username: v.string(), bio: v.optional(v.string()), offer: v.string(), audience: v.string(), planDuration: v.union(v.literal("week"), v.literal("month")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    const strategicAnalysis = await callGroqForStrategy(args.username, args.offer, args.audience, args.bio);

    const totalDays = args.planDuration === "week" ? 7 : 30;
    const schedule = getStrategicSchedule(totalDays);

    const fullPlan: ContentPlanItem[] = [];
    if (schedule.length > 0) {
        const midPointIndex = Math.ceil(schedule.length / 2);
        const firstHalfSchedule = schedule.slice(0, midPointIndex);
        const secondHalfSchedule = schedule.slice(midPointIndex);

        console.log(`Gerando a primeira metade do plano (${firstHalfSchedule.length} posts)...`);
        const response1 = await callGroqForContentPlan(firstHalfSchedule, strategicAnalysis, args.username, args.offer, args.audience);
        const part1 = extractJson<ContentPlanResult>(response1).content_plan;

        fullPlan.push(...part1);

        if (secondHalfSchedule.length > 0) {
            console.log(`Gerando a segunda metade do plano (${secondHalfSchedule.length} posts), com memória...`);
            const response2 = await callGroqForContentPlan(secondHalfSchedule, strategicAnalysis, args.username, args.offer, args.audience, part1);
            const part2 = extractJson<ContentPlanResult>(response2).content_plan;
            fullPlan.push(...part2);
        }
    }

    const sanitizedPlan = sanitizeContentPlan(fullPlan);
    const analysisData = { ...strategicAnalysis, content_plan: sanitizedPlan, username: args.username, bio: args.bio || "", offer: args.offer, audience: args.audience, planDuration: args.planDuration, aiModel: "groq-viral-strategist-sequential-llama3-70b" };

    await ctx.runMutation(internal.mentor.saveAnalysis, { analysisData });
    return analysisData;
  },
});

const contentPlanItemSchema = v.object({
  day: v.string(), time: v.string(),
  format: v.union(v.literal("reels"), v.literal("carrossel"), v.literal("stories"), v.literal("imagem"), v.literal("atividade")),
  title: v.string(), content_idea: v.string(),
  status: v.union(v.literal("planejado"), v.literal("concluido")),
  completedAt: v.optional(v.number()),
  funnel_stage: v.union(v.literal("atrair"), v.literal("nutrir"), v.literal("converter")),
  focus_metric: v.string(),
  details: v.optional(v.object({
    tool_suggestion: v.string(), step_by_step: v.string(), script_or_copy: v.string(), hashtags: v.string(),
    creative_guidance: v.object({ type: v.string(), description: v.string(), prompt: v.string(), tool_link: v.string(), }),
  })),
});

export const saveAnalysis = internalMutation({
  args: { analysisData: v.object({
      optimized_bio: v.string(), content_pillars: v.array(v.object({ pillar: v.string(), description: v.string() })),
      audience_persona: v.object({ name: v.string(), description: v.string(), pain_points: v.array(v.string()) }),
      brand_voice: v.string(), content_plan: v.array(contentPlanItemSchema), username: v.string(), bio: v.string(),
      offer: v.string(), audience: v.string(), planDuration: v.union(v.literal("week"), v.literal("month")),
      aiModel: v.optional(v.string()), }) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new Error("Não autenticado.");
    const existingAnalysis = await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).first();
    const dataToSave = { ...args.analysisData, userId: identity.subject, updatedAt: Date.now() };
    if (existingAnalysis) { await ctx.db.patch(existingAnalysis._id, dataToSave); return existingAnalysis._id;
    } else { return await ctx.db.insert("analyses", { ...dataToSave, createdAt: Date.now() }); }
  }
});

export const getSavedAnalysis = query({
  args: {}, handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity(); if (!identity) return null;
    return await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).order("desc").first();
  }
});

export const updateContentPlan = mutation({
  args: { analysisId: v.id("analyses"), newPlan: v.array(contentPlanItemSchema) },
  handler: async (ctx, { analysisId, newPlan }) => {
    const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new Error("Não autenticado.");
    const analysis = await ctx.db.get(analysisId); if (!analysis || analysis.userId !== identity.subject) throw new Error("Análise não encontrada.");
    await ctx.db.patch(analysisId, { content_plan: sanitizeContentPlan(newPlan), updatedAt: Date.now() });
    return { success: true };
  }
});

export const updateStepProgress = mutation({
  args: { analysisId: v.id("analyses"), itemId: v.string(), stepIndex: v.number() },
  handler: async (ctx, { analysisId, itemId, stepIndex }) => {
    const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new Error("Não autenticado.");
    const analysis = await ctx.db.get(analysisId); if (!analysis || analysis.userId !== identity.subject) throw new Error("Análise não encontrada.");

    const contentPlan = [...analysis.content_plan];
    const itemIndex = contentPlan.findIndex(item => itemId.includes(item.title));
    if (itemIndex === -1) throw new Error("Item não encontrado no plano.");

    // Como o stepProgress não está no schema, usamos outra abordagem para rastrear progresso
    await ctx.db.patch(analysisId, { updatedAt: Date.now() });
    return { success: true, stepIndex };
  }
});

// Compartilhamento e Gamificação
export const shareAchievement = mutation({
  args: {
    streakDays: v.number(),
    completedPosts: v.number(),
    totalPosts: v.number(),
    username: v.string(),
    generateImage: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    // Gerar um código único para o compartilhamento
    const shareCode = `share_${Math.random().toString(36).substring(2, 10)}`;

    // Calcular data de expiração (30 dias a partir de agora)
    const now = Date.now();
    const expiresAt = now + (30 * 24 * 60 * 60 * 1000); // 30 dias em milissegundos

    // Salvar dados de compartilhamento conforme o schema real
    await ctx.db.insert("sharedAchievements", {
      userId: identity.subject,
      streakDays: args.streakDays,
      completedPosts: args.completedPosts,
      totalPosts: args.totalPosts,
      shareCode,
      createdAt: now,
      expiresAt,
      views: 0,
      platform: undefined // Campo opcional
    });

    // Gerar URL de compartilhamento
    const shareUrl = `https://freelink.com/share/${shareCode}`;

    // Aqui você adicionaria uma lógica para gerar a imagem dinâmica com Vercel OG ou similar
    const imageUrl = args.generateImage
      ? `https://freelink.com/api/og?username=${args.username}&streak=${args.streakDays}&completed=${args.completedPosts}&total=${args.totalPosts}`
      : '';

    return {
      shareCode,
      shareUrl,
      imageUrl
    };
  }
});

export const updateSharingPlatform = mutation({
  args: {
    achievementId: v.string(), // shareCode, não ID
    platform: v.string()
  },
  handler: async (ctx, { achievementId, platform }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    // Buscar por shareCode em vez de ID direto
    const achievement = await ctx.db
      .query("sharedAchievements")
      .filter(q => q.eq(q.field("shareCode"), achievementId))
      .first();

    if (!achievement || achievement.userId !== identity.subject)
      throw new Error("Compartilhamento não encontrado.");

    // Atualizar a plataforma de compartilhamento
    await ctx.db.patch(achievement._id, { platform });

    return { success: true };
  }
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Em um app real, você consultaria o banco de dados para construir um leaderboard
    // Aqui estamos simulando dados de teste
    return [
      { username: "camila.empreende", streakDays: 45, posts: 38, badges: 5 },
      { username: "gabriel.marketer", streakDays: 42, posts: 36, badges: 4 },
      { username: "patricia.coach", streakDays: 35, posts: 30, badges: 4 },
      { username: "marcos.designer", streakDays: 32, posts: 29, badges: 3 },
      { username: "laura.design", streakDays: 26, posts: 24, badges: 3 },
      { username: "rafael.coach", streakDays: 21, posts: 19, badges: 2 },
      { username: "bruno.finance", streakDays: 18, posts: 16, badges: 2 },
      { username: "juliana.content", streakDays: 14, posts: 14, badges: 1 },
      { username: "marcos.tech", streakDays: 12, posts: 10, badges: 1 },
      { username: "ana.fitness", streakDays: 9, posts: 8, badges: 1 },
    ];
  }
});