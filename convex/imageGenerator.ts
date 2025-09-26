// /convex/imageGenerator.ts - VERSÃO FINAL CORRIGIDA E LIMPA

import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import Groq from 'groq-sdk';
import { internal } from "./_generated/api";

// ============================================================
// 🔥 CONFIGURAÇÃO DA API KEY
// ============================================================

const stabilityApiKey = process.env.STABILITY_API_KEY;

const groq = process.env.GROQ_API_KEY ? new Groq({
    apiKey: process.env.GROQ_API_KEY,
}) : null;

// ============================================================
// 🎯 TRADUÇÃO E MELHORAMENTO DE PROMPT INTELIGENTE
// ============================================================

function enhancePrompt(originalPrompt: string): string {
    const translations: Record<string, string> = {
        "cachorro": "dog", "gato": "cat", "pessoa": "person", "mulher": "woman", "homem": "man",
        "criança": "child", "bebê": "baby", "rosto": "face", "retrato": "portrait", "paisagem": "landscape",
        "cidade": "city", "praia": "beach", "montanha": "mountain", "floresta": "forest", "oceano": "ocean",
        "carro": "car", "casa": "house", "prédio": "building", "escritório": "office", "loja": "shop",
        "produto": "product", "comida": "food", "natureza": "nature", "animais": "animals",
        "flores": "flowers", "árvore": "tree", "céu": "sky", "nuvens": "clouds", "sol": "sun",
        "lua": "moon", "estrelas": "stars",
        "realista": "realistic", "foto realista": "photorealistic", "desenho": "drawing",
        "pintura": "painting", "arte digital": "digital art", "ilustração": "illustration",
        "cartoon": "cartoon", "anime": "anime style", "minimalista": "minimalist", "moderno": "modern",
        "vintage": "vintage", "futurista": "futuristic", "abstrato": "abstract", "3d": "3d render",
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
        "imagem de atenção": "attention grabbing image, eye catching visual",
        "chamativo": "eye catching", "viral": "viral trending", "tendência": "trending",
        "popular": "popular", "urgente": "urgent", "importante": "important"
    };

    let enhancedPrompt = originalPrompt.toLowerCase();

    Object.entries(translations).forEach(([pt, en]) => {
        const regex = new RegExp(`\\b${pt}\\b`, 'gi');
        enhancedPrompt = enhancedPrompt.replace(regex, en);
    });

    if (/[àáâãèéêìíîòóôõùúûç]/i.test(enhancedPrompt)) {
        enhancedPrompt = enhancedPrompt
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    if (!enhancedPrompt.includes('quality') && !enhancedPrompt.includes('detailed')) {
        enhancedPrompt += ", high quality, ultra detailed, sharp focus, professional";
    }

    if (!enhancedPrompt.includes('style') && !enhancedPrompt.includes('realistic') && !enhancedPrompt.includes('art')) {
        enhancedPrompt += ", professional photography style, best quality";
    }

    enhancedPrompt = enhancedPrompt.replace(/\s+/g, ' ').trim();

    console.log("✨ Prompt melhorado:", enhancedPrompt);
    return enhancedPrompt;
}

// ============================================================
// 🎨 STABILITY AI - MELHOR QUALIDADE (STABLE DIFFUSION XL)
// ============================================================

async function generateWithStabilityAI(prompt: string, apiKey: string | undefined): Promise<Blob | null> {
    if (!apiKey || apiKey === "not_configured") {
        console.log("⚠️ Stability AI não configurada");
        return null;
    }

    try {
        console.log("🎨 Gerando com Stability AI (Qualidade Premium)...");
        const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "Accept": "application/json"
            },
            body: JSON.stringify({
                text_prompts: [
                    { text: prompt, weight: 1 },
                    { text: "blurry, bad quality, ugly, distorted, disfigured, low resolution, bad anatomy, worst quality, low quality", weight: -1 }
                ],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                samples: 1,
                steps: 30,
                style_preset: "photographic"
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
                console.log("✅ Stability AI gerou com sucesso! (Alta Qualidade)");
                return blob;
            }
        } else {
            const error = await response.text();
            console.error("❌ Erro Stability AI:", error);
            if (response.status === 402) {
                console.log("⚠️ Créditos Stability AI esgotados, tentando alternativa...");
            }
        }
    } catch (error) {
        console.error("❌ Erro ao conectar com Stability AI:", error);
    }
    return null;
}

// ============================================================
// 🌟 POLLINATIONS AI - MODELO FLUX (GRÁTIS E BOM)
// ============================================================

async function generateWithPollinations(prompt: string, model: 'flux' | 'turbo' = 'flux'): Promise<Blob | null> {
    try {
        console.log(`🌟 Gerando com Pollinations ${model.toUpperCase()}...`);
        const params = new URLSearchParams({
            width: '1024',
            height: '1024',
            seed: Math.floor(Math.random() * 1000000).toString(),
            model: model,
            nologo: 'true'
        });
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
        const response1 = await fetch(url);
        if (response1.ok) {
            const blob1 = await response1.blob();
            if (blob1.size > 50000) {
                console.log(`✅ Pollinations ${model.toUpperCase()} gerou na primeira tentativa!`);
                return blob1;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response2 = await fetch(url);
        if (response2.ok) {
            const blob = await response2.blob();
            if (blob.size > 50000) {
                console.log(`✅ Pollinations ${model.toUpperCase()} funcionou!`);
                return blob;
            }
        }
        if (model === 'flux') {
            console.log("⚠️ Flux não respondeu, tentando Turbo...");
            return generateWithPollinations(prompt, 'turbo');
        }
    } catch (error) {
        console.log(`⚠️ Erro Pollinations ${model}:`, error);
    }
    return null;
}

// ============================================================
// 🤖 CRAIYON - DALL-E MINI (BACKUP - ENTENDE BEM PROMPTS)
// ============================================================

async function generateWithCraiyon(prompt: string): Promise<Blob | null> {
    try {
        console.log("🤖 Gerando com Craiyon (pode demorar 20-30s)...");
        const response = await fetch("https://backend.craiyon.com/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: prompt,
                version: "c4ue22fb7kb6wlac",
                token: null
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
                console.log("✅ Craiyon gerou com sucesso!");
                return blob;
            }
        }
    } catch (error) {
        console.log("⚠️ Craiyon erro:", error);
    }
    return null;
}

// ============================================================
// 🚀 FUNÇÃO PRINCIPAL - APENAS AS MELHORES IAs
// ============================================================

async function generateImageWithAI(prompt: string): Promise<Blob> {
    console.log("🚀 Iniciando geração com as MELHORES IAs...");
    console.log("📝 Prompt original:", prompt);

    const enhancedPrompt = enhancePrompt(prompt);

    const generators = [
        { name: "Stability AI (Premium Quality)", fn: () => generateWithStabilityAI(enhancedPrompt, stabilityApiKey), quality: 10 },
        { name: "Pollinations Flux (High Quality)", fn: () => generateWithPollinations(enhancedPrompt, 'flux'), quality: 8 },
        { name: "Pollinations Turbo (Fast)", fn: () => generateWithPollinations(enhancedPrompt, 'turbo'), quality: 7 },
        { name: "Craiyon (DALL-E Mini)", fn: () => generateWithCraiyon(enhancedPrompt), quality: 6 }
    ];

    for (const generator of generators) {
        try {
            console.log(`🔄 Tentando ${generator.name}...`);
            const blob = await generator.fn();
            if (blob && blob.size > 10000) {
                console.log(`✅ SUCESSO com ${generator.name}! Qualidade: ${generator.quality}/10`);
                return blob;
            }
            console.log(`⚠️ ${generator.name} não retornou imagem válida`);
        } catch (error) {
            console.log(`❌ ${generator.name} erro:`, error);
        }
    }

    console.log("🔄 Última tentativa com Pollinations básico...");
    try {
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        const fallbackResponse = await fetch(fallbackUrl);
        if (fallbackResponse.ok) {
            const fallbackBlob = await fallbackResponse.blob();
            if (fallbackBlob.size > 5000) {
                console.log("✅ Fallback funcionou!");
                return fallbackBlob;
            }
        }
    } catch (error) {
        console.log("❌ Fallback falhou:", error);
    }

    throw new Error("Não foi possível gerar a imagem. Por favor, tente novamente em alguns instantes.");
}

// ============================================================
// TIPOS E INTERFACES
// ============================================================

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

// ============================================================
// GERAÇÃO DE ROTEIRO VIRAL - AGORA COM IA DE VERDADE
// ============================================================

async function generateViralScript(topic: string, style: string, duration: number): Promise<VideoScript> {
    if (!groq) {
        throw new Error("GROQ_API_KEY não está configurada no backend.");
    }

    // ✅ CORREÇÃO: Usar um prompt mais robusto para a IA
    const prompt = `
        Você é um Produtor de Conteúdo Viral e Roteirista de Hollywood. Sua missão é criar um roteiro de vídeo que seja explosivo, envolvente e que gere resultados para o tema: "${topic}".

        O roteiro deve seguir o estilo: "${style}".

        ## REGRAS RÍGIDAS E MANDATÓRIAS:
        1. **GERE CONTEÚDO ORIGINAL!** NÃO use templates genéricos. Crie algo único para o tema.
        2. O resultado deve ser um **ÚNICO BLOCO DE CÓDIGO JSON**.
        3. A duração total do vídeo será de ${duration} segundos. Distribua o conteúdo em 5 a 10 cenas.
        4. Cada cena deve ter um objetivo claro e uma descrição detalhada de visual e câmera.
        5. O GANCHO (hook) da primeira cena é a parte mais importante. Crie algo que quebre o padrão e prenda a atenção nos primeiros 3 segundos.
        6. Inclua um CTA (Call to Action) irresistível que peça uma ação específica (curtir, comentar, seguir, salvar, compartilhar).
        7. Crie um conjunto de hashtags relevantes e virais.
        8. Sugira um nome de música ou um estilo de música que seja tendência e combine com o estilo do vídeo.
        9. Crie tutoriais passo a passo específicos para o Canva e o CapCut, explicando como criar o vídeo do roteiro.
        10. Crie 5 "Dicas Pro" que são segredos de especialistas para maximizar a viralização.

        ## ESTRUTURA DO JSON OBRIGATÓRIA:
        \`\`\`json
        {
          "title": "Título criativo e viral para o vídeo",
          "hook": "Gancho matador para os 3 primeiros segundos.",
          "duration": "${duration} segundos",
          "format": "9:16 Vertical (Reels/TikTok/Shorts)",
          "style": "${style}",
          "scenes": [
            {
              "number": 1,
              "duration": "3 segundos (CRUCIAL!)",
              "text": "Texto ou narração da primeira cena",
              "visual": "Descrição detalhada do que a câmera deve mostrar",
              "camera": "Instrução de câmera (ex: 'zoom in rápido')",
              "transition": "Tipo de transição para a próxima cena (ex: 'corte seco')"
            },
            // ...mais cenas até o final do vídeo
            {
              "number": 5,
              "duration": "3-5 segundos",
              "text": "Texto da última cena, com a conclusão",
              "visual": "Visual final e impactante",
              "camera": "Instrução de câmera final (ex: 'slow zoom out')",
              "transition": "Transição final (ex: 'fade out')"
            }
          ],
          "music": "Nome da música ou estilo musical recomendado.",
          "hashtags": [
            "#hashtag1",
            "#hashtag2",
            "#hashtag3",
            "#hashtag_do_tema"
          ],
          "cta": "Chamada para Ação irresistível",
          "canvaSteps": [
            "1️⃣ Passo 1 para o Canva...",
            "2️⃣ Passo 2 para o Canva...",
            "3️⃣ DICA: ...",
            "..."
          ],
          "capcutSteps": [
            "1️⃣ Passo 1 para o CapCut...",
            "2️⃣ Passo 2 para o CapCut...",
            "3️⃣ DICA: ...",
            "..."
          ],
          "proTips": [
            "Dica pro 1",
            "Dica pro 2",
            "Dica pro 3"
          ]
        }
        \`\`\`

        Gere o JSON completo e válido agora.
    `;

    try {
        console.log("🎬 Enviando prompt para Groq...");
        const chatCompletion = await groq.chat.completions.create({
            // ✅ CORREÇÃO: Usar um modelo da Groq que NÃO está descontinuado
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: 'system', content: 'Você é um produtor de conteúdo viral. Responda APENAS com um objeto JSON válido.' },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.9,
            max_tokens: 4096,
        });

        const scriptText = chatCompletion.choices[0]?.message?.content;
        if (!scriptText) {
            throw new Error("A IA não retornou um roteiro válido.");
        }

        console.log("✅ Roteiro gerado com sucesso pela IA!");

        const script = JSON.parse(scriptText) as VideoScript;

        // As lógicas de fallback para tutoriais e dicas podem ser mantidas,
        // mas com um prompt robusto, a IA deve gerar os conteúdos corretamente.

        if (!script.canvaSteps || script.canvaSteps.length === 0) {
            script.canvaSteps = ["A IA não gerou tutoriais de Canva, mas você pode usar o editor de vídeo para adicionar texto e música!", "DICA: Siga os passos do CapCut para ter uma ideia!"];
        }
        if (!script.capcutSteps || script.capcutSteps.length === 0) {
            script.capcutSteps = ["A IA não gerou tutoriais de CapCut, mas o editor de vídeo é intuitivo. Adicione texto, legendas e sincronize com a música!", "DICA: Use a ferramenta de legendas automáticas para economizar tempo!"];
        }

        if (!script.proTips || script.proTips.length === 0) {
            script.proTips = [
                "Dica de Ouro: Otimize seu SEO para Reels e TikTok com a legenda!",
                "Estratégia: Poste 1 vídeo por dia para manter a consistência e crescer rápido.",
                "Hack: Participe de desafios e utilize áudios em alta para aumentar o alcance."
            ];
        }

        return script;

    } catch (error) {
        console.error("❌ Erro na geração de roteiro com a IA:", error);
        const genericFallback = {
            title: `Roteiro Genérico sobre ${topic}`,
            hook: "PARE TUDO! Você precisa ver isso...",
            duration: `${duration} segundos`,
            format: "9:16 Vertical (Reels/TikTok/Shorts)",
            style: style,
            scenes: [
                { number: 1, duration: "3s (CRUCIAL!)", text: `Gancho sobre ${topic}`, visual: "Imagem impactante sobre o tema", camera: "Zoom in", transition: "Corte rápido" },
                { number: 2, duration: "5s", text: `Ponto 1: Detalhes sobre ${topic}`, visual: "Animação de texto e ilustrações", camera: "Pan suave", transition: "Zoom out" },
                { number: 3, duration: "5s", text: `Ponto 2: Estratégia sobre ${topic}`, visual: "Gráficos e estatísticas", camera: "Câmera estática", transition: "Glitch" },
                { number: 4, duration: "5s", text: `Ponto 3: Dica final sobre ${topic}`, visual: "Vídeo do criador falando", camera: "Close-up", transition: "Fade" }
            ],
            music: "Música pop/eletrônica viral (procure: 'trending viral song')",
            hashtags: [`#${topic.replace(/\s/g, '')}`, "#viral", "#foryou", "#marketingdigital"],
            cta: "COMENTA 'EU QUERO' para receber mais conteúdo!",
            canvaSteps: ["1️⃣ Passo a passo para criar o vídeo no Canva: ...", "2️⃣ ..."],
            capcutSteps: ["1️⃣ Passo a passo para criar o vídeo no CapCut: ...", "2️⃣ ..."],
            proTips: ["Dica 1", "Dica 2", "Dica 3"]
        };
        return genericFallback;
    }
}

// ============================================================
// 🚀 AÇÃO PRINCIPAL - GERAR IMAGEM (SEM LIMITES)
// ============================================================

export const generateImage = action({
    args: {
        prompt: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Faça login para continuar");

        const userId = identity.subject;

        try {
            console.log("🎨 Iniciando geração para:", userId);
            console.log("📝 Prompt recebido:", args.prompt);

            const imageBlob = await generateImageWithAI(args.prompt);

            console.log("✅ Imagem gerada com sucesso! Tamanho:", imageBlob.size);

            const storageId = await ctx.storage.store(imageBlob);
            const imageUrl = await ctx.storage.getUrl(storageId);

            if (!imageUrl) {
                throw new Error("Erro ao salvar imagem");
            }

            console.log("💾 Imagem salva:", imageUrl);

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
                message: `🎉 Imagem gerada com sucesso usando IA de alta qualidade!`
            };

        } catch (error) {
            console.error("❌ Erro:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erro ao gerar imagem. Tente novamente!");
        }
    },
});

// ============================================================
// 🎬 AÇÃO - GERAR ROTEIRO DE VÍDEO (SEM LIMITES)
// ============================================================

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
            console.log("🎬 Gerando roteiro para:", args.topic);

            const script = await generateViralScript(
                args.topic,
                args.style,
                args.duration
            );

            console.log("✅ Roteiro gerado!");

            return {
                script,
                method: 'premium',
                remainingPremium: 999,
                message: `🎬 Roteiro viral criado com sucesso!`
            };

        } catch (error) {
            console.error("❌ Erro:", error);
            throw new Error("Erro ao gerar roteiro. Tente novamente!");
        }
    },
});

// ============================================================
// MUTATIONS E QUERIES
// ============================================================

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