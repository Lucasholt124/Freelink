import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import ToolAccessGate from "@/components/tool-access/ToolAccessGate";
import AdsManagerComponent from "@/components/AdsManager";

export default async function AdsManagerPage() {
  const user = await currentUser();
  if (!user) return null;
  const subscription = await getUserSubscriptionPlan(user.id);
  const isAdmin = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const plan = isAdmin ? "ultra" : subscription.plan;
  if (plan !== "pro" && plan !== "ultra")
    return <ToolAccessGate tool="ads" currentPlan={subscription.plan} />;
  return <AdsManagerComponent userPlan={plan} />;
}
