import { ClientTrackingData } from "./types";

export async function trackLinkClick(event: ClientTrackingData) {
  try {
    // Gere ou recupere o visitorId (cookie/localStorage)
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitorId", visitorId);
    }

    const trackingData = {
      profileUsername: event.profileUsername,
      linkId: event.linkId,
      linkTitle: event.linkTitle,
      linkUrl: event.linkUrl,
      userAgent: event.userAgent || navigator.userAgent,
      referrer: event.referrer || document.referrer || "direct",
      visitorId, // <-- Envie aqui!
    };

    console.log("Link click tracked:", trackingData);

    await fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trackingData),
    });

    return trackingData;
  } catch (error) {
    console.error("Failed to track link click:", error);
  }
}