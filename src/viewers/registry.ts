import { ViewerComponent } from './types';
import { MimeDetectionResult } from '../detection';

export type { ViewerRegistry } from './types';

/**
 * Resolve which viewer to use based on MIME detection result
 *
 * Priority:
 * 1. Exact MIME type match
 * 2. MIME family match
 * 3. Fallback viewer
 */
export function resolveViewer(
  detection: MimeDetectionResult,
  registry: import('./types').ViewerRegistry
): ViewerComponent | null {
  // Try exact MIME type match first
  if (detection.mimeType && registry.byMimeType?.[detection.mimeType]) {
    return registry.byMimeType[detection.mimeType];
  }

  // Try MIME family match
  if (detection.family && registry.byFamily?.[detection.family]) {
    return registry.byFamily[detection.family];
  }

  // Fall back to default viewer
  return registry.fallback || null;
}

/**
 * Create a viewer registry with convenience methods
 */
export function createViewerRegistry(
  config: Partial<import('./types').ViewerRegistry> = {}
): import('./types').ViewerRegistry {
  return {
    byMimeType: config.byMimeType || {},
    byFamily: config.byFamily || {},
    fallback: config.fallback,
  };
}
