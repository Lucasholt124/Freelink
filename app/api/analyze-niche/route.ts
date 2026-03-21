import { NextRequest, NextResponse } from "next/server";

// 🧠 SISTEMA DE CLASSIFICAÇÃO ANTI-CONCORRÊNCIA COM GROQ
// A IA lê o nome do produto e o texto do anúncio para entender exatamente
// em qual nicho ele se encaixa, e assim NUNCA mostrar um anúncio de tênis
// na página de quem vende tênis (concorrente direto)

export async function POST(req: NextRequest) {
  try {
    const { title, text } = await req.json();

    if (!title && !text) {
      return NextResponse.json({ niche: "geral" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.warn("⚠️ GROQ_API_KEY não configurada. Usando fallback local.");
      return NextResponse.json({ niche: classifyNicheLocally(title, text) });
    }

    const systemPrompt = `Você é um classificador de nichos de mercado para uma rede de anúncios.
Sua função é analisar o título e texto de um anúncio e retornar EXATAMENTE UMA palavra que represente o nicho do produto.

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS uma palavra em minúsculo, sem acentos, sem espaços, sem explicação.
2. Se não conseguir identificar, retorne "geral".
3. Analise o NOME do produto, a MARCA mencionada, e o CONTEXTO do texto.
4. O objetivo é evitar que anúncios de produtos similares apareçam em páginas de concorrentes.

EXEMPLOS DE NICHOS (use estes ou crie variações):
- calcados (tênis, sapatos, chinelos, sandálias, botas)
- roupas (camisetas, vestidos, jaquetas, moda)
- eletronicos (celulares, fones, notebooks, tablets, gadgets)
- beleza (maquiagem, skincare, perfumes, cosmeticos)
- fitness (suplementos, whey, creatina, academia, treino)
- games (consoles, jogos, controles, gamer)
- casa (moveis, decoracao, cozinha, organizacao)
- pets (racao, coleira, brinquedos para animais)
- automotivo (pecas, acessorios, carro, moto)
- cursos (infoprodutos, ebooks, mentorias, aulas)
- alimentacao (doces, comida, restaurante, delivery)
- saude (remedios, vitaminas, bem-estar, terapia)
- joias (relogios, pulseiras, colares, brincos, acessorios)
- esportes (futebol, basquete, natacao, esportivo)
- tecnologia (software, apps, saas, ferramentas digitais)
- infantil (brinquedos, roupas de bebe, criancas)
- papelaria (cadernos, canetas, material escolar)
- musica (instrumentos, violao, teclado, fones)
- viagem (malas, passagens, turismo, hotel)

Se o produto mistura nichos, escolha o MAIS FORTE/PRINCIPAL.`;

    const userMessage = `Analise este anúncio e classifique o nicho:

TÍTULO: "${title}"
TEXTO: "${text}"

Responda com UMA ÚNICA PALAVRA representando o nicho:`;

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
        temperature: 0.1, // Baixa pra ser consistente
        max_tokens: 20,   // Só precisa de uma palavra
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      console.error("Erro na API Groq:", response.status, await response.text());
      return NextResponse.json({ niche: classifyNicheLocally(title, text) });
    }

    const data = await response.json();
    const rawNiche = data.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "geral";

    // 🛡️ Sanitiza: remove qualquer coisa que não seja letra
    const cleanNiche = rawNiche
      .replace(/[^a-z]/g, "")
      .substring(0, 30) || "geral";

    console.log(`🎯 Nicho classificado pela IA: "${title}" → ${cleanNiche}`);

    return NextResponse.json({ niche: cleanNiche });

  } catch (error) {
    console.error("❌ Erro ao classificar nicho:", error);
    return NextResponse.json({ niche: "geral" });
  }
}

// 🔄 FALLBACK LOCAL: Classificação básica sem IA (caso a Groq esteja offline)
function classifyNicheLocally(title: string, text: string): string {
  const combined = `${title} ${text}`.toLowerCase();

  const nicheKeywords: Record<string, string[]> = {
    calcados: ["tênis", "tenis", "sapato", "chinelo", "sandalia", "sandália", "bota", "nike", "adidas", "puma", "mizuno", "new balance", "vans", "air max", "jordan", "sapatênis"],
    roupas: ["camiseta", "camisa", "vestido", "jaqueta", "calça", "bermuda", "blusa", "moletom", "cropped", "saia", "blazer", "moda", "outfit", "roupa", "look"],
    eletronicos: ["celular", "smartphone", "iphone", "samsung", "xiaomi", "notebook", "tablet", "fone", "airpods", "carregador", "cabo", "power bank", "gadget"],
    beleza: ["maquiagem", "batom", "base", "rimel", "skincare", "perfume", "creme", "hidratante", "protetor solar", "shampoo", "condicionador", "cosmético", "cosmetico"],
    fitness: ["whey", "creatina", "suplemento", "proteina", "proteína", "treino", "academia", "pre treino", "pré-treino", "bcaa", "glutamina", "hipercalorico", "termogenico"],
    games: ["ps5", "xbox", "nintendo", "switch", "controle", "joystick", "headset gamer", "placa de video", "gamer", "console", "jogo", "game"],
    casa: ["sofá", "sofa", "mesa", "cadeira", "decoração", "decoracao", "cozinha", "organização", "organizacao", "movel", "móvel", "tapete", "cortina", "luminária", "luminaria"],
    pets: ["ração", "racao", "coleira", "pet", "cachorro", "gato", "animal", "petisco", "cama pet", "brinquedo pet"],
    automotivo: ["carro", "moto", "pneu", "óleo", "oleo", "filtro", "automotivo", "peça", "peca", "acessório carro", "farol", "volante"],
    cursos: ["curso", "mentoria", "ebook", "e-book", "infoproduto", "aula", "treinamento", "masterclass", "workshop"],
    alimentacao: ["doce", "bolo", "pizza", "hamburguer", "hamburger", "comida", "restaurante", "delivery", "brigadeiro", "açaí", "acai", "salgado"],
    saude: ["vitamina", "remédio", "remedio", "saúde", "saude", "terapia", "bem-estar", "suplemento natural", "fitoterápico", "fitoterapico"],
    joias: ["relógio", "relogio", "pulseira", "colar", "brinco", "anel", "joia", "jóia", "acessório", "acessorio", "bijuteria"],
    esportes: ["futebol", "basquete", "natação", "natacao", "esporte", "bola", "chuteira", "luva", "raquete"],
    tecnologia: ["software", "app", "aplicativo", "saas", "ferramenta digital", "automação", "automacao", "inteligência artificial", "ia"],
    infantil: ["brinquedo", "bebê", "bebe", "criança", "crianca", "infantil", "berço", "berco", "carrinho"],
    papelaria: ["caderno", "caneta", "lápis", "lapis", "mochila", "estojo", "material escolar", "agenda", "planner"],
    musica: ["violão", "violao", "guitarra", "teclado musical", "bateria", "instrumento", "ukulele", "microfone"],
    viagem: ["mala", "viagem", "passagem", "hotel", "turismo", "hospedagem", "airbnb"],
  };

  for (const [niche, keywords] of Object.entries(nicheKeywords)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return niche;
      }
    }
  }

  return "geral";
}