// Em app/api/generate-bio/route.ts
// (Substitua o arquivo inteiro)

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

// Força a rota a rodar no ambiente Node.js da Vercel
export const runtime = 'nodejs';

// =======================================================
// CORREÇÃO: Usando a API da Groq
// =======================================================
// A biblioteca da OpenAI funciona com a Groq, só precisamos mudar a URL base.
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // <-- Usando a chave da Groq
  baseURL: 'https://api.groq.com/openai/v1', // <-- Apontando para os servidores da Groq
});


async function generateAnalysis(username: string, bio: string, offer: string, audience: string) {
    const prompt = `
      Você é um Diretor de Estratégia de Conteúdo para o Instagram, focado em resultados para o mercado brasileiro.

      Dados do Cliente:
      - Nome de Usuário: "@${username}"
      - Bio Atual: "${bio || 'O usuário não tem uma bio preenchida.'}"
      - Produto/Serviço: "${offer}"
      - Público-alvo: "${audience}"

      Sua tarefa é criar uma análise estratégica completa e um plano de conteúdo para uma semana.
      Sua resposta DEVE ser um único objeto JSON com as chaves: "suggestions", "strategy", "grid", e "weekly_plan".

      1.  **suggestions**: (array de 3 strings) Gere 3 novas opções de BIO otimizadas...
      2.  **strategy**: (string) Escreva uma análise de estratégia de conteúdo...
      3.  **grid**: (array de 9 strings) Crie 9 ideias curtas para um "feed ideal"...
      4.  **weekly_plan**: (array de objetos) Crie um plano de conteúdo detalhado para os próximos 7 dias...
    `;

    // Usamos o cliente da Groq para fazer a chamada
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192', // Usamos um modelo disponível na Groq
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Você é um assistente de marketing que retorna respostas apenas no formato JSON estruturado solicitado.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const analysisResult = JSON.parse(response.choices[0]?.message?.content || '{}');
    return NextResponse.json(analysisResult);
}


export async function POST(req: Request) {
  // Agora verificamos a chave da Groq
  if (!process.env.GROQ_API_KEY) {
    return new NextResponse(JSON.stringify({ error: 'Chave da API da Groq não configurada.' }), { status: 500 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Usuário não autenticado.' }), { status: 401 });
    }

    const body = await req.json();
    const { offer, audience, username, bio } = body;

    if (!offer || !audience) {
        return new NextResponse(JSON.stringify({ error: 'Os campos "oferta" e "público-alvo" são obrigatórios.' }), { status: 400 });
    }

    // ============================================================
    // CORREÇÃO: Removendo dependência da conexão individual do Instagram
    // Agora sempre usamos os dados fornecidos manualmente
    // ============================================================

    // Verificar se username e bio foram fornecidos
    if (!username || !bio) {
        // Se não foram fornecidos, usar valores padrão
        const defaultUsername = "usuario";
        const defaultBio = "Bio não fornecida";

        return generateAnalysis(
            username || defaultUsername,
            bio || defaultBio,
            offer,
            audience
        );
    }

    // Gerar análise com os dados fornecidos
    return generateAnalysis(username, bio, offer, audience);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}