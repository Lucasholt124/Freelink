// hooks/useAnalytics.ts
import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  topCountry: { name: string; clicks: number };
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  devices: { desktop: number; mobile: number; tablet: number };
  trafficSources: Array<{ name: string; clicks: number; icon: string }>;
  recentActivities: Array<{ time: string; action: string; location: string }>;
  performanceMetrics: { loadTime: number; responseTime: number; uptime: number };
  engagement: { avgTimeOnPage: number; pagesPerSession: number; returnRate: number };
  comparison: { current: number; previous: number };
}

interface LinkAnalyticsData {
  hourlyDistribution: Array<{ hour: number; clicks: number; peak: boolean }>;
  dailyTrend: Array<{ date: string; clicks: number }>;
  browsers: Array<{ name: string; count: number }>;
  operatingSystems: Array<{ name: string; count: number }>;
  referrers: Array<{ source: string; count: number }>;
  geoHeatmap: Array<{ lat: number; lng: number; intensity: number }>;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/dashboard');

        if (!response.ok) {
          throw new Error('Erro ao carregar analytics');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  return { data, loading, error };
}

export function useLinkAnalytics(linkId: string) {
  const [data, setData] = useState<LinkAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLinkAnalytics() {
      if (!linkId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/link/${linkId}`);

        if (!response.ok) {
          throw new Error('Erro ao carregar analytics do link');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchLinkAnalytics();
  }, [linkId]);

  return { data, loading, error };
}