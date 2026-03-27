// hooks/useAnalytics.ts
// Click analytics was removed. These hooks are stubs returning empty data
// to avoid breaking any remaining component imports.

export function useAnalytics() {
  return {
    data: null,
    loading: false,
    error: null,
  };
}

export function useLinkAnalytics(_linkId: string) {
  return {
    data: null,
    loading: false,
    error: null,
  };
}