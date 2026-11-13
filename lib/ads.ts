import { networkCategories, safeAdDestination } from "./ad-policy";

export type AdPlan = "pro" | "ultra";
export type AdCampaign = {
  _id: string;
  title: string;
  productLink: string;
  adText: string;
  mediaUrls: string[];
  mediaTypes?: string[];
  niche?: string;
  status: "active" | "paused" | "completed";
  views: number;
  clicks: number;
  maxViewsLimit: number;
  lastResetMonth: string;
  createdAt: number;
};
export type CampaignDraft = {
  title: string;
  productLink: string;
  adText: string;
  niche: string;
};
export type AdMedia = { url: string; type: "image" | "video" };
export type CreateAdInput = CampaignDraft & { files: File[] };
export type UploadProgress = {
  phase: "uploading" | "saving";
  current: number;
  total: number;
  fileName?: string;
};
export const adPlanLimits = {
  pro: { campaigns: 2, media: 2, viewsPerCampaign: 1000 },
  ultra: { campaigns: 3, media: 10, viewsPerCampaign: 5000 },
} as const;
export const adCategories = networkCategories;
export const emptyAdDraft: CampaignDraft = {
  title: "",
  productLink: "",
  adText: "",
  niche: "geral",
};
export const adDestination = safeAdDestination;
export function adHost(value: string) {
  const url = adDestination(value);
  return url
    ? new URL(url).hostname.replace(/^www\./, "")
    : "Destino do anúncio";
}
export function adCategory(value?: string) {
  return adCategories.find(([id]) => id === value)?.[1] ?? value ?? "Geral";
}
export function adMonth(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
export function adViews(campaign: AdCampaign, month = adMonth()) {
  return campaign.lastResetMonth === month ? Math.max(0, campaign.views) : 0;
}
export function campaignState(campaign: AdCampaign, month = adMonth()) {
  if (
    adViews(campaign, month) >= campaign.maxViewsLimit &&
    campaign.maxViewsLimit > 0
  )
    return "limit" as const;
  if (campaign.status === "active") return "active" as const;
  if (campaign.status === "paused") return "paused" as const;
  return campaign.lastResetMonth !== month
    ? ("ready" as const)
    : ("completed" as const);
}
export function adProgress(campaign: AdCampaign, month = adMonth()) {
  return campaign.maxViewsLimit > 0
    ? Math.min(
        100,
        Math.max(0, (adViews(campaign, month) / campaign.maxViewsLimit) * 100),
      )
    : 0;
}
export function adTotals(campaigns: AdCampaign[], month = adMonth()) {
  return campaigns.reduce(
    (total, campaign) => ({
      views: total.views + adViews(campaign, month),
      clicks: total.clicks + Math.max(0, campaign.clicks),
      active:
        total.active + (campaignState(campaign, month) === "active" ? 1 : 0),
    }),
    { views: 0, clicks: 0, active: 0 },
  );
}
export function filterCampaigns(
  campaigns: AdCampaign[],
  search: string,
  status: "all" | "active" | "paused" | "limit",
  month = adMonth(),
) {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const terms = normalize(search).trim().split(/\s+/).filter(Boolean);
  return campaigns.filter(
    (campaign) =>
      (status === "all" || campaignState(campaign, month) === status) &&
      terms.every((term) =>
        normalize(
          `${campaign.title} ${campaign.adText} ${adCategory(campaign.niche)}`,
        ).includes(term),
      ),
  );
}
export function validateAdDraft(
  draft: CampaignDraft,
  fileCount: number,
  maxMedia: number,
) {
  const errors: Partial<Record<keyof CampaignDraft | "media", string>> = {};
  if (!draft.title.trim()) errors.title = "Dê um título ao anúncio.";
  else if (draft.title.trim().length > 100)
    errors.title = "Use até 100 caracteres no título.";
  if (!adDestination(draft.productLink))
    errors.productLink =
      "Cole um endereço completo começando com https:// ou http://.";
  if (!draft.adText.trim())
    errors.adText = "Escreva uma mensagem para quem encontrar o anúncio.";
  else if (draft.adText.trim().length > 1000)
    errors.adText = "Use até 1.000 caracteres no texto.";
  if (
    draft.niche === "geral" ||
    !adCategories.some(([id]) => id === draft.niche)
  )
    errors.niche = "Selecione uma categoria.";
  if (fileCount < 1)
    errors.media = "Adicione pelo menos uma imagem ou um vídeo.";
  else if (fileCount > maxMedia)
    errors.media = `Seu plano permite até ${maxMedia} mídias por campanha.`;
  return errors;
}
export function selectAdFiles(
  files: Pick<File, "name" | "type" | "size">[],
  existing: number,
  max: number,
) {
  const accepted: number[] = [];
  const errors: string[] = [];
  const images = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ];
  const videos = ["video/mp4", "video/quicktime", "video/webm"];
  files.forEach((file, index) => {
    const isImage = images.includes(file.type),
      isVideo = videos.includes(file.type);
    if (!isImage && !isVideo) {
      errors.push(`${file.name}: formato não suportado.`);
      return;
    }
    if (file.size === 0) {
      errors.push(`${file.name}: o arquivo está vazio.`);
      return;
    }
    const limit = (isVideo ? 50 : 10) * 1024 * 1024;
    if (file.size > limit) {
      errors.push(
        `${file.name}: use ${isVideo ? "vídeos de até 50 MB" : "imagens de até 10 MB"}.`,
      );
      return;
    }
    if (existing + accepted.length >= max) {
      errors.push(`Seu plano permite até ${max} mídias por campanha.`);
      return;
    }
    accepted.push(index);
  });
  return { accepted, errors: [...new Set(errors)] };
}
export function suggestedAdText(title: string) {
  return `Conheça ${title.trim()}. Veja os detalhes e saiba mais pelo link.`;
}
export function adNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}
export function adDate(value: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
