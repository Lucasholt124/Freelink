export const DASHBOARD_LOAD_TIMEOUT_MS = 15_000;

type Input = {
  clerkLoaded: boolean;
  clerkSignedIn: boolean;
  convexLoading: boolean;
  convexAuthenticated: boolean;
  overview: "pending" | "empty" | "ready";
  timedOut: boolean;
};

// A signed-in Clerk session does not guarantee an authenticated Convex session.
export function resolveDashboardLoadState(input: Input) {
  const waiting = input.timedOut ? "timeout" : "loading";
  if (!input.clerkLoaded) return waiting;
  if (!input.clerkSignedIn) return "signed-out";
  if (input.convexLoading) return waiting;
  if (!input.convexAuthenticated) return "auth-error";
  if (input.overview === "ready") return "ready";
  if (input.overview === "empty") return "auth-error";
  return waiting;
}
