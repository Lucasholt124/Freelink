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

export default crons;