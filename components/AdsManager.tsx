"use client";
import { useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import AdsWorkspace from "@/components/ads/AdsWorkspace";
import {
  adDestination,
  adPlanLimits,
  validateAdDraft,
  type AdPlan,
  type CreateAdInput,
  type UploadProgress,
} from "@/lib/ads";

export default function AdsManagerComponent({
  userPlan,
}: {
  userPlan: string;
}) {
  const { user, isLoaded } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const campaigns = useQuery(
    api.ads.getCampaigns,
    isAuthenticated ? {} : "skip",
  );
  const pages = useQuery(
    api.ads.getMyPageCategories,
    isAuthenticated ? {} : "skip",
  );
  const setPageCategory = useMutation(api.ads.saveUserNiche);
  const setCampaignCategory = useMutation(api.ads.setCampaignCategory);
  const generateUploadUrl = useMutation(api.ads.generateUploadUrl);
  const createCampaign = useAction(api.ads.publishCampaign);
  const toggleStatus = useMutation(api.ads.toggleCampaignStatus);
  const deleteCampaign = useMutation(api.ads.deleteCampaign);
  const uploaded = useRef(new Map<File, Id<"_storage">>());
  const plan: AdPlan = userPlan === "ultra" ? "ultra" : "pro";

  async function create(
    input: CreateAdInput,
    onProgress: (progress: UploadProgress) => void,
  ) {
    const limit = adPlanLimits[plan];
    if ((campaigns?.length ?? 0) >= limit.campaigns)
      throw new Error("Você atingiu o limite de campanhas do plano.");
    if (
      Object.keys(validateAdDraft(input, input.files.length, limit.media))
        .length
    )
      throw new Error("Revise os dados da campanha antes de publicar.");
    const mediaStorageIds: Id<"_storage">[] = [],
      mediaTypes: string[] = [];
    for (let index = 0; index < input.files.length; index++) {
      const file = input.files[index];
      onProgress({
        phase: "uploading",
        current: index + 1,
        total: input.files.length,
        fileName: file.name,
      });
      let storageId = uploaded.current.get(file);
      if (!storageId) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok)
          throw new Error(
            `Não foi possível enviar ${file.name}. Tente novamente.`,
          );
        const data = await response.json();
        if (!data || typeof data.storageId !== "string" || !data.storageId)
          throw new Error(
            `O envio de ${file.name} não foi concluído. Tente novamente.`,
          );
        storageId = data.storageId as Id<"_storage">;
        uploaded.current.set(file, storageId);
      }
      mediaStorageIds.push(storageId);
      mediaTypes.push(file.type.startsWith("video/") ? "video" : "image");
    }
    onProgress({
      phase: "saving",
      current: input.files.length,
      total: input.files.length,
    });
    await createCampaign({
      title: input.title.trim(),
      productLink: adDestination(input.productLink)!,
      adText: input.adText.trim(),
      niche: input.niche,
      mediaStorageIds,
      mediaTypes,
    });
    uploaded.current.clear();
  }
  return (
    <AdsWorkspace
      plan={plan}
      campaigns={campaigns ?? []}
      pages={pages}
      onPageCategory={async (username, niche) => {
        await setPageCategory({ username, niche, confirmed: true });
      }}
      onCampaignCategory={async (id, niche) => {
        await setCampaignCategory({ id: id as Id<"adCampaigns">, niche });
      }}
      loading={
        !isLoaded || isLoading || (isAuthenticated && campaigns === undefined)
      }
      connectionError={isLoaded && !isLoading && (!user || !isAuthenticated)}
      onCreate={create}
      onResetDraft={() => uploaded.current.clear()}
      onToggle={async (id, status) => {
        await toggleStatus({ id: id as Id<"adCampaigns">, status });
      }}
      onDelete={async (id) => {
        await deleteCampaign({ id: id as Id<"adCampaigns"> });
      }}
    />
  );
}
