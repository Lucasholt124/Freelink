import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ✅ SEUS CRONS ANTIGOS (MANTENHA ELES)
crons.interval(
  "process-scheduled-posts",
  { minutes: 5 },
  internal.notificationSender.processScheduledPosts
);

crons.interval(
  "cleanup-expired-storage",
  { hours: 6 },
  internal.aiStudio.cleanupExpiredStorage
);

// ✅ NOVO CRON (CORRIGIDO)
// Aponta para marketingActions (onde está o "use node")
crons.daily(
  "marketing-drip-campaign",
  { hourUTC: 9, minuteUTC: 0 },
  internal.marketingActions.sendDailyEmails
);

export default crons;