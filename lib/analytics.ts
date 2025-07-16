// Remove the import since we'll define our own client-side interface
// import { TrackingEvent } from "@/app/api/track-click/route";

import { ClientTrackingData } from "./types";



export async function trackLinkClick(event: ClientTrackingData) {
  try {
    // In production, you'd send this to your Tinybird ingest endpoint
    // For now, we'll log it and you can set up the webhook later
    const trackingData = {
      profileUsername: event.profileUsername,
      linkId: event.linkId,
      linkTitle: event.linkTitle,
      linkUrl: event.linkUrl,
      userAgent: event.userAgent || navigator.userAgent,
      referrer: event.referrer || document.referrer || "direct",
    };

    console.log("Link click tracked:", trackingData);

    // Send to your API endpoint which forwards to Tinybird
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