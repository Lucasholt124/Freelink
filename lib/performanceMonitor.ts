interface PerformanceData {
  loadTime: number;
  responseTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
}

// Adicionando tipos para as APIs de Performance
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}


export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async getPerformanceMetrics(): Promise<PerformanceData> {
    if (typeof window === 'undefined') {
      return this.getDefaultMetrics();
    }

    await this.waitForLoad();

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    // Web Vitals
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    const lcp = await this.getLargestContentfulPaint();
    const cls = await this.getCumulativeLayoutShift();
    const tbt = await this.getTotalBlockingTime();

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      responseTime: navigation.responseEnd - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstContentfulPaint: fcp ? fcp.startTime : 0,
      largestContentfulPaint: lcp,
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      totalBlockingTime: tbt,
      cumulativeLayoutShift: cls
    };
  }

  private waitForLoad(): Promise<void> {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve());
      }
    });
  }

  private getLargestContentfulPaint(): Promise<number> {
    return new Promise(resolve => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Fallback após 5 segundos
      setTimeout(() => resolve(0), 5000);
    });
  }

  private getCumulativeLayoutShift(): Promise<number> {
    return new Promise(resolve => {
      let cls = 0;

      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as LayoutShift).hadRecentInput) {
            cls += (entry as LayoutShift).value;
          }
        }
        resolve(cls);
      }).observe({ entryTypes: ['layout-shift'] });

      // Resolver após 3 segundos
      setTimeout(() => resolve(cls), 3000);
    });
  }

  private getTotalBlockingTime(): Promise<number> {
    return new Promise(resolve => {
      let tbt = 0;

      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const blockingTime = entry.duration - 50;
          if (blockingTime > 0) {
            tbt += blockingTime;
          }
        }
        resolve(tbt);
      }).observe({ entryTypes: ['long-task'] });

      // Resolver após 3 segundos
      setTimeout(() => resolve(tbt), 3000);
    });
  }

  private getDefaultMetrics(): PerformanceData {
    return {
      loadTime: 0,
      responseTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0,
      cumulativeLayoutShift: 0
    };
  }

  async sendMetricsToServer(linkId: string): Promise<void> {
    const metrics = await this.getPerformanceMetrics();

    try {
      await fetch('/api/track-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId,
          metrics,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          connection: (navigator as Navigator & { connection?: { effectiveType: string } }).connection?.effectiveType || 'unknown'
        })
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();