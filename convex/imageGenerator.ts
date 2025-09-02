// Em /convex/imageGenerator.ts
import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// =================================================================
// BACKEND CORRIGIDO - SEM DATA URLs
// =================================================================

interface ImageGeneratorAPI {
  name: string;
  generate: (prompt: string, style?: string) => Promise<string | null>;
  priority: number;
}

// APIs de IA reais e gratuitas
const AI_APIS: ImageGeneratorAPI[] = [
  {
    name: "Pollinations.ai",
    priority: 1,
    generate: async (prompt: string, style?: string) => {
      try {
        const enhancedPrompt = enhancePrompt(prompt, style);
        const encodedPrompt = encodeURIComponent(enhancedPrompt);

        const params = new URLSearchParams({
          width: "1024",
          height: "1024",
          seed: Math.floor(Math.random() * 1000000).toString(),
          enhance: "true",
          nologo: "true"
        });

        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`;
        console.log("✅ URL Pollinations gerada:", imageUrl);
        return imageUrl;
      } catch (error) {
        console.error("❌ Erro Pollinations.ai:", error);
      }
      return null;
    }
  },
  {
    name: "Picsum Photos",
    priority: 2,
    generate: async (prompt: string) => {
      try {
        // Gera seed baseado no prompt
        const seed = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;
        console.log("✅ URL Picsum gerada:", imageUrl);
        return imageUrl;
      } catch (error) {
        console.error("❌ Erro Picsum:", error);
      }
      return null;
    }
  },
  {
    name: "Lorem Picsum Blur",
    priority: 3,
    generate: async (prompt: string) => {
      try {
        // Use the prompt to generate a consistent seed, just like the other Picsum API
        const seed = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024?blur=2`;
        console.log("✅ URL Lorem Picsum gerada:", imageUrl);
        return imageUrl;
      } catch (error) {
        console.error("❌ Erro Lorem Picsum:", error);
      }
      return null;
    }
  }
];

// Função para melhorar o prompt
function enhancePrompt(prompt: string, style?: string): string {
  const lowerPrompt = prompt.toLowerCase();

  // Detecta contexto do negócio
  const contexts = {
    ecommerce: lowerPrompt.includes('ecommerce') || lowerPrompt.includes('produto') || lowerPrompt.includes('loja'),
    social: lowerPrompt.includes('instagram') || lowerPrompt.includes('social') || lowerPrompt.includes('post'),
    marketing: lowerPrompt.includes('marketing') || lowerPrompt.includes('campanha') || lowerPrompt.includes('anúncio'),
    branding: lowerPrompt.includes('brand') || lowerPrompt.includes('logo') || lowerPrompt.includes('identidade'),
    content: lowerPrompt.includes('content') || lowerPrompt.includes('conteúdo') || lowerPrompt.includes('criador')
  };

  let enhancedPrompt = prompt;

  // Adiciona estilo se especificado
  if (style) {
    const styleModifiers: Record<string, string> = {
      realistic: "ultra realistic, photorealistic, 8k resolution, highly detailed",
      artistic: "artistic, creative, vibrant colors, artistic style",
      "3d": "3D render, octane render, CGI, volumetric lighting",
      minimal: "minimalist, clean, simple, white background, minimal design",
      product: "product photography, commercial, professional lighting, studio shot",
      lifestyle: "lifestyle photography, natural lighting, authentic, candid"
    };

    if (styleModifiers[style]) {
      enhancedPrompt += `, ${styleModifiers[style]}`;
    }
  }

  // Adiciona contexto específico
  if (contexts.ecommerce) {
    enhancedPrompt += ", professional product shot, e-commerce ready, clean background";
  } else if (contexts.social) {
    enhancedPrompt += ", social media ready, eye-catching, engaging, viral potential";
  } else if (contexts.marketing) {
    enhancedPrompt += ", marketing material, professional, high impact, commercial quality";
  } else if (contexts.branding) {
    enhancedPrompt += ", brand identity, professional branding, corporate quality";
  } else if (contexts.content) {
    enhancedPrompt += ", content creation, digital media, online presence";
  }

  // Adiciona modificadores gerais
  enhancedPrompt += ", professional quality, high resolution, sharp focus";

  return enhancedPrompt;
}

// Função para criar SVG como Blob diretamente
function createSVGBlob(prompt: string): Blob {
  const colors = ['#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const svgContent = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${randomColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#grad)"/>
      <rect x="112" y="362" width="800" height="300" rx="20" fill="white" opacity="0.1"/>
      <text x="512" y="470" font-size="48" font-weight="bold" fill="white" text-anchor="middle">AI Generated</text>
      <text x="512" y="540" font-size="24" fill="white" opacity="0.9" text-anchor="middle">${prompt.substring(0, 40)}</text>
      <text x="512" y="920" font-size="16" fill="white" opacity="0.5" text-anchor="middle">Content Studio by FreeLink</text>
    </svg>
  `;

  return new Blob([svgContent], { type: 'image/svg+xml' });
}

// FUNÇÃO PRINCIPAL DE GERAÇÃO
export const generateImage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }
    const userId = identity.subject;

    console.log("🎨 Iniciando geração para:", args.prompt);

    // Extrai estilo do prompt
    const styleMatch = args.prompt.match(/(\w+)\s+style/i);
    const style = styleMatch ? styleMatch[1].toLowerCase() : "realistic";

    let imageBlob: Blob | null = null;
    let successfulAPI: string | null = null;

    // Tenta cada API em ordem
    for (const api of AI_APIS.sort((a, b) => a.priority - b.priority)) {
      console.log(`🔄 Tentando ${api.name}...`);

      try {
        const generatedUrl = await api.generate(args.prompt, style);

        if (generatedUrl) {
          console.log(`📥 Baixando imagem de ${api.name}...`);

          // Baixa a imagem com timeout e retry
          let attempts = 0;
          const maxAttempts = 2;

          while (attempts < maxAttempts && !imageBlob) {
            attempts++;

            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos

              const response = await fetch(generatedUrl, {
                signal: controller.signal,
                headers: {
                  'Accept': 'image/*',
                  'User-Agent': 'Mozilla/5.0 (compatible; ContentStudio/1.0)'
                }
              });

              clearTimeout(timeoutId);

              if (response.ok) {
                const contentType = response.headers.get('content-type');
                console.log(`📋 Content-Type: ${contentType}`);

                // Verifica se é uma imagem
                if (!contentType || contentType.includes('image')) {
                  const blob = await response.blob();

                  // Verifica tamanho mínimo
                  if (blob.size > 5000) { // Mínimo 5KB
                    imageBlob = blob;
                    successfulAPI = api.name;
                    console.log(`✅ ${api.name} gerou imagem de ${blob.size} bytes`);
                    break;
                  } else {
                    console.log(`⚠️ Imagem muito pequena: ${blob.size} bytes`);
                  }
                }
              } else {
                console.log(`⚠️ Response status: ${response.status}`);
              }
            } catch (fetchError) {
              console.error(`❌ Tentativa ${attempts} falhou:`, fetchError);
              if (attempts < maxAttempts) {
                console.log(`🔄 Tentando novamente...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
              }
            }
          }

          if (imageBlob) break; // Sai do loop se conseguiu uma imagem
        }
      } catch (error) {
        console.error(`❌ Erro geral em ${api.name}:`, error);
        continue;
      }
    }

    // Se nenhuma API funcionou, usa fallback simples do Pollinations
    if (!imageBlob) {
      console.log("⚠️ Tentando fallback simplificado...");

      try {
        // URL super simples, sem parâmetros extras
        const simplePrompt = args.prompt.split(' ').slice(0, 3).join(' ');
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplePrompt)}`;

        console.log(`🔗 URL fallback: ${fallbackUrl}`);

        const response = await fetch(fallbackUrl);
        if (response.ok) {
          const blob = await response.blob();
          if (blob.size > 5000) {
            imageBlob = blob;
            successfulAPI = "Pollinations Fallback";
            console.log("✅ Fallback funcionou!");
          }
        }
      } catch (error) {
        console.error("❌ Fallback também falhou:", error);
      }
    }

    // Último recurso: usa placeholder.com
    if (!imageBlob) {
      console.log("🆘 Usando placeholder de emergência...");

      try {
        const placeholderUrl = `https://via.placeholder.com/1024x1024/8b5cf6/ffffff?text=${encodeURIComponent('AI+Generated')}`;
        const response = await fetch(placeholderUrl);

        if (response.ok) {
          imageBlob = await response.blob();
          successfulAPI = "Placeholder";
          console.log("✅ Placeholder funcionou!");
        }
      } catch (error) {
        console.error("❌ Placeholder falhou:", error);
      }
    }

    // Se ainda não tem imagem, cria SVG como último recurso
    if (!imageBlob) {
      console.log("🎨 Criando SVG de emergência...");
      imageBlob = createSVGBlob(args.prompt);
      successfulAPI = "SVG Fallback";
      console.log("✅ SVG criado como blob!");
    }

    // SEMPRE salva no storage
    try {
      console.log(`💾 Salvando blob de ${imageBlob.size} bytes no storage...`);

      const storageId = await ctx.storage.store(imageBlob);
      console.log("📁 Storage ID criado:", storageId);

      const imageUrl = await ctx.storage.getUrl(storageId);
      console.log("🔗 URL do storage:", imageUrl);

      if (!imageUrl) {
        throw new Error("Falha ao obter URL do storage");
      }

      // Salva no banco COM storage ID
      await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt,
        imageUrl,
        storageId,
      });

      console.log(`🎉 Sucesso! Imagem gerada via ${successfulAPI}`);

      return imageUrl;

    } catch (storageError) {
      console.error("❌ Erro ao salvar no storage:", storageError);
      throw new Error(`Erro ao salvar imagem: ${storageError instanceof Error ? storageError.message : 'Erro desconhecido'}`);
    }
  },
});

// Mutation para salvar (sem alteração)
export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert("generatedImages", {
      userId: args.userId,
      prompt: args.prompt,
      imageUrl: args.imageUrl,
      storageId: args.storageId,
    });
    console.log("✅ Imagem salva no banco com storage ID:", result);
    return result;
  },
});

// Queries (sem alteração)
export const getImagesForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const images = await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);

    return images || [];
  },
});

export const getImage = query({
  args: { imageId: v.id("generatedImages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image || image.userId !== identity.subject) {
      throw new Error("Imagem não encontrada");
    }

    return image;
  },
});

export const getUserImageCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const images = await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return images.length;
  },
});