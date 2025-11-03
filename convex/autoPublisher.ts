// convex/autoPublisher.ts - PROCESSADOR DE PUBLICAÇÃO AUTOMÁTICA (SEM ERROS)
import { internalAction, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// ============================================
// TIPOS
// ============================================

interface ProcessResult {
  processed: number;
  success?: number;
  failed?: number;
}

// ============================================
// QUERY INTERNA
// ============================================

export const getPostsReadyToPublish = internalQuery({
  handler: async (ctx): Promise<Doc<"scheduledPosts">[]> => {
    const now = Date.now();

    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_auto_publish", (q) => q.eq("autoPublish", true))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "queued"),
          q.lte(q.field("scheduledTimestamp"), now)
        )
      )
      .take(10);

    return posts;
  },
});

// ============================================
// ACTION INTERNA
// ============================================

export const processQueuedPosts = internalAction({
  handler: async (ctx): Promise<ProcessResult> => {
    console.log("🔄 Processando posts na fila...");

    try {
      const postsToPublish: Doc<"scheduledPosts">[] = await ctx.runQuery(
        internal.autoPublisher.getPostsReadyToPublish
      );

      if (postsToPublish.length === 0) {
        console.log("✅ Nenhum post para publicar no momento");
        return { processed: 0 };
      }

      console.log(`📤 Encontrados ${postsToPublish.length} posts para publicar`);

      let successCount = 0;
      let failCount = 0;

      for (const post of postsToPublish) {
        try {
          console.log(`📝 Publicando post ${post._id}...`);

          await ctx.runAction(api.bufferIntegration.publishToBuffer, {
            postId: post._id,
          });

          successCount++;
          console.log(`✅ Post ${post._id} publicado com sucesso`);
        } catch (error) {
          failCount++;
          const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
          console.error(`❌ Erro ao publicar post ${post._id}:`, errorMessage);
        }
      }

      console.log(`✅ Processamento completo: ${successCount} sucesso, ${failCount} falhas`);

      return {
        processed: postsToPublish.length,
        success: successCount,
        failed: failCount,
      };
    } catch (error) {
      console.error("❌ Erro no processador automático:", error);
      throw error;
    }
  },
});