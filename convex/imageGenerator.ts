// /convex/imageGenerator.ts - VERSÃO OTIMIZADA PARA REALISMO E VIRALIZAÇÃO
import { action, mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import Groq from 'groq-sdk';
import { internal } from "./_generated/api";

// ========================================================
// 🔥 CONFIGURAÇÃO DA API KEY
// ==========================================================
const stabilityApiKey = process.env.STABILITY_API_KEY;
const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY,
}) : null;

// ========================================================
// 🎯 TRADUÇÃO E FORÇAR PROMPT REALISTA
// ==========================================================
function enhancePrompt(originalPrompt: string): string {
  const translations: Record<string, string> = {
    "cachorro": "dog", "gato": "cat", "pessoa": "person", "mulher": "woman", "homem": "man",
    "criança": "child", "bebê": "baby", "rosto": "face", "retrato": "portrait", "paisagem": "landscape",
    "cidade": "city", "praia": "beach", "montanha": "mountain", "floresta": "forest", "oceano": "ocean",
    "carro": "car", "casa": "house", "prédio": "building", "escritório": "office", "loja": "store",
    "produto": "product", "comida": "food", "natureza": "nature", "animais": "animals",
    "flores": "flowers", "árvore": "tree", "céu": "sky", "nuvens": "clouds", "sol": "sun",
    "lua": "moon", "estrelas": "stars",
    "realista": "realistic", "foto realista": "photorealistic",
    "alta qualidade": "high quality", "detalhado": "detailed", "profissional": "professional",
    "cinematográfico": "cinematic", "épico": "epic", "dramático": "dramatic", "vibrante": "vibrant",
    "colorido": "colorful", "escuro": "dark", "claro": "bright", "iluminado": "illuminated",
    "sombrio": "shadowy", "bonito": "beautiful", "lindo": "gorgeous",
    "correndo": "running", "pulando": "jumping", "sorrindo": "smiling", "chorando": "crying",
    "sentado": "sitting", "em pé": "standing", "voando": "flying", "nadando": "swimming",
    "caminhando": "walking", "dançando": "dancing",
    "vermelho": "red", "azul": "blue", "verde": "green", "amarelo": "yellow", "roxo": "purple",
    "laranja": "orange", "rosa": "pink", "preto": "black", "branco": "white", "cinza": "gray",
    "dourado": "golden", "prateado": "silver", "marrom": "brown",
    "logo": "logo", "logotipo": "logo design", "marca": "brand", "empresa": "company",
    "negócio": "business", "venda": "sale", "promoção": "promotion", "desconto": "discount",
    "oferta": "offer", "anúncio": "advertisement", "banner": "banner", "post": "social media post",
    "story": "story", "thumbnail": "thumbnail", "capa": "cover",
    "imagem de atenção": "attention-grabbing image, eye-catching visual",
    "chamativo": "eye-catching", "viral": "viral trend", "tendência": "trending",
    "popular": "popular", "urgente": "urgent", "importante": "important"
  };

  // REMOVER palavras que indicam desenho/cartoon
  const removeWords = [
    "desenho", "drawing", "cartoon", "anime", "illustration", "ilustração",
    "sketch", "painting", "pintura", "art", "arte", "animated", "animado",
    "comic", "manga", "chibi", "pixar", "disney", "3d render", "stylized"
  ];

  let enhancedPrompt = originalPrompt.toLowerCase();

  // Remover palavras indesejadas
  removeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    enhancedPrompt = enhancedPrompt.replace(regex, '');
  });

  // Traduzir
  Object.entries(translations).forEach(([pt, en]) => {
    const regex = new RegExp(`\\b${pt}\\b`, 'gi');
    enhancedPrompt = enhancedPrompt.replace(regex, en);
  });

  // Remover acentos
  if (/[àáâãèéêìíîòóôõùúûç]/i.test(enhancedPrompt)) {
    enhancedPrompt = enhancedPrompt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // 🔥 FORÇAR REALISMO SEMPRE
  const realisticEnhancers = [
    "ultra realistic photograph",
    "photorealistic",
    "hyperrealistic",
    "8K resolution",
    "professional photography",
    "shot on Canon EOS R5",
    "natural lighting",
    "real human",
    "actual photo",
    "not illustration",
    "not cartoon",
    "not drawing",
    "authentic",
    "lifelike",
    "cinematic quality",
    "raw photo",
    "detailed textures",
    "realistic skin",
    "professional lens",
    "depth of field"
  ];

  // Adicionar modificadores realistas
  enhancedPrompt = `${enhancedPrompt}, ${realisticEnhancers.slice(0, 8).join(", ")}`;

  // Adicionar negative prompt embutido
  enhancedPrompt += ", (NOT: cartoon, anime, drawing, illustration, painting, sketch, 3d render, cgi, animated, stylized)";

  enhancedPrompt = enhancedPrompt.replace(/\s+/g, ' ').trim();
  console.log("✨ Prompt REALISTA melhorado:", enhancedPrompt);
  return enhancedPrompt;
}

// ========================================================
// 🎨 STABILITY AI - FORÇAR MODO FOTOGRÁFICO
// ==========================================================
async function generateWithStabilityAI(prompt: string, apiKey: string | undefined): Promise<Blob | null> {
  if (!apiKey || apiKey === "not_configured") {
    console.log("⚠️ Stability AI não configurada");
    return null;
  }

  try {
    console.log("🎨 Gerando FOTO REALISTA com Stability AI...");
    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: `${prompt}, photorealistic, ultra realistic, real photograph, professional photography`,
            weight: 1.5
          },
          {
            text: "cartoon, anime, illustration, drawing, painting, sketch, 3d render, cgi, animated, stylized, artistic, abstract, blurry, bad quality, ugly, distorted, disfigured, low resolution, bad anatomy",
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 50, // Aumentado para mais qualidade
        style_preset: "photographic", // SEMPRE fotográfico
        sampler: "K_DPM_2_ANCESTRAL"
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.artifacts && data.artifacts[0]) {
        const base64 = data.artifacts[0].base64;
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        console.log("✅ Foto REALISTA gerada com Stability AI!");
        return blob;
      }
    }
  } catch (error) {
    console.error("❌ Erro ao conectar com Stability AI:", error);
  }
  return null;
}

// ========================================================
// 🌟 POLLINATIONS - FORÇAR REALISMO
// ==========================================================
async function generateWithPollinations(prompt: string, model: 'flux' | 'flux-realism' = 'flux-realism'): Promise<Blob | null> {
  try {
    // Adicionar modificadores de realismo ao prompt
    const realisticPrompt = `${prompt}, photorealistic style, real photography, not cartoon, not illustration`;

    console.log(`🌟 Gerando FOTO REALISTA com Pollinations...`);
    const params = new URLSearchParams({
      width: '1024',
      height: '1024',
      seed: Math.floor(Math.random() * 1000000).toString(),
      model: model, // Usar o modelo passado como parâmetro
      nologo: 'true',
      enhance: 'true' // Melhorar qualidade
    });

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(realisticPrompt)}?${params}`;

    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 50000) {
        console.log(`✅ Foto REALISTA gerada com Pollinations!`);
        return blob;
      }
    }

    // Segunda tentativa com mais ênfase no realismo
    await new Promise(resolve => setTimeout(resolve, 2000));
    const enhancedRealisticPrompt = `ultra realistic photograph of ${prompt}, 8K quality, professional camera`;
    const url2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedRealisticPrompt)}?${params}`;

    const response2 = await fetch(url2);
    if (response2.ok) {
      const blob = await response2.blob();
      if (blob.size > 50000) {
        console.log(`✅ Foto REALISTA gerada na segunda tentativa!`);
        return blob;
      }
    }

  } catch (error) {
    console.log(`⚠️ Erro Pollinations:`, error);
  }
  return null;
}

// ========================================================
// 🤖 CRAIYON - TENTAR FORÇAR REALISMO
// ==========================================================
async function generateWithCraiyon(prompt: string): Promise<Blob | null> {
  try {
    console.log("🤖 Gerando com Craiyon (tentando realismo)...");

    // Adicionar termos de realismo mesmo no Craiyon
    const realisticPrompt = `photorealistic ${prompt}, real photo, not cartoon`;

    const response = await fetch("https://backend.craiyon.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: realisticPrompt,
        version: "c4ue22fb7kb6wlac",
        token: null,
        model: "photo" // Tentar forçar modelo fotográfico se disponível
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        const base64 = data.images[0];
        const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        console.log("✅ Craiyon gerou (tentativa de realismo)!");
        return blob;
      }
    }
  } catch (error) {
    console.log("⚠️ Craiyon erro:", error);
  }
  return null;
}

// ========================================================
// 🚀 FUNÇÃO PRINCIPAL - APENAS IMAGENS REALISTAS
// ==========================================================
async function generateImageWithAI(prompt: string): Promise<Blob> {
  console.log("🚀 Iniciando geração de FOTO REALISTA...");
  console.log("📝 Prompt original:", prompt);

  const enhancedPrompt = enhancePrompt(prompt);

  const generators = [
    { name: "Stability AI (Ultra Realista)", fn: () => generateWithStabilityAI(enhancedPrompt, stabilityApiKey), quality: 10 },
    { name: "Pollinations Flux Realism", fn: () => generateWithPollinations(enhancedPrompt, 'flux-realism'), quality: 9 },
    { name: "Pollinations Flux HD", fn: () => generateWithPollinations(enhancedPrompt, 'flux'), quality: 8 },
    { name: "Craiyon Photo Mode", fn: () => generateWithCraiyon(enhancedPrompt), quality: 6 }
  ];

  for (const generator of generators) {
    try {
      console.log(`🔄 Tentando ${generator.name}...`);
      const blob = await generator.fn();
      if (blob && blob.size > 10000) {
        console.log(`✅ FOTO REALISTA gerada com ${generator.name}! Qualidade: ${generator.quality}/10`);
        return blob;
      }
    } catch (error) {
      console.log(`❌ ${generator.name} erro:`, error);
    }
  }

  // Última tentativa com prompt super realista
  console.log("🔄 Última tentativa com prompt ultra-realista...");
  try {
    const ultraRealisticPrompt = `ultra realistic 8K photograph of ${prompt}, shot with professional camera, hyperrealistic, actual photo`;
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(ultraRealisticPrompt)}?model=flux-realism&width=1024&height=1024&enhance=true`;
    const fallbackResponse = await fetch(fallbackUrl);
    if (fallbackResponse.ok) {
      const fallbackBlob = await fallbackResponse.blob();
      if (fallbackBlob.size > 5000) {
        console.log("✅ Fallback realista funcionou!");
        return fallbackBlob;
      }
    }
  } catch (error) {
    console.log("❌ Fallback falhou:", error);
  }

  throw new Error("Não foi possível gerar a imagem realista. Tente novamente!");
}

// =========================================================
// TIPOS E INTERFACES
// ==========================================================
interface VideoScript {
  title: string;
  hook: string;
  duration: string;
  format: string;
  style: string;
  scenes: Array<{
    number: number;
    duration: string;
    text: string;
    visual: string;
    camera: string;
    transition: string;
  }>;
  music: string;
  hashtags: string[];
  cta: string;
  canvaSteps: string[];
  capcutSteps: string[];
  proTips: string[];
}

// ========================================================
// 🔥 GERAÇÃO DE ROTEIRO MEGA VIRAL
// ==========================================================
async function generateViralScript(topic: string, style: string, duration: number): Promise<VideoScript> {
  if (!groq) {
    throw new Error("GROQ_API_KEY não está configurada no backend.");
  }

  const prompt = `
    Você é o MELHOR criador de conteúdo viral do mundo, responsável por vídeos com MILHÕES de views.

    Crie um roteiro EXPLOSIVO sobre: "${topic}"
    Estilo desejado: "${style}"
    Duração: ${duration} segundos

    ## 🔥 FÓRMULA SECRETA DE VIRALIZAÇÃO:

    1. **GANCHO PSICOLÓGICO IRRESISTÍVEL (0-3 segundos)**
       - Use gatilhos mentais: URGÊNCIA, CURIOSIDADE, MEDO DE PERDER (FOMO)
       - Padrões que funcionam:
         • "PARE DE SCROLLAR! Isso vai mudar sua vida..."
         • "99% das pessoas não sabem disso sobre..."
         • "REVELADO: O segredo que [autoridade] não quer que você saiba"
         • "Você está fazendo [algo comum] ERRADO a vida toda"
         • "URGENTE: Só funciona até [data próxima]"
         • "Como eu [resultado impressionante] em apenas [tempo curto]"

    2. **ESTRUTURA VICIANTE:**
       - 0-3s: Gancho impossível de ignorar
       - 3-8s: Promessa transformadora
       - 8-15s: Conteúdo de valor REAL (não enrolação)
       - 15-25s: Prova social ou demonstração
       - 25-30s: CTA com urgência

    3. **ELEMENTOS VIRAIS OBRIGATÓRIOS:**
       - Criar LOOP VICIANTE (final conecta com início)
       - Usar PATTERN INTERRUPT a cada 3-5 segundos
       - Adicionar PLOT TWIST inesperado
       - Incluir elemento CONTROVERSO (mas respeitoso)
       - Despertar EMOÇÃO FORTE (surpresa, indignação, esperança)

    4. **TÉCNICAS PSICOLÓGICAS:**
       - Efeito Zeigarnik (deixar algo incompleto)
       - Princípio da Escassez
       - Prova Social Massiva
       - Autoridade Instantânea
       - Reciprocidade (dar valor primeiro)

    5. **ELEMENTOS VISUAIS VIRAIS:**
       - Mudanças rápidas a cada 2-3 segundos
       - Textos GRANDES e IMPACTANTES
       - Cores contrastantes (vermelho/branco, amarelo/preto)
       - Zoom in/out dramáticos
       - Emojis estratégicos 🔥💰😱
       - Setas e círculos destacando pontos importantes

    6. **MÚSICA/ÁUDIO VIRAL:**
       - Usar trending sounds do momento
       - Beat drop sincronizado com revelação
       - Mudanças de ritmo para manter atenção

    7. **HASHTAGS MATADORAS:**
       - Mix de hashtags: 30% mega populares, 50% nicho, 20% branded
       - Incluir hashtags de tendências atuais

    8. **CTAs QUE CONVERTEM:**
       - "COMENTA [palavra] e eu te mando o link"
       - "SALVA antes que eu delete"
       - "SEGUE para a PARTE 2"
       - "Marque 3 amigos que precisam ver isso"
       - "Qual você escolhe? 1, 2 ou 3?"

    ## ESTRUTURA JSON OBRIGATÓRIA:
    \`\`\`json
    {
      "title": "Título viral com emoji e urgência",
      "hook": "Gancho psicológico IMPOSSÍVEL de ignorar",
      "duration": "${duration} segundos",
      "format": "9:16 Vertical (Reels/TikTok/Shorts)",
      "style": "${style}",
      "scenes": [
        {
          "number": 1,
          "duration": "0-3 segundos",
          "text": "Texto do gancho matador",
          "visual": "Visual impactante descrito em detalhes",
          "camera": "Movimento de câmera específico",
          "transition": "Transição dinâmica"
        }
      ],
      "music": "Nome específico de áudio viral ou descrição",
      "hashtags": ["#hashtag1", "#viral", "#fyp", "#trending2024"],
      "cta": "Call-to-action irresistível com gatilho mental",
      "canvaSteps": [
        "Passo detalhado 1",
        "Passo detalhado 2"
      ],
      "capcutSteps": [
        "Passo detalhado 1",
        "Passo detalhado 2"
      ],
      "proTips": [
        "Dica secreta 1",
        "Dica secreta 2",
        "Dica secreta 3"
      ]
    }
    \`\`\`

    IMPORTANTE: O roteiro DEVE ser sobre "${topic}" especificamente. Seja ULTRA criativo e use as técnicas mais avançadas de viralização!`;

  try {
    console.log("🎬 Gerando roteiro MEGA VIRAL...");
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em viralização com 10 anos de experiência. Seus vídeos sempre alcançam milhões de views. Responda APENAS com JSON válido.'
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
      max_tokens: 4096,
    });

    const scriptText = chatCompletion.choices[0]?.message?.content;
    if (!scriptText) {
      throw new Error("Erro ao gerar roteiro viral");
    }

    console.log("✅ Roteiro MEGA VIRAL gerado!");
    const script = JSON.parse(scriptText) as VideoScript;

    // Adicionar dicas extras se não vieram
    if (!script.proTips || script.proTips.length < 5) {
      script.proTips = [
        "🔥 POSTE entre 6h-8h ou 19h-21h para máximo alcance",
        "📱 RESPONDA TODOS os comentários nos primeiros 30 minutos",
        "🎯 Use 5-7 hashtags no máximo (3 grandes, 4 de nicho)",
        "⚡ Faça SÉRIE de vídeos sobre o tema (Part 1, 2, 3...)",
        "💰 Teste diferentes thumbnails no Stories antes de postar",
        "🚀 Colabore com outros creators do nicho",
        "📊 Analise métricas: Taxa de retenção > 50% = viral"
      ];
    }

    return script;

  } catch (error) {
    console.error("❌ Erro na geração do roteiro viral:", error);

    // Fallback melhorado com técnicas virais
    return {
      title: `🔥 ${topic.toUpperCase()} - O Segredo Que Vai Explodir Sua Mente`,
      hook: `PARE AGORA! 97% das pessoas não sabem isso sobre ${topic}...`,
      duration: `${duration} segundos`,
      format: "9:16 Vertical (Reels/TikTok/Shorts)",
      style: style,
      scenes: [
        {
          number: 1,
          duration: "0-3s",
          text: `⚠️ ATENÇÃO: Isso sobre ${topic} vai MUDAR TUDO`,
          visual: "Zoom rápido com texto GRANDE em vermelho, fundo escuro",
          camera: "Zoom in dramático",
          transition: "Glitch effect"
        },
        {
          number: 2,
          duration: "3-8s",
          text: `Descobri o MÉTODO SECRETO que os experts de ${topic} usam`,
          visual: "Revelação com efeito de luz, números impressionantes na tela",
          camera: "Shake leve + zoom out",
          transition: "Flash branco"
        },
        {
          number: 3,
          duration: "8-15s",
          text: `3 PASSOS SIMPLES: 1️⃣ [passo] 2️⃣ [passo] 3️⃣ [passo]`,
          visual: "Lista visual dinâmica com checkmarks aparecendo",
          camera: "Tracking lateral",
          transition: "Slide rápido"
        },
        {
          number: 4,
          duration: "15-25s",
          text: `PROVA: Veja os resultados REAIS de quem aplicou`,
          visual: "Before/After dramático ou depoimentos rápidos",
          camera: "Montagem rápida multi-ângulos",
          transition: "Match cut"
        },
        {
          number: 5,
          duration: "25-30s",
          text: `COMENTA "${topic.split(' ')[0]}" e SALVA para não perder! PARTE 2 amanhã...`,
          visual: "CTA com timer countdown, seta apontando para botões",
          camera: "Zoom out final com loop pro início",
          transition: "Loop perfeito"
        }
      ],
      music: "Trending: Dramatic violin drop ou Phonk beat viral do momento",
      hashtags: [
        `#${topic.replace(/\s/g, '').toLowerCase()}`,
        "#viral",
        "#fyp",
        "#foryoupage",
        "#trending",
        "#viralreels",
        "#explorepage",
        `#${style.toLowerCase()}`,
        "#dicasrapidas",
        "#aprendacomigo"
      ],
      cta: "🔥 COMENTA 'EU QUERO' e SALVA esse vídeo AGORA! Vou escolher 10 pessoas para enviar o GUIA COMPLETO GRÁTIS!",
      canvaSteps: [
        "1️⃣ Abra o Canva e escolha 'Reels do Instagram'",
        "2️⃣ Use template 'Texto Dinâmico Viral'",
        "3️⃣ Fonte: Montserrat Black ou Anton (TAMANHO 80+)",
        "4️⃣ Cores: Fundo escuro + Texto branco/amarelo néon",
        "5️⃣ Adicione elementos animados: setas, explosões, emojis 3D",
        "6️⃣ Timing: Troca de texto a cada 2-3 segundos MAX",
        "🎯 DICA PRO: Use 'Beat Sync' para sincronizar com música"
      ],
      capcutSteps: [
        "1️⃣ Importe vídeos/imagens em alta qualidade",
        "2️⃣ Adicione 'Auto Captions' com fonte BOLD grande",
        "3️⃣ Use transições: Zoom blur, Glitch, Flash",
        "4️⃣ Efeitos: Shake, Speed ramping, Reverse",
        "5️⃣ Adicione Overlays: Light leaks, Particles",
        "6️⃣ Color grading: Alto contraste + Saturação",
        "7️⃣ Keyframes em textos para movimento constante",
        "🎯 DICA PRO: Export em 4K 60fps para máxima qualidade"
      ],
      proTips: [
        "🔥 POSTE entre 6h-8h ou 19h-21h (horário de pico)",
        "💬 RESPONDA todos os comentários em 30 min (algoritmo adora)",
        "📊 Se retenção < 50%, refaça o gancho",
        "🔄 Crie SÉRIE: Part 1, 2, 3 (aumenta 300% o engajamento)",
        "🎯 Teste 3 thumbnails diferentes nos Stories antes"
      ]
    } as VideoScript;
  }
}

// ========================================================
// 🚀 AÇÃO PRINCIPAL - GERAR IMAGEM REALISTA
// ==========================================================
export const generateImage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const userId = identity.subject;
    try {
      console.log("🎨 Iniciando geração de FOTO REALISTA para:", userId);
      console.log("📝 Prompt recebido:", args.prompt);

      const imageBlob = await generateImageWithAI(args.prompt);
      console.log("✅ Foto realista gerada! Tamanho:", imageBlob.size);

      const storageId = await ctx.storage.store(imageBlob);
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) {
        throw new Error("Erro ao salvar imagem");
      }
      console.log("💾 Foto realista salva:", imageUrl);

      await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt,
        imageUrl,
        storageId,
      });

      return {
        url: imageUrl,
        method: 'premium',
        remainingPremium: 999,
        message: `🎉 Foto ultra-realista gerada com sucesso!`
      };
    } catch (error) {
      console.error("❌ Erro:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao gerar imagem realista. Tente novamente!");
    }
  },
});

// ========================================================
// 🎬 AÇÃO - GERAR ROTEIRO VIRAL
// ==========================================================
export const generateVideoScript = action({
  args: {
    topic: v.string(),
    style: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    try {
      console.log("🎬 Gerando roteiro VIRAL para:", args.topic);
      const script = await generateViralScript(
        args.topic,
        args.style,
        args.duration
      );
      console.log("✅ Roteiro VIRAL pronto!");
      return {
        script,
        method: 'premium',
        remainingPremium: 999,
        message: `🎬 Roteiro viral explosivo criado com sucesso!`
      };
    } catch (error) {
      console.error("❌ Erro:", error);
      throw new Error("Erro ao gerar roteiro viral. Tente novamente!");
    }
  },
});

// ========================================================
// 🗑️ MUTAÇÃO - DELETAR IMAGEM
// ==========================================================
export const deleteImage = mutation({
  args: {
    imageId: v.id("generatedImages"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Imagem não encontrada.");
    }

    if (image.userId !== identity.subject) {
      throw new Error("Você não tem permissão para deletar esta imagem.");
    }

    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.imageId);

    return { success: true, message: "Imagem deletada com sucesso." };
  },
});

// ===============================================================
// MUTAÇÕES E CONSULTAS
// ========================================================================
export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generatedImages", args);
  },
});

export const getImagesForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const images = await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(100);

    return images || [];
  },
});

export const getUserImageCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const images = await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return images.length;
  },
});

export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return {
      geminiImagesRemaining: 999,
      geminiVideosRemaining: 999,
    };
  },
});