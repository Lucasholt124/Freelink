// Em /convex/mentor.ts
// (Substitua o arquivo inteiro)

import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {  internal } from "./_generated/api";
import OpenAI from "openai";

// Configuração do Groq
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// --- ACTION para GERAR uma nova análise ---
export const generateAnalysis = action({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
    offer: v.string(),
    audience: v.string(),
    planDuration: v.union(v.literal("week"), v.literal("month")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    // Armazena os inputs do usuário junto com a análise
    const userData = {
        username: args.username,
        bio: args.bio || "",
        offer: args.offer,
        audience: args.audience,
        planDuration: args.planDuration,
    }

    const prompt = `
      Você é "Athena", a estrategista de conteúdo digital mais avançada do mundo, com foco em viralização e crescimento orgânico para o mercado brasileiro no Instagram. Sua tarefa é criar um plano de batalha de conteúdo completo, detalhado e acionável.

      Dados do Cliente:
      - Username: "@${args.username}"
      - Bio Atual: "${args.bio || 'Não informada.'}"
      - Vende/Oferece: "${args.offer}"
      - Audiência-Alvo: "${args.audience}"
      - Duração da Missão: ${args.planDuration === "week" ? "7 dias (Sprint)" : "30 dias (Campanha Completa)"}

      ⚠️ SUA RESPOSTA DEVE SER UM ÚNICO OBJETO JSON VÁLIDO, SEM NENHUM TEXTO OU EXPLICAÇÃO FORA DELE.
      O plano de conteúdo ('content_plan') deve conter exatamente ${args.planDuration === "week" ? "7" : "30"} itens, um para cada dia.
      Use o seguinte formato:

      {
        "suggestions": [
          "Opção de bio 1, focada em autoridade e com um CTA claro.",
          "Opção de bio 2, mais pessoal e focada em conexão emocional.",
          "Opção de bio 3, direta ao ponto, ideal para quem já tem prova social."
        ],
        "strategy": "### Análise Estratégica Rápida\\n**Forças:** ...\\n**Fraquezas:** ...\\n**Oportunidades:** ...\\n**Ameaças:** ...\\n\\n### Pilares de Conteúdo\\n1. **Pilar 1 (Educação):** Título do pilar. Ex: 'Desmistificando X'.\\n2. **Pilar 2 (Conexão):** Título do pilar. Ex: 'Bastidores da Jornada'.\\n3. **Pilar 3 (Venda):** Título do pilar. Ex: 'A Solução Definitiva'.\\n\\n### Linha Editorial\\n**Tom de Voz:** ... (ex: Especialista e acessível, bem-humorado e direto, inspirador e calmo)\\n**Identidade Visual:** ... (ex: Cores vibrantes como laranja e roxo, fontes limpas e modernas, uso de templates específicos no Canva para consistência)",
        "grid": [
          "Reels: Gancho viral sobre [dor do público]",
          "Carrossel: 5 mitos sobre [seu nicho]",
          "Foto: Frase de impacto em fundo limpo",
          "Carrossel: Tutorial passo a passo de [tópico]",
          "Reels: Bastidores do seu processo",
          "Foto: Depoimento de cliente com foto",
          "Carrossel: Antes e Depois de [solução]",
          "Reels: Respondendo a uma pergunta comum",
          "Foto: CTA direto para seu produto/serviço"
        ],
        "content_plan": [
          {
            "day": "Dia 1",
            "time": "19:05",
            "format": "Reels",
            "title": "O Erro #1 que Todos Cometem em [Seu Nicho]",
            "content_idea": "Um roteiro detalhado para um Reels de 15 segundos.\\n**Gancho (3s):** Mostre o erro de forma visual e exagerada.\\n**Desenvolvimento (9s):** Explique rapidamente por que é um erro e mostre a forma certa.\\n**CTA (3s):** 'Se você quer evitar esse erro, comente EU QUERO'.",
            "status": "planejado",
            "details": { "passo_a_passo": "1. Grave a cena do erro. 2. Grave a cena da solução. 3. Use o áudio em alta [nome do áudio]. 4. Legendas grandes e amarelas." }
          }
        ]
      }
    `;

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Você é um assistente que responde apenas com o objeto JSON solicitado, sem exceções." },
        { role: "user", content: prompt },
      ],
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) throw new Error("A IA não retornou um resultado.");

    const analysisData = JSON.parse(resultText);

    await ctx.runMutation(internal.mentor.saveAnalysis, {
      analysisData: { ...analysisData, ...userData }
    });

    return { ...analysisData, ...userData };
  },
});

// --- MUTATION INTERNA para SALVAR a análise ---
export const saveAnalysis = internalMutation({
    args: {
      analysisData: v.any(), // Inclui os dados do usuário agora
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");

        const existingAnalysis = await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).first();

        const dataToSave = {
            ...args.analysisData,
            userId: identity.subject,
            updatedAt: Date.now()
        };

        if (existingAnalysis) {
            await ctx.db.patch(existingAnalysis._id, dataToSave);
            return existingAnalysis._id;
        } else {
            return await ctx.db.insert("analyses", { ...dataToSave, createdAt: Date.now() });
        }
    }
});

// --- QUERY para BUSCAR a análise salva ---
export const getSavedAnalysis = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        return await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).order("desc").first();
    }
});

// --- [NOVO] MUTATION para ATUALIZAR o plano de conteúdo (marcar como feito, editar, etc.) ---
export const updateContentPlan = mutation({
    args: {
        analysisId: v.id("analyses"),
        newPlan: v.array(v.object({
            day: v.string(),
            time: v.string(),
            format: v.string(),
            title: v.string(),
            content_idea: v.string(),
            status: v.union(v.literal("planejado"), v.literal("concluido")),
            details: v.optional(v.object({ passo_a_passo: v.string() })),
        }))
    },
    handler: async (ctx, { analysisId, newPlan }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");

        const analysis = await ctx.db.get(analysisId);
        if (!analysis || analysis.userId !== identity.subject) {
            throw new Error("Análise não encontrada ou permissão negada.");
        }

        await ctx.db.patch(analysisId, {
            content_plan: newPlan,
            updatedAt: Date.now(),
        });
    }
});