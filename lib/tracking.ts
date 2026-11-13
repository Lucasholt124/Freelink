export type TrackingValues = {
  facebookPixelId: string;
  googleAnalyticsId: string;
};
export type TrackingField = keyof TrackingValues;
export type TrackingPage = {
  id: string;
  name: string;
  username: string;
  isMain: boolean;
  color: string;
};
export type TrackingDraft = {
  base: TrackingValues;
  values: TrackingValues;
  remote?: TrackingValues;
};
export const trackingPlatforms = {
  facebookPixelId: {
    name: "Meta Pixel",
    label: "ID do Pixel",
    placeholder: "Ex.: 123456789012345",
    url: "https://business.facebook.com/events_manager2/",
    destination: "Abrir Gerenciador de Eventos",
    description:
      "Conecte a visita à sua página à fonte de dados usada nos seus anúncios da Meta.",
  },
  googleAnalyticsId: {
    name: "Google Analytics 4",
    label: "ID de medição do GA4",
    placeholder: "Ex.: G-XXXXXXXXXX",
    url: "https://analytics.google.com/analytics/web/",
    destination: "Abrir Google Analytics",
    description:
      "Associe os acessos à sua página ao fluxo da Web na sua propriedade do GA4.",
  },
} as const;
export function trackingValues(
  value?: Partial<TrackingValues> | null,
): TrackingValues {
  return {
    facebookPixelId: (value?.facebookPixelId ?? "").trim(),
    googleAnalyticsId: (value?.googleAnalyticsId ?? "").trim().toUpperCase(),
  };
}
export function trackingErrors(value: TrackingValues) {
  const clean = trackingValues(value),
    errors: Partial<Record<TrackingField, string>> = {};
  if (clean.facebookPixelId && !/^\d{1,32}$/.test(clean.facebookPixelId))
    errors.facebookPixelId =
      "Cole apenas o ID numérico do Pixel, sem código ou espaços entre os números.";
  if (
    clean.googleAnalyticsId &&
    !/^G-[A-Z0-9]{4,32}$/.test(clean.googleAnalyticsId)
  )
    errors.googleAnalyticsId =
      "Use o ID de medição do GA4 que começa com G-. Não cole código de instalação ou IDs GTM-, AW- e UA-.";
  return errors;
}
export function sameTracking(first: TrackingValues, second: TrackingValues) {
  const a = trackingValues(first),
    b = trackingValues(second);
  return (
    a.facebookPixelId === b.facebookPixelId &&
    a.googleAnalyticsId === b.googleAnalyticsId
  );
}
export function trackingChanged(draft: TrackingDraft) {
  return !sameTracking(draft.base, draft.values);
}
export function removedTracking(
  base: TrackingValues,
  values: TrackingValues,
): TrackingField[] {
  const a = trackingValues(base),
    b = trackingValues(values);
  return (["facebookPixelId", "googleAnalyticsId"] as const).filter(
    (field) => a[field] && !b[field],
  );
}
export function syncTrackingDraft(
  existing: TrackingDraft | undefined,
  incoming: TrackingValues,
): TrackingDraft {
  const clean = trackingValues(incoming);
  if (
    !existing ||
    !trackingChanged(existing) ||
    sameTracking(existing.values, clean)
  )
    return { base: clean, values: clean };
  if (sameTracking(existing.base, clean)) return existing;
  return { ...existing, remote: clean };
}
export function trackingFieldStatus(
  draft: TrackingDraft,
  field: TrackingField,
) {
  const saved = trackingValues(draft.base)[field],
    value = trackingValues(draft.values)[field];
  if (trackingErrors(draft.values)[field]) return "invalid";
  if (saved && !value) return "remove";
  if (saved !== value) return "pending";
  return value ? "saved" : "empty";
}
export function trackingPayload(
  pages: Pick<TrackingPage, "id">[],
  pageId: string,
  values: TrackingValues,
) {
  if (!pages.some((page) => page.id === pageId))
    throw new Error("Escolha uma página da sua conta.");
  if (Object.keys(trackingErrors(values)).length)
    throw new Error("Revise os identificadores antes de salvar.");
  const clean = trackingValues(values);
  return {
    userId: pageId,
    facebookPixelId: clean.facebookPixelId || undefined,
    googleAnalyticsId: clean.googleAnalyticsId || undefined,
  };
}
