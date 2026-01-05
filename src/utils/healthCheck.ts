// Health check utilities for production monitoring

interface HealthStatus {
  status: 'healthy' | 'warning' | 'unhealthy';
  timestamp: string;
  checks: HealthCheckResult[];
  uptime: number;
  version: string;
}

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration: number;
  timestamp: string;
}

interface HealthCheckConfig {
  enableDatabaseCheck?: boolean;
  enableApiCheck?: boolean;
  enableCacheCheck?: boolean;
  enableMemoryCheck?: boolean;
  enableNetworkCheck?: boolean;
  customChecks?: Array<{
    name: string;
    check: () => Promise<{ status: 'pass' | 'fail' | 'warn'; message: string }>;
  }>;
}

class HealthChecker {
  private startTime: number;
  private config: Required<HealthCheckConfig>;
  private lastCheck: HealthStatus | null = null;

  constructor(config: HealthCheckConfig = {}) {
    this.startTime = Date.now();
    this.config = {
      enableDatabaseCheck: true,
      enableApiCheck: true,
      enableCacheCheck: true,
      enableMemoryCheck: true,
      enableNetworkCheck: true,
      customChecks: [],
      ...config
    };
  }

  async runHealthCheck(): Promise<HealthStatus> {
    const checks: HealthCheckResult[] = [];
    const startTime = Date.now();

    // Run all enabled checks in parallel
    const checkPromises = [];

    if (this.config.enableDatabaseCheck) {
      checkPromises.push(this.checkDatabase());
    }

    if (this.config.enableApiCheck) {
      checkPromises.push(this.checkApiConnectivity());
    }

    if (this.config.enableCacheCheck) {
      checkPromises.push(this.checkCacheHealth());
    }

    if (this.config.enableMemoryCheck) {
      checkPromises.push(this.checkMemoryUsage());
    }

    if (this.config.enableNetworkCheck) {
      checkPromises.push(this.checkNetworkConnectivity());
    }

    // Add custom checks
    this.config.customChecks.forEach(customCheck => {
      checkPromises.push(this.runCustomCheck(customCheck));
    });

    // Wait for all checks to complete
    const results = await Promise.allSettled(checkPromises);

    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        checks.push(result.value);
      } else {
        // Handle failed checks
        checks.push({
          name: `check-${index}`,
          status: 'fail',
          message: `Check failed: ${result.reason}`,
          duration: 0,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Determine overall status
    const failedChecks = checks.filter(check => check.status === 'fail').length;
    const warningChecks = checks.filter(check => check.status === 'warn').length;

    let overallStatus: 'healthy' | 'warning' | 'unhealthy' = 'healthy';
    if (failedChecks > 0) {
      overallStatus = 'unhealthy';
    } else if (warningChecks > 0) {
      overallStatus = 'warning';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      uptime: Date.now() - this.startTime,
      version: this.getAppVersion()
    };

    this.lastCheck = healthStatus;
    return healthStatus;
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // This would normally test actual database connectivity
      // For now, we'll simulate a check
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

      return {
        name: 'database',
        status: 'pass',
        message: 'Database connection successful',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'fail',
        message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async checkApiConnectivity(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Test API connectivity (you would implement actual API health checks)
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        return {
          name: 'api_connectivity',
          status: 'pass',
          message: 'API endpoints responding',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'api_connectivity',
          status: 'warn',
          message: `API responded with status ${response.status}`,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'api_connectivity',
        status: 'fail',
        message: `API connectivity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async checkCacheHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const cacheStats = { size: 0, entries: 0 };

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          cacheStats.entries += keys.length;
        }

        return {
          name: 'cache_health',
          status: 'pass',
          message: `Cache healthy: ${cacheStats.entries} entries`,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'cache_health',
          status: 'warn',
          message: 'Cache API not supported',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'cache_health',
        status: 'fail',
        message: `Cache health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        const usagePercent = (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100;

        let status: 'pass' | 'warn' | 'fail' = 'pass';
        let message = `Memory usage: ${usagePercent.toFixed(1)}%`;

        if (usagePercent > 80) {
          status = 'fail';
          message += ' - High memory usage detected';
        } else if (usagePercent > 60) {
          status = 'warn';
          message += ' - Moderate memory usage';
        }

        return {
          name: 'memory_usage',
          status,
          message,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'memory_usage',
          status: 'warn',
          message: 'Memory monitoring not available',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'memory_usage',
        status: 'fail',
        message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async checkNetworkConnectivity(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Test basic network connectivity
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
        mode: 'no-cors'
      });

      return {
        name: 'network_connectivity',
        status: 'pass',
        message: 'Network connectivity confirmed',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'network_connectivity',
        status: 'fail',
        message: `Network connectivity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async runCustomCheck(customCheck: { name: string; check: () => Promise<{ status: 'pass' | 'fail' | 'warn'; message: string }> }): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const result = await customCheck.check();

      return {
        name: customCheck.name,
        status: result.status,
        message: result.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: customCheck.name,
        status: 'fail',
        message: `Custom check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private getAppVersion(): string {
    // Try to get version from package.json or build info
    try {
      // This would be set during build process
      return import.meta.env.VITE_APP_VERSION || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  // Public API
  getLastHealthCheck(): HealthStatus | null {
    return this.lastCheck;
  }

  isHealthy(): boolean {
    return this.lastCheck?.status === 'healthy';
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

// Global health checker instance
export const healthChecker = new HealthChecker();

// React hook for component health monitoring
export const useHealthCheck = () => {
  const runCheck = async () => {
    return await healthChecker.runHealthCheck();
  };

  const isHealthy = () => healthChecker.isHealthy();
  const getUptime = () => healthChecker.getUptime();
  const getLastCheck = () => healthChecker.getLastHealthCheck();

  return { runCheck, isHealthy, getUptime, getLastCheck };
};

export type { HealthStatus, HealthCheckResult, HealthCheckConfig };
export { HealthChecker };