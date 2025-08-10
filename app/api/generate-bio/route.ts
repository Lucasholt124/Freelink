// Em app/api/generate-bio/route.ts
// (Substitua o arquivo inteiro)

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

/**
 * Gera uma análise de perfil do Instagram usando dados reais da API Graph e a IA da OpenAI.
 */
export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new NextResponse('Chave da API OpenAI não configurada.', { status: 500 });
  }

  try {
    // 1. Autenticar o usuário do Freelinnk
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Usuário não autenticado.', { status: 401 });
    }

    // 2. O frontend agora só precisa enviar a 'oferta' e o 'público'.
    const { offer, audience } = await req.json();
    if (!offer || !audience) {
        return new NextResponse('Os campos "oferta" e "público-alvo" são obrigatórios.', { status: 400 });
    }

    // 3. Buscar a conexão do Instagram salva no Convex.
    // `fetchQuery` é usado pois estamos em um ambiente de servidor (Route Handler).
    const instagramConnection = await fetchQuery(api.connections.get, { provider: 'instagram' });

    if (!instagramConnection?.accessToken) {
        return new NextResponse('Conexão com o Instagram não encontrada. Por favor, conecte sua conta nas configurações.', { status: 403 });
    }

    // 4. USAR O TOKEN REAL para buscar os dados do perfil (username e bio) no Instagram.
    const userInfoUrl = `https://graph.instagram.com/me?fields=id,username,biography&access_token=${instagramConnection.accessToken}`;
    const userInfoResponse = await fetch(userInfoUrl);
    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
        // Se o token expirou ou foi revogado, a API retornará um erro aqui.
        throw new Error(userInfo.error?.message || "Falha ao buscar dados do perfil no Instagram. Tente reconectar sua conta.");
    }

    const { username, biography: bio } = userInfo;

    // 5. Montar o prompt para a OpenAI com os dados REAIS obtidos.
    const prompt = `
      Você é um Diretor de Estratégia de Conteúdo para o Instagram, focado em resultados para o mercado brasileiro.

      Dados do Cliente:
      - Nome de Usuário: "@${username}"
      - Bio Atual: "${bio || 'O usuário não tem uma bio preenchida.'}"
      - Produto/Serviço: "${offer}"
      - Público-alvo: "${audience}"

      Sua tarefa é criar uma análise estratégica completa e um plano de conteúdo para uma semana.
      Sua resposta DEVE ser um único objeto JSON com as chaves: "suggestions", "strategy", "grid", e "weekly_plan".

      1.  **suggestions**: (array de 3 strings) Gere 3 novas opções de BIO otimizadas... (regras)
      2.  **strategy**: (string) Escreva uma análise de estratégia de conteúdo... (regras)
      3.  **grid**: (array de 9 strings) Crie 9 ideias curtas para um "feed ideal"...
      4.  **weekly_plan**: (array de objetos) Crie um plano de conteúdo detalhado para os próximos 7 dias... (regras)
    `; // O resto do seu prompt detalhado continua aqui.

    // 6. Chamar a OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: false,
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

  } catch (error) {
    console.error('[GENERATE_API_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}