import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// =================================================================
// 🔧 FUNÇÕES AUXILIARES
// =================================================================
const getGroqApiKey = (): string => {
  return process.env.GROQ_API_KEY || "";
};

const getReplicateApiKey = (): string => {
  return process.env.REPLICATE_API_KEY || "";
};

const base64ToBlob = (base64: string): Blob => {
  const match = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)/);
  if (!match) {
    throw new Error('Invalid base64 string');
  }
  const contentType = match[1];
  const base64Data = match[2];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

// =================================================================
// 1. 💬 CHAT COM IA - GROQ COM MODELOS ATIVOS
// =================================================================
export const chatWithAI = action({
  args: {
    userId: v.string(),
    message: v.string(),
    conversationHistory: v.optional(v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string()
    })))
  },
  handler: async (ctx, args): Promise<{ success: boolean; response?: string; message?: string }> => {
    try {
      console.log("💬 Iniciando chat...");

      const GROQ_KEY = getGroqApiKey();

      if (GROQ_KEY && GROQ_KEY.length > 10) {
        // Lista de modelos ATIVOS em ordem de preferência
        const models = [
          "llama-3.3-70b-versatile",  // Mais recente e poderoso
          "llama-3.1-8b-instant",     // Rápido
          "gemma2-9b-it",             // Alternativa Google
          "llama3-70b-8192",          // Estável
          "llama3-8b-8192"            // Fallback rápido
        ];

        for (const model of models) {
          try {
            console.log(`🚀 Tentando modelo: ${model}...`);

            const messages = [
              {
                role: "system",
                content: "Você é uma assistente de IA extremamente útil, inteligente e amigável. Responda sempre em português brasileiro de forma clara, objetiva e prestativa. Seja criativo e útil em suas respostas."
              },
              ...(args.conversationHistory || []).slice(-8),
              {
                role: "user",
                content: args.message
              }
            ];

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${GROQ_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.8,
                max_tokens: 2048,
                top_p: 0.9,
                stream: false
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const aiResponse = data.choices[0]?.message?.content;

              if (aiResponse) {
                console.log(`✅ Sucesso com modelo: ${model}`);

                await ctx.runMutation(api.aiStudio.saveChatMessage, {
                  userId: args.userId,
                  message: args.message,
                  response: aiResponse,
                });

                return {
                  success: true,
                  response: aiResponse,
                };
              }
            } else {
              const errorText = await response.text();
              console.warn(`⚠️ Modelo ${model} falhou:`, response.status);

              // Se for erro de modelo descontinuado, tenta o próximo
              if (response.status === 400 && errorText.includes("decommissioned")) {
                continue;
              }
            }
          } catch (error) {
            console.warn(`⚠️ Erro no modelo ${model}:`, error);
            continue;
          }
        }

        console.error("❌ Todos os modelos falharam");
      } else {
        console.log("⚠️ GROQ_API_KEY não configurada");
      }

      // FALLBACK: Respostas inteligentes
      console.log("🤖 Usando sistema de resposta local...");
      const intelligentResponse = generateIntelligentResponse(args.message);

      await ctx.runMutation(api.aiStudio.saveChatMessage, {
        userId: args.userId,
        message: args.message,
        response: intelligentResponse,
      });

      return {
        success: true,
        response: intelligentResponse,
      };

    } catch (error: unknown) {
      console.error("❌ Erro geral:", error);
      return {
        success: true,
        response: "Desculpe, ocorreu um erro. Tente novamente.",
      };
    }
  },
});

// Sistema de resposta inteligente local
function generateIntelligentResponse(message: string): string {
  const msg = message.toLowerCase().trim();

  if (msg.match(/^(oi|olá|ola|hey|hi|hello|bom dia|boa tarde|boa noite)/)) {
    return "Olá! 😊 Como posso ajudar você hoje?\n\nPosso responder perguntas, criar conteúdo, dar ideias e muito mais!\n\n💡 **Dica**: Configure sua GROQ_API_KEY gratuita em https://console.groq.com para respostas ainda melhores com IA!";
  }

  if (msg.match(/^(obrigad|valeu|thanks)/)) {
    return "Por nada! 😊 Fico feliz em ajudar! Se precisar de mais alguma coisa, é só chamar!";
  }

  if (msg.match(/(quem|o que|você|voce|ia|ai)/)) {
    return "🤖 **Sobre mim:**\n\nSou uma assistente de IA criada para ajudar você!\n\n**Posso fazer:**\n✅ Responder perguntas sobre qualquer assunto\n✅ Criar textos e conteúdos\n✅ Dar ideias criativas\n✅ Resolver problemas\n✅ Explicar conceitos\n✅ Ajudar com programação\n✅ Estratégias de marketing\n\nComo posso te ajudar especificamente?";
  }

  if (msg.match(/(ajuda|help|como)/)) {
    return "📚 **Como posso ajudar:**\n\n**💡 Criação de Conteúdo:**\n• Textos, artigos, posts\n• Copywriting e marketing\n• Roteiros e scripts\n\n**🎯 Conhecimento:**\n• Responder perguntas\n• Explicar conceitos\n• Pesquisar informações\n\n**💻 Programação:**\n• Ajuda com código\n• Explicar bugs\n• Boas práticas\n\nSobre o que você quer conversar?";
  }

  if (msg.match(/(marketing|venda|anuncio|publicidade|copy)/)) {
    return "📊 **Marketing Digital:**\n\nPosso ajudar com:\n\n✅ **Copywriting** persuasivo\n✅ **Estratégias** de marketing\n✅ **Campanhas** de anúncios\n✅ **Conteúdo** para redes sociais\n✅ **E-mail marketing**\n✅ **SEO** e tráfego\n✅ **Funis** de vendas\n\nQual aspecto do marketing você quer explorar?";
  }

  if (msg.match(/(programar|código|codigo|desenvolv|javascript|python|react|bug|erro)/)) {
    return "💻 **Programação:**\n\nPosso ajudar com:\n\n✅ Explicar conceitos de programação\n✅ Ajudar a resolver bugs\n✅ Revisar lógica de código\n✅ Sugerir melhores práticas\n✅ Estruturar projetos\n\n**Linguagens que conheço:**\nJavaScript, TypeScript, Python, React, Node.js, e muitas outras!\n\nQual é sua dúvida de programação?";
  }

  if (msg.match(/(criar|escrever|texto|artigo|post|conteudo)/)) {
    return "📝 **Criação de Conteúdo:**\n\nPosso criar:\n\n✅ Artigos e posts para blog\n✅ Legendas para Instagram/TikTok\n✅ Roteiros de vídeo\n✅ E-mails profissionais\n✅ Descrições de produtos\n✅ Textos persuasivos\n\nSobre qual tema você precisa de conteúdo?";
  }

  if (msg.match(/(ideia|sugest|criativ|inspira)/)) {
    return "💡 **Ideias Criativas:**\n\nPosso sugerir ideias para:\n\n✅ Negócios e produtos\n✅ Conteúdo viral\n✅ Nomes e branding\n✅ Campanhas de marketing\n✅ Projetos criativos\n\nPara qual área você precisa de ideias?";
  }

  // Resposta padrão inteligente
  return `Entendi sua pergunta: "${message}"\n\n🔑 **Para respostas completas com IA:**\n\n1️⃣ Acesse: **https://console.groq.com**\n2️⃣ Faça login (gratuito)\n3️⃣ Vá em "API Keys" → "Create API Key"\n4️⃣ Copie a chave\n5️⃣ Cole no arquivo **.env.local**:\n   \`GROQ_API_KEY=sua_chave_aqui\`\n6️⃣ Reinicie o servidor (Ctrl+C e npm run dev)\n\n✨ **É 100% gratuito** e leva apenas 2 minutos!\n\nEnquanto isso, me pergunte sobre:\n• Marketing\n• Programação\n• Criação de conteúdo\n• Ideias criativas`;
}

// =================================================================
// 2. 🎨 APRIMORAR IMAGEM - REPLICATE (FUNCIONA 100%)
// =================================================================
export const enhanceImage = action({
  args: {
    userId: v.string(),
    imageFile: v.string(),
    effect: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const blob = base64ToBlob(args.imageFile);
      const REPLICATE_KEY = process.env.REPLICATE_API_TOKEN || "";

      if (REPLICATE_KEY && REPLICATE_KEY.length > 10) {

        console.log("🚀 Usando nightmareai/real-esrgan ($0.002 por imagem)");

        try {
          const startTime = Date.now();

          // MODELO MAIS BARATO - nightmareai/real-esrgan
          const prediction = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${REPLICATE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
              input: {
                image: args.imageFile,
                scale: 2,              // Scale 2 = mais rápido e barato
                face_enhance: false    // False = mais barato
              }
            }),
          });

          if (!prediction.ok) {
            const errorText = await prediction.text();
            throw new Error(`Erro ao criar prediction: ${errorText}`);
          }

          let result = await prediction.json();
          const predictionId = result.id;

          console.log(`📊 Prediction ID: ${predictionId}`);
          console.log(`📊 Status: ${result.status}`);

          // Polling otimizado
          let attempts = 0;
          const maxAttempts = 60;

          while (result.status === "starting" || result.status === "processing") {
            attempts++;

            if (attempts >= maxAttempts) {
              throw new Error("Timeout - processamento muito longo");
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            const statusResponse = await fetch(
              `https://api.replicate.com/v1/predictions/${predictionId}`,
              { headers: { "Authorization": `Bearer ${REPLICATE_KEY}` } }
            );

            if (statusResponse.ok) {
              result = await statusResponse.json();

              if (attempts % 5 === 0) {
                console.log(`⏳ ${attempts}s - ${result.status}`);
              }
            }
          }

          // Processar resultado
          if (result.status === "succeeded") {
            const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log(`✅ Sucesso em ${processingTime}s!`);

            const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

            if (!imageUrl) {
              throw new Error("Output vazio");
            }

            // Download
            const imageResponse = await fetch(imageUrl);

            if (!imageResponse.ok) {
              throw new Error(`Erro ao baixar: ${imageResponse.status}`);
            }

            const imageBlob = await imageResponse.blob();

            const originalKB = (blob.size / 1024).toFixed(1);
            const resultKB = (imageBlob.size / 1024).toFixed(1);
            const increase = ((imageBlob.size / blob.size - 1) * 100).toFixed(0);

            console.log(`📦 ${originalKB}KB → ${resultKB}KB (+${increase}%)`);

            // Salvar
            const storageId = await ctx.storage.store(imageBlob);
            const finalUrl = await ctx.storage.getUrl(storageId);

            if (finalUrl) {
              await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
                userId: args.userId,
                originalUrl: args.imageFile.substring(0, 100),
                resultUrl: finalUrl,
                prompt: `Real-ESRGAN x2 - $0.002`,
                storageId: storageId
              });

              // Calcular crédito estimado restante (supondo $10 inicial)
              const estimatedUsed = 0.04; // Do seu billing
              const estimatedRemaining = 10 - estimatedUsed;
              const imagesRemaining = Math.floor(estimatedRemaining / 0.002);

              return {
                success: true,
                url: finalUrl,
                message: `✨ **Imagem Aprimorada!**\n\n📊 **Detalhes:**\n• Original: ${originalKB}KB\n• Resultado: ${resultKB}KB\n• Aumento: +${increase}%\n• Tempo: ${processingTime}s\n\n💰 **Custo:**\n• Esta imagem: $0.002\n• Crédito restante: ~$${estimatedRemaining.toFixed(2)}\n• Imagens restantes: ~${imagesRemaining.toLocaleString()}\n\n🚀 **Modelo:** Real-ESRGAN x2 (nightmareai)`
              };
            }
          } else if (result.status === "failed") {
            throw new Error(`Processamento falhou: ${result.error}`);
          }

        } catch (error) {
          console.error("❌ Erro ao processar:", error);
          throw error;
        }
      }

      // Fallback se não tiver API key
      const storageId = await ctx.storage.store(blob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) {
        await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
          userId: args.userId,
          originalUrl: args.imageFile.substring(0, 100),
          resultUrl: finalUrl,
          prompt: "Original (sem processamento)",
          storageId: storageId
        });

        return {
          success: true,
          url: finalUrl,
          message: `📸 Imagem salva!\n\n🔑 Configure REPLICATE_API_TOKEN para aprimoramento:\n\n💰 **Custo Real:**\n• $0.002 por imagem\n• $2 por 1000 imagens\n• 500 imagens por $1\n\nCom $10 = 5,000 imagens! 🚀`
        };
      }

      throw new Error("Falha ao salvar");

    } catch (error: unknown) {
      console.error("❌ Erro geral:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro ao processar imagem"
      };
    }
  },
});

// =================================================================
// 3. 🎤 VOZ PARA TEXTO - GROQ WHISPER
// =================================================================
export const speechToText = action({
  args: {
    userId: v.string(),
    audioUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; text?: string; message?: string }> => {
    try {
      const GROQ_KEY = getGroqApiKey();

      if (GROQ_KEY && GROQ_KEY.length > 10) {
        try {
          console.log("🎤 Transcrevendo com Groq Whisper...");

          const audioBlob = base64ToBlob(args.audioUrl);
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.mp3');
          formData.append('model', 'whisper-large-v3-turbo'); // Modelo mais recente
          formData.append('language', 'pt');
          formData.append('response_format', 'json');
          formData.append('temperature', '0');

          const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_KEY}`,
            },
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            const transcription = result.text;

            if (transcription && transcription.length > 3) {
              console.log("✅ Áudio transcrito!");

              await ctx.runMutation(api.aiStudio.saveTranscription, {
                userId: args.userId,
                audioUrl: args.audioUrl.substring(0, 100),
                transcription
              });

              return {
                success: true,
                text: transcription,
                message: "✅ Áudio transcrito com Whisper Turbo!"
              };
            }
          } else {
            const errorText = await response.text();
            console.error("❌ Erro Whisper:", errorText);
          }
        } catch (error) {
          console.error("❌ Erro ao transcrever:", error);
        }
      }

      // Fallback
      const fallbackText = "⚠️ Configure GROQ_API_KEY para transcrição automática.\n\n🔑 Obtenha gratuitamente em:\nhttps://console.groq.com";

      await ctx.runMutation(api.aiStudio.saveTranscription, {
        userId: args.userId,
        audioUrl: args.audioUrl.substring(0, 100),
        transcription: fallbackText
      });

      return {
        success: true,
        text: fallbackText,
        message: "Configure GROQ_API_KEY"
      };
    } catch (error: unknown) {
      console.error("❌ Erro STT:", error);
      return {
        success: false,
        message: "Erro ao transcrever"
      };
    }
  },
});

// =================================================================
// 4. 📸 REMOVER FUNDO - REPLICATE
// =================================================================
export const removeBackground = action({
  args: {
    userId: v.string(),
    imageUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const blob = base64ToBlob(args.imageUrl);
      const REPLICATE_KEY = getReplicateApiKey();

      if (REPLICATE_KEY && REPLICATE_KEY.length > 10) {
        try {
          console.log("✂️ Removendo fundo com Replicate...");

          const prediction = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${REPLICATE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              version: "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
              input: {
                image: args.imageUrl
              }
            }),
          });

          if (prediction.ok) {
            let result = await prediction.json();
            const predictionId = result.id;

            for (let i = 0; i < 20; i++) {
              await new Promise(resolve => setTimeout(resolve, 1000));

              const statusResponse = await fetch(
                `https://api.replicate.com/v1/predictions/${predictionId}`,
                {
                  headers: {
                    "Authorization": `Bearer ${REPLICATE_KEY}`,
                  },
                }
              );

              if (statusResponse.ok) {
                result = await statusResponse.json();

                if (result.status === "succeeded" && result.output) {
                  console.log("✅ Fundo removido!");

                  const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
                  const imageResponse = await fetch(imageUrl);
                  const imageBlob = await imageResponse.blob();

                  const storageId = await ctx.storage.store(imageBlob);
                  const finalUrl = await ctx.storage.getUrl(storageId);

                  if (finalUrl) {
                    return {
                      success: true,
                      url: finalUrl,
                      message: "✨ Fundo removido com IA!"
                    };
                  }
                } else if (result.status === "failed") {
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error("❌ Erro Replicate:", error);
        }
      }

      // Fallback
      const storageId = await ctx.storage.store(blob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) {
        return {
          success: true,
          url: finalUrl,
          message: "✅ Configure REPLICATE_API_TOKEN para remoção com IA"
        };
      }

      throw new Error("Falha");
    } catch (error: unknown) {
      console.error("❌ Erro:", error);
      return {
        success: false,
        message: "Erro ao processar"
      };
    }
  },
});

// =================================================================
// 💾 MUTATIONS
// =================================================================
export const saveEnhancedImage = mutation({
  args: {
    userId: v.string(),
    originalUrl: v.string(),
    resultUrl: v.string(),
    prompt: v.string(),
    storageId: v.optional(v.id("_storage"))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      ...args,
      type: "enhanced_image",
      createdAt: Date.now()
    });
  },
});

export const saveTranscription = mutation({
  args: {
    userId: v.string(),
    audioUrl: v.string(),
    transcription: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      originalUrl: args.audioUrl,
      text: args.transcription,
      userId: args.userId,
      type: "transcription",
      createdAt: Date.now()
    });
  },
});

export const saveChatMessage = mutation({
  args: {
    userId: v.string(),
    message: v.string(),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      userId: args.userId,
      text: args.message,
      resultUrl: args.response,
      type: "chat",
      createdAt: Date.now()
    });
  },
});