// hooks/useBrain.ts - HOOK CUSTOMIZADO PARA BRAIN
"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useBrainCampaigns() {
  const campaigns = useQuery(api.brainCampaigns.listCampaigns);
  const currentCampaign = useQuery(api.brainCampaigns.getCurrentCampaign);

  const createCampaign = useMutation(api.brainCampaigns.createCampaign);
  const updateCampaign = useMutation(api.brainCampaigns.updateCampaign);
  const deleteCampaign = useMutation(api.brainCampaigns.deleteCampaign);

  return {
    campaigns,
    currentCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}

export function useScheduledPosts(campaignId?: Id<"brainCampaigns">) {
  const allPosts = useQuery(api.scheduledPosts.listAllPosts);
  const campaignPosts = useQuery(
    api.scheduledPosts.listPostsByCampaign,
    campaignId ? { campaignId } : "skip"
  );

  const createPost = useMutation(api.scheduledPosts.createScheduledPost);
  const updatePost = useMutation(api.scheduledPosts.updateScheduledPost);
  const deletePost = useMutation(api.scheduledPosts.deleteScheduledPost);

  return {
    allPosts,
    campaignPosts,
    createPost,
    updatePost,
    deletePost,
  };
}

export function useBufferIntegration() {
  const integration = useQuery(api.bufferIntegration.getIntegration);

  const saveToken = useMutation(api.bufferIntegration.saveBufferToken);
  const disconnect = useMutation(api.bufferIntegration.disconnectBuffer);
  const fetchProfiles = useAction(api.bufferIntegration.fetchBufferProfiles);
  const publishPost = useAction(api.bufferIntegration.publishToBuffer);

  const isConnected = !!integration?.bufferAccessToken;
  const hasProfiles = (integration?.bufferProfiles?.length ?? 0) > 0;

  return {
    integration,
    isConnected,
    hasProfiles,
    saveToken,
    disconnect,
    fetchProfiles,
    publishPost,
  };
}

export function useContentGeneration() {
  const generateIdeas = useAction(api.brain.generateContentIdeas);

  return {
    generateIdeas,
  };
}