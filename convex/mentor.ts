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
// 3. CHAMADAS DE IA REFORMULADAS
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
4. "brand_voice": Descreva o tom de voz ideal para a marca em uma única frase (ex: "Educacional, motivador e direto ao ponto.").
Exemplo da estrutura JSON de saída esperada:
{ "optimized_bio": "Transformo [Público] em [Resultado] com [Oferta].\\n✨ [Benefício 1]\\n✨ [Benefício 2]\\n👇 Comece agora:", "content_pillars": [ { "pillar": "Educação sobre o Problema", "description": "Conteúdos que ensinam a audiência sobre a importância de resolver o problema que a sua oferta soluciona." }, { "pillar": "Demonstração da Solução", "description": "Posts que mostram como sua oferta funciona na prática, estudos de caso e tutoriais." }, { "pillar": "Construção de Autoridade", "description": "Conteúdos que posicionam você como especialista, compartilhando insights, tendências e bastidores." } ], "audience_persona": { "name": "Carlos Empreendedor", "description": "Um dono de pequeno negócio de 35 anos que luta para atrair clientes online e se sente sobrecarregado com marketing digital.", "pain_points": ["Falta de tempo para criar conteúdo", "Não sabe como converter seguidores em clientes", "Orçamento de marketing limitado"] }, "brand_voice": "Confiável, experiente e encorajador, como um mentor." }`;
  try {
    const response = await groq.chat.completions.create({ model: "llama3-70b-8192", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.8, max_tokens: 4000, response_format: { type: "json_object" } });
    const responseText = response.choices[0]?.message?.content;
    if (!responseText) throw new Error("A Fase 1 (Estratégia) não retornou conteúdo.");
    return JSON.parse(responseText) as StrategicAnalysis;
  } catch (error) { console.error("Erro na Fase 1 (callGroqForStrategy):", error); throw new Error("Falha ao gerar a análise estratégica."); }
}

async function callGroqForContentPlan(schedule: StrategicSlot[], strategy: StrategicAnalysis, username: string, offer: string, audience: string): Promise<string> {
  const systemPrompt = `Você é 'O Estrategista Viral', uma fusão de um copywriter de resposta direta, um growth hacker e um diretor criativo. Sua especialidade é criar planos de conteúdo para Instagram que são psicologicamente persuasivos, impossíveis de ignorar e que geram crescimento orgânico massivo.

**REGRAS DE OURO (NÃO QUEBRE NUNCA):**
1. **FORMATO JSON PURO:** Sua única saída é um array JSON válido. Comece com '[' e termine com ']'. Sem comentários, sem introduções.
2. **PROFUNDIDADE MÁXIMA:** É PROIBIDO conteúdo genérico ou superficial. Evite dicas óbvias como 'tenha consistência' ou 'conheça seu público'. Cada post deve entregar uma pequena transformação, uma nova perspectiva ou um momento 'AHA!'.
3. **ZERO REPETIÇÃO:** O plano deve ser 100% coeso e sem repetições. Como você está gerando o plano inteiro de uma vez, você tem o contexto total. Use-o para garantir que cada título, ideia e ângulo seja único.
4. **GATILHOS MENTAIS:** Incorpore curiosidade, prova social, especificidade e urgência nos títulos e ideias. Crie posts que as pessoas sintam uma necessidade intrínseca de salvar e compartilhar.
5. **ESTRUTURA RÍGIDA:** Siga a estrutura do JSON de exemplo à risca. Os campos \`funnel_stage\` e \`format\` devem conter apenas os valores literais permitidos: "reels", "carrossel", "stories", "imagem", "atividade", "atrair", "nutrir", "converter".
6. **NARRATIVA SEMANAL:** Pense em mini-temas para cada semana. Os posts de uma semana devem se conectar de alguma forma, contando uma história ou explorando um tópico em profundidade.`;

  const scheduleInstructions = schedule.map(slot => `- Dia ${slot.day} às ${slot.time}: Propósito '${slot.purpose}'.`).join('\n');

  const userPrompt = `**MISSÃO:** Criar um plano de conteúdo viral completo para @${username}.

**<ANALISE_ESTRATEGICA>**
${JSON.stringify(strategy, null, 2)}
**</ANALISE_ESTRATEGICA>**

**<INSTRUCOES_PLANO>**
1. **CRONOGRAMA ESTRATÉGICO:** Crie um post para CADA um dos seguintes slots. Siga o propósito de cada um:
${scheduleInstructions}
2. **DIAS DE ATIVIDADE:** Nos dias que NÃO estão no cronograma, sugira uma "atividade" de crescimento (ex: "Interagir com 10 contas do público-alvo", "Analisar 3 concorrentes").
3. **COERÊNCIA:** Garanta que o plano flua logicamente, usando a 'Narrativa Semanal' para conectar as ideias. Alterne entre os pilares de conteúdo para manter o interesse.
4. **FOCO PRINCIPAL:** Todo o conteúdo deve ser criado para ajudar "${audience}" a ter sucesso com "${offer}".
**</INSTRUCOES_PLANO>**

**<EXEMPLO_JSON_ITEM>**
{ "day": "Dia 1", "time": "08:30", "format": "reels", "title": "O erro de 1 minuto que custa 90% das suas vendas em ${offer}", "content_idea": "Um Reel rápido e chocante que expõe um erro contraintuitivo que a persona comete no início do dia. A solução é uma simples mudança de mentalidade ou processo.", "status": "planejado", "funnel_stage": "atrair", "focus_metric": "Compartilhamentos", "details": { "script_or_copy": "Você acorda e faz ISSO? 🤯 Pare agora!\\\\n9 em cada 10 pessoas que vendem ${offer} sabotam seu dia antes mesmo do café. O verdadeiro problema não é o que você faz, mas o que você PENSA.\\\\nTeste esta mudança de 1 minuto amanhã e me agradeça depois. 👇\\\\n#erroscomuns #${offer.replace(/\s+/g, '')} #produtividade", "tool_suggestion": "CapCut", "step_by_step": "1. Gancho forte. 2. Mostrar erro. 3. Apresentar solução.", "hashtags": "#dicas #vendas", "creative_guidance": { "type": "video", "description": "...", "prompt": "...", "tool_link": "..." } } }
**</EXEMPLO_JSON_ITEM>**`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.8, max_tokens: 8100
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

    let fullPlan: ContentPlanItem[] = [];
    if (schedule.length > 0) {
        const contentPlanResponse = await callGroqForContentPlan(schedule, strategicAnalysis, args.username, args.offer, args.audience);
        fullPlan = extractJson<ContentPlanResult>(contentPlanResponse).content_plan;
    }

    const sanitizedPlan = sanitizeContentPlan(fullPlan);

    const analysisData = { ...strategicAnalysis, content_plan: sanitizedPlan, username: args.username, bio: args.bio || "", offer: args.offer, audience: args.audience, planDuration: args.planDuration, aiModel: "groq-viral-strategist-llama3-70b" };

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

export const markContentItemComplete = mutation({
  args: { analysisId: v.id("analyses"), dayIndex: v.number(), status: v.union(v.literal("planejado"), v.literal("concluido")), },
  handler: async (ctx, { analysisId, dayIndex, status }) => {
    const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new Error("Não autenticado.");
    const analysis = await ctx.db.get(analysisId); if (!analysis || analysis.userId !== identity.subject) throw new Error("Análise não encontrada.");
    const contentPlan = [...analysis.content_plan];
    if (dayIndex < 0 || dayIndex >= contentPlan.length) throw new Error("Índice de dia inválido.");
    contentPlan[dayIndex] = { ...contentPlan[dayIndex], status: status, completedAt: status === "concluido" ? Date.now() : undefined };
    await ctx.db.patch(analysisId, { content_plan: sanitizeContentPlan(contentPlan), updatedAt: Date.now() });
    return { success: true };
  }
});