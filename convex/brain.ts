// Em convex/brain.ts
// (Substitua o arquivo inteiro)

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';

// =======================================================
// CORREÇÃO: Usando a API da Groq
// =======================================================

// A biblioteca da OpenAI funciona com a Groq, só precisamos mudar a URL base.
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // <-- Usando a nova chave
  baseURL: 'https://api.groq.com/openai/v1', // <-- Apontando para os servidores da Groq
});

export const generateContentIdeas = action({
  args: { theme: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    if (!process.env.GROQ_API_KEY) {
      throw new Error("Chave da API da Groq não configurada no ambiente Convex.");
    }

    const prompt = `
      Você é o "Mago Viral", um especialista em marketing de conteúdo para o Instagram no Brasil...
      Tema: "${args.theme}"
      Sua resposta DEVE ser um único objeto JSON válido com as chaves: "viral_titles" e "reel_scripts".
      1.  viral_titles: (array de 4 strings)...
      2.  reel_scripts: (array de 2 objetos)...
    `;

    const response = await groq.chat.completions.create({
      // Usamos um modelo disponível na Groq. Llama3 é excelente.
      model: 'llama3-8b-8192',
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
    } catch {
        console.error("Erro ao fazer parse do JSON da IA:", resultText);
        throw new Error("A IA retornou uma resposta em um formato inválido.");
    }
  },
});