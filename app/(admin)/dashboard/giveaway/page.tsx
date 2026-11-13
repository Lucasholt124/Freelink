import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import ToolAccessGate from "@/components/tool-access/ToolAccessGate";
import GiveawayTool from "@/components/GiveawayTool";

export default async function GiveawayPage() {
  const user = await currentUser();
  if (!user) return null;
  const subscription = await getUserSubscriptionPlan(user.id);
  const isAdmin = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const plan = isAdmin ? "ultra" : subscription.plan;
  if (plan !== "ultra" && plan !== "pro") {
    return <ToolAccessGate tool="giveaway" currentPlan={subscription.plan} />;
  }
  return <GiveawayTool userPlan={plan} />;
}
