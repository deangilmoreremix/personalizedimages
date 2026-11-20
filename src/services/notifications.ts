/**
 * Notifications API + Push API helpers.
 * - notifyDone(): local "your image is ready" notification (only when the tab is in the background).
 * - subscribeToPush(): registers a Web Push subscription (needs VITE_VAPID_PUBLIC_KEY and a server
 *   that sends pushes; the service worker already handles `push` and `notificationclick`).
 */
const PREF_KEY = 'vr.notify.enabled';

export function isNotificationSupported(): boolean {
  return typeof Notification !== 'undefined';
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  return isNotificationSupported() ? Notification.permission : 'unsupported';
}

export function isNotifyEnabled(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === '1' && getNotificationPermission() === 'granted';
  } catch {
    return false;
  }
}

/** Turn the preference on (asks for permission if needed). Resolves to the resulting state. */
export async function setNotifyEnabled(on: boolean): Promise<boolean> {
  try {
    if (!on) {
      localStorage.setItem(PREF_KEY, '0');
      return false;
    }
    if (!isNotificationSupported()) return false;
    const perm = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    const granted = perm === 'granted';
    localStorage.setItem(PREF_KEY, granted ? '1' : '0');
    return granted;
  } catch {
    return false;
  }
}

export interface NotifyOptions {
  body?: string;
  tag?: string;
  url?: string;
  icon?: string;
  /** Show even if the tab is focused (default: only when hidden). */
  force?: boolean;
}

/** Returns true if a notification was shown. */
export async function notifyDone(title: string, opts: NotifyOptions = {}): Promise<boolean> {
  if (!isNotifyEnabled()) return false;
  if (!opts.force && typeof document !== 'undefined' && document.visibilityState === 'visible' && document.hasFocus()) return false;
  const options: NotificationOptions & { data?: unknown } = {
    body: opts.body,
    tag: opts.tag,
    icon: opts.icon || '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: opts.url || '/' }
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg?.showNotification) {
      await reg.showNotification(title, options);
      return true;
    }
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      if (opts.url) window.location.assign(opts.url);
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}

/* ---------------- Push API ---------------- */

export function isPushSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof window !== 'undefined' && 'PushManager' in window;
}

export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

/** Subscribe this browser to Web Push. Returns the subscription JSON to store server-side. */
export async function subscribeToPush(vapidPublicKey = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY): Promise<PushSubscriptionJSON | null> {
  if (!isPushSupported() || !vapidPublicKey) return null;
  if (Notification.permission === 'default') await Notification.requestPermission();
  if (Notification.permission !== 'granted') return null;
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub = existing || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource }));
  return sub.toJSON();
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return sub ? sub.unsubscribe() : false;
}
