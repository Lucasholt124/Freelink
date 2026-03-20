import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchAnalytics } from "@/lib/analytics-server";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardOverview from "./DashboardOverview";
import { getCachedSubscriptionPlan, getCachedUserSlug } from "@/lib/cached-queries";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");


  const [userSlug, planDetails] = await Promise.all([
    getCachedUserSlug(user.id),
    getCachedSubscriptionPlan(user.id),
  ]);

  const analytics = await fetchAnalytics(user.id, userSlug ?? '');

  const firstName = user.firstName || "Creator";
  const userPlan = planDetails.plan || "free";

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