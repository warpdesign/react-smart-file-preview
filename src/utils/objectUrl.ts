import { FileSource } from '../detection';

/**
 * Create an object URL from a file source
 * Handles URL strings, Files, and Blobs
 */
export function createObjectURL(source: FileSource): string {
  if (typeof source === 'string') {
    // Already a URL
    return source;
  }

  // Create blob URL
  return URL.createObjectURL(source);
}

/**
 * Revoke an object URL if it was created from a Blob/File
 */
export function revokeObjectURL(url: string, originalSource: FileSource): void {
  // Only revoke if this was a blob: URL we created
  if (typeof originalSource !== 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
