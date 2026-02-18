import { StockResource } from '../services/stockImageService';

export interface AttributionConfig {
  showInUI: boolean;
  embedInExport: boolean;
  format: 'text' | 'watermark' | 'metadata' | 'footer';
}

export interface ComplianceResult {
  isCompliant: boolean;
  requiresAttribution: boolean;
  attributionText: string;
  warnings: string[];
}

export const FREEPIK_COMPLIANCE = {
  FREE_ATTRIBUTION: 'Designed by Freepik',
  FREEPIK_URL: 'https://www.freepik.com',

  PROHIBITED_USES: [
    'Cannot redistribute Freepik content as standalone files',
    'Cannot use as the ONLY element in a product',
    'Cannot sublicense or resell Freepik content directly',
    'Must transform/add substantial value to Freepik assets'
  ],

  ALLOWED_USES: [
    'Commercial use in integrated products',
    'Modification and transformation',
    'Use in templates with customization',
    'Composite works with other elements',
    'Derivative works with added value'
  ]
} as const;

export function getAttributionText(resource: StockResource, isPremiumUser: boolean = false): string {
  if (isPremiumUser && resource.license?.includes('premium')) {
    return '';
  }

  const author = resource.author || 'Freepik';
  const baseAttribution = `Designed by ${author}`;

  if (resource.attributionText) {
    return resource.attributionText;
  }

  return baseAttribution;
}

export function getAttributionUrl(resource: StockResource): string {
  return resource.attributionUrl || resource.url || FREEPIK_COMPLIANCE.FREEPIK_URL;
}

export function formatAttributionForExport(
  resources: StockResource[],
  format: 'text' | 'html' | 'metadata',
  isPremiumUser: boolean = false
): string {
  const attributions = resources
    .map(resource => {
      const text = getAttributionText(resource, isPremiumUser);
      const url = getAttributionUrl(resource);

      if (!text) return null;

      switch (format) {
        case 'html':
          return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
        case 'metadata':
          return JSON.stringify({ text, url, resourceId: resource.id });
        case 'text':
        default:
          return `${text} (${url})`;
      }
    })
    .filter(Boolean);

  if (attributions.length === 0) return '';

  const uniqueAttributions = [...new Set(attributions)];

  switch (format) {
    case 'html':
      return `<div class="freepik-attribution">${uniqueAttributions.join(' • ')}</div>`;
    case 'metadata':
      return `[${uniqueAttributions.join(',')}]`;
    case 'text':
    default:
      return uniqueAttributions.join(' • ');
  }
}

export function validateFreepikUsage(
  useCase: string,
  hasTransformation: boolean,
  isOnlyElement: boolean,
  isRedistributing: boolean
): ComplianceResult {
  const warnings: string[] = [];
  let isCompliant = true;

  if (isRedistributing && !hasTransformation) {
    warnings.push('Cannot redistribute Freepik content without transformation');
    isCompliant = false;
  }

  if (isOnlyElement) {
    warnings.push('Freepik content should not be the ONLY element in your product');
    warnings.push('Add text, effects, or combine with other elements for compliance');
  }

  if (!hasTransformation) {
    warnings.push('Consider adding value through transformation, filters, or composition');
  }

  const requiresAttribution = !useCase.includes('premium');

  return {
    isCompliant,
    requiresAttribution,
    attributionText: requiresAttribution ? FREEPIK_COMPLIANCE.FREE_ATTRIBUTION : '',
    warnings
  };
}

export function embedAttributionInImage(
  imageDataUrl: string,
  attribution: string,
  position: 'bottom-right' | 'bottom-left' | 'bottom-center' = 'bottom-right'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.textBaseline = 'bottom';

      const padding = 8;
      const textWidth = ctx.measureText(attribution).width;
      const textHeight = 16;

      let x = padding;
      if (position === 'bottom-right') {
        x = canvas.width - textWidth - padding;
      } else if (position === 'bottom-center') {
        x = (canvas.width - textWidth) / 2;
      }

      const y = canvas.height - padding;

      ctx.fillRect(x - 4, y - textHeight, textWidth + 8, textHeight + 4);

      ctx.fillStyle = 'white';
      ctx.fillText(attribution, x, y);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageDataUrl;
  });
}

export function checkRateLimitCompliance(
  requestsMade: number,
  requestsLimit: number,
  timeWindowMs: number
): { canProceed: boolean; waitTimeMs: number; message: string } {
  const canProceed = requestsMade < requestsLimit;
  const waitTimeMs = canProceed ? 0 : timeWindowMs;

  return {
    canProceed,
    waitTimeMs,
    message: canProceed
      ? `${requestsLimit - requestsMade} requests remaining`
      : `Rate limit reached. Please wait ${Math.ceil(waitTimeMs / 1000)}s`
  };
}

export function trackFreepikUsage(
  resourceId: number,
  usedInModule: string,
  transformationType: 'reference' | 'composite' | 'template' | 'derivative' | 'thumbnail'
): void {
  if (typeof window !== 'undefined') {
    const usageKey = `freepik_usage_${resourceId}_${usedInModule}`;
    const usage = {
      resourceId,
      usedInModule,
      transformationType,
      timestamp: new Date().toISOString(),
      requiresAttribution: true
    };

    try {
      localStorage.setItem(usageKey, JSON.stringify(usage));
    } catch (error) {
      console.warn('Could not track Freepik usage:', error);
    }
  }
}

export function getUsageHistory(): Array<{
  resourceId: number;
  usedInModule: string;
  transformationType: string;
  timestamp: string;
}> {
  if (typeof window === 'undefined') return [];

  const history: Array<any> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('freepik_usage_')) {
      try {
        const usage = JSON.parse(localStorage.getItem(key) || '{}');
        history.push(usage);
      } catch (error) {
        console.warn('Could not parse usage history:', error);
      }
    }
  }

  return history.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export const FreepikCompliance = {
  getAttributionText,
  getAttributionUrl,
  formatAttributionForExport,
  validateFreepikUsage,
  embedAttributionInImage,
  checkRateLimitCompliance,
  trackFreepikUsage,
  getUsageHistory,
  COMPLIANCE_INFO: FREEPIK_COMPLIANCE
};

export default FreepikCompliance;
