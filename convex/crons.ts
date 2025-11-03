// convex/crons.ts - CRON JOB para publicação automática
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Executar a cada 5 minutos
crons.interval(
  "publish-queued-posts",
  { minutes: 5 },
  internal.autoPublisher.processQueuedPosts
);

export default crons;