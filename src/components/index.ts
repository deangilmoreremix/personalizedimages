/**
 * Barrel Export for Components
 * 
 * This file provides a centralized export point for all components,
 * making imports cleaner and more maintainable.
 * 
 * Usage:
 *   import { PageLoader, ErrorBoundary } from '@/components';
 */

// Layout & Utility Components
export { default as PageLoader } from './PageLoader';
export { default as ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

// Re-export commonly used types if available
export type { ErrorContext, ErrorSeverity, ErrorTrackingConfig } from '../utils/errorTracking';

// Note: Other components use default exports and can be imported directly:
//   import Hero from '@/components/Hero';
//   import Button from '@/components/ui/Button';
// 
// To enable barrel imports for all components, update each component file
// to use named exports instead of default exports:
//   export function ComponentName() { ... }
//   export default ComponentName;
