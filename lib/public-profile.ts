export function publicLinkUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw || /[\u0000-\u001f\u007f]/.test(value)) return null;
  if (/^mailto:/i.test(raw))
    return /^mailto:[^\s@]+@[^\s@]+(?:\?.*)?$/i.test(raw)
      ? raw.replace(/^mailto:/i, "mailto:")
      : null;
  if (/^tel:/i.test(raw))
    return /^tel:\+?[0-9() .-]+$/i.test(raw)
      ? raw.replace(/^tel:/i, "tel:")
      : null;
  if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:/i.test(raw)) return null;
  try {
    const url = new URL(
      raw.startsWith("//")
        ? `https:${raw}`
        : /^https?:/i.test(raw)
          ? raw
          : `https://${raw}`,
    );
    return ["http:", "https:"].includes(url.protocol) &&
      url.hostname &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function linkDestination(value: string) {
  const href = publicLinkUrl(value);
  if (!href) return "Link indisponível";
  if (href.startsWith("mailto:")) return "E-mail";
  if (href.startsWith("tel:")) return "Telefone";
  const host = new URL(href).hostname.replace(/^www\./, "").toLowerCase();
  const belongsTo = (domain: string) =>
    host === domain || host.endsWith(`.${domain}`);
  if (host === "wa.me" || belongsTo("whatsapp.com")) return "WhatsApp";
  if (belongsTo("instagram.com")) return "Instagram";
  if (belongsTo("youtube.com") || host === "youtu.be") return "YouTube";
  if (belongsTo("tiktok.com")) return "TikTok";
  if (belongsTo("facebook.com") || host === "fb.me") return "Facebook";
  if (belongsTo("linkedin.com")) return "LinkedIn";
  if (belongsTo("spotify.com")) return "Spotify";
  if (host === "t.me" || belongsTo("telegram.org")) return "Telegram";
  return host;
}

export function profileBio(description: string) {
  const lines = description.split("\n");
  if (/^(AVISO|STATUS):/i.test(lines[0]))
    return {
      status: lines[0].replace(/^(AVISO|STATUS):\s*/i, "").trim(),
      bio: lines.slice(1).join("\n").trim(),
    };
  return { status: "", bio: description.trim() };
}

export function profileAccent(value?: string) {
  if (/^#[\da-f]{6}$/i.test(value || "")) return value!;
  if (/^#[\da-f]{3}$/i.test(value || ""))
    return `#${value!
      .slice(1)
      .split("")
      .map((part) => part + part)
      .join("")}`;
  return "#7144e8";
}

export function accentText(value: string) {
  const color = profileAccent(value);
  const rgb = [1, 3, 5]
    .map((index) => parseInt(color.slice(index, index + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  const whiteContrast = 1.05 / (luminance + 0.05);
  const darkContrast = (luminance + 0.05) / (0.005605391624202723 + 0.05);
  if (whiteContrast >= darkContrast && whiteContrast >= 4.5) return "#ffffff";
  if (darkContrast >= 4.5) return "#111111";
  return "#000000";
}

export const profileBadges = {
  new: "Novo",
  hot: "Em alta",
  popular: "Popular",
  limited: "Por tempo limitado",
} as const;
