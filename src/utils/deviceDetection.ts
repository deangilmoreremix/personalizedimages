/**
 * Detect if the current device is a mobile device
 * @returns true if the device is mobile
 */
export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Regular expression to check for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent) || 
    (window.innerWidth <= 768) ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);
}

/**
 * Detect if touch is supported
 * @returns true if touch is supported
 */
function isTouchSupported(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get the device type
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  
  if (width <= 640) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}