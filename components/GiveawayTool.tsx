"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import GiveawayWorkspace from "@/components/giveaway/GiveawayWorkspace";
import type { GiveawayMethod } from "@/lib/giveaway";

export default function GiveawayTool({
  userPlan = "pro",
}: {
  userPlan?: "pro" | "ultra";
}) {
  const { user, isLoaded } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const giveaways = useQuery(
    api.publicGiveaways.getUserGiveaways,
    isAuthenticated ? {} : "skip",
  );
  const saveGiveaway = useMutation(api.publicGiveaways.saveGiveaway);
  const endGiveaway = useMutation(api.publicGiveaways.endGiveaway);
  const deleteGiveaway = useMutation(api.publicGiveaways.deleteGiveaway);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveId =
    selectedId ??
    giveaways?.find((giveaway) => giveaway.isActive)?.id ??
    giveaways?.[0]?.id ??
    null;

  async function create({
    title,
    method,
  }: {
    title: string;
    method: GiveawayMethod;
  }) {
    const giveawayId = `giveaway_${crypto.randomUUID()}`;
    await saveGiveaway({
      giveawayId,
      title: title.trim(),
      method,
      participants: [],
      isActive: true,
    });
    setSelectedId(giveawayId);
  }

  return (
    <GiveawayWorkspace
      userId={user?.id ?? ""}
      planLabel={userPlan === "ultra" ? "Ultra" : "Pro"}
      loading={
        !isLoaded || isLoading || (isAuthenticated && giveaways === undefined)
      }
      connectionError={isLoaded && !isLoading && (!user || !isAuthenticated)}
      giveaways={giveaways ?? []}
      selectedId={effectiveId}
      onSelect={setSelectedId}
      onCreate={create}
      onEnd={async (giveawayId) => {
        await endGiveaway({ giveawayId });
      }}
      onDelete={async (giveawayId) => {
        await deleteGiveaway({ giveawayId });
        setSelectedId(null);
      }}
    />
  );
}
