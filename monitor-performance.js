#!/usr/bin/env node

/**
 * Comprehensive Performance Monitoring Script for VideoRemix
 * Tracks API usage, costs, performance metrics, errors, and provides alerting
 */

import fs from 'fs';
import path from 'path';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      totalCost: 0,
      requestsByProvider: {},
      errorsByType: {},
      performanceMetrics: [],
      uptime: Date.now(),
      alerts: [],
      thresholds: {
        maxResponseTime: 5000, // 5 seconds
        maxErrorRate: 0.05,    // 5%
        maxCostPerHour: 10     // $10/hour
      }
    };

    // Load existing metrics if available
    this.loadExistingMetrics();
  }

  loadExistingMetrics() {
    try {
      const metricsFile = path.join(process.cwd(), 'performance-metrics.json');
      if (fs.existsSync(metricsFile)) {
        const data = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
        Object.assign(this.metrics, data);
      }
    } catch (error) {
      console.warn('Could not load existing metrics:', error.message);
    }
  }

  trackRequest(provider, cost = 0, duration = 0, success = true, endpoint = '') {
    this.metrics.totalRequests++;

    // Track by provider
    if (!this.metrics.requestsByProvider[provider]) {
      this.metrics.requestsByProvider[provider] = {
        count: 0,
        cost: 0,
        avgDuration: 0,
        successCount: 0,
        errorCount: 0,
        endpoints: {}
      };
    }

    const providerStats = this.metrics.requestsByProvider[provider];
    providerStats.count++;
    providerStats.cost += cost;

    if (success) {
      providerStats.successCount++;
    } else {
      providerStats.errorCount++;
    }

    // Update average duration
    if (duration > 0) {
      providerStats.avgDuration = (providerStats.avgDuration * (providerStats.count - 1) + duration) / providerStats.count;
    }

    // Track by endpoint
    if (endpoint) {
      if (!providerStats.endpoints[endpoint]) {
        providerStats.endpoints[endpoint] = { count: 0, avgDuration: 0 };
      }
      providerStats.endpoints[endpoint].count++;
      if (duration > 0) {
        const ep = providerStats.endpoints[endpoint];
        ep.avgDuration = (ep.avgDuration * (ep.count - 1) + duration) / ep.count;
      }
    }

    // Track performance metrics
    if (duration > 0) {
      this.metrics.performanceMetrics.push({
        timestamp: Date.now(),
        provider,
        duration,
        success,
        endpoint
      });

      // Keep only last 1000 metrics to prevent memory issues
      if (this.metrics.performanceMetrics.length > 1000) {
        this.metrics.performanceMetrics = this.metrics.performanceMetrics.slice(-1000);
      }
    }

    // Check for alerts
    this.checkAlerts(provider, duration, success);

    this.saveMetrics();
  }

  trackError(errorType, message, provider = '', endpoint = '') {
    if (!this.metrics.errorsByType[errorType]) {
      this.metrics.errorsByType[errorType] = {
        count: 0,
        messages: [],
        providers: {},
        endpoints: {}
      };
    }

    const errorStats = this.metrics.errorsByType[errorType];
    errorStats.count++;

    if (errorStats.messages.length < 10) { // Keep last 10 messages
      errorStats.messages.push({
        timestamp: Date.now(),
        message,
        provider,
        endpoint
      });
    }

    if (provider) {
      errorStats.providers[provider] = (errorStats.providers[provider] || 0) + 1;
    }

    if (endpoint) {
      errorStats.endpoints[endpoint] = (errorStats.endpoints[endpoint] || 0) + 1;
    }

    this.checkErrorRateAlerts();
    this.saveMetrics();
  }

  checkAlerts(provider, duration, success) {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);

    // Check response time threshold
    if (duration > this.metrics.thresholds.maxResponseTime) {
      this.addAlert('HIGH_RESPONSE_TIME', `Slow response from ${provider}: ${duration}ms`, 'warning');
    }

    // Check cost threshold (simplified - would need more sophisticated tracking)
    const recentMetrics = this.metrics.performanceMetrics.filter(m => m.timestamp > hourAgo);
    const hourlyCost = recentMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);

    if (hourlyCost > this.metrics.thresholds.maxCostPerHour) {
      this.addAlert('HIGH_COST', `High hourly cost: $${hourlyCost.toFixed(2)}`, 'warning');
    }
  }

  checkErrorRateAlerts() {
    const totalRequests = this.metrics.totalRequests;
    const totalErrors = Object.values(this.metrics.errorsByType).reduce((sum, err) => sum + err.count, 0);
    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

    if (errorRate > this.metrics.thresholds.maxErrorRate) {
      this.addAlert('HIGH_ERROR_RATE', `Error rate too high: ${(errorRate * 100).toFixed(1)}%`, 'error');
    }
  }

  addAlert(type, message, severity = 'info') {
    const alert = {
      id: Date.now().toString(),
      type,
      message,
      severity,
      timestamp: Date.now(),
      acknowledged: false
    };

    this.metrics.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.metrics.alerts.length > 100) {
      this.metrics.alerts = this.metrics.alerts.slice(-100);
    }

    // Log alert
    const severityEmoji = severity === 'error' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${severityEmoji} ALERT: ${message}`);
  }

  acknowledgeAlert(alertId) {
    const alert = this.metrics.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.saveMetrics();
    }
  }

  saveMetrics() {
    try {
      const metricsFile = path.join(process.cwd(), 'performance-metrics.json');
      fs.writeFileSync(metricsFile, JSON.stringify({
        ...this.metrics,
        lastUpdated: Date.now()
      }, null, 2));
    } catch (error) {
      console.error('Failed to save metrics:', error.message);
    }
  }

  generateReport() {
    console.log('📊 Performance Report - VideoRemix');
    console.log('=' .repeat(60));

    const uptime = Date.now() - this.metrics.uptime;
    const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(1);

    console.log(`⏱️  Uptime: ${uptimeHours} hours`);
    console.log(`📈 Total Requests: ${this.metrics.totalRequests.toLocaleString()}`);
    console.log(`💰 Total Cost: $${this.metrics.totalCost.toFixed(2)}`);

    // Error rate
    const totalErrors = Object.values(this.metrics.errorsByType).reduce((sum, err) => sum + err.count, 0);
    const errorRate = this.metrics.totalRequests > 0 ? (totalErrors / this.metrics.totalRequests * 100) : 0;
    console.log(`❌ Error Rate: ${errorRate.toFixed(1)}%`);

    console.log('\n🔧 By Provider:');
    Object.entries(this.metrics.requestsByProvider).forEach(([provider, stats]) => {
      const successRate = stats.count > 0 ? (stats.successCount / stats.count * 100) : 0;
      console.log(`  ${provider}: ${stats.count} requests, $${stats.cost.toFixed(2)}, ${successRate.toFixed(1)}% success, ${stats.avgDuration.toFixed(0)}ms avg`);
    });

    console.log('\n🚨 Recent Alerts:');
    const recentAlerts = this.metrics.alerts.filter(a => !a.acknowledged).slice(-5);
    if (recentAlerts.length === 0) {
      console.log('  No active alerts');
    } else {
      recentAlerts.forEach(alert => {
        const timeAgo = Math.floor((Date.now() - alert.timestamp) / 1000 / 60);
        console.log(`  ${alert.severity.toUpperCase()}: ${alert.message} (${timeAgo}m ago)`);
      });
    }

    console.log('\n📊 Top Error Types:');
    const sortedErrors = Object.entries(this.metrics.errorsByType)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5);

    if (sortedErrors.length === 0) {
      console.log('  No errors recorded');
    } else {
      sortedErrors.forEach(([type, stats]) => {
        console.log(`  ${type}: ${stats.count} occurrences`);
      });
    }
  }

  getHealthStatus() {
    const totalErrors = Object.values(this.metrics.errorsByType).reduce((sum, err) => sum + err.count, 0);
    const errorRate = this.metrics.totalRequests > 0 ? totalErrors / this.metrics.totalRequests : 0;

    const activeAlerts = this.metrics.alerts.filter(a => !a.acknowledged).length;

    let status = 'healthy';
    let score = 100;

    if (errorRate > 0.1) { // 10%
      status = 'critical';
      score -= 50;
    } else if (errorRate > 0.05) { // 5%
      status = 'warning';
      score -= 25;
    }

    if (activeAlerts > 5) {
      status = 'critical';
      score -= 30;
    } else if (activeAlerts > 2) {
      status = 'warning';
      score -= 15;
    }

    return { status, score: Math.max(0, score), errorRate, activeAlerts };
  }

  exportMetrics() {
    return {
      ...this.metrics,
      health: this.getHealthStatus(),
      report: this.generateReport()
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PerformanceMonitor();

  const command = process.argv[2];

  switch (command) {
    case 'report':
      monitor.generateReport();
      break;
    case 'health':
      const health = monitor.getHealthStatus();
      console.log(`Health Status: ${health.status.toUpperCase()} (Score: ${health.score}/100)`);
      console.log(`Error Rate: ${(health.errorRate * 100).toFixed(1)}%`);
      console.log(`Active Alerts: ${health.activeAlerts}`);
      break;
    case 'alerts':
      const alerts = monitor.metrics.alerts.filter(a => !a.acknowledged);
      if (alerts.length === 0) {
        console.log('No active alerts');
      } else {
        alerts.forEach(alert => {
          console.log(`${alert.type}: ${alert.message}`);
        });
      }
      break;
    case 'reset':
      monitor.metrics = {
        totalRequests: 0,
        totalCost: 0,
        requestsByProvider: {},
        errorsByType: {},
        performanceMetrics: [],
        uptime: Date.now(),
        alerts: [],
        thresholds: monitor.metrics.thresholds
      };
      monitor.saveMetrics();
      console.log('Metrics reset');
      break;
    default:
      console.log('Usage: node monitor-performance.js [command]');
      console.log('Commands:');
      console.log('  report  - Show performance report');
      console.log('  health  - Show health status');
      console.log('  alerts  - Show active alerts');
      console.log('  reset   - Reset all metrics');
  }
}

// Export for use in the application
export default PerformanceMonitor;