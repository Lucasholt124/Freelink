// Em convex/brain.ts
// (Substitua o arquivo inteiro)

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateContentIdeas = mutation({
  args: {
    theme: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    // Essencial para produção: Adicionar verificação de plano aqui.

    const prompt = `
      Você é o "Mago Viral", um especialista em marketing de conteúdo para o Instagram no Brasil...
      Tema: "${args.theme}"
      Sua resposta DEVE ser um único objeto JSON válido com as chaves: "viral_titles" e "reel_scripts".
      1.  **viral_titles**: (array de 4 strings)...
      2.  **reel_scripts**: (array de 2 objetos)...
    `;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Chave da API da OpenAI não configurada.");
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Você é um assistente de marketing que retorna respostas apenas no formato JSON solicitado.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) {
        throw new Error("A IA não retornou um resultado válido.");
    }

    try {
        return JSON.parse(resultText);
    } catch { // <-- CORREÇÃO: Removido o '(e)' que não estava sendo usado.
        console.error("Erro ao fazer parse do JSON da IA:", resultText);
        throw new Error("A IA retornou uma resposta em um formato inválido.");
    }
  },
});