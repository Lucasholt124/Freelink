// convex/crons.ts - CRON JOB PARA NOTIFICAÇÕES AUTOMÁTICAS
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ============================================
// RODA A CADA 1 MINUTO
// ============================================
crons.interval(
  "send-scheduled-notifications",
  { minutes: 1 }, // A cada 1 minuto
  internal.notificationSender.processScheduledPosts
);

export default crons;