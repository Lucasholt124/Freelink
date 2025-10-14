// /lib/sessionTracking.ts
import { useEffect } from "react";
interface SessionData {
  sessionId: string;
  startTime: number;
  lastActivityTime: number;
  pageViews: number;
  linkId: string;
  userId: string;
}

class SessionTracker {
  private static instance: SessionTracker;
  private sessions: Map<string, SessionData> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  static getInstance(): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker();
    }
    return SessionTracker.instance;
  }

  startSession(linkId: string, userId: string): string {
    const sessionId = this.generateSessionId();
    const sessionData: SessionData = {
      sessionId,
      startTime: Date.now(),
      lastActivityTime: Date.now(),
      pageViews: 1,
      linkId,
      userId
    };

    this.sessions.set(sessionId, sessionData);
    this.saveToStorage(sessionId, sessionData);
    this.trackActivity(sessionId);

    return sessionId;
  }

  trackActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId) || this.loadFromStorage(sessionId);

    if (session) {
      session.lastActivityTime = Date.now();
      session.pageViews++;
      this.sessions.set(sessionId, session);
      this.saveToStorage(sessionId, session);
    }
  }

  getSessionDuration(sessionId: string): number {
    const session = this.sessions.get(sessionId) || this.loadFromStorage(sessionId);
    if (!session) return 0;

    return session.lastActivityTime - session.startTime;
  }

  getAverageTimeOnPage(sessionId: string): number {
    const session = this.sessions.get(sessionId) || this.loadFromStorage(sessionId);
    if (!session) return 0;

    const duration = this.getSessionDuration(sessionId);
    return duration / session.pageViews;
  }

  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId) || this.loadFromStorage(sessionId);

    if (session) {
      // Enviar dados para o servidor
      this.sendSessionData(session);

      // Limpar dados locais
      this.sessions.delete(sessionId);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`session_${sessionId}`);
      }
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(sessionId: string, data: SessionData): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`session_${sessionId}`, JSON.stringify(data));
    }
  }

  private loadFromStorage(sessionId: string): SessionData | null {
    if (typeof window === 'undefined') return null;

    const data = sessionStorage.getItem(`session_${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  private async sendSessionData(session: SessionData): Promise<void> {
    try {
      await fetch('/api/track-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          linkId: session.linkId,
          userId: session.userId,
          duration: session.lastActivityTime - session.startTime,
          pageViews: session.pageViews,
          avgTimePerPage: (session.lastActivityTime - session.startTime) / session.pageViews
        })
      });
    } catch (error) {
      console.error('Failed to send session data:', error);
    }
  }

  // Limpar sessões expiradas
  cleanupExpiredSessions(): void {
    const now = Date.now();

    this.sessions.forEach((session, sessionId) => {
      if (now - session.lastActivityTime > this.SESSION_TIMEOUT) {
        this.endSession(sessionId);
      }
    });
  }
}

export const sessionTracker = SessionTracker.getInstance();

// Hook para usar no React
export function useSessionTracking(linkId: string, userId: string) {
  useEffect(() => {
    // Iniciar sessão
    const sessionId = sessionTracker.startSession(linkId, userId);

    // Rastrear atividade do mouse/teclado
    const trackActivity = () => sessionTracker.trackActivity(sessionId);
    window.addEventListener('mousemove', trackActivity);
    window.addEventListener('keypress', trackActivity);
    window.addEventListener('scroll', trackActivity);
    window.addEventListener('click', trackActivity);

    // Limpar ao sair
    const cleanup = () => sessionTracker.endSession(sessionId);
    window.addEventListener('beforeunload', cleanup);

    // Limpar sessões expiradas a cada 5 minutos
    const intervalId = setInterval(() => {
      sessionTracker.cleanupExpiredSessions();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('mousemove', trackActivity);
      window.removeEventListener('keypress', trackActivity);
      window.removeEventListener('scroll', trackActivity);
      window.removeEventListener('click', trackActivity);
      window.removeEventListener('beforeunload', cleanup);
      clearInterval(intervalId);
      cleanup();
    };
  }, [linkId, userId]);
}