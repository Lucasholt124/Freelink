
export interface LocationData {
  country?: string;
  region?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
}

// Client-side data that gets sent from the browser
export interface ClientTrackingData {
  profileUsername: string;
  linkId: string;
  linkTitle: string;
  linkUrl: string;
  userAgent?: string;
  visitorId: string;
  referrer?: string;
}

// Complete server-side tracking event with additional data
// Note: Use profileUserId for queries as usernames can change
export interface ServerTrackingEvent extends ClientTrackingData {
  profileUserId: string;
  location: LocationData; // Usa nossa nova interface
  timestamp: string;
}