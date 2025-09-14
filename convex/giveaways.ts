import { action } from "./_generated/server";
import { v } from "convex/values";

// --- Sorteio Instagram ---
// --- Sorteio Instagram ---
export const runInstagramGiveaway = action({
  args: {
    comments: v.array(v.string()),
    unique: v.boolean(),
    mentions: v.number(),
    excludeWords: v.string(),
    ignoredUsers: v.string(),
    minWords: v.number(),
    verifiedOnly: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    if (args.comments.length === 0) {
      throw new Error("Nenhum comentário foi fornecido.");
    }

    let eligibleComments = args.comments.map((c) => {
      // Tentar extrair username de diferentes formatos
      let username = "desconhecido";
      let text = c;

      // Formato 1: "username: comment"
      if (c.includes(":")) {
        const parts = c.split(":");
        username = parts[0].trim().replace("@", "");
        text = parts.slice(1).join(":").trim();
      }
      // Formato 2: "@username comment"
      else if (c.startsWith("@")) {
        const parts = c.split(/\s+/);
        username = parts[0].replace("@", "");
        return { username, text };
      }
      // Formato 3: apenas texto (usar primeira palavra como username)
      else {
        const parts = c.split(/\s+/);
        username = parts[0] || "desconhecido";
      }

      return { username, text: c };
    });

    // Filtrar palavras excluídas
    if (args.excludeWords && args.excludeWords.trim()) {
      const excludeWordsList = args.excludeWords
        .split(",")
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length > 0);

      eligibleComments = eligibleComments.filter((c) => {
        const lowerText = c.text.toLowerCase();
        return !excludeWordsList.some((word) => lowerText.includes(word));
      });
    }

    // Filtrar usuários ignorados
    if (args.ignoredUsers && args.ignoredUsers.trim()) {
      const ignoredUsersList = args.ignoredUsers
        .split(",")
        .map((u) => u.trim().toLowerCase().replace("@", ""))
        .filter((u) => u.length > 0);

      eligibleComments = eligibleComments.filter(
        (c) => !ignoredUsersList.includes(c.username.toLowerCase())
      );
    }

    // Filtrar por número mínimo de palavras
    if (args.minWords > 0) {
      eligibleComments = eligibleComments.filter(
        (c) => c.text.split(/\s+/).filter(word => word.length > 0).length >= args.minWords
      );
    }

    // Filtrar por menções
    if (args.mentions > 0) {
      eligibleComments = eligibleComments.filter(
        (c) => (c.text.match(/@\w+/g) || []).length >= args.mentions
      );
    }

    // Filtrar apenas verificados (procurar por ✓ ou ✔ ou verified)
    if (args.verifiedOnly) {
      eligibleComments = eligibleComments.filter((c) =>
        c.text.includes("✓") ||
        c.text.includes("✔") ||
        c.text.toLowerCase().includes("verified")
      );
    }

    // Filtrar únicos
    if (args.unique) {
      const uniqueUsernames = new Set<string>();
      eligibleComments = eligibleComments.filter((c) => {
        if (!uniqueUsernames.has(c.username)) {
          uniqueUsernames.add(c.username);
          return true;
        }
        return false;
      });
    }

    if (eligibleComments.length === 0) {
      // Dar uma mensagem mais específica sobre o que causou a filtragem
      let message = "Nenhum comentário elegível encontrado.";

      if (args.verifiedOnly) {
        message += " Certifique-se de que os comentários de contas verificadas contenham ✓.";
      }
      if (args.mentions > 0) {
        message += ` Certifique-se de que os comentários tenham pelo menos ${args.mentions} menção(ões) com @.`;
      }
      if (args.minWords > 0) {
        message += ` Certifique-se de que os comentários tenham pelo menos ${args.minWords} palavra(s).`;
      }

      throw new Error(message);
    }

    const winner =
      eligibleComments[Math.floor(Math.random() * eligibleComments.length)];

    return {
      username: winner.username,
      commentText: winner.text,
      profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(
        winner.username
      )}`,
    };
  },
});

// --- Sorteio Lista ---
export const runListGiveaway = action({
  args: {
    participants: v.array(v.string()),
    unique: v.boolean(),
    excludePattern: v.string(),
    minLength: v.number(),
    winnersCount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    let participantsList = args.participants
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (participantsList.length === 0)
      throw new Error("A lista de participantes está vazia.");

    // Filtrar por comprimento mínimo
    if (args.minLength > 0) {
      participantsList = participantsList.filter(
        (p) => p.length >= args.minLength
      );
    }

    // Filtrar por padrão de exclusão
    if (args.excludePattern && args.excludePattern.trim()) {
      try {
        const regex = new RegExp(args.excludePattern, "i");
        participantsList = participantsList.filter((p) => !regex.test(p));
      } catch  {
        // Se o regex for inválido, ignorar o filtro
      }
    }

    // Remover duplicatas se necessário
    if (args.unique) {
      participantsList = [...new Set(participantsList)];
    }

    if (participantsList.length === 0)
      throw new Error("A lista ficou vazia após aplicar os filtros.");

    // Determinar número de vencedores
    const winnersCount = Math.min(
      args.winnersCount || 1,
      participantsList.length
    );

    // Se for apenas um vencedor
    if (winnersCount === 1) {
      const winnerName =
        participantsList[Math.floor(Math.random() * participantsList.length)];

      return {
        username: winnerName,
        commentText: "Selecionado(a) da lista",
        profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(
          winnerName
        )}`,
      };
    }

    // Se forem múltiplos vencedores
    const winners: string[] = [];
    const availableParticipants = [...participantsList];

    for (let i = 0; i < winnersCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableParticipants.length);
      winners.push(availableParticipants[randomIndex]);
      availableParticipants.splice(randomIndex, 1);
    }

    return {
      username: winners.join(", "),
      commentText: `${winnersCount} vencedor(es) selecionado(s) da lista`,
      profilePicUrl: `https://i.pravatar.cc/150?u=multiple`,
      winners: winners,
    };
  },
});

// --- Sorteio Numérico ---
export const runNumberGiveaway = action({
  args: {
    min: v.number(),
    max: v.number(),
    exclude: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    if (args.min > args.max) {
      throw new Error("O valor mínimo não pode ser maior que o máximo.");
    }

    // Criar lista de números válidos
    const validNumbers: number[] = [];
    for (let i = args.min; i <= args.max; i++) {
      if (!args.exclude.includes(i)) {
        validNumbers.push(i);
      }
    }

    if (validNumbers.length === 0) {
      throw new Error("Nenhum número válido disponível após exclusões.");
    }

    const number = validNumbers[Math.floor(Math.random() * validNumbers.length)];

    return { number };
  },
});

// --- Sorteio Ponderado (Lista com pesos) ---
export const runWeightedListGiveaway = action({
  args: {
    participants: v.array(
      v.object({
        username: v.string(),
        weight: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    if (args.participants.length === 0)
      throw new Error("A lista de participantes está vazia.");

    // Soma total dos pesos
    const totalWeight = args.participants.reduce(
      (acc, p) => acc + p.weight,
      0
    );
    if (totalWeight <= 0)
      throw new Error("A soma dos pesos deve ser maior que zero.");

    // Sorteio ponderado
    let random = Math.random() * totalWeight;
    for (const participant of args.participants) {
      random -= participant.weight;
      if (random <= 0) {
        return {
          username: participant.username,
          weight: participant.weight,
          commentText: "Selecionado(a) ponderado(a)",
          profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(
            participant.username
          )}`,
        };
      }
    }

    // Fallback (não deve ocorrer)
    const fallback = args.participants[0];
    return {
      username: fallback.username,
      weight: fallback.weight,
      commentText: "Selecionado(a) ponderado(a)",
      profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(
        fallback.username
      )}`,
    };
  },
});