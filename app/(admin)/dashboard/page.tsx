import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchAnalytics } from "@/lib/analytics-server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardOverview from "./DashboardOverview";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const [analytics, planDetails, userSlug] = await Promise.all([
    fetchAnalytics(user.id),
    getUserSubscriptionPlan(user.id),
    fetchQuery(api.lib.usernames.getUserSlug, { userId: user.id }),
  ]);

  const userPlan = planDetails.plan || "free";
  const firstName = user.firstName || "Creator";

  return (
    <Suspense fallback={<div className="p-8 space-y-4"><Skeleton className="h-32 w-full rounded-2xl" /><Skeleton className="h-96 w-full rounded-2xl" /></div>}>
      <DashboardOverview
        analytics={analytics}
        userPlan={userPlan}
        firstName={firstName}
        userSlug={userSlug}
      />
    </Suspense>
  );
}