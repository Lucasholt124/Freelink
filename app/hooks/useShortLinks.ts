// hooks/useShortLinks.ts
import { useState, useEffect, useCallback } from 'react';

interface ShortLink {
  id: string;
  url: string;
  title: string;
  clicks: number;
  createdAt: number;
}

interface LinkClick {
  id: string;
  timestamp: number;
  country: string | null;
  visitorId: string;
  userAgent: string | null;
  referrer: string | null;
}

interface LinkDetails {
  link: {
    id: string;
    url: string;
    title: string;
    createdAt: number;
  };
  clicks: LinkClick[];
}

export function useShortLinks() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shortlinks/list');

      if (!response.ok) {
        throw new Error('Erro ao carregar links');
      }

      const data = await response.json();
      setLinks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const createLink = async (originalUrl: string, customSlug?: string) => {
    try {
      const response = await fetch('/api/shortlinks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl, customSlug }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar link');
      }

      const newLink = await response.json();
      await fetchLinks(); // Recarregar lista
      return newLink;
    } catch (err) {
      throw err;
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/shortlinks/${linkId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar link');
      }

      await fetchLinks(); // Recarregar lista
      return true;
    } catch (err) {
      throw err;
    }
  };

  return {
    links,
    loading,
    error,
    createLink,
    deleteLink,
    refetch: fetchLinks,
  };
}

export function useLinkClicks(linkId: string) {
  const [data, setData] = useState<LinkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClicks() {
      if (!linkId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/shortlinks/${linkId}/clicks`);

        if (!response.ok) {
          throw new Error('Erro ao carregar cliques');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchClicks();
  }, [linkId]);

  return { data, loading, error };
}