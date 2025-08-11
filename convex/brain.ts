// Em convex/brain.ts
// (Esta versão está correta)

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// O frontend vai chamar esta action diretamente.
export const generateContentIdeas = action({
  args: { theme: v.string() },
  handler: async (ctx, args) => { // <-- CORREÇÃO: Adicionado 'args' aqui
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    // Verificação de plano...

    const prompt = `
      Você é o "Mago Viral", um especialista em marketing de conteúdo para o Instagram no Brasil...
      Tema: "${args.theme}" // <-- Agora 'args.theme' existe

      Sua resposta DEVE ser um único objeto JSON válido com as chaves: "viral_titles" e "reel_scripts".
      1.  viral_titles: (array de 4 strings)...
      2.  reel_scripts: (array de 2 objetos)...
    `;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Chave da API da OpenAI não configurada.");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Modelo corrigido para um existente
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: "..." }, { role: "user", content: prompt }],
    });

    const resultText = response.choices[0]?.message?.content;

    if (!resultText) throw new Error("A IA não retornou um resultado válido.");
    try {
      return JSON.parse(resultText);
    } catch {
      throw new Error("A IA retornou uma resposta em um formato inválido.");
    }
  },
});