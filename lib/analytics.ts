// lib/analytics.ts
// Click tracking was removed. This function is a no-op stub to avoid breaking imports.

import { ClientTrackingData } from './types';

export async function trackLinkClick(_event: ClientTrackingData): Promise<void> {
  // No-op: click tracking was removed.
  try {
    return;
  } catch {
    // Silently ignore
  }
}