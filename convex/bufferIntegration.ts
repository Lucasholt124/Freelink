// convex/bufferIntegration.ts - INTEGRAÇÃO REAL COM BUFFER (SEM ERROS)
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";


const BUFFER_API_BASE = "https://api.bufferapp.com/1";

// ============================================
// TIPOS
// ============================================

interface BufferProfile {
  id: string;
  service: string;
  formatted_service: string;
  formatted_username: string;
  avatar?: string;
}

interface BufferProfileFormatted {
  id: string;
  service: string;
  serviceName: string;
  serviceUsername: string;
  avatar?: string;
}

interface BufferUpdateResponse {
  success: boolean;
  updates?: Array<{ id: string }>;
  id?: string;
  message?: string;
}

interface BufferUpdateStatus {
  id: string;
  status: string;
  text: string;
  sent_at?: number;
  statistics?: Record<string, unknown>;
}

// ============================================
// MUTATIONS
// ============================================

export const saveBufferToken = mutation({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const existing = await ctx.db
      .query("socialIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        bufferAccessToken: args.accessToken,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const integrationId = await ctx.db.insert("socialIntegrations", {
        userId: identity.subject,
        bufferAccessToken: args.accessToken,
        createdAt: Date.now(),
      });
      return integrationId;
    }
  },
});

export const saveBufferProfiles = mutation({
  args: {
    profiles: v.array(v.object({
      id: v.string(),
      service: v.string(),
      serviceName: v.string(),
      serviceUsername: v.string(),
      avatar: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const existing = await ctx.db
      .query("socialIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!existing) throw new Error("Token não encontrado. Conecte primeiro.");

    await ctx.db.patch(existing._id, {
      bufferProfiles: args.profiles,
      updatedAt: Date.now(),
    });

    return existing._id;
  },
});

export const disconnectBuffer = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const integration = await ctx.db
      .query("socialIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!integration) return { success: false };

    await ctx.db.patch(integration._id, {
      bufferAccessToken: undefined,
      bufferProfiles: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================
// QUERIES
// ============================================

export const getIntegration = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const integration = await ctx.db
      .query("socialIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    return integration;
  },
});

// ============================================
// ACTIONS (Chamadas HTTP para Buffer API)
// ============================================

export const fetchBufferProfiles = action({
  handler: async (ctx): Promise<BufferProfileFormatted[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const integration = await ctx.runQuery(api.bufferIntegration.getIntegration);
    if (!integration?.bufferAccessToken) {
      throw new Error("Buffer não conectado");
    }

    try {
      const response: Response = await fetch(
        `${BUFFER_API_BASE}/profiles.json?access_token=${integration.bufferAccessToken}`
      );

      if (!response.ok) {
        const error = await response.json() as { message?: string };
        throw new Error(error.message || "Erro ao buscar perfis do Buffer");
      }

      const profiles = await response.json() as BufferProfile[];

      const formattedProfiles: BufferProfileFormatted[] = profiles.map((p) => ({
        id: p.id,
        service: p.service,
        serviceName: p.formatted_service,
        serviceUsername: p.formatted_username,
        avatar: p.avatar,
      }));

      await ctx.runMutation(api.bufferIntegration.saveBufferProfiles, {
        profiles: formattedProfiles,
      });

      return formattedProfiles;
    } catch (error) {
      console.error("Erro ao buscar perfis Buffer:", error);
      const errorMessage = error instanceof Error ? error.message : "Falha ao conectar com Buffer";
      throw new Error(errorMessage);
    }
  },
});

export const publishToBuffer = action({
  args: {
    postId: v.id("scheduledPosts"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; bufferUpdateId?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const post = await ctx.runQuery(api.scheduledPosts.getPost, { postId: args.postId });
    if (!post) throw new Error("Post não encontrado");

    const integration = await ctx.runQuery(api.bufferIntegration.getIntegration);
    if (!integration?.bufferAccessToken || !integration?.bufferProfiles) {
      throw new Error("Buffer não conectado ou sem perfis");
    }

    const profile = integration.bufferProfiles.find(p => p.service === post.platform);
    if (!profile) {
      throw new Error(`Perfil ${post.platform} não encontrado no Buffer`);
    }

    await ctx.runMutation(api.scheduledPosts.updateScheduledPost, {
      postId: args.postId,
      status: "publishing",
    });

    try {
      const fullText = `${post.caption}\n\n${post.hashtags.join(' ')}`;

      const params = new URLSearchParams({
        access_token: integration.bufferAccessToken,
        text: fullText,
        'profile_ids[]': profile.id,
      });

      if (post.mediaUrl) {
        params.append('media[photo]', post.mediaUrl);
      }

      if (post.autoPublish && post.scheduledTimestamp > Date.now()) {
        const scheduledAt = new Date(post.scheduledTimestamp).toISOString();
        params.append('scheduled_at', scheduledAt);
      } else {
        params.append('now', 'true');
      }

      const response: Response = await fetch(
        `${BUFFER_API_BASE}/updates/create.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        const error = await response.json() as { message?: string };
        throw new Error(error.message || "Erro ao publicar no Buffer");
      }

      const result = await response.json() as BufferUpdateResponse;

      await ctx.runMutation(api.scheduledPosts.updateScheduledPost, {
        postId: args.postId,
        status: "published",
        bufferUpdateId: result.updates?.[0]?.id || result.id,
        bufferProfileId: profile.id,
      });

      return {
        success: true,
        bufferUpdateId: result.updates?.[0]?.id || result.id,
      };
    } catch (error) {
      console.error("Erro ao publicar no Buffer:", error);

      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      await ctx.runMutation(api.scheduledPosts.updateScheduledPost, {
        postId: args.postId,
        status: "failed",
        publishError: errorMessage,
      });

      throw error;
    }
  },
});

export const checkBufferUpdateStatus = action({
  args: {
    updateId: v.string(),
  },
  handler: async (ctx, args): Promise<BufferUpdateStatus> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const integration = await ctx.runQuery(api.bufferIntegration.getIntegration);
    if (!integration?.bufferAccessToken) {
      throw new Error("Buffer não conectado");
    }

    try {
      const response: Response = await fetch(
        `${BUFFER_API_BASE}/updates/${args.updateId}.json?access_token=${integration.bufferAccessToken}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar status do update");
      }

      const update = await response.json() as BufferUpdateStatus;

      return {
        id: update.id,
        status: update.status,
        text: update.text,
        sent_at: update.sent_at,
        statistics: update.statistics,
      };
    } catch (error) {
      console.error("Erro ao checar status:", error);
      throw error;
    }
  },
});