import { Geo } from "@vercel/functions";

// Client-side data that gets sent from the browser
export interface ClientTrackingData {
  profileUsername: string;
  linkId: string;
  linkTitle: string;
  linkUrl: string;
  userAgent?: string;
  referrer?: string;
}

// Complete server-side tracking event with additional data
// Note: Use profileUserId for queries as usernames can change
export interface ServerTrackingEvent extends ClientTrackingData {
  profileUserId: string;
  location: Geo;
  timestamp: string;
}