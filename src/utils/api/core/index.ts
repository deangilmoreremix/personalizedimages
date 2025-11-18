/**
 * Core API Module
 *
 * Unified entry point for all AI API interactions.
 */

// Export core components
export { ApiClient, apiClient } from './ApiClient';
export type { ApiRequest, ApiResponse, RateLimitInfo } from './ApiClient';

// Export providers
export * from './providers';

// Export types
export type * from './types';

// Re-export commonly used functions for backward compatibility
export { getEnvironmentConfig, validateEnvironmentConfig, hasValidApiKey, getApiKey } from '../../env';