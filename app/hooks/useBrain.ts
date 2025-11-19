// app/hooks/useBrain.ts - HOOK CUSTOMIZADO PARA BRAIN (CORRIGIDO)
"use client";

import { useQuery, useMutation, useAction, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePushNotifications } from "./usePushNotifications";

// ============================================
// CAMPANHAS (AGORA PAGINADO)
// ============================================
export function useBrainCampaigns() {
  // ✅ CORREÇÃO: Trocamos useQuery por usePaginatedQuery
  // O backend 'listCampaigns' agora exige paginação, então este hook deve refletir isso.
  const {
    results: campaigns,
    status,
    loadMore
  } = usePaginatedQuery(
    api.brainCampaigns.listCampaigns,
    {}, // Argumentos da query (vazio pois só tem paginationOpts)
    { initialNumItems: 20 } // Carrega 20 por vez
  );

  const currentCampaign = useQuery(api.brainCampaigns.getCurrentCampaign);

  const createCampaign = useMutation(api.brainCampaigns.createCampaign);
  const updateCampaign = useMutation(api.brainCampaigns.updateCampaign);
  const deleteCampaign = useMutation(api.brainCampaigns.deleteCampaign);

  return {
    campaigns,        // Lista atual de campanhas
    campaignsStatus: status, // Para saber se está carregando
    loadMoreCampaigns: loadMore, // Função para botão "Carregar Mais"
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
  // ✅ MANTIDO: Passando objeto vazio como segundo argumento
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
  const generateIdeas = useAction(api.brain.generateContentIdeas);

  return {
    generateIdeas,
  };
}

// ============================================
// ALIAS PARA COMPATIBILIDADE
// ============================================
/**
 * @deprecated Use useNotificationIntegration()
 */
export function useBufferIntegration() {
  return useNotificationIntegration();
}