import { v, ConvexError } from "convex/values";
import { action, internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  normalizeBarcode,
  optionLabel,
  validateCapture,
  validateSaleDate,
} from "../lib/retail";

const option = v.object({ name: v.string(), value: v.string() });
export const claimPhoto = internalMutation({
  args: { userId: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) =>
    ctx.db.insert("retailPhotos", { ...args, createdAt: Date.now() }),
});

// Store inside an authenticated action, so ownership is bound to the uploaded bytes.
export const storeProductPhoto = action({
  args: { dataUrl: v.string() },
  handler: async (
    ctx,
    { dataUrl },
  ): Promise<{
    storageId: import("./_generated/dataModel").Id<"_storage">;
    url: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Entre na sua conta para salvar a foto.");
    if (dataUrl.length > 650_000)
      throw new Error("A foto ficou grande. Escolha outra ou tente novamente.");
    const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) throw new Error("Escolha uma foto válida do produto.");
    const bytes = Uint8Array.from(atob(match[1]), (char) => char.charCodeAt(0));
    if (
      bytes.length < 4 ||
      bytes[0] !== 0xff ||
      bytes[1] !== 0xd8 ||
      bytes.length > 480_000
    )
      throw new Error("A foto não pôde ser lida. Escolha novamente.");
    const storageId = await ctx.storage.store(
      new Blob([bytes], { type: "image/jpeg" }),
    );
    try {
      await ctx.runMutation(internal.retail.claimPhoto, {
        userId: identity.subject,
        storageId,
      });
      const url = await ctx.storage.getUrl(storageId);
      if (!url) throw new Error("Não foi possível carregar a foto.");
      return { storageId, url };
    } catch (error) {
      await ctx.storage.delete(storageId);
      throw error;
    }
  },
});

export const createProducts = mutation({
  args: {
    requestId: v.string(),
    businessId: v.optional(v.id("businesses")),
    name: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    costPrice: v.number(),
    salePrice: v.number(),
    unit: v.string(),
    photoId: v.optional(v.id("_storage")),
    variants: v.array(
      v.object({
        options: v.array(option),
        stock: v.number(),
        barcode: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError("Entre na sua conta para cadastrar produtos.");
    if (!/^[a-zA-Z0-9_-]{12,100}$/.test(args.requestId))
      throw new ConvexError("Reabra o cadastro e tente novamente.");
    const errors = validateCapture(args);
    if (errors.length) throw new ConvexError(errors[0]);
    const fingerprint = JSON.stringify(args);
    const previous = await ctx.db
      .query("retailRequests")
      .withIndex("by_user_request", (q) =>
        q.eq("userId", identity.subject).eq("requestId", args.requestId),
      )
      .unique();
    if (previous) {
      if (
        previous.operation !== "capture" ||
        previous.fingerprint !== fingerprint
      )
        throw new ConvexError(
          "Este cadastro já foi enviado com outros dados. Confira seus produtos antes de tentar de novo.",
        );
      return previous.productIds || [];
    }
    if (args.businessId) {
      const business = await ctx.db.get(args.businessId);
      if (!business || business.userId !== identity.subject)
        throw new ConvexError("Negócio não encontrado.");
    }
    let imageUrl: string | undefined;
    if (args.photoId) {
      const photo = await ctx.db
        .query("retailPhotos")
        .withIndex("by_storage", (q) => q.eq("storageId", args.photoId!))
        .unique();
      if (!photo || photo.userId !== identity.subject)
        throw new ConvexError("Escolha uma foto enviada pela sua conta.");
      imageUrl = (await ctx.storage.getUrl(args.photoId)) || undefined;
      if (!imageUrl)
        throw new ConvexError(
          "A foto não está mais disponível. Escolha novamente.",
        );
    }
    const existing = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    const codes = new Set(
      existing
        .flatMap((product) => [product.barcode, product.sku])
        .filter(Boolean)
        .map((code) => code!.trim().toLowerCase()),
    );
    for (const row of args.variants) {
      if (row.barcode && codes.has(normalizeBarcode(row.barcode).toLowerCase()))
        throw new ConvexError(
          `A etiqueta ${row.barcode} já pertence a outro produto. Confira o cadastro existente ou deixe o código em branco.`,
        );
    }
    const ids = [];
    for (const row of args.variants) {
      const options = row.options.map((value) => ({
        name: value.name.trim(),
        value: value.value.trim(),
      }));
      const suffix = optionLabel(options);
      const id = await ctx.db.insert("products", {
        userId: identity.subject,
        businessId: args.businessId,
        name: args.name.trim() + (suffix ? ` — ${suffix}` : ""),
        category: args.category?.trim() || undefined,
        description: args.description?.trim() || undefined,
        costPrice: args.costPrice,
        salePrice: args.salePrice,
        unit: args.unit,
        stock: row.stock,
        barcode: normalizeBarcode(row.barcode) || undefined,
        imageStorageId: args.photoId,
        imageUrl,
        variantGroupId: args.requestId,
        variantOptions: options,
        active: true,
        createdAt: Date.now(),
      });
      ids.push(id);
    }
    await ctx.db.insert("retailRequests", {
      userId: identity.subject,
      requestId: args.requestId,
      operation: "capture",
      fingerprint,
      productIds: ids,
      createdAt: Date.now(),
    });
    return ids;
  },
});

// Durable per-account budget for photo suggestions, also checked by the paid server route.
export const reservePhotoSuggestion = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Entre na sua conta.");
    const day = new Date().toISOString().slice(0, 10);
    const usage = await ctx.db
      .query("retailPhotoUsage")
      .withIndex("by_user_day", (q) =>
        q.eq("userId", identity.subject).eq("day", day),
      )
      .unique();
    if (
      usage &&
      (usage.count >= 30 || Date.now() - usage.lastRequestedAt < 5000)
    )
      throw new Error(
        "Aguarde um pouco antes de pedir outra sugestão. O limite é de 30 fotos por dia.",
      );
    if (usage)
      await ctx.db.patch(usage._id, {
        count: usage.count + 1,
        lastRequestedAt: Date.now(),
      });
    else
      await ctx.db.insert("retailPhotoUsage", {
        userId: identity.subject,
        day,
        count: 1,
        lastRequestedAt: Date.now(),
      });
    return true;
  },
});

export const receiveSale = mutation({
  args: { saleId: v.id("sales"), date: v.string(), paymentMethod: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError("Entre na sua conta para registrar o recebimento.");
    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.userId !== identity.subject)
      throw new ConvexError("Venda não encontrada.");
    // The paid state and linked cash entry are committed together. Retries are safe.
    if (sale.paymentStatus === "paid") return { alreadyPaid: true };
    if (!["pending", "overdue"].includes(sale.paymentStatus || ""))
      throw new ConvexError("Essa venda não está marcada como a receber.");
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    if (
      !validateSaleDate(args.date) ||
      args.date > today ||
      args.date < sale.date
    )
      throw new ConvexError(
        "Confira a data: o recebimento não pode ser anterior à venda nem estar no futuro.",
      );
    if (
      ![
        "pix",
        "cash",
        "credit_card",
        "debit_card",
        "bank_transfer",
        "other",
      ].includes(args.paymentMethod)
    )
      throw new ConvexError("Escolha uma forma de pagamento válida.");
    const existing = await ctx.db
      .query("cashFlow")
      .withIndex("by_sale", (q) => q.eq("saleId", sale._id))
      .first();
    if (!existing)
      await ctx.db.insert("cashFlow", {
        saleId: sale._id,
        userId: identity.subject,
        businessId: sale.businessId,
        type: "in",
        amount: sale.totalRevenue,
        description: `Recebimento: ${sale.productName}`,
        date: args.date,
        time: new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        paymentMethod: args.paymentMethod,
        createdAt: Date.now(),
      });
    await ctx.db.patch(sale._id, {
      paymentStatus: "paid",
      paymentMethod: args.paymentMethod as
        | "pix"
        | "cash"
        | "credit_card"
        | "debit_card"
        | "bank_transfer"
        | "other",
      paidAt: Date.parse(`${args.date}T12:00:00Z`),
      updatedAt: Date.now(),
    });
    await ctx.scheduler.runAfter(
      0,
      internal.profitCalculator.updateDailySummary,
      {
        userId: identity.subject,
        date: sale.date,
        businessId: sale.businessId,
      },
    );
    return { alreadyPaid: false };
  },
});
