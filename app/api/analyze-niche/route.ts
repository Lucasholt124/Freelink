import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, text } = await req.json();

    if (!title || !text) {
      return NextResponse.json(
        { error: 'Título e texto são obrigatórios.' },
        { status: 400 }
      );
    }

    // 🔥 Aqui entra a chave de API da Groq. Você precisará colocar GROQ_API_KEY no seu arquivo .env.local
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ GROQ_API_KEY não encontrada no .env. Retornando nicho padrão.");
      return NextResponse.json({ niche: "geral" });
    }

    const prompt = `Você é um classificador de nichos de mercado hiper-preciso.
    Sua única tarefa é ler o texto abaixo e retornar UMA ÚNICA PALAVRA que defina o nicho.
    NÃO escreva nenhuma introdução, apenas a palavra. Use letras minúsculas.
    Exemplos de respostas válidas: moda, beleza, barbearia, alimentação, tecnologia, saúde, finanças.

    Título da campanha/página: ${title}
    Texto do anúncio/descrição: ${text}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Modelo excelente e rápido da Groq
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1, // Temperatura baixa para respostas diretas
        max_tokens: 10
      })
    });

    const data = await response.json();

    // Pega a resposta da IA, limpa espaços e pontuações chatas
    let niche = data.choices?.[0]?.message?.content?.trim().toLowerCase() || "geral";
    niche = niche.replace(/[^a-zãáàâéêíóôõúç]/gi, ''); // Deixa só letras

    return NextResponse.json({ niche });

  } catch (error) {
    console.error('Erro na IA da Groq:', error);
    // Fallback: se a IA der qualquer pau, a campanha não quebra, só ganha um nicho genérico
    return NextResponse.json({ niche: 'geral' });
  }
}