// Comprehensive performance monitoring utility
interface PerformanceMetrics {
  // Core Web Vitals
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte

  // Custom metrics
  bundleLoadTime?: number;
  apiResponseTime?: number;
  imageLoadTime?: number;
  cacheHitRate?: number;
  errorRate?: number;

  // Resource metrics
  totalResources?: number;
  cachedResources?: number;
  failedResources?: number;

  // Memory usage (if available)
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

interface PerformanceConfig {
  enableWebVitals?: boolean;
  enableResourceTracking?: boolean;
  enableErrorTracking?: boolean;
  reportInterval?: number; // How often to report metrics (ms)
  maxMetricsHistory?: number; // How many metric sets to keep
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private config: Required<PerformanceConfig>;
  private startTime: number;
  private apiCallCount = 0;
  private apiErrorCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(config: PerformanceConfig = {}) {
    this.config = {
      enableWebVitals: true,
      enableResourceTracking: true,
      enableErrorTracking: true,
      reportInterval: 30000, // 30 seconds
      maxMetricsHistory: 100,
      ...config
    };

    this.startTime = performance.now();

    this.initialize();
  }

  private initialize() {
    if (this.config.enableWebVitals) {
      this.setupWebVitalsTracking();
    }

    if (this.config.enableResourceTracking) {
      this.setupResourceTracking();
    }

    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Periodic reporting
    setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);
  }

  private setupWebVitalsTracking() {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        this.updateMetrics({ FCP: entries[0].startTime });
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.updateMetrics({ LCP: lastEntry.startTime });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const firstEntry = entries[0] as any;
        this.updateMetrics({ FID: firstEntry.processingStart - firstEntry.startTime });
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.updateMetrics({ CLS: clsValue });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private setupResourceTracking() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let cached = 0;
      let failed = 0;

      entries.forEach((entry: any) => {
        if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
          cached++;
        }
        if (entry.transferSize === 0 && entry.decodedBodySize === 0) {
          failed++;
        }
      });

      this.updateMetrics({
        totalResources: entries.length,
        cachedResources: cached,
        failedResources: failed,
        cacheHitRate: cached / entries.length
      });
    }).observe({ entryTypes: ['resource'] });
  }

  private setupErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.apiErrorCount++;
      this.updateMetrics({ errorRate: this.apiErrorCount / this.apiCallCount });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.apiErrorCount++;
      this.updateMetrics({ errorRate: this.apiErrorCount / this.apiCallCount });
    });
  }

  // Track API calls
  trackApiCall(responseTime: number, success: boolean = true) {
    this.apiCallCount++;
    if (!success) {
      this.apiErrorCount++;
    }

    this.updateMetrics({
      apiResponseTime: responseTime,
      errorRate: this.apiErrorCount / this.apiCallCount
    });
  }

  // Track cache performance
  trackCacheAccess(hit: boolean) {
    if (hit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    const total = this.cacheHits + this.cacheMisses;
    this.updateMetrics({
      cacheHitRate: this.cacheHits / total
    });
  }

  // Track image loading
  trackImageLoad(loadTime: number) {
    this.updateMetrics({ imageLoadTime: loadTime });
  }

  // Get current memory usage (Chrome only)
  private getMemoryUsage() {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return {
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        limit: mem.jsHeapSizeLimit
      };
    }
    return undefined;
  }

  private updateMetrics(newMetrics: Partial<PerformanceMetrics>) {
    const currentMetrics = this.metrics[this.metrics.length - 1] || {};
    const updatedMetrics = {
      ...currentMetrics,
      ...newMetrics,
      memoryUsage: this.getMemoryUsage(),
      timestamp: Date.now()
    };

    this.metrics.push(updatedMetrics);

    // Keep only recent metrics
    if (this.metrics.length > this.config.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.config.maxMetricsHistory);
    }
  }

  private reportMetrics() {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) return;

    // Calculate performance score (0-100)
    const score = this.calculatePerformanceScore(latestMetrics);

    const report = {
      timestamp: new Date().toISOString(),
      metrics: latestMetrics,
      score,
      sessionDuration: performance.now() - this.startTime,
      userAgent: navigator.userAgent
    };

    // Log in development
    if (import.meta.env.DEV) {
      console.log('Performance Report:', report);
    }

    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      this.sendToMonitoringService(report);
    }
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // Core Web Vitals penalties
    if (metrics.FCP && metrics.FCP > 2000) score -= 10;
    if (metrics.LCP && metrics.LCP > 2500) score -= 15;
    if (metrics.FID && metrics.FID > 100) score -= 10;
    if (metrics.CLS && metrics.CLS > 0.1) score -= 10;

    // Custom metrics penalties
    if (metrics.apiResponseTime && metrics.apiResponseTime > 1000) score -= 5;
    if (metrics.errorRate && metrics.errorRate > 0.05) score -= 10;
    if (metrics.cacheHitRate && metrics.cacheHitRate < 0.5) score -= 5;

    // Memory usage penalty
    if (metrics.memoryUsage) {
      const usagePercent = metrics.memoryUsage.used / metrics.memoryUsage.limit;
      if (usagePercent > 0.8) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private async sendToMonitoringService(report: any) {
    try {
      // Implement your monitoring service integration here
      // Example: fetch('/api/analytics/performance', { method: 'POST', body: JSON.stringify(report) });
      console.log('Performance report sent to monitoring service');
    } catch (error) {
      console.error('Failed to send performance report:', error);
    }
  }

  // Public API
  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const averages: any = {};
    const keys = Object.keys(this.metrics[0]).filter(key => typeof this.metrics[0][key as keyof PerformanceMetrics] === 'number');

    keys.forEach(key => {
      const values = this.metrics.map(m => m[key as keyof PerformanceMetrics]).filter(v => typeof v === 'number') as number[];
      averages[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return averages;
  }

  reset() {
    this.metrics = [];
    this.apiCallCount = 0;
    this.apiErrorCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.startTime = performance.now();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component-level performance tracking
export const usePerformanceTracking = (componentName: string) => {
  const startTime = performance.now();

  const trackRender = () => {
    const renderTime = performance.now() - startTime;
    if (import.meta.env.DEV) {
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }
  };

  const trackInteraction = (interactionName: string, duration: number) => {
    if (import.meta.env.DEV) {
      console.log(`${componentName} ${interactionName}: ${duration.toFixed(2)}ms`);
    }
  };

  return { trackRender, trackInteraction };
};

export type { PerformanceMetrics, PerformanceConfig };
export { PerformanceMonitor };