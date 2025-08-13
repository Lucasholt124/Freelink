// Em /convex/mentor.ts
// (Substitua o arquivo inteiro)

import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";

// Configuração do Groq
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// --- ACTION para GERAR uma nova análise (COM O NOVO PROMPT) ---
export const generateAnalysis = action({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
    offer: v.string(),
    audience: v.string(),
    planDuration: v.union(v.literal("week"), v.literal("month")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    const userData = {
        username: args.username,
        bio: args.bio || "",
        offer: args.offer,
        audience: args.audience,
        planDuration: args.planDuration,
    }

    // <<< O PROMPT FOI COMPLETAMENTE REFEITO PARA A ESTRATÉGIA CUSTO ZERO >>>
    const prompt = `
      Você é "Athena", a Diretora de Criação e Estrategista de Conteúdo mais avançada do mundo, com foco em crescimento orgânico para criadores com orçamento ZERO. Sua missão é criar um plano de batalha TATICAMENTE ACIONÁVEL, recomendando apenas ferramentas e métodos gratuitos.

      Dados do Cliente:
      - Username: "@${args.username}"
      - Vende/Oferece: "${args.offer}"
      - Audiência-Alvo: "${args.audience}"
      - Duração da Missão: ${args.planDuration === "week" ? "7 dias" : "30 dias"}

      ⚠️ SUA RESPOSTA DEVE SER UM ÚNICO OBJETO JSON VÁLIDO.
      Para cada item no "content_plan", você DEVE fornecer todos os campos a seguir, de forma detalhada e pronta para uso. Seja extremamente específico nas instruções.

      {
        "suggestions": ["Bio focada em autoridade...", "Bio focada em conexão...", "Bio com CTA direto..."],
        "strategy": "### Análise Estratégica\\n**Forças:**...\\n...",
        "grid": ["Reels: ...", "Carrossel: ...", "Foto: ..."],
        "content_plan": [
          {
            "day": "Dia 1",
            "time": "19:05",
            "format": "Carrossel",
            "title": "Os 3 Pilares de um E-commerce de Sucesso",
            "content_idea": "Um resumo conciso do post.",
            "status": "planejado",
            "details": {
              "tool_suggestion": "Canva (para design), ChatGPT/Groq (para refinar copy)",
              "step_by_step": "1. Abra o Canva.com e procure por 'Post para Instagram Carrossel'. 2. Escolha um template gratuito que combine com sua marca. 3. Crie 5 slides seguindo o roteiro abaixo. 4. Use as cores da sua identidade visual. 5. Exporte como PNG ou PDF.",
              "script_or_copy": "LEGENDA PARA O POST:\\nTransforme sua loja virtual numa máquina de vendas! 🚀 Descubra os 3 pilares essenciais que sustentam todo e-commerce de sucesso. Arrasta pro lado e salva pra não esquecer!\\n\\nROTEIRO DO CARROSSEL:\\nSlide 1 (Capa): Os 3 Pilares que TODO E-commerce de Sucesso Precisa Dominar.\\nSlide 2: Pilar 1: A PLATAFORMA. ...\\nSlide 5 (CTA): Sentindo-se perdido? Comente 'EU QUERO'...",
              "hashtags": "#ecommerce #lojavirtual #marketingdigital #sucesso online #dicasdeempreendedorismo",
              "creative_guidance": {
                "type": "image",
                "description": "Para a capa e fundo dos slides, use a IA gratuita do Canva ou o 'Microsoft Designer / Image Creator' (baseado em DALL-E 3 e gratuito).",
                "prompt": "Um infográfico limpo e minimalista para um post de Instagram, com o tema 'Pilares do Sucesso'. Use uma paleta de cores azul corporativo e branco. Ícones representando 'carrinho de compras', 'caminhão de entrega' e 'gráfico de crescimento'. Estilo flat design. --ar 1:1",
                "tool_link": "https://www.bing.com/images/create"
              }
            }
          },
          {
            "day": "Dia 2",
            "time": "18:30",
            "format": "Reels",
            "title": "O Erro #1 em Anúncios",
            "content_idea": "Um vídeo curto e dinâmico.",
            "status": "planejado",
            "details": {
              "tool_suggestion": "CapCut (para edição), Biblioteca de áudios do Instagram",
              "step_by_step": "1. Grave 3 clipes curtos com seu celular. 2. Importe no CapCut. 3. Adicione legendas automáticas e edite o estilo (fonte grande, cor amarela). 4. Encontre um áudio em alta no Instagram Reels e salve-o. 5. No CapCut, sincronize os cortes do vídeo com a batida da música. 6. Exporte em 1080p.",
              "script_or_copy": "TEXTO NA TELA (Legendas):\\n(Cena 1) O maior erro que você comete nos seus anúncios...\\n(Cena 2) ...é não ter uma OFERTA IRRESISTÍVEL.\\n(Cena 3) Foque em transformar seu produto na única solução óbvia!\\n\\nLEGENDA DO POST:\\nSeus anúncios não convertem? O problema pode não ser o botão, mas a oferta. Me conta, qual sua maior dificuldade com anúncios? 👇",
              "hashtags": "#reelsbrasil #trafegopago #marketingdeconteudo #anunciosonline #dicadevideo",
              "creative_guidance": {
                "type": "video",
                "description": "Para vídeos, o segredo é a edição dinâmica. Use o CapCut para cortes rápidos (a cada 1-2 segundos) e legendas que prendem a atenção. Use a biblioteca gratuita de vídeos do Pexels ou Canva se não quiser aparecer.",
                "prompt": "Não aplicável para vídeo, foque na edição e roteiro.",
                "tool_link": "https://www.capcut.com/"
              }
            }
          }
        ]
      }
    `;

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Você é um assistente que responde apenas com o objeto JSON solicitado, sem exceções." },
        { role: "user", content: prompt },
      ],
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) throw new Error("A IA não retornou um resultado.");

    const analysisData = JSON.parse(resultText);

    await ctx.runMutation(internal.mentor.saveAnalysis, {
      analysisData: { ...analysisData, ...userData }
    });

    return { ...analysisData, ...userData };
  },
});

// --- MUTATION INTERNA para SALVAR a análise (sem alterações) ---
export const saveAnalysis = internalMutation({
    args: {
      analysisData: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");

        const existingAnalysis = await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).first();

        const dataToSave = {
            ...args.analysisData,
            userId: identity.subject,
            updatedAt: Date.now()
        };

        if (existingAnalysis) {
            await ctx.db.patch(existingAnalysis._id, dataToSave);
            return existingAnalysis._id;
        } else {
            return await ctx.db.insert("analyses", { ...dataToSave, createdAt: Date.now() });
        }
    }
});

// --- QUERY para BUSCAR a análise salva (sem alterações) ---
export const getSavedAnalysis = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        return await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).order("desc").first();
    }
});

// --- MUTATION para ATUALIZAR o plano de conteúdo (COM NOVA ESTRUTURA DE DADOS) ---
export const updateContentPlan = mutation({
    args: {
        analysisId: v.id("analyses"),
        // <<< OS ARGUMENTOS AQUI DEVEM CORRESPONDER AO NOVO SCHEMA >>>
        newPlan: v.array(v.object({
            day: v.string(),
            time: v.string(),
            format: v.string(),
            title: v.string(),
            content_idea: v.string(),
            status: v.union(v.literal("planejado"), v.literal("concluido")),
            details: v.optional(v.object({
                tool_suggestion: v.string(),
                step_by_step: v.string(),
                script_or_copy: v.string(),
                hashtags: v.string(),
                creative_guidance: v.object({
                    type: v.string(),
                    description: v.string(),
                    prompt: v.string(),
                    tool_link: v.string(),
                }),
            })),
        }))
    },
    handler: async (ctx, { analysisId, newPlan }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");

        const analysis = await ctx.db.get(analysisId);
        if (!analysis || analysis.userId !== identity.subject) {
            throw new Error("Análise não encontrada ou permissão negada.");
        }

        await ctx.db.patch(analysisId, {
            content_plan: newPlan,
            updatedAt: Date.now(),
        });
    }
});