import React from 'react';
import { Info, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { StockResource } from '../../services/stockImageService';
import { FreepikCompliance } from '../../utils/freepikCompliance';

interface FreepikAttributionProps {
  resources: StockResource[];
  isPremiumUser?: boolean;
  showComplianceInfo?: boolean;
  variant?: 'inline' | 'footer' | 'tooltip' | 'badge';
  className?: string;
}

export function FreepikAttribution({
  resources,
  isPremiumUser = false,
  showComplianceInfo = false,
  variant = 'inline',
  className = ''
}: FreepikAttributionProps) {
  if (resources.length === 0) return null;

  const hasFreepikResources = resources.some(r =>
    r.url?.includes('freepik') || r.license?.includes('freepik')
  );

  if (!hasFreepikResources) return null;

  const requiresAttribution = !isPremiumUser;

  if (!requiresAttribution && !showComplianceInfo) return null;

  const attributionText = FreepikCompliance.formatAttributionForExport(
    resources,
    'text',
    isPremiumUser
  );

  switch (variant) {
    case 'badge':
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium ${className}`}>
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Freepik Assets Used</span>
        </div>
      );

    case 'tooltip':
      return (
        <div className={`group relative inline-block ${className}`}>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <Info className="w-4 h-4" />
          </button>
          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50">
            <p className="font-medium mb-1">Attribution Required</p>
            <p className="text-gray-300">{attributionText}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      );

    case 'footer':
      return (
        <div className={`border-t border-gray-200 bg-gray-50 px-4 py-3 ${className}`}>
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="text-gray-700 font-medium mb-1">Image Attribution</p>
              <p className="text-gray-600">{attributionText}</p>
              {showComplianceInfo && (
                <a
                  href="https://www.freepik.com/legal/terms-of-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-2"
                >
                  View Freepik Terms
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      );

    case 'inline':
    default:
      return (
        <div className={`flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900">
              {requiresAttribution ? (
                <>
                  <span className="font-medium">Attribution required: </span>
                  {attributionText}
                </>
              ) : (
                <>
                  <span className="font-medium">Premium license active</span> - No attribution required
                </>
              )}
            </p>
            {showComplianceInfo && (
              <a
                href="https://www.freepik.com/legal/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-800 text-xs inline-flex items-center gap-1 mt-1.5"
              >
                Learn more about Freepik licensing
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      );
  }
}

interface ComplianceWarningProps {
  warnings: string[];
  onDismiss?: () => void;
}

export function ComplianceWarning({ warnings, onDismiss }: ComplianceWarningProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">
            Compliance Guidelines
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
          <a
            href="https://www.freepik.com/legal/terms-of-use"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-700 hover:text-yellow-800 text-xs font-medium inline-flex items-center gap-1 mt-3"
          >
            Review Freepik Terms of Use
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface ComplianceCheckProps {
  useCase: string;
  hasTransformation: boolean;
  isOnlyElement: boolean;
  children: (result: { isCompliant: boolean; warnings: string[] }) => React.ReactNode;
}

export function ComplianceCheck({
  useCase,
  hasTransformation,
  isOnlyElement,
  children
}: ComplianceCheckProps) {
  const result = FreepikCompliance.validateFreepikUsage(
    useCase,
    hasTransformation,
    isOnlyElement,
    false
  );

  return <>{children({ isCompliant: result.isCompliant, warnings: result.warnings })}</>;
}

export default FreepikAttribution;
