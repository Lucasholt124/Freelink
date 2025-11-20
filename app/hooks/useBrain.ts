// app/hooks/useBrain.ts - HOOK ATUALIZADO COM TODAS AS FEATURES
"use client";

import { useQuery, useMutation, useAction, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePushNotifications } from "./usePushNotifications";

// ============================================
// CAMPANHAS
// ============================================
export function useBrainCampaigns() {
  const {
    results: campaigns,
    status,
    loadMore
  } = usePaginatedQuery(
    api.brainCampaigns.listCampaigns,
    {},
    { initialNumItems: 20 }
  );

  const currentCampaign = useQuery(api.brainCampaigns.getCurrentCampaign);

  const createCampaign = useMutation(api.brainCampaigns.createCampaign);
  const updateCampaign = useMutation(api.brainCampaigns.updateCampaign);
  const deleteCampaign = useMutation(api.brainCampaigns.deleteCampaign);

  return {
    campaigns,
    campaignsStatus: status,
    loadMoreCampaigns: loadMore,
    currentCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}

// ============================================
// POSTS AGENDADOS (COM EDIÇÃO)
// ============================================
export function useScheduledPosts(campaignId?: Id<"brainCampaigns">) {
  const allPosts = useQuery(api.posts.listScheduledPosts, {});

  const campaignPosts = useQuery(
    api.posts.getPostsByCampaign,
    campaignId ? { campaignId } : "skip"
  );

  const createPost = useMutation(api.posts.schedulePost);
  const updatePost = useMutation(api.calendar.updateScheduledPost);
  const deletePost = useMutation(api.calendar.deleteScheduledPost);
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
// CALENDÁRIO CUSTOMIZÁVEL
// ============================================
export function useCalendar() {
  const createEvent = useMutation(api.calendar.createCustomEvent);
  const updateEvent = useMutation(api.calendar.updateCustomEvent);
  const deleteEvent = useMutation(api.calendar.deleteCustomEvent);
  const toggleEventStatus = useMutation(api.calendar.toggleEventStatus);

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
  };
}

// ============================================
// NOTIFICAÇÕES MULTI-CANAL
// ============================================
export function useNotificationIntegration() {
  const {
    isSupported: isPushSupported,
    isSubscribed: isPushActive,
    isLoading: isPushLoading,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushNotifications();

  // WhatsApp
  const whatsappData = useQuery(api.notifications.getWhatsAppIntegration);
  const addWhatsApp = useMutation(api.notifications.addWhatsAppIntegration);
  const verifyWhatsApp = useMutation(api.notifications.verifyWhatsApp);
  const toggleWhatsApp = useMutation(api.notifications.toggleWhatsApp);

  // SMS
  const smsData = useQuery(api.notifications.getSmsIntegration);
  const addSms = useMutation(api.notifications.addSmsIntegration);
  const verifySms = useMutation(api.notifications.verifySms);
  const toggleSms = useMutation(api.notifications.toggleSms);

  // Stats
  const stats = useQuery(api.notifications.getNotificationStats);

  // Envio
  const sendNotification = useAction(api.notifications.sendPostNotification);

  const isConnected =
    isPushActive ||
    (whatsappData?.active ?? false) ||
    (smsData?.active ?? false);

  return {
    // Push
    isPushSupported,
    isPushActive,
    isPushLoading,
    subscribePush,
    unsubscribePush,

    // WhatsApp
    whatsappData,
    addWhatsApp,
    verifyWhatsApp,
    toggleWhatsApp,

    // SMS
    smsData,
    addSms,
    verifySms,
    toggleSms,

    // Geral
    isConnected,
    hasAnyMethod: isConnected,
    stats,
    sendNotification,
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
export function useBufferIntegration() {
  return useNotificationIntegration();
}