import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import ToolAccessGate from "@/components/tool-access/ToolAccessGate";
import { TrackingForm } from "@/components/TrackingForm";

export default async function TrackingPage() {
  const user = await currentUser();
  if (!user) return null;

  const subscription = await getUserSubscriptionPlan(user.id);
  const isAdmin = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";

  if (subscription.plan !== "ultra" && !isAdmin) {
    return <ToolAccessGate tool="tracking" currentPlan={subscription.plan} />;
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-6xl mx-auto flex flex-col min-h-screen">
      <TrackingForm />
    </div>
  );
}
