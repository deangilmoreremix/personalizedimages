/**
 * Privacy-friendly engagement analytics via the Beacon API (survives page unloads).
 * Off unless VITE_ANALYTICS_ENDPOINT is set. No cookies, no user identifiers: a random
 * per-tab session id only. Respects Do Not Track.
 */
const SESSION_KEY = 'vr.analytics.session';

let endpointOverride: string | undefined;

/** Set the collection endpoint at runtime (overrides VITE_ANALYTICS_ENDPOINT). */
export function configureAnalytics(opts: { endpoint?: string }) {
  endpointOverride = opts.endpoint;
}

function endpoint(): string {
  return endpointOverride ?? (((import.meta as any).env?.VITE_ANALYTICS_ENDPOINT as string) || '');
}

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Math.random()).slice(2);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

export function isAnalyticsEnabled(): boolean {
  if (!endpoint()) return false;
  if (typeof navigator !== 'undefined' && (navigator as any).doNotTrack === '1') return false;
  return true;
}

export type EventProps = Record<string, string | number | boolean | null>;

/** Fire-and-forget. Returns true if the browser accepted the payload. */
export function trackEvent(name: string, props: EventProps = {}): boolean {
  if (!isAnalyticsEnabled()) return false;
  const body = JSON.stringify({
    name: name.slice(0, 64),
    props,
    session: sessionId(),
    path: typeof location !== 'undefined' ? location.pathname : '',
    ts: Date.now()
  });
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      // text/plain keeps this a "simple" request (no CORS preflight) from sendBeacon.
      return navigator.sendBeacon(endpoint(), new Blob([body], { type: 'text/plain;charset=UTF-8' }));
    }
    fetch(endpoint(), { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}
