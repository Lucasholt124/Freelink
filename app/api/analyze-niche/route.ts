import { NextRequest, NextResponse } from "next/server";

// 🔥 A LISTA OFICIAL (Tem que bater exatamente com o <select> do AdsManager) 🔥  
const VALID_NICHES = [
  "vestuario", "eletronicos", "beleza", "fitness", "games", "casa",
  "pets", "automotivo", "cursos", "alimentacao", "saude", "joias",
  "esportes", "tecnologia", "infantil", "papelaria", "musica",
  "viagem", "fotografia", "design", "marketing", "financas",
  "juridico", "construcao", "agro", "artesanato", "geral"
];

export async function POST(req: NextRequest) {
  try {
    const { title, text, links = [] } = await req.json();

    if (!title && !text && links.length === 0) {
      return NextResponse.json({ niche: "geral" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const linksText = links.join(", ");

    if (!GROQ_API_KEY) {
      return NextResponse.json({ niche: classifyNicheLocally(title, text, linksText) });
    }

    const systemPrompt = `Você é um classificador de nichos de mercado extremamente rigoroso.
Sua função é analisar o Título, a Bio e os Links e retornar EXATAMENTE UMA PALAVRA da lista permitida.

REGRAS DE DESEMPATE (PRIORIDADE ALTA):
1. Se o conteúdo envolver academia, treino, crossfit, suplementos, legging, "fit" ou "fitness", IGNORE "roupa/moda" e retorne SEMPRE "fitness".
2. Se o conteúdo envolver moda, vestidos, sapatos ou estilo (sem relação com academia), retorne "vestuario".
3. Se o conteúdo for comida, lanche, doce, açaí, retorne "alimentacao".

LISTA PERMITIDA:
${VALID_NICHES.join(", ")}`;

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
        temperature: 0, // Temperatura ZERO para forçar obediência
        max_tokens: 15,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ niche: classifyNicheLocally(title, text, linksText) });
    }

    const data = await response.json();
    const rawNiche = data.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "geral";

    let cleanNiche = rawNiche
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "")
      .substring(0, 30) || "geral";

    // 🚨 A MÁGICA AQUI: Se a IA inventar uma palavra (ex: "moda"), jogamos fora e usamos o Fallback!
    if (!VALID_NICHES.includes(cleanNiche)) {
      console.log(`⚠️ IA inventou "${cleanNiche}". Aplicando fallback rigoroso...`);
      cleanNiche = classifyNicheLocally(title, text, linksText);
    }

    console.log(`🎯 Nicho classificado: "${title}" → ${cleanNiche}`);
    return NextResponse.json({ niche: cleanNiche });

  } catch {
    return NextResponse.json({ niche: "geral" });
  }
}

// 🔥 LÓGICA COMPLEXA (FALLBACK) 🔥
function classifyNicheLocally(title: string, text: string, linksText: string): string {
  const combined = `${title} ${text} ${linksText}`.toLowerCase();

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

  for (const rule of nicheRules) {
    if (rule.regex.test(combined)) {
      return rule.niche;
    }
  }
  return "geral";
}