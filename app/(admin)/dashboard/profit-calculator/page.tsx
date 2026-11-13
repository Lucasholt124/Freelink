import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import ToolAccessGate from "@/components/tool-access/ToolAccessGate";
import ProfitCalculatorComponent from "@/components/ProfitCalculator";

export default async function ProfitCalculatorPage() {
  const user = await currentUser();
  if (!user) return null;

  const subscription = await getUserSubscriptionPlan(user.id);
  const isAdmin = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const hasAccess = subscription.plan === "ultra" || isAdmin;

  if (!hasAccess)
    return <ToolAccessGate tool="finance" currentPlan={subscription.plan} />;

  return <ProfitCalculatorComponent />;
}
