// convex/files.ts - Sistema de upload de arquivos (CORRIGIDO E TIPADO)
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


// Retorno: string | null
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<string | null> => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Retorno: string
export const generateUploadUrl = mutation({
  handler: async (ctx): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    return await ctx.storage.generateUploadUrl();
  },
});