import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Agora recebemos os links também!
    const { title, text, links = [] } = await req.json();

    if (!title && !text && links.length === 0) {
      return NextResponse.json({ niche: "geral" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const linksText = links.join(", "); // Junta os títulos dos links

    if (!GROQ_API_KEY) {
      console.warn("⚠️ GROQ_API_KEY não configurada. Usando fallback local.");
      return NextResponse.json({ niche: classifyNicheLocally(title, text, linksText) });
    }

    // 🔥 A CAMISA DE FORÇA DA IA 🔥
    const systemPrompt = `Você é um classificador de nichos de mercado extremamente rigoroso.
Sua função é analisar o Título, a Bio e os Links de uma página e retornar EXATAMENTE UMA PALAVRA da lista permitida.

REGRAS DE DESEMPATE (PRIORIDADE ALTA):
1. Se o conteúdo envolver academia, treino, crossfit, suplemento, legging, "fit" ou "fitness", IGNORE a palavra "roupa/moda" e retorne SEMPRE "fitness".
2. Se o conteúdo envolver moda, vestidos, sapatos, estilo (sem relação com academia), retorne "vestuario".
3. Se o conteúdo for comida, lanche, doce, açaí, retorne "alimentacao".

LISTA PERMITIDA (Você só pode responder com UMA destas palavras, em minúsculo, sem acentos):
vestuario, eletronicos, beleza, fitness, games, casa, pets, automotivo, cursos, alimentacao, saude, joias, esportes, tecnologia, infantil, papelaria, musica, viagem, fotografia, design, marketing, financas, juridico, construcao, agro, artesanato, geral`;

    const userMessage = `Classifique o nicho:
TÍTULO/USERNAME: "${title}"
BIO/DESCRIÇÃO: "${text}"
LINKS DA PÁGINA: "${linksText}"

Responda com UMA ÚNICA PALAVRA da lista permitida:`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.1, // Temperatura quase 0 para ela não ser "criativa"
        max_tokens: 15,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ niche: classifyNicheLocally(title, text, linksText) });
    }

    const data = await response.json();
    const rawNiche = data.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "geral";

    // Limpeza pesada para garantir que não passe ponto, vírgula ou acento
    const cleanNiche = rawNiche
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "")
      .substring(0, 30) || "geral";

    console.log(`🎯 Nicho classificado: "${title}" → ${cleanNiche}`);
    return NextResponse.json({ niche: cleanNiche });

  } catch {
    return NextResponse.json({ niche: "geral" });
  }
}

// 🔥 LÓGICA COMPLEXA (FALLBACK) 🔥
function classifyNicheLocally(title: string, text: string, linksText: string): string {
  // Junta tudo para analisar
  const combined = `${title} ${text} ${linksText}`.toLowerCase();

  // Mapeamento usando Expressões Regulares (RegEx).
  // O \b garante que ele só pegue a palavra inteira (ex: \bfit\b não pega "outfit" ou "profit")
  const nicheRules: { niche: string; regex: RegExp }[] = [
    { niche: "fitness", regex: /\b(whey|creatina|suplemento|treino|academia|crossfit|gym|fit|fitness|fitniss|legging|maromba)\b/i },
    { niche: "vestuario", regex: /\b(roupa|moda|fashion|estilo|tendência|grife|boutique|camiseta|camisa|vestido|jaqueta|calça|bermuda|blusa|look|tênis|sapato|sandália|bota|nike|adidas)\b/i },
    { niche: "alimentacao", regex: /\b(doce|bolo|pizza|hamburguer|hamburger|comida|restaurante|delivery|açaí|acai|lanchonete|ifood)\b/i },
    { niche: "eletronicos", regex: /\b(celular|smartphone|iphone|samsung|xiaomi|notebook|tablet|fone|tecnologia)\b/i },
    { niche: "beleza", regex: /\b(maquiagem|batom|base|skincare|perfume|cosmético|salão|cabelo|unha|manicure)\b/i },
    { niche: "automotivo", regex: /\b(carro|moto|pneu|óleo|mecânico|oficina|veículo|lavajato)\b/i },
    { niche: "cursos", regex: /\b(curso|mentoria|ebook|e-book|infoproduto|aula|kiwify|hotmart)\b/i },
    { niche: "pets", regex: /\b(ração|coleira|pet|cachorro|gato|veterinário|petshop)\b/i },
    { niche: "casa", regex: /\b(sofá|mesa|cadeira|decoração|cozinha|móvel|imóvel|imobiliária)\b/i },

  ];

  // A ordem do array acima importa! Ele vai checar fitness ANTES de vestuário.
  for (const rule of nicheRules) {
    if (rule.regex.test(combined)) {
      return rule.niche;
    }
  }

  return "geral";
}