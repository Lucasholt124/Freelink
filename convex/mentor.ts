// Em /convex/mentor.ts
// (Substitua o arquivo inteiro)

import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import {  internal } from "./_generated/api";
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
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

    const prompt = `
      Você é "Athena", a estrategista de conteúdo mais brilhante do mundo para criadores brasileiros no Instagram. Sua tarefa é criar um plano de crescimento completo, detalhado e acionável.

      Dados do Cliente:
      - Username: "@${args.username}"
      - Bio Atual: "${args.bio || 'Não informada.'}"
      - Vende/Oferece: "${args.offer}"
      - Público-alvo: "${args.audience}"
      - Duração do Plano: ${args.planDuration === 'week' ? '7 dias' : '30 dias'}

      Sua resposta DEVE ser um único objeto JSON com as chaves: "suggestions", "strategy", "grid", e "content_plan".

      1.  **suggestions**: Gere 3 novas opções de BIO. Devem ser magnéticas, claras e com um CTA forte.
      2.  **strategy**: Crie uma estratégia de conteúdo. Inclua:
          -   **Pilares de Conteúdo:** 3 a 5 pilares com exemplos.
          -   **Linha Editorial:** Tom de voz e estilo visual.
          -   **Destaques Essenciais:** 4 nomes de destaques com o que colocar em cada um.
      3.  **grid**: Gere 9 ideias curtas para um feed visualmente harmonioso, usando emojis para representar o tipo de post.
      4.  **content_plan**: Crie um plano de conteúdo para ${args.planDuration === 'week' ? '7' : '30'} dias. O array deve conter ${args.planDuration === 'week' ? '7' : '30'} objetos.
          -   Cada objeto deve ter: "day" (ex: "Dia 1"), "time" (ex: "19:00"), "format" (Reels, Carrossel, Story, Live), "title" (um título chamativo para o post), "content_idea" (descrição ultra-detalhada com gancho, desenvolvimento e CTA) e "status" (inicialmente "planejado").
    `;

    const response = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      response_format: { type: 'json_object' },
      messages: [ { role: 'system', content: 'Responda apenas com o objeto JSON solicitado.' }, { role: 'user', content: prompt } ],
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) throw new Error("A IA não retornou um resultado.");

    const analysisData = JSON.parse(resultText);

    await ctx.runMutation(internal.mentor.saveAnalysis, { analysisData });

    return analysisData;
  },
});

// --- MUTATION para SALVAR a análise ---
export const saveAnalysis = internalMutation({
    args: { analysisData: v.any() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");

        const existingAnalysis = await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).first();

        if (existingAnalysis) {
            await ctx.db.patch(existingAnalysis._id, { ...args.analysisData, updatedAt: Date.now() });
        } else {
            await ctx.db.insert("analyses", { userId: identity.subject, ...args.analysisData, createdAt: Date.now() });
        }
    }
});

// --- QUERY para BUSCAR a análise salva ---
export const getSavedAnalysis = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        return await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).first();
    }
});