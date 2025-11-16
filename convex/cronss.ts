import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Executa a cada 6 horas para limpar arquivos expirados
crons.interval(
  "cleanup-expired-storage",
  { hours: 6 },
  internal.aiStudio.cleanupExpiredStorage
);

export default crons;