import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('notifications', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is off until permission is granted, then notifies only when the tab is hidden', async () => {
    const shown: any[] = [];
    const NotificationMock: any = vi.fn((title: string, o: any) => shown.push({ title, ...o }));
    NotificationMock.permission = 'default';
    NotificationMock.requestPermission = vi.fn(async () => {
      NotificationMock.permission = 'granted';
      return 'granted';
    });
    vi.stubGlobal('Notification', NotificationMock);
    const m = await import('../notifications');

    expect(m.isNotifyEnabled()).toBe(false);
    expect(await m.notifyDone('x')).toBe(false);
    expect(await m.setNotifyEnabled(true)).toBe(true);
    expect(m.isNotifyEnabled()).toBe(true);

    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    expect(await m.notifyDone('focused')).toBe(false); // visible + focused: stay quiet
    expect(await m.notifyDone('forced', { force: true, body: 'b', url: '/gallery' })).toBe(true);
    expect(shown[0]).toMatchObject({ title: 'forced', body: 'b', data: { url: '/gallery' } });

    vi.spyOn(document, 'hasFocus').mockReturnValue(false);
    expect(await m.notifyDone('background')).toBe(true);
  });

  it('stays disabled when permission is denied or unsupported', async () => {
    const N: any = vi.fn();
    N.permission = 'denied';
    N.requestPermission = vi.fn(async () => 'denied');
    vi.stubGlobal('Notification', N);
    let m = await import('../notifications');
    expect(await m.setNotifyEnabled(true)).toBe(false);
    expect(m.isNotifyEnabled()).toBe(false);

    vi.resetModules();
    vi.stubGlobal('Notification', undefined);
    m = await import('../notifications');
    expect(m.getNotificationPermission()).toBe('unsupported');
    expect(await m.setNotifyEnabled(true)).toBe(false);
  });

  it('decodes VAPID keys (url-safe base64)', async () => {
    const { urlBase64ToUint8Array } = await import('../notifications');
    expect(Array.from(urlBase64ToUint8Array('AQID'))).toEqual([1, 2, 3]);
    expect(Array.from(urlBase64ToUint8Array('-_8'))).toEqual([251, 255]);
  });
});

describe('analyticsBeacon', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is a no-op without an endpoint', async () => {
    const beacon = vi.fn(() => true);
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: beacon });
    const { trackEvent, isAnalyticsEnabled } = await import('../analyticsBeacon');
    expect(isAnalyticsEnabled()).toBe(false);
    expect(trackEvent('x')).toBe(false);
    expect(beacon).not.toHaveBeenCalled();
  });

  it('sends a compact, identifier-free payload with sendBeacon', async () => {
    const beacon = vi.fn((_url: string, _body: Blob) => true);
    vi.stubGlobal('navigator', { sendBeacon: beacon, doNotTrack: '0' });
    const { trackEvent, configureAnalytics } = await import('../analyticsBeacon');
    configureAnalytics({ endpoint: 'https://example.test/events' });
    expect(trackEvent('image_generated', { model: 'm', ms: 1200 })).toBe(true);
    const [url, blob] = beacon.mock.calls[0];
    expect(url).toBe('https://example.test/events');
    const text = await new Promise<string>(res => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsText(blob as Blob); });
    const body = JSON.parse(text);
    expect(body).toMatchObject({ name: 'image_generated', props: { model: 'm', ms: 1200 } });
    expect(Object.keys(body).sort()).toEqual(['name', 'path', 'props', 'session', 'ts']);
  });

  it('respects Do Not Track', async () => {
    const beacon = vi.fn(() => true);
    vi.stubGlobal('navigator', { sendBeacon: beacon, doNotTrack: '1' });
    const { trackEvent, configureAnalytics } = await import('../analyticsBeacon');
    configureAnalytics({ endpoint: 'https://example.test/events' });
    expect(trackEvent('x')).toBe(false);
    expect(beacon).not.toHaveBeenCalled();
  });
});
