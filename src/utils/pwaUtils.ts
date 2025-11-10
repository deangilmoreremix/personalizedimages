// PWA Utilities for VideoRemix
export interface PWAAnalytics {
  installPromptShown: boolean;
  installPromptAccepted: boolean;
  offlineUsage: boolean;
  cacheHits: number;
  cacheMisses: number;
}

// Check if running in StackBlitz WebContainer
const isStackBlitz = (): boolean => {
  return (
    window.location.hostname.includes('stackblitz') ||
    window.location.hostname.includes('webcontainer') ||
    navigator.userAgent.includes('StackBlitz') ||
    // Check for WebContainer-specific indicators
    (window as any).process?.versions?.webcontainer
  );
};

// Service Worker Registration
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  // Skip Service Worker registration in development mode or StackBlitz WebContainer
  if (import.meta.env.DEV || isStackBlitz()) {
    if (import.meta.env.DEV) {
      console.log('Service Worker registration skipped: Development mode');
    } else {
      console.log('Service Worker registration skipped: Running in StackBlitz WebContainer (not supported)');
    }
    return null;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      if (import.meta.env.DEV) {
        console.log('Service Worker registered successfully:', registration.scope);
      }

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Service Worker registration failed:', error);
      }
      return null;
    }
  }

  if (import.meta.env.DEV) {
    console.log('Service Worker not supported');
  }
  return null;
};

// Check if app is installed
export const isPWAInstalled = (): boolean => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // iOS Safari
  if ((window.navigator as any).standalone) {
    return true;
  }

  return false;
};

// Check online status
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Get cache statistics
export const getCacheStats = async (): Promise<{ size: number; entries: number }> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let totalEntries = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalEntries += keys.length;

        // Estimate size (rough approximation)
        for (const request of keys) {
          try {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          } catch (e) {
            // Ignore errors for size calculation
          }
        }
      }

      return { size: totalSize, entries: totalEntries };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting cache stats:', error);
      }
    }
  }

  return { size: 0, entries: 0 };
};

// Clear all caches
export const clearAllCaches = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      if (import.meta.env.DEV) {
        console.log('All caches cleared');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error clearing caches:', error);
      }
    }
  }
};

// Show update notification
const showUpdateNotification = () => {
  // Create a simple notification for the update
  const updateBanner = document.createElement('div');
  updateBanner.id = 'pwa-update-banner';
  updateBanner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 shadow-lg';
  updateBanner.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div>
          <p class="font-medium">Update Available</p>
          <p class="text-sm opacity-90">A new version of VideoRemix is ready</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button id="update-dismiss" class="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm transition-colors">
          Later
        </button>
        <button id="update-reload" class="px-3 py-1 bg-white text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors">
          Update Now
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(updateBanner);

  // Handle button clicks
  document.getElementById('update-dismiss')?.addEventListener('click', () => {
    updateBanner.remove();
  });

  document.getElementById('update-reload')?.addEventListener('click', () => {
    window.location.reload();
  });
};

// Handle offline/online events
export const setupNetworkListeners = (onOnline?: () => void, onOffline?: () => void) => {
  window.addEventListener('online', () => {
    if (import.meta.env.DEV) {
      console.log('Network: Online');
    }
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    if (import.meta.env.DEV) {
      console.log('Network: Offline');
    }
    onOffline?.();
  });
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return 'denied';
};

// Send notification
export const sendNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    });
  }
};

// PWA Analytics tracking
export class PWAAnalyticsTracker {
  private static instance: PWAAnalyticsTracker;
  private analytics: PWAAnalytics = {
    installPromptShown: false,
    installPromptAccepted: false,
    offlineUsage: false,
    cacheHits: 0,
    cacheMisses: 0
  };

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): PWAAnalyticsTracker {
    if (!PWAAnalyticsTracker.instance) {
      PWAAnalyticsTracker.instance = new PWAAnalyticsTracker();
    }
    return PWAAnalyticsTracker.instance;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('pwa-analytics');
      if (stored) {
        this.analytics = { ...this.analytics, ...JSON.parse(stored) };
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading PWA analytics:', error);
      }
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('pwa-analytics', JSON.stringify(this.analytics));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving PWA analytics:', error);
      }
    }
  }

  trackInstallPromptShown() {
    this.analytics.installPromptShown = true;
    this.saveToStorage();
  }

  trackInstallPromptAccepted() {
    this.analytics.installPromptAccepted = true;
    this.saveToStorage();
  }

  trackOfflineUsage() {
    this.analytics.offlineUsage = true;
    this.saveToStorage();
  }

  trackCacheHit() {
    this.analytics.cacheHits++;
    this.saveToStorage();
  }

  trackCacheMiss() {
    this.analytics.cacheMisses++;
    this.saveToStorage();
  }

  getAnalytics(): PWAAnalytics {
    return { ...this.analytics };
  }

  resetAnalytics() {
    this.analytics = {
      installPromptShown: false,
      installPromptAccepted: false,
      offlineUsage: false,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.saveToStorage();
  }
}

export const pwaAnalytics = PWAAnalyticsTracker.getInstance();