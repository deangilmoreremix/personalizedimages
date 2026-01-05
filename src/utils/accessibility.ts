// Accessibility utilities and helpers for production-ready apps

interface AccessibilityConfig {
  enableKeyboardNavigation?: boolean;
  enableScreenReaderSupport?: boolean;
  enableFocusManagement?: boolean;
  enableReducedMotion?: boolean;
  enableHighContrast?: boolean;
}

class AccessibilityManager {
  private config: Required<AccessibilityConfig>;
  private focusStack: HTMLElement[] = [];
  private observers: MutationObserver[] = [];

  constructor(config: AccessibilityConfig = {}) {
    this.config = {
      enableKeyboardNavigation: true,
      enableScreenReaderSupport: true,
      enableFocusManagement: true,
      enableReducedMotion: true,
      enableHighContrast: true,
      ...config
    };

    this.initialize();
  }

  private initialize() {
    if (this.config.enableKeyboardNavigation) {
      this.setupKeyboardNavigation();
    }

    if (this.config.enableScreenReaderSupport) {
      this.setupScreenReaderSupport();
    }

    if (this.config.enableFocusManagement) {
      this.setupFocusManagement();
    }

    if (this.config.enableReducedMotion) {
      this.setupReducedMotion();
    }

    if (this.config.enableHighContrast) {
      this.setupHighContrast();
    }
  }

  private setupKeyboardNavigation() {
    // Enhanced keyboard navigation for custom components
    document.addEventListener('keydown', (event) => {
      // Handle Escape key for modals/dialogs
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }

      // Handle Tab navigation
      if (event.key === 'Tab') {
        this.handleTabNavigation(event);
      }
    });
  }

  private setupScreenReaderSupport() {
    // Announce dynamic content changes
    this.setupLiveRegions();

    // Ensure proper ARIA labels
    this.validateAriaLabels();

    // Skip links for keyboard users
    this.addSkipLinks();
  }

  private setupFocusManagement() {
    // Manage focus for modals and dialogs
    this.setupFocusTraps();

    // Restore focus when components unmount
    this.setupFocusRestoration();
  }

  private setupReducedMotion() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionPreference = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        document.documentElement.classList.add('reduce-motion');
        this.disableAnimations();
      } else {
        document.documentElement.classList.remove('reduce-motion');
        this.enableAnimations();
      }
    };

    prefersReducedMotion.addEventListener('change', handleMotionPreference);
    handleMotionPreference(prefersReducedMotion);
  }

  private setupHighContrast() {
    // Detect high contrast mode
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');

    const handleContrastPreference = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    };

    prefersHighContrast.addEventListener('change', handleContrastPreference);
    handleContrastPreference(prefersHighContrast);
  }

  // Focus management methods
  trapFocus(container: HTMLElement) {
    if (!this.config.enableFocusManagement) return;

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    // Store for cleanup
    this.focusStack.push(container);
  }

  releaseFocus() {
    if (this.focusStack.length > 0) {
      this.focusStack.pop();
    }
  }

  // Screen reader support
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.config.enableScreenReaderSupport) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Utility methods
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];

    return Array.from(container.querySelectorAll(focusableSelectors.join(', ')))
      .filter((element) => {
        const htmlElement = element as HTMLElement;
        return htmlElement.offsetWidth > 0 && htmlElement.offsetHeight > 0;
      }) as HTMLElement[];
  }

  private handleEscapeKey() {
    // Close modals, dialogs, etc.
    const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]') as HTMLElement;
    if (activeModal) {
      const closeButton = activeModal.querySelector('[aria-label="Close"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  private handleTabNavigation(event: KeyboardEvent) {
    // Enhanced tab navigation logic can be added here
  }

  private setupLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'accessibility-live-region';
    document.body.appendChild(liveRegion);
  }

  private validateAriaLabels() {
    // Check for missing ARIA labels on interactive elements
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, [role="button"]');

    interactiveElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const hasAriaLabel = htmlElement.hasAttribute('aria-label') ||
                          htmlElement.hasAttribute('aria-labelledby') ||
                          htmlElement.hasAttribute('title');

      if (!hasAriaLabel && !htmlElement.textContent?.trim()) {
        console.warn('Accessibility: Interactive element missing label', htmlElement);
      }
    });
  }

  private addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50';
    skipLink.textContent = 'Skip to main content';

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  private setupFocusTraps() {
    // Focus trap logic for modals
  }

  private setupFocusRestoration() {
    // Focus restoration logic
  }

  private disableAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  private enableAnimations() {
    const styleElement = document.querySelector('style[data-reduced-motion]');
    if (styleElement) {
      styleElement.remove();
    }
  }

  // Public API methods
  isHighContrastEnabled(): boolean {
    return document.documentElement.classList.contains('high-contrast');
  }

  isReducedMotionEnabled(): boolean {
    return document.documentElement.classList.contains('reduce-motion');
  }

  getFocusableElementsInContainer(container: HTMLElement): HTMLElement[] {
    return this.getFocusableElements(container);
  }
}

// Global accessibility manager
export const accessibilityManager = new AccessibilityManager();

// React hooks for accessibility
export const useAccessibility = () => {
  const announce = (message: string, priority?: 'polite' | 'assertive') => {
    accessibilityManager.announce(message, priority);
  };

  const trapFocus = (container: HTMLElement) => {
    accessibilityManager.trapFocus(container);
  };

  const releaseFocus = () => {
    accessibilityManager.releaseFocus();
  };

  const isHighContrastEnabled = () => accessibilityManager.isHighContrastEnabled();
  const isReducedMotionEnabled = () => accessibilityManager.isReducedMotionEnabled();

  return {
    announce,
    trapFocus,
    releaseFocus,
    isHighContrastEnabled,
    isReducedMotionEnabled
  };
};

// Utility functions for common accessibility patterns
export const createAccessibleButton = (
  text: string,
  onClick: () => void,
  options: {
    ariaLabel?: string;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
  } = {}
) => {
  const { ariaLabel, disabled = false, variant = 'primary' } = options;

  const button = document.createElement('button');
  button.textContent = text;
  button.setAttribute('type', 'button');
  button.className = `btn btn-${variant}`;
  button.disabled = disabled;

  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }

  button.addEventListener('click', onClick);

  return button;
};

export const createScreenReaderOnlyText = (text: string): HTMLElement => {
  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = text;
  return span;
};

export { AccessibilityManager };
export type { AccessibilityConfig };