import '@testing-library/jest-dom';

// jsdom does not implement window.matchMedia, which ThemeProvider (and any
// component reading prefers-color-scheme) calls during render/effects. Provide
// a minimal MediaQueryList polyfill so component tests can render under jsdom.
// This is test infrastructure only and does not change application behavior.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string): MediaQueryList => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const mql = {
      media: query,
      matches: false,
      onchange: null,
      addListener: (cb: (event: MediaQueryListEvent) => void) => listeners.add(cb),
      removeListener: (cb: (event: MediaQueryListEvent) => void) => listeners.delete(cb),
      addEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) =>
        listeners.add(cb),
      removeEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) =>
        listeners.delete(cb),
      dispatchEvent: () => false,
    };
    return mql as unknown as MediaQueryList;
  }) as typeof window.matchMedia;
}