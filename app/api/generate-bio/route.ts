// Em app/api/generate-bio/route.ts
// (Substitua o arquivo inteiro)

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import OpenAI from 'openai';

// Força a rota a rodar no ambiente Node.js da Vercel para ter acesso a `process.env`.
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

      1.  **suggestions**: (array de 3 strings) Gere 3 novas opções de BIO otimizadas com no máximo 150 caracteres, CTA claro e emojis estratégicos.
      2.  **strategy**: (string) Escreva uma análise de estratégia de conteúdo. Sugira 3 "pilares de conteúdo" e 3 nomes de Destaques. Use \\n para quebra de linha.
      3.  **grid**: (array de 9 strings) Crie 9 ideias curtas para um "feed ideal" visualmente equilibrado.
      4.  **weekly_plan**: (array de objetos) Crie um plano de conteúdo detalhado para os próximos 7 dias com 7 objetos, cada um com as chaves "day", "time", "format", e "content_idea". Varie os formatos e horários.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
  if (!process.env.OPENAI_API_KEY) {
    return new NextResponse(JSON.stringify({ error: 'Chave da API OpenAI não configurada.' }), { status: 500 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Usuário não autenticado.' }), { status: 401 });
    }

    const body = await req.json();
    const { offer, audience } = body;

    if (!offer || !audience) {
        return new NextResponse(JSON.stringify({ error: 'Os campos "oferta" e "público-alvo" são obrigatórios.' }), { status: 400 });
    }

    const instagramConnection = await fetchQuery(api.connections.get, { provider: 'instagram' });

    if (instagramConnection?.accessToken) {
        const userInfoUrl = `https://graph.instagram.com/me?fields=id,username,biography&access_token=${instagramConnection.accessToken}`;
        const userInfoResponse = await fetch(userInfoUrl);
        const userInfo = await userInfoResponse.json();

        if (!userInfoResponse.ok) {
            throw new Error(userInfo.error?.message || "Falha ao buscar dados do perfil no Instagram. Tente reconectar sua conta.");
        }
        const { username, biography: bio } = userInfo;
        return generateAnalysis(username, bio, offer, audience);
    } else {
        // Fallback para dados manuais (caso do plano Free, ou se a conexão não existir)
        const { username, bio } = body;
        if (!username || !bio) {
            return new NextResponse(JSON.stringify({ error: 'Conexão com o Instagram não encontrada e dados manuais não fornecidos.' }), { status: 403 });
        }
        return generateAnalysis(username, bio, offer, audience);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}