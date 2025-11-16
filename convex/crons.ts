// convex/crons.ts - TODOS OS CRON JOBS EM UM ARQUIVO
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ✅ Processa posts agendados - A cada 5 minutos (antes era 1 minuto)
crons.interval(
  "process-scheduled-posts",
  { minutes: 5 },
  internal.notificationSender.processScheduledPosts
);

// ✅ Limpeza de arquivos expirados - A cada 6 horas
crons.interval(
  "cleanup-expired-storage",
  { hours: 6 },
  internal.aiStudio.cleanupExpiredStorage
);

export default crons;