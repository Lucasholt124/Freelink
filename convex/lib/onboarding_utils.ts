export interface OnboardingProgress {
  completed: boolean;
  currentStep: number;
  hasSeenWelcome?: boolean;
}

export function resolveOnboardingStatus(
  progress: OnboardingProgress | null,
  hasLegacyData: boolean,
) {
  if (progress) {
    return {
      completed: progress.completed,
      currentStep: progress.completed
        ? 4
        : Math.max(1, Math.min(4, progress.currentStep)),
      hasSeenWelcome: progress.hasSeenWelcome ?? progress.completed,
      isExistingUser: false,
    };
  }
  return {
    completed: hasLegacyData,
    currentStep: hasLegacyData ? 4 : 1,
    hasSeenWelcome: hasLegacyData,
    isExistingUser: hasLegacyData,
  };
}

export function onboardingSteps(currentStep: number, completed = false) {
  return ["Perfil", "Endereço", "Primeiro link", "Conclusão"].map(
    (name, index) => ({
      step: index + 1,
      name,
      completed: completed || index + 1 < currentStep,
    }),
  );
}

export function usernameError(value: string): string | null {
  if (value.length < 3 || value.length > 30)
    return "Escolha um endereço com 3 a 30 caracteres.";
  if (!/^[a-z0-9_-]+$/.test(value))
    return "Use letras, números, hífen ou sublinhado, sem espaços ou pontos.";
  return null;
}

export function normalizeLinkUrl(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  const candidate = text.startsWith("//")
    ? `https:${text}`
    : /^[a-z][a-z\d+.-]*:/i.test(text)
      ? text
      : `https://${text}`;
  try {
    const url = new URL(candidate);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost")
      return null;
    return url.href;
  } catch {
    return null;
  }
}
