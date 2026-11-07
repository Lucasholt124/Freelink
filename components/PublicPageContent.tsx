"use client";

import { useEffect, useState } from "react";
import {
  type Preloaded,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Script from "next/script";
import QRCode from "qrcode";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  QrCode,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { SubscriptionPlanDetails } from "@/lib/subscription";
import { trackLinkClick } from "@/lib/analytics";
import { publicLinkUrl } from "@/lib/public-profile";
import ProfileView, { type ProfileLink } from "./public-profile/ProfileView";
import styles from "./public-profile/public-profile.module.css";

interface PublicPageContentProps {
  username: string;
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksBySlug>;
  preloadedCustomizations: Preloaded<
    typeof api.lib.customizations.getCustomizationsBySlug
  >;
  plan: SubscriptionPlanDetails["plan"];
  pageOwnerNiche?: string;
}
type Consent = "granted" | "denied" | null;
type PublicAd = {
  id: Id<"adCampaigns">;
  title: string;
  text: string;
  mediaUrls: string[];
  mediaTypes?: string[];
  link: string;
};
const jsValue = (value: string) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

export default function PublicPageContent({
  username,
  preloadedLinks,
  preloadedCustomizations,
  plan,
  pageOwnerNiche = "geral",
}: PublicPageContentProps) {
  const customizations = usePreloadedQuery(preloadedCustomizations);
  const links = usePreloadedQuery(preloadedLinks);
  const tracking = useQuery(api.tracking.getIdsBySlug, { slug: username });
  const [dark, setDark] = useState(false);
  const [origin, setOrigin] = useState("");
  const [feedback, setFeedback] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [qrError, setQrError] = useState(false);
  const [qrRetry, setQrRetry] = useState(0);
  const [consent, setConsent] = useState<Consent>(null);
  const profileUrl = origin ? `${origin}/${encodeURIComponent(username)}` : "";
  const hasTracking = !!(
    tracking?.googleAnalyticsId || tracking?.facebookPixelId
  );

  useEffect(() => {
    setOrigin(window.location.origin);
    let preferred: string | null = null;
    try {
      preferred = localStorage.getItem(`freelinnk-profile-theme:${username}`);
      const saved = localStorage.getItem("freelinnk_cookie_consent");
      setConsent(saved === "granted" || saved === "denied" ? saved : null);
    } catch {
      /* The profile remains usable without storage. */
    }
    setDark(
      preferred
        ? preferred === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
  }, [username]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(""), 4500);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!qrOpen || !profileUrl) return;
    let active = true;
    setQrImage("");
    setQrError(false);
    // Generate locally only after the visitor requests it.
    QRCode.toDataURL(profileUrl, {
      width: 320,
      margin: 3,
      color: { dark: "#25202d", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setQrImage(url);
      })
      .catch(() => {
        if (active) setQrError(true);
      });
    return () => {
      active = false;
    };
  }, [qrOpen, profileUrl, qrRetry]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem(
        `freelinnk-profile-theme:${username}`,
        next ? "dark" : "light",
      );
    } catch {
      /* Optional preference. */
    }
  }
  async function shareProfile() {
    if (!profileUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: customizations?.displayName || `@${username}`,
          url: profileUrl,
        });
        setFeedback("Perfil compartilhado.");
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setFeedback("Endereço do perfil copiado.");
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        setFeedback("Não foi possível compartilhar. Tente novamente.");
    }
  }
  function trackOwnerLink(link: ProfileLink) {
    // Tracking must never prevent the visitor from opening the owner's link.
    try {
      let visitorId = localStorage.getItem("visitorId");
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("visitorId", visitorId);
      }
      void trackLinkClick({
        profileUsername: username,
        linkId: link._id,
        linkTitle: link.title,
        linkUrl: link.url,
        visitorId,
      }).catch(() => {});
    } catch {
      /* Continue normal anchor navigation. */
    }
  }
  function chooseConsent(next: Exclude<Consent, null>) {
    setConsent(next);
    try {
      localStorage.setItem("freelinnk_cookie_consent", next);
    } catch {
      /* Consent still applies for this visit. */
    }
    const analyticsWindow = window as Window & {
      gtag?: (...args: unknown[]) => void;
      fbq?: (...args: unknown[]) => void;
    };
    analyticsWindow.gtag?.("consent", "update", {
      analytics_storage: next,
      ad_storage: next,
    });
    analyticsWindow.fbq?.("consent", next === "granted" ? "grant" : "revoke");
  }

  return (
    <>
      <ProfileView
        username={username}
        profile={customizations}
        links={links}
        plan={plan}
        dark={dark}
        feedback={feedback}
        onTheme={toggleTheme}
        onShare={shareProfile}
        onQr={() => setQrOpen(true)}
        onLink={trackOwnerLink}
      >
        {plan !== "ultra" && <ProfileAd plan={plan} niche={pageOwnerNiche} />}
        {hasTracking && (
          <section
            className={styles.privacy}
            aria-label="Preferências de privacidade"
          >
            {consent === null ? (
              <>
                <h2>Sobre sua privacidade</h2>
                <p>
                  Este perfil utiliza ferramentas para medir visitas. Você pode
                  aceitar ou continuar sem essa medição.
                </p>
                <div>
                  <button type="button" onClick={() => chooseConsent("denied")}>
                    Continuar sem aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseConsent("granted")}
                  >
                    Aceitar medição
                  </button>
                </div>
              </>
            ) : (
              <details>
                <summary>Preferências de privacidade</summary>
                <p>
                  {consent === "granted"
                    ? "Você permitiu a medição de visitas neste navegador."
                    : "Você optou por continuar sem a medição de visitas."}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    chooseConsent(consent === "granted" ? "denied" : "granted")
                  }
                >
                  {consent === "granted"
                    ? "Recusar medição"
                    : "Aceitar medição"}
                </button>
              </details>
            )}
          </section>
        )}
      </ProfileView>

      <Dialog.Root open={qrOpen} onOpenChange={setQrOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content
            className={styles.qrDialog}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              document
                .querySelector<HTMLButtonElement>(
                  'button[aria-label="Ver QR Code do perfil"]',
                )
                ?.focus();
            }}
          >
            <Dialog.Close asChild>
              <button
                type="button"
                className={styles.dialogClose}
                aria-label="Fechar QR Code"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
            <span className={styles.qrIcon}>
              <QrCode size={21} aria-hidden="true" />
            </span>
            <Dialog.Title>Leve este perfil com você.</Dialog.Title>
            <Dialog.Description>
              Aponte a câmera para abrir a página de @{username}.
            </Dialog.Description>
            <div className={styles.qrImage}>
              {qrImage ? (
                <img
                  src={qrImage}
                  alt={`QR Code para abrir o perfil de ${username}`}
                  width={256}
                  height={256}
                />
              ) : qrError ? (
                <p role="alert">
                  Não foi possível gerar o QR Code.
                  <button
                    type="button"
                    onClick={() => setQrRetry((value) => value + 1)}
                  >
                    Tentar novamente
                  </button>
                </p>
              ) : (
                <p role="status">Preparando QR Code…</p>
              )}
            </div>
            {qrImage && (
              <a
                className={styles.downloadQr}
                href={qrImage}
                download={`${username}-qrcode.png`}
              >
                <Download size={16} aria-hidden="true" />
                Baixar QR Code
              </a>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {consent === "granted" && (
        <>
          {tracking?.googleAnalyticsId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tracking.googleAnalyticsId)}`}
                strategy="afterInteractive"
              />
              <Script
                id={`profile-ga-${username}`}
                strategy="afterInteractive"
              >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${jsValue(tracking.googleAnalyticsId)});`}</Script>
            </>
          )}
          {tracking?.facebookPixelId && (
            <Script
              id={`profile-pixel-${username}`}
              strategy="afterInteractive"
            >{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${jsValue(tracking.facebookPixelId)});fbq('track','PageView');`}</Script>
          )}
        </>
      )}
    </>
  );
}

function ProfileAd({ plan, niche }: { plan: "free" | "pro"; niche: string }) {
  const fetchAd = useMutation(api.ads.getAdForPublicPage);
  const registerAdClick = useMutation(api.ads.registerAdClick);
  const [ad, setAd] = useState<PublicAd | null>(null);
  const [media, setMedia] = useState(0);
  useEffect(() => {
    let active = true;
    setAd(null);
    setMedia(0);
    const timer = setTimeout(() => {
      void fetchAd({ pageOwnerNiche: niche, pageOwnerPlan: plan })
        .then((result) => {
          if (active && result?.id) setAd(result);
        })
        .catch(() => {});
    }, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fetchAd, niche, plan]);
  const href = ad && publicLinkUrl(ad.link);
  if (!ad || !href) return null;
  const mediaUrl = ad.mediaUrls[media];
  return (
    <aside
      className={styles.sponsor}
      aria-label="Publicidade da rede Freelinnk"
    >
      <p className={styles.sponsorLabel}>PUBLICIDADE · REDE FREELINNK</p>
      <div className={styles.sponsorCard}>
        {mediaUrl && (
          <div className={styles.adMedia}>
            {ad.mediaTypes?.[media] === "video" ? (
              <video
                src={mediaUrl}
                controls
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <Image
                src={mediaUrl}
                alt={ad.title}
                fill
                sizes="(max-width: 640px) 90vw, 540px"
              />
            )}
            {ad.mediaUrls.length > 1 && (
              <div className={styles.mediaControls}>
                <button
                  type="button"
                  aria-label="Mídia anterior do anúncio"
                  onClick={() =>
                    setMedia(
                      (value) =>
                        (value + ad.mediaUrls.length - 1) % ad.mediaUrls.length,
                    )
                  }
                >
                  <ChevronLeft size={17} />
                </button>
                <span aria-live="polite">
                  {media + 1} / {ad.mediaUrls.length}
                </span>
                <button
                  type="button"
                  aria-label="Próxima mídia do anúncio"
                  onClick={() =>
                    setMedia((value) => (value + 1) % ad.mediaUrls.length)
                  }
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
          </div>
        )}
        <div className={styles.adCopy}>
          <h2>{ad.title}</h2>
          <p>{ad.text}</p>
          <a
            href={href}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => {
              void registerAdClick({ id: ad.id }).catch(() => {});
            }}
          >
            Conhecer anunciante
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </aside>
  );
}
