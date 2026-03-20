interface UptimeData {
  uptime: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  lastCheck: Date;
  avgResponseTime: number;
  incidents: Array<{
    timestamp: Date;
    duration: number;
    reason: string;
  }>;
}

export class UptimeMonitor {
  private static instance: UptimeMonitor;
  private checkInterval: NodeJS.Timeout | null = null;

  static getInstance(): UptimeMonitor {
    if (!UptimeMonitor.instance) {
      UptimeMonitor.instance = new UptimeMonitor();
    }
    return UptimeMonitor.instance;
  }

  async checkUptime(url: string): Promise<UptimeData> {
    try {
      const response = await fetch('/api/uptime-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to check uptime:', error);
      return this.getDefaultUptimeData();
    }
  }

  startMonitoring(url: string, intervalMinutes: number = 5): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Verificar imediatamente
    this.performCheck(url);

    // Configurar verificações periódicas
    this.checkInterval = setInterval(() => {
      this.performCheck(url);
    }, intervalMinutes * 60 * 1000);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async performCheck(url: string): Promise<void> {
    const startTime = Date.now();

    try {
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors'
      });

      const responseTime = Date.now() - startTime;

      await this.recordCheck(url, true, responseTime);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.recordCheck(url, false, Date.now() - startTime, errorMessage);
    }
  }

  private async recordCheck(
    url: string,
    success: boolean,
    responseTime: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await fetch('/api/record-uptime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          success,
          responseTime,
          errorMessage,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to record uptime check:', error);
    }
  }

  private getDefaultUptimeData(): UptimeData {
    return {
      uptime: 100,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      lastCheck: new Date(),
      avgResponseTime: 0,
      incidents: []
    };
  }
}

export const uptimeMonitor = UptimeMonitor.getInstance();