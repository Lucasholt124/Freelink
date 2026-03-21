import { NextRequest, NextResponse } from "next/server";

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
Sua função é analisar o título e texto de um anúncio/perfil e retornar EXATAMENTE UMA palavra que represente o nicho.

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS uma palavra em minúsculo, sem acentos, sem espaços, sem explicação.
2. Se não conseguir identificar, retorne "geral".
3. Analise o NOME do produto/perfil, a MARCA mencionada, e o CONTEXTO do texto.
4. O objetivo é evitar que anúncios de produtos similares apareçam em páginas de concorrentes.

NICHOS VÁLIDOS (use exatamente estes):
calcados, roupas, eletronicos, beleza, fitness, games, casa, pets, automotivo, cursos, alimentacao, saude, joias, esportes, tecnologia, infantil, papelaria, musica, viagem, moda, fotografia, design, marketing, financas, juridico, construcao, agro, religiao, artesanato, geral

Se o perfil/produto mistura nichos, escolha o MAIS FORTE/PRINCIPAL.`;

    const userMessage = `Classifique o nicho deste conteúdo:

TÍTULO/NOME: "${title}"
DESCRIÇÃO/TEXTO: "${text}"

Responda com UMA ÚNICA PALAVRA:`;

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
        temperature: 0.1,
        max_tokens: 20,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      console.error("Erro na API Groq:", response.status, await response.text());
      return NextResponse.json({ niche: classifyNicheLocally(title, text) });
    }

    const data = await response.json();
    const rawNiche = data.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "geral";

    const cleanNiche = rawNiche
      .replace(/[^a-z]/g, "")
      .substring(0, 30) || "geral";

    console.log(`🎯 Nicho classificado: "${title}" → ${cleanNiche}`);

    return NextResponse.json({ niche: cleanNiche });

  } catch (error) {
    console.error("❌ Erro ao classificar nicho:", error);
    return NextResponse.json({ niche: "geral" });
  }
}

function classifyNicheLocally(title: string, text: string): string {
  const combined = `${title} ${text}`.toLowerCase();

  const nicheKeywords: Record<string, string[]> = {
    calcados: ["tênis", "tenis", "sapato", "chinelo", "sandalia", "sandália", "bota", "nike", "adidas", "puma", "mizuno", "new balance", "vans", "air max", "jordan", "sapatênis", "sapatenis"],
    roupas: ["camiseta", "camisa", "vestido", "jaqueta", "calça", "bermuda", "blusa", "moletom", "cropped", "saia", "blazer", "roupa", "look", "outfit"],
    moda: ["moda", "fashion", "estilo", "tendência", "tendencia", "grife", "boutique", "loja de roupa"],
    eletronicos: ["celular", "smartphone", "iphone", "samsung", "xiaomi", "notebook", "tablet", "fone", "airpods", "carregador", "cabo", "power bank", "gadget"],
    beleza: ["maquiagem", "batom", "base", "rimel", "skincare", "perfume", "creme", "hidratante", "protetor solar", "shampoo", "condicionador", "cosmético", "cosmetico", "salão", "salao"],
    fitness: ["whey", "creatina", "suplemento", "proteina", "proteína", "treino", "academia", "pre treino", "pré-treino", "bcaa", "glutamina", "hipercalorico", "termogenico", "gym"],
    games: ["ps5", "xbox", "nintendo", "switch", "controle", "joystick", "headset gamer", "placa de video", "gamer", "console", "jogo", "game", "streamer"],
    casa: ["sofá", "sofa", "mesa", "cadeira", "decoração", "decoracao", "cozinha", "organização", "organizacao", "movel", "móvel", "tapete", "cortina", "luminária", "luminaria"],
    pets: ["ração", "racao", "coleira", "pet", "cachorro", "gato", "animal", "petisco", "cama pet", "brinquedo pet", "veterinário", "veterinario", "petshop"],
    automotivo: ["carro", "moto", "pneu", "óleo", "oleo", "filtro", "automotivo", "peça", "peca", "acessório carro", "farol", "volante", "mecânico", "mecanico", "oficina"],
    cursos: ["curso", "mentoria", "ebook", "e-book", "infoproduto", "aula", "treinamento", "masterclass", "workshop", "hotmart", "kiwify", "eduzz"],
    alimentacao: ["doce", "bolo", "pizza", "hamburguer", "hamburger", "comida", "restaurante", "delivery", "brigadeiro", "açaí", "acai", "salgado", "confeitaria", "lanchonete"],
    saude: ["vitamina", "remédio", "remedio", "saúde", "saude", "terapia", "bem-estar", "suplemento natural", "fitoterápico", "fitoterapico", "médico", "medico", "clínica", "clinica"],
    joias: ["relógio", "relogio", "pulseira", "colar", "brinco", "anel", "joia", "jóia", "acessório", "acessorio", "bijuteria", "semijoias"],
    esportes: ["futebol", "basquete", "natação", "natacao", "esporte", "bola", "chuteira", "luva", "raquete", "corrida", "ciclismo"],
    tecnologia: ["software", "app", "aplicativo", "saas", "ferramenta digital", "automação", "automacao", "inteligência artificial", "programação", "programacao", "desenvolvedor"],
    infantil: ["brinquedo", "bebê", "bebe", "criança", "crianca", "infantil", "berço", "berco", "carrinho", "kids"],
    papelaria: ["caderno", "caneta", "lápis", "lapis", "mochila", "estojo", "material escolar", "agenda", "planner", "sticker"],
    musica: ["violão", "violao", "guitarra", "teclado musical", "bateria", "instrumento", "ukulele", "microfone", "música", "musica", "dj", "produtor musical"],
    viagem: ["mala", "viagem", "passagem", "hotel", "turismo", "hospedagem", "airbnb", "mochilão", "mochilao"],
    fotografia: ["fotógrafo", "fotografo", "fotografia", "ensaio", "câmera", "camera", "foto", "estúdio", "estudio"],
    design: ["design", "designer", "logo", "identidade visual", "ui", "ux", "gráfico", "grafico", "ilustração", "ilustracao"],
    marketing: ["marketing", "tráfego", "trafego", "social media", "gestor", "anúncio", "anuncio", "copywriting", "lead", "funil"],
    financas: ["investimento", "finanças", "financas", "trading", "cripto", "bitcoin", "renda", "dinheiro", "banco", "empréstimo", "emprestimo"],
    juridico: ["advogado", "advocacia", "jurídico", "juridico", "direito", "lei", "contrato", "escritório", "escritorio"],
    construcao: ["construção", "construcao", "obra", "pedreiro", "engenheiro", "arquiteto", "reforma", "material de construção"],
    agro: ["agro", "fazenda", "rural", "agrícola", "agricola", "pecuária", "pecuaria", "plantação", "plantacao", "semente"],
    artesanato: ["artesanato", "crochê", "croche", "tricô", "trico", "bordado", "feito à mão", "handmade", "customizado"],
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