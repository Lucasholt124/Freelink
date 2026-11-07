"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Globe,
  Link2,
  Mail,
  Moon,
  Phone,
  QrCode,
  Share2,
  Star,
  Sun,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaSpotify,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa6";
import {
  accentText,
  linkDestination,
  profileAccent,
  profileBadges,
  profileBio,
  publicLinkUrl,
} from "@/lib/public-profile";
import styles from "./public-profile.module.css";

export interface ProfileLink {
  _id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  isFeatured?: boolean;
  badgeType?: keyof typeof profileBadges;
}
export interface ProfileAppearance {
  displayName?: string;
  description?: string;
  profilePictureUrl?: string;
  accentColor?: string;
  backgroundType?: "color" | "gradient" | "image";
  backgroundStyle?: "full" | "header";
  backgroundColor1?: string;
  backgroundColor2?: string;
  backgroundImageUrl?: string;
  backgroundImageBlur?: number;
  backgroundImageOpacity?: number;
}
interface ProfileViewProps {
  embedded?: boolean;
  username: string;
  profile: ProfileAppearance | null;
  links: ProfileLink[];
  plan: "free" | "pro" | "ultra";
  dark: boolean;
  feedback: string;
  onTheme: () => void;
  onShare: () => void;
  onQr: () => void;
  onLink: (link: ProfileLink) => void;
  children?: ReactNode;
}

function DestinationIcon({ url }: { url: string }) {
  const icons = {
    WhatsApp: FaWhatsapp,
    Instagram: FaInstagram,
    YouTube: FaYoutube,
    TikTok: FaTiktok,
    Facebook: FaFacebook,
    LinkedIn: FaLinkedin,
    Spotify: FaSpotify,
    Telegram: FaTelegram,
    "E-mail": Mail,
    Telefone: Phone,
  };
  const destination = linkDestination(url);
  const Icon = icons[destination as keyof typeof icons] || Globe;
  return <Icon size={21} aria-hidden="true" />;
}

export default function ProfileView({
  embedded = false,
  username,
  profile,
  links,
  plan,
  dark,
  feedback,
  onTheme,
  onShare,
  onQr,
  onLink,
  children,
}: ProfileViewProps) {
  const name = profile?.displayName?.trim() || `@${username}`;
  const accent = profileAccent(profile?.accentColor);
  const { bio, status } = profileBio(profile?.description || "");
  const image =
    profile?.backgroundType === "image" && profile.backgroundImageUrl;
  const headerImage = profile?.backgroundStyle === "header" ? image : null;
  const colors =
    profile?.backgroundType === "gradient"
      ? `linear-gradient(145deg, ${profileAccent(profile.backgroundColor1)}, ${profileAccent(profile.backgroundColor2 || profile.backgroundColor1)})`
      : profile?.backgroundType === "color" && profile.backgroundColor1
        ? profileAccent(profile.backgroundColor1)
        : undefined;
  const initials = name
    .replace(/^@/, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase();
  const variables = {
    "--profile-accent": accent,
    "--profile-accent-text": accentText(accent),
    background: colors,
  } as CSSProperties;
  const imageStyle = {
    filter: `blur(${Math.min(20, Math.max(0, profile?.backgroundImageBlur || 0))}px)`,
    opacity:
      Math.min(100, Math.max(0, profile?.backgroundImageOpacity ?? 100)) / 100,
  };

  return (
    <div
      className={`${styles.page} ${dark ? styles.dark : ""} ${embedded ? styles.embedded : ""}`}
      style={variables}
    >
      <a className={styles.skipLink} href="#profile-links">
        Ir para os links de {name}
      </a>
      {image && !headerImage && (
        <div className={styles.backgroundImage} aria-hidden="true">
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            style={imageStyle}
          />
          <div />
        </div>
      )}
      <div className={styles.canvas}>
        <article
          className={`${styles.profile} ${plan !== "free" ? styles.withoutAttribution : ""}`}
          aria-labelledby="profile-name"
        >
          <div
            className={`${styles.cover} ${headerImage ? styles.photoCover : styles.brandCover}`}
            aria-hidden="true"
          >
            {headerImage ? (
              <>
                <Image
                  src={headerImage}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 620px"
                  style={imageStyle}
                />
                <div />
              </>
            ) : (
              <>
                <span />
                <span />
              </>
            )}
          </div>
          <div className={styles.toolbar} aria-label="Opções deste perfil">
            <button
              type="button"
              className={styles.utilityButton}
              onClick={onTheme}
              aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
              title={dark ? "Usar tema claro" : "Usar tema escuro"}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div>
              <button
                type="button"
                className={styles.utilityButton}
                onClick={onQr}
                aria-label="Ver QR Code do perfil"
                title="Ver QR Code"
              >
                <QrCode size={17} />
              </button>
              <button
                type="button"
                className={styles.utilityButton}
                onClick={onShare}
                aria-label="Compartilhar este perfil"
                title="Compartilhar perfil"
              >
                <Share2 size={17} />
              </button>
            </div>
          </div>
          <header
            className={`${styles.identity} ${headerImage ? styles.withCover : ""}`}
          >
            <div className={styles.avatar}>
              {profile?.profilePictureUrl ? (
                <Image
                  src={profile.profilePictureUrl}
                  alt={`Foto de ${name}`}
                  width={112}
                  height={112}
                  priority
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <h1 id="profile-name">{name}</h1>
            {profile?.displayName?.trim() && (
              <p className={styles.handle}>@{username}</p>
            )}
            {bio && <p className={styles.bio}>{bio}</p>}
            {status && (
              <p className={styles.ownerStatus}>
                <span aria-hidden="true" />
                {status}
              </p>
            )}
          </header>
          <main
            id="profile-links"
            className={styles.links}
            tabIndex={-1}
            aria-label={`Links de ${name}`}
          >
            {links.length > 0 && (
              <p className={styles.linksEyebrow}>
                <span />
                LINKS E CONTATO
                <span />
              </p>
            )}
            {links.length ? (
              <ol className={styles.linkList}>
                {links.map((link) => {
                  const href = publicLinkUrl(link.url);
                  const label = (
                    <>
                      <span className={styles.linkIcon}>
                        {link.thumbnailUrl ? (
                          <Image
                            src={link.thumbnailUrl}
                            alt=""
                            width={48}
                            height={48}
                          />
                        ) : (
                          <DestinationIcon url={link.url} />
                        )}
                      </span>
                      <span className={styles.linkText}>
                        <span className={styles.linkTitle}>{link.title}</span>
                        <span className={styles.destination}>
                          {linkDestination(link.url)}
                        </span>
                      </span>
                      {link.badgeType ? (
                        <span className={styles.badge}>
                          {profileBadges[link.badgeType]}
                        </span>
                      ) : link.isFeatured ? (
                        <Star
                          size={14}
                          className={styles.featuredStar}
                          aria-label="Em destaque"
                        />
                      ) : null}
                      <ArrowUpRight
                        size={19}
                        className={styles.linkArrow}
                        aria-hidden="true"
                      />
                    </>
                  );
                  return (
                    <li key={link._id}>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.linkCard} ${link.isFeatured ? styles.featured : ""}`}
                          onClick={() => onLink(link)}
                        >
                          {label}
                        </a>
                      ) : (
                        <div
                          className={`${styles.linkCard} ${styles.unavailable}`}
                          aria-disabled="true"
                        >
                          {label}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className={styles.empty}>
                <Link2 size={27} aria-hidden="true" />
                <h2>Novidades a caminho.</h2>
                <p>Os links deste perfil aparecerão aqui.</p>
              </div>
            )}
          </main>
          <p className={styles.feedback} role="status" aria-live="polite">
            {feedback}
          </p>
          {children}
          {plan === "free" && (
            <footer
              className={styles.attribution}
              aria-label="Sobre a plataforma Freelinnk"
            >
              <span className={styles.madeWith}>
                <Link2 size={13} aria-hidden="true" />
                Feito com <strong>Freelinnk</strong>
              </span>
              <p>Quer uma página como esta?</p>
              <a href="/" target="_blank" rel="noopener noreferrer">
                Conheça o Freelinnk
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
}
