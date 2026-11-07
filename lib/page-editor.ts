import { profileBio, publicLinkUrl } from "./public-profile";

export const pagePalettes = [
  {
    name: "Lilás",
    accent: "#7144e8",
    background: "#f4f0fc",
    second: "#d8c9f3",
  },
  {
    name: "Verde natural",
    accent: "#17724a",
    background: "#f0f7f2",
    second: "#c9e0cf",
  },
  {
    name: "Terracota",
    accent: "#b45435",
    background: "#fcf3ed",
    second: "#edc7b3",
  },
  { name: "Azul", accent: "#2257a5", background: "#f0f5fc", second: "#c4d7ee" },
  { name: "Rosa", accent: "#a73469", background: "#fcf0f6", second: "#eac3d5" },
  {
    name: "Preto e dourado",
    accent: "#ab843a",
    background: "#1b1915",
    second: "#3e3525",
  },
] as const;

export interface AppearanceValues {
  displayName: string;
  bio: string;
  status: string;
  accentColor: string;
  backgroundType: "color" | "gradient" | "image";
  backgroundStyle: "full" | "header";
  backgroundColor1: string;
  backgroundColor2: string;
  backgroundImageBlur: number;
  backgroundImageOpacity: number;
  photoUrl: string;
  photoId?: string;
  clearPhoto: boolean;
  backgroundUrl: string;
  backgroundId?: string;
  clearBackground: boolean;
}
type SavedProfile = {
  displayName?: string;
  description?: string;
  accentColor?: string;
  backgroundType?: "color" | "gradient" | "image";
  backgroundStyle?: "full" | "header";
  backgroundColor1?: string;
  backgroundColor2?: string;
  backgroundImageBlur?: number;
  backgroundImageOpacity?: number;
  profilePictureUrl?: string;
  profilePictureStorageId?: string;
  backgroundImageUrl?: string;
  backgroundImageStorageId?: string;
};
function editableColor(value: string | undefined, fallback: string) {
  if (/^#[a-f\d]{3}$/i.test(value || ""))
    return `#${value!
      .slice(1)
      .split("")
      .map((part) => part + part)
      .join("")}`;
  return validColor(value || "") ? value! : fallback;
}
export function appearanceValues(
  profile?: SavedProfile | null,
): AppearanceValues {
  const { bio, status } = profileBio(profile?.description || "");
  return {
    displayName: profile?.displayName || "",
    bio,
    status,
    accentColor: editableColor(profile?.accentColor, "#7144e8"),
    backgroundType: profile?.backgroundType || "color",
    backgroundStyle: profile?.backgroundStyle || "full",
    backgroundColor1: editableColor(profile?.backgroundColor1, "#f4f0fc"),
    backgroundColor2: editableColor(profile?.backgroundColor2, "#d8c9f3"),
    backgroundImageBlur: profile?.backgroundImageBlur ?? 0,
    backgroundImageOpacity: profile?.backgroundImageOpacity ?? 100,
    photoUrl: profile?.profilePictureUrl || "",
    photoId: profile?.profilePictureStorageId,
    clearPhoto: false,
    backgroundUrl: profile?.backgroundImageUrl || "",
    backgroundId: profile?.backgroundImageStorageId,
    clearBackground: false,
  };
}
export function appearanceDescription(
  values: Pick<AppearanceValues, "bio" | "status">,
) {
  return values.status.trim()
    ? `AVISO: ${values.status.trim()}\n${values.bio.trim()}`
    : values.bio.trim();
}
export const validColor = (value: string) => /^#[a-f\d]{6}$/i.test(value);
export function appearanceError(values: AppearanceValues) {
  if (!values.displayName.trim() || values.displayName.trim().length > 80)
    return "Informe um nome para a página com até 80 caracteres.";
  if (values.bio.length > 160) return "A bio pode ter até 160 caracteres.";
  if (values.status.length > 80) return "O aviso pode ter até 80 caracteres.";
  if (
    ![
      values.accentColor,
      values.backgroundColor1,
      values.backgroundColor2,
    ].every(validColor)
  )
    return "Use cores no formato #123ABC.";
  if (values.backgroundType === "image" && !values.backgroundUrl)
    return "Escolha uma imagem para o fundo.";
  return "";
}
export function extraPageLimit(plan: string, isAdmin = false) {
  return isAdmin ? 999 : plan === "ultra" ? 30 : plan === "pro" ? 10 : 0;
}

export type DestinationKind =
  "site" | "whatsapp" | "instagram" | "email" | "phone";
export function buildLinkDestination(
  kind: DestinationKind,
  input: string,
  message = "",
) {
  const value = input.trim();
  if (!value) return null;
  if (kind === "whatsapp") {
    const digits = value.replace(/\D/g, "");
    if (
      !/^\+?[\d\s().-]+$/.test(value) ||
      digits.length < 8 ||
      digits.length > 15
    )
      return null;
    return `https://wa.me/${digits}${message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ""}`;
  }
  if (kind === "instagram" && !/^https?:/i.test(value)) {
    const handle = value.replace(/^@/, "");
    return /^[a-z\d_.]{1,30}$/i.test(handle)
      ? `https://www.instagram.com/${handle}/`
      : null;
  }
  if (kind === "email")
    return publicLinkUrl(/^mailto:/i.test(value) ? value : `mailto:${value}`);
  if (kind === "phone")
    return publicLinkUrl(/^tel:/i.test(value) ? value : `tel:${value}`);
  return publicLinkUrl(value);
}
export function destinationFields(raw: string): {
  kind: DestinationKind;
  address: string;
  message: string;
} {
  const fallback = { kind: "site" as const, address: raw, message: "" };
  const safe = publicLinkUrl(raw);
  if (!safe) return fallback;
  if (safe.startsWith("mailto:") && !safe.includes("?"))
    return { kind: "email", address: safe.slice(7), message: "" };
  if (safe.startsWith("tel:"))
    return { kind: "phone", address: safe.slice(4), message: "" };
  const url = new URL(safe);
  const host = url.hostname.replace(/^www\./, "");
  if (
    host === "wa.me" &&
    /^\/\d+$/.test(url.pathname) &&
    [...url.searchParams.keys()].every((key) => key === "text")
  )
    return {
      kind: "whatsapp",
      address: `+${url.pathname.slice(1)}`,
      message: url.searchParams.get("text") || "",
    };
  if (
    host === "instagram.com" &&
    /^\/[a-z\d_.]+\/?$/i.test(url.pathname) &&
    !url.search
  )
    return {
      kind: "instagram",
      address: `@${url.pathname.split("/")[1]}`,
      message: "",
    };
  return fallback;
}
export function editorError(
  error: unknown,
  fallback = "Não foi possível salvar. Tente novamente.",
) {
  const data = (error as { data?: unknown })?.data;
  return typeof data === "string" ? data : fallback;
}
