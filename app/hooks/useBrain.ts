// app/hooks/useBrain.ts - HOOK CUSTOMIZADO PARA BRAIN (SEM BUFFER)
"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePushNotifications } from "./usePushNotifications";

// ============================================
// CAMPANHAS
// ============================================
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

// ============================================
// POSTS AGENDADOS
// ============================================
export function useScheduledPosts(campaignId?: Id<"brainCampaigns">) {
  // ✅ CORRIGIDO: Adicionado segundo argumento vazio
  const allPosts = useQuery(api.posts.listScheduledPosts, {});
  const campaignPosts = useQuery(
    api.posts.getPostsByCampaign,
    campaignId ? { campaignId } : "skip"
  );

  const createPost = useMutation(api.posts.schedulePost);
  const updatePost = useMutation(api.posts.updatePost);
  const deletePost = useMutation(api.posts.deletePost);
  const markAsCompleted = useMutation(api.posts.markAsCompleted);

  return {
    allPosts,
    campaignPosts,
    createPost,
    updatePost,
    deletePost,
    markAsCompleted,
  };
}

// ============================================
// INTEGRAÇÃO COM PUSH NOTIFICATIONS
// (SUBSTITUI O BUFFER)
// ============================================
export function useNotificationIntegration() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const subscriptions = useQuery(api.push.getUserSubscriptions);
  const notificationHistory = useQuery(api.push.getNotificationHistory);

  return {
    // Estado das notificações
    isSupported,
    isConnected: isSubscribed,
    hasProfiles: isSubscribed,
    isLoading,

    // Dados
    subscriptions,
    notificationHistory,

    // Ações
    connect: subscribe,
    disconnect: unsubscribe,
  };
}

// ============================================
// GERAÇÃO DE CONTEÚDO
// ============================================
export function useContentGeneration() {
  // ✅ CORRIGIDO: useAction para actions (não useMutation)
  const generateIdeas = useAction(api.brain.generateContentIdeas);

  return {
    generateIdeas,
  };
}

// ============================================
// ALIAS PARA COMPATIBILIDADE (REMOVA DEPOIS)
// ============================================
/**
 * @deprecated Use useNotificationIntegration() em vez disso
 * Este alias existe apenas para compatibilidade com código existente
 */
export function useBufferIntegration() {
  console.warn(
    "⚠️ useBufferIntegration está deprecated. Use useNotificationIntegration() no lugar."
  );
  return useNotificationIntegration();
}