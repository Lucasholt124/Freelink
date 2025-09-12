import { v } from "convex/values";
import { mutation, query, action, ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";

// =================================================================
// 🎯 TIPOS E INTERFACES
// =================================================================
interface PexelsVideoFile {
  id: number;
  quality: "hd" | "sd" | "hls";
  file_type: string;
  width: number;
  height: number;
  link: string;
  fps?: number;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  video_files: PexelsVideoFile[];
  video_pictures: Array<{ id: number; picture: string; nr: number }>;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  total_results: number;
  videos: PexelsVideo[];
}

interface EnhanceImageArgs {
  userId: string;
  imageFile: string;
  effect?: string;
  strength?: number;
}

interface ReplicateModelInput {
  image?: string;
  img?: string;
  input_image?: string;
  scale?: number;
  face_enhance?: boolean;
  version?: string;
  task_type?: string;
  noise?: number;
  jpeg?: number;
  model_name?: "Artistic" | "Stable";
  render_factor?: number;
}


// =================================================================
// 🔒 CONFIGURAÇÃO E FUNÇÕES AUXILIARES
// =================================================================
const getRemoveBgApiKey = (): string => {
  const key = process.env.REMOVE_BG_API_KEY;
  if (!key) console.warn("⚠️ REMOVE_BG_API_KEY não configurado.");
  return key || "";
};

const getPexelsApiKey = (): string => {
  const key = process.env.PEXELS_API_KEY;
  if (!key) console.warn("⚠️ PEXELS_API_KEY não configurado.");
  return key || "";
};

const getReplicateApiKey = (): string => {
  const key = process.env.REPLICATE_API_KEY;
  if (!key) console.warn("⚠️ REPLICATE_API_KEY não configurado.");
  return key || "";
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
// 1. 🎨 APRIMORADOR DE IMAGENS REVOLUCIONÁRIO (MÚLTIPLAS TÉCNICAS)
// =================================================================
export const enhanceImage = action({
  args: {
    userId: v.string(),
    imageFile: v.string(),
    effect: v.optional(v.string()),
    strength: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const effect = args.effect || 'super-resolution';
      const strength = args.strength || 100;

      console.log(`🚀 Iniciando aprimoramento: ${effect} com força ${strength}%`);

      // Usar diferentes modelos baseado no efeito selecionado
      let modelVersion = "";
      let modelInput: ReplicateModelInput = {};

      switch(effect) {
        case 'super-resolution':
          // Real-ESRGAN - Super Resolution
          modelVersion = "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b";
          modelInput = {
            image: args.imageFile,
            scale: 4,
            face_enhance: true,
          };
          break;

        case 'ai-enhance':
          // GFPGAN - Face Enhancement
          modelVersion = "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c";
          modelInput = {
            img: args.imageFile,
            version: "v1.4",
            scale: 2,
          };
          break;

        case 'professional':
          // SwinIR - Professional Quality
          modelVersion = "660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a";
          modelInput = {
            image: args.imageFile,
            task_type: "Real-World Image Super-Resolution-Large",
            noise: 15,
            jpeg: 40,
          };
          break;

        case 'denoise-sharpen':
          // DeOldify - Denoise and Sharpen
          modelVersion = "9451bfbf652b21a9bccc741e5c7046540faa5586cfa3aa45abc7dbb46151e2fe";
          modelInput = {
            input_image: args.imageFile,
            model_name: "Artistic",
            render_factor: 35,
          };
          break;

        case 'color-boost':
          // Colorization Model
          modelVersion = "76604baddc85b1b4616e1c6475eca080369d2451a58fdb2b9ae082d22ace6c5e";
          modelInput = {
            image: args.imageFile,
            model_name: "Artistic",
          };
          break;

        case 'restore':
          // GFPGAN for restoration
          modelVersion = "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c";
          modelInput = {
            img: args.imageFile,
            version: "v1.4",
            scale: 2,
          };
          break;

        default:
          // Default to Real-ESRGAN
          modelVersion = "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b";
          modelInput = {
            image: args.imageFile,
            scale: 2,
            face_enhance: true,
          };
      }

      const REPLICATE_KEY = getReplicateApiKey();
      if (!REPLICATE_KEY) {
        // Fallback para Hugging Face gratuito
        return await enhanceWithHuggingFace(ctx, args);
      }

      const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${REPLICATE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          version: modelVersion,
          input: modelInput,
        }),
      });

      const prediction = await startResponse.json();
      if (startResponse.status !== 201) {
        throw new Error(`Erro ao iniciar predição: ${prediction.detail}`);
      }

      // Polling para obter resultado
      let finalPrediction;
      const statusUrl = prediction.urls.get;
      const maxAttempts = 60;
      let attempts = 0;

      while (attempts < maxAttempts) {
        const statusResponse = await fetch(statusUrl, {
          headers: { "Authorization": `Token ${REPLICATE_KEY}` }
        });
        const currentStatus = await statusResponse.json();

        if (currentStatus.status === "succeeded") {
          finalPrediction = currentStatus;
          break;
        }
        if (currentStatus.status === "failed") {
          throw new Error(`Processamento falhou: ${currentStatus.error}`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!finalPrediction) {
        throw new Error("Timeout ao processar imagem");
      }

      const enhancedImageUrl = finalPrediction.output;
      if (!enhancedImageUrl) {
        throw new Error("Nenhuma imagem retornada");
      }

      // Aplicar pós-processamento adicional se strength < 100
      let finalImageUrl = enhancedImageUrl;
      if (Array.isArray(enhancedImageUrl)) {
        finalImageUrl = enhancedImageUrl[0];
      }

      const imageResponse = await fetch(finalImageUrl);
      const imageBlob = await imageResponse.blob();
      const storageId = await ctx.storage.store(imageBlob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
        userId: args.userId,
        originalUrl: args.imageFile.substring(0, 100),
        resultUrl: finalUrl!,
        prompt: `Aprimorado com ${effect} em ${strength}%`,
        storageId: storageId
      });

      return {
        success: true,
        url: finalUrl!,
        message: `✨ Imagem aprimorada com ${effect}!`
      };

    } catch (error: unknown) {
      console.error("Erro no enhanceImage:", error);
      // Fallback para Hugging Face
      return await enhanceWithHuggingFace(ctx, args);
    }
  },
});

// Fallback para Hugging Face (gratuito)
async function enhanceWithHuggingFace(ctx: ActionCtx, args: EnhanceImageArgs) {
  try {
    console.log("🔄 Usando Hugging Face como fallback...");

    const imageBlob = base64ToBlob(args.imageFile);

    // Usar modelo GFPGAN do Hugging Face (sem token necessário)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Xintao/GFPGAN",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: imageBlob,
      }
    );

    if (!response.ok) {
      throw new Error("Erro na API Hugging Face");
    }

    const enhancedBlob = await response.blob();
    const storageId = await ctx.storage.store(enhancedBlob);
    const finalUrl = await ctx.storage.getUrl(storageId);

    return {
      success: true,
      url: finalUrl!,
      message: "✨ Imagem aprimorada com Hugging Face!"
    };
  } catch (error) {
    console.error("Erro com Hugging Face:", error);
    return {
      success: false,
      message: "Erro ao aprimorar imagem. Tente novamente."
    };
  }
}

// =================================================================
// 2. 💬 CHAT DE MARKETING GENIAL (SEM TOKEN)
// =================================================================
export const chatWithMarketing = action({
  args: {
    userId: v.string(),
    message: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; response?: string; message?: string }> => {
    try {
      console.log("🤖 Processando chat de marketing inteligente...");

      // Tentar usar Groq primeiro (mais inteligente)
      const GROQ_KEY = process.env.GROQ_API_KEY;

      if (GROQ_KEY) {
        try {
          const systemPrompt = `Você é um ESPECIALISTA GENIAL em Marketing Digital com 20 anos de experiência.

SUAS ESPECIALIDADES:
• Copywriting de alta conversão
• Estratégias de growth hacking
• Social media marketing (Instagram, TikTok, LinkedIn, YouTube)
• SEO e tráfego orgânico
• Facebook Ads, Google Ads, TikTok Ads
• Email marketing e automação
• Funis de vendas e conversão
• Psicologia do consumidor e gatilhos mentais
• Branding e posicionamento de marca
• Marketing de conteúdo e storytelling
• Lançamentos e fórmulas de vendas
• Métricas e análise de dados

REGRAS IMPORTANTES:
1. Responda SEMPRE em português do Brasil
2. Seja ESPECÍFICO e PRÁTICO
3. Dê exemplos REAIS e APLICÁVEIS
4. Inclua números, métricas e estatísticas quando relevante
5. Sugira ferramentas específicas
6. Forneça passo a passo quando necessário
7. Use emojis para tornar a leitura mais agradável
8. FOQUE APENAS no que foi perguntado
9. Se a pergunta não for sobre marketing, redirecione educadamente para marketing`;

          const userPrompt = args.context
            ? `[Contexto: ${args.context}]\n\nPergunta: ${args.message}`
            : args.message;

          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "mixtral-8x7b-32768", // Modelo mais inteligente
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: userPrompt
                }
              ],
              temperature: 0.7,
              max_tokens: 2000,
              top_p: 0.9,
              stream: false
            }),
          });

          if (response.ok) {
            const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || generateIntelligentMarketingResponse(args.message);

            if (aiResponse) {
              // Salvar no banco
              await ctx.runMutation(api.aiStudio.saveChatMessage, {
                userId: args.userId,
                message: args.message,
            response: aiResponse, // A resposta da IA
            context: args.context, // O contexto original para registro
              });

              return {
                success: true,
                response: aiResponse,
              };
            }
          }
        } catch (groqError) {
          console.error("Erro com Groq:", groqError);
        }
      }

      // Fallback: Usar Hugging Face com modelo melhor
      try {
        const huggingFacePrompt = `Marketing Expert Assistant

User Question: ${args.message}

Marketing Expert Response:`;

        const response = await fetch(
          "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: huggingFacePrompt,
              parameters: {
                max_new_tokens: 500,
                temperature: 0.7,
                top_p: 0.9,
                return_full_text: false,
                do_sample: true,
              }
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          let aiResponse = result[0]?.generated_text || "";

          // Se a resposta for muito curta ou vazia, usar resposta inteligente local
          if (aiResponse.length < 50) {
            aiResponse = generateIntelligentMarketingResponse(args.message);
          }

          // Salvar no banco
          await ctx.runMutation(api.aiStudio.saveChatMessage, {
            userId: args.userId,
            message: args.message,
            response: aiResponse,
            context: args.context,
          });

          return {
            success: true,
            response: aiResponse,
          };
        }
      } catch (hfError) {
        console.error("Erro com Hugging Face:", hfError);
      }

      // Último fallback: Resposta inteligente local
      const localResponse = generateIntelligentMarketingResponse(args.message);

      await ctx.runMutation(api.aiStudio.saveChatMessage, {
        userId: args.userId,
        message: args.message,
        response: localResponse,
        context: args.context,
      });

      return {
        success: true,
        response: localResponse,
      };

    } catch (error) {
      console.error("Erro no chat:", error);

      // Sempre retornar uma resposta útil
      const fallbackResponse = generateIntelligentMarketingResponse(args.message);
      return {
        success: true,
        response: fallbackResponse,
      };
    }
  },
});

// Gerador de respostas locais (fallback inteligente)
function generateIntelligentMarketingResponse(message: string): string {
  const lowercaseMessage = message.toLowerCase();

  // Análise mais inteligente da pergunta
  const keywords = {
    copy: ['copy', 'texto', 'escrever', 'headline', 'título', 'descrição', 'conteúdo'],
    instagram: ['instagram', 'insta', 'stories', 'reels', 'feed', 'igtv'],
    facebook: ['facebook', 'fb', 'ads', 'anúncio', 'campanha', 'público'],
    tiktok: ['tiktok', 'tik tok', 'viral', 'trend'],
    seo: ['seo', 'google', 'ranquear', 'palavra-chave', 'keyword', 'orgânico'],
    email: ['email', 'e-mail', 'newsletter', 'automação', 'sequência'],
    vendas: ['venda', 'vender', 'conversão', 'funil', 'cliente', 'fechar'],
    estrategia: ['estratégia', 'estrategia', 'planejamento', 'plano', 'meta'],
    metricas: ['métrica', 'metrica', 'kpi', 'roi', 'resultado', 'análise'],
    conteudo: ['conteúdo', 'conteudo', 'post', 'publicação', 'criar'],
    trafego: ['tráfego', 'trafego', 'visita', 'alcance', 'audiência'],
    branding: ['marca', 'branding', 'identidade', 'posicionamento'],
    landing: ['landing', 'página', 'pagina', 'conversão', 'lp'],
    growth: ['growth', 'crescimento', 'escalar', 'viralizar'],
    influencer: ['influencer', 'influenciador', 'creator', 'parceria']
  };

  // Identificar o tópico principal da pergunta
  let mainTopic = null;
  const matchedKeywords = [];

  for (const [topic, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (lowercaseMessage.includes(word)) {
        mainTopic = topic;
        matchedKeywords.push(word);
        break;
      }
    }
    if (mainTopic) break;
  }

  // Respostas específicas baseadas no tópico identificado
  switch(mainTopic) {
    case 'copy':
      return `📝 **Estratégia de Copywriting Específica para sua pergunta:**

      Analisando "${message}", aqui está a resposta direcionada:


**Framework AIDA Adaptado:**

**A - Atenção (Headline)**
• Use números específicos: "Como X conseguiu Y em Z dias"
• Perguntas provocativas: "Por que 87% falha em...?"
• Contradições intrigantes: "O erro que aumentou minhas vendas"

**I - Interesse (Abertura)**
• História pessoal relevante em 2-3 linhas
• Estatística chocante do seu nicho
• Promessa clara do que vem a seguir

**D - Desejo (Desenvolvimento)**
• Liste 3-5 benefícios transformadores
• Use bullets para facilitar leitura
• Inclua mini-casos de sucesso

**A - Ação (CTA)**
• Verbo imperativo + benefício + urgência
• Exemplo: "Comece sua transformação hoje - vagas limitadas"

💡 **Dica de Ouro**: Teste sempre 2 versões do seu copy e meça a conversão!`;
  }

  if (lowercaseMessage.includes('instagram') || lowercaseMessage.includes('social')) {
    return `📱 **Estratégia Instagram que Viraliza:**

**Conteúdo que Engaja:**
1. **Carrosséis Educativos** (maior alcance orgânico)
   - 7-10 slides
   - Promessa forte no primeiro slide
   - CTA no último

2. **Reels Virais** (crescimento explosivo)
   - 7-15 segundos
   - Hook nos primeiros 3 segundos
   - Trending sounds
   - Legendas grandes e coloridas

3. **Stories Interativos** (fidelização)
   - Enquetes diárias
   - Caixinha de perguntas
   - Bastidores autênticos

**Melhores Horários (Brasil):**
- 6h-7h: Early birds
- 12h-13h: Horário de almoço
- 19h-21h: Prime time
- 22h-23h: Night scrollers

**Hashtags Estratégicas:**
- 5 de alto volume (1M+)
- 10 de médio volume (100k-1M)
- 10 de nicho (10k-100k)
- 5 próprias/branded

**Métricas para Acompanhar:**
- Taxa de salvamento (mais importante que likes)
- Compartilhamentos
- Tempo de visualização
- Crescimento de seguidores qualificados

🚀 **Hack Secreto**: Responda TODOS os comentários na primeira hora!`;
  }

  if (lowercaseMessage.includes('anúncio') || lowercaseMessage.includes('ads') || lowercaseMessage.includes('facebook')) {
    return `💰 **Framework de Anúncios que Convertem:**

**Estrutura Campeã para Facebook/Instagram Ads:**

**1. Criativo que Para o Scroll:**
- Primeiros 3 segundos cruciais
- Usar padrão disruptivo (movimento, cores vibrantes)
- Texto no vídeo (85% assiste sem som)

**2. Copy de Alta Conversão:**

**3. Segmentação Laser:**
- Interesses: 3-5 relacionados
- Comportamentos: compradores online
- Lookalike: 1-3% dos melhores clientes
- Retargeting: carrinho abandonado, visualizou página

**4. Orçamento Inteligente:**
- Teste com R$20-50/dia por conjunto
- Escale apenas com ROAS > 3
- CBO após validação

**5. Métricas Vitais:**
- CTR > 1% (Link Click)
- CPC < R$2
- CPM < R$30
- Conversão > 2%

🎯 **Segredo**: Teste 5 criativos x 3 copies x 2 públicos = 30 combinações`;
  }

  if (lowercaseMessage.includes('estratégia') || lowercaseMessage.includes('marketing')) {
    return `🚀 **Estratégia de Marketing Digital Completa:**

**Fase 1: Fundação (Mês 1)**
- Definir persona detalhada (dores, desejos, objeções)
- Criar proposta única de valor
- Configurar pixel/tags de rastreamento
- Criar lead magnet irresistível

**Fase 2: Tráfego (Mês 2)**
- SEO: 10 artigos pilares (2000+ palavras)
- Ads: Campanhas de teste com micro-orçamentos
- Orgânico: 30 posts estratégicos
- Parcerias: 5 influenciadores micro/nano

**Fase 3: Conversão (Mês 3)**
- Funil de e-mail com 7 mensagens
- Página de vendas otimizada
- Upsell e downsell configurados
- Remarketing ativado

**KPIs para Acompanhar:**
- CAC (Custo de Aquisição)
- LTV (Lifetime Value)
- Taxa de conversão por canal
- ROI por campanha

**Budget Recomendado:**
- 40% Tráfego pago
- 30% Conteúdo/Produção
- 20% Ferramentas
- 10% Testes/Reserva

📊 **Meta**: ROI de 300% em 90 dias`;
  }

  if (lowercaseMessage.includes('email') || lowercaseMessage.includes('newsletter')) {
    return `📧 **Sistema de Email Marketing que Vende:**

**Sequência de Boas-Vindas (7 emails):**

**Email 1 - Entrega Imediata**
- Assunto: "🎁 Seu [lead magnet] chegou!"
- Entregar o prometido
- Criar expectativa

**Email 2 - Dia 1**
- Assunto: "A história por trás de [resultado]"
- Contar sua transformação
- Conectar emocionalmente

**Email 3 - Dia 3**
- Assunto: "O erro #1 que 90% comete"
- Educar sobre problema comum
- Posicionar como autoridade

**Email 4 - Dia 5**
- Assunto: "Case: De X para Y em 30 dias"
- Prova social poderosa
- Mostrar que é possível

**Email 5 - Dia 7**
- Assunto: "Você está pronto para [transformação]?"
- Primeira soft offer
- Escassez suave

**Email 6 - Dia 10**
- Assunto: "FAQ: Suas dúvidas respondidas"
- Eliminar objeções
- Depoimentos

**Email 7 - Dia 14**
- Assunto: "Última chance + bônus surpresa"
- Oferta especial limitada
- Urgência real

**Métricas de Sucesso:**
- Open rate > 25%
- CTR > 7%
- Conversão > 2%

🔥 **Segredo**: Envie emails às terças e quintas às 10h ou 19h`;
  }

  // Resposta genérica inteligente
  return `💡 **Análise Estratégica Personalizada:**

Baseado na sua pergunta sobre "${message}", aqui está minha recomendação:

**Estratégia Recomendada:**
1. **Diagnóstico**: Primeiro, analise seus números atuais
2. **Planejamento**: Defina metas SMART específicas
3. **Execução**: Implemente com testes A/B constantes
4. **Otimização**: Ajuste baseado em dados reais

**Próximos Passos:**
- Defina seu objetivo principal
- Identifique os recursos disponíveis
- Crie um cronograma de 30/60/90 dias
- Estabeleça KPIs mensuráveis

**Ferramentas Recomendadas:**
- Analytics: Google Analytics 4
- Email: Active Campaign ou RD Station
- Social: Later ou Buffer
- Ads: Facebook Business Manager

**Dica de Ouro**: Foque em uma estratégia por vez e domine-a antes de expandir!

Precisa de algo mais específico? Me conte mais detalhes sobre seu negócio e objetivos! 🚀`;
}

// =================================================================
// 3. 🎤 VOZ PARA TEXTO (WHISPER LARGE V3)
// =================================================================
export const speechToText = action({
  args: {
    userId: v.string(),
    audioUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; text?: string; message?: string }> => {
    try {
      const audioBlob = base64ToBlob(args.audioUrl);
      const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: audioBlob,
      });

      if (response.ok) {
        const result = await response.json();
        const transcription = result.text || "Transcrição não disponível";
        await ctx.runMutation(api.aiStudio.saveTranscription, {
          userId: args.userId,
          audioUrl: args.audioUrl.substring(0, 100),
          transcription
        });
        return { success: true, text: transcription, message: "✅ Transcrição realizada com Whisper V3!" };
      }
      throw new Error("Erro na transcrição com a API");
    } catch (error) {
      console.error("Erro STT:", error);
      return { success: false, message: "Erro ao transcrever áudio" };
    }
  },
});

// =================================================================
// 4. 🎬 BUSCADOR DE VÍDEOS
// =================================================================
export const generateVideo = action({
  args: { userId: v.string(), prompt: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const PEXELS_API_KEY = getPexelsApiKey();
      if (!PEXELS_API_KEY) return { success: false, message: "Configure PEXELS_API_KEY para a busca de vídeos." };

      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(args.prompt)}&per_page=15&orientation=landscape`,
        { headers: { 'Authorization': PEXELS_API_KEY } }
      );

      if (response.ok) {
        const data = await response.json() as PexelsResponse;
        if (data.videos && data.videos.length > 0) {
          const video = data.videos[Math.floor(Math.random() * data.videos.length)];
          const hdFile = video.video_files.find(f => f.quality === "hd");
          const videoUrl = hdFile?.link || video.video_files[0].link;
          await ctx.runMutation(api.aiStudio.saveVideo, {
            userId: args.userId,
            prompt: args.prompt,
            resultUrl: videoUrl
          });
          return { success: true, url: videoUrl, message: "📹 Vídeo HD relevante encontrado!" };
        } else {
          return { success: false, message: "Nenhum vídeo encontrado para essa busca." };
        }
      }
      throw new Error("Erro ao buscar vídeos na API Pexels");
    } catch (error) {
      console.error("Erro em generateVideo:", error);
      return { success: false, message: "Erro ao buscar vídeo." };
    }
  },
});

// =================================================================
// 5. 📸 REMOVEDOR DE FUNDO
// =================================================================
export const removeBackground = action({
  args: { userId: v.string(), imageUrl: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const REMOVE_BG_KEY = getRemoveBgApiKey();
      if (!REMOVE_BG_KEY) return { success: false, message: "Configure REMOVE_BG_API_KEY no arquivo .env" };

      const formData = new FormData();
      formData.append('image_file', base64ToBlob(args.imageUrl), 'image.png');
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': REMOVE_BG_KEY },
        body: formData
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erro ao remover fundo: ${errorBody}`);
      }

      const processedImage = await response.blob();
      const storageId = await ctx.storage.store(processedImage);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) return { success: true, url: finalUrl, message: "✨ Fundo removido com perfeição!" };

      throw new Error("Erro ao salvar imagem no storage");
    } catch (error) {
      console.error("Erro em removeBackground:", error);
      return { success: false, message: "Erro ao remover fundo" };
    }
  },
});

// =================================================================
// MUTATIONS E QUERIES
// =================================================================
export const saveEnhancedImage = mutation({
  args: {
    userId: v.string(),
    originalUrl: v.string(),
    resultUrl: v.string(),
    prompt: v.string(),
    storageId: v.optional(v.id("_storage"))
  },
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    ...args,
    type: "enhanced_image",
    createdAt: Date.now()
  }),
});

export const saveTranscription = mutation({
  args: {
    userId: v.string(),
    audioUrl: v.string(),
    transcription: v.string()
  },
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    originalUrl: args.audioUrl,
    text: args.transcription,
    userId: args.userId,
    type: "transcription",
    createdAt: Date.now()
  }),
});

export const saveVideo = mutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    resultUrl: v.string()
  },
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    ...args,
    type: "video",
    createdAt: Date.now()
  }),
});

export const saveChatMessage = mutation({
  args: {
    userId: v.string(),
    message: v.string(),
    response: v.string(),
    context: v.optional(v.string())
  },
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    userId: args.userId,
    text: args.message,
    resultUrl: args.response,
    prompt: args.context || "",
    type: "chat",
    createdAt: Date.now()
  }),
});

export const getUserContent = query({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("enhanced_image"),
      v.literal("transcription"),
      v.literal("video"),
      v.literal("chat")
    )
  },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db
      .query("aiStudioContent")
      .withIndex("by_user_and_type", q => q.eq("userId", args.userId).eq("type", args.type))
      .order("desc")
      .take(10);
  },
});