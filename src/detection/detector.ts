import { FileSource, MimeDetectionResult, MimeDetectionOptions } from './types';
import { detectFromMagicBytes, readBytes } from './magicBytes';
import { detectFromExtension, getMimeFamily } from './extension';

const DEFAULT_MAX_MAGIC_LENGTH = 64;

/**
 * Main MIME type detection function
 *
 * Priority:
 * 1. Binary magic bytes (highest confidence)
 * 2. Content-Type header or Blob.type
 * 3. File extension fallback (lowest confidence)
 */
export async function detectMimeType(
  source: FileSource,
  options: MimeDetectionOptions = {}
): Promise<MimeDetectionResult> {
  const maxMagicLength = options.maxMagicLength || DEFAULT_MAX_MAGIC_LENGTH;
  const signal = options.signal;

  try {
    // For URLs, fetch magic bytes and Content-Type header in parallel
    let bytesPromise: Promise<Uint8Array>;
    let headerPromise: Promise<string | null>;

    if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
      // Run both in parallel for HTTP/HTTPS URLs
      bytesPromise = readBytes(source, maxMagicLength, signal);
      headerPromise = getContentTypeFromHeader(source, signal);
    } else {
      // For non-URL sources, only read bytes
      bytesPromise = readBytes(source, maxMagicLength, signal);
      headerPromise = Promise.resolve(null);
    }

    // Step 1: Try magic bytes detection (HIGHEST PRIORITY)
    const bytes = await bytesPromise;
    const magicMimeType = detectFromMagicBytes(bytes, maxMagicLength);

    if (magicMimeType) {
      const family = getMimeFamily(magicMimeType);

      // Check if we're overriding another detection method
      const blobMimeType = getBlobMimeType(source);
      const extensionMimeType = detectFromExtension(source);

      const overridden = (blobMimeType && blobMimeType !== magicMimeType)
        ? { mimeType: blobMimeType, source: 'blob-type' }
        : (extensionMimeType && extensionMimeType !== magicMimeType)
        ? { mimeType: extensionMimeType, source: 'file-extension' }
        : undefined;

      return {
        mimeType: magicMimeType,
        family,
        confidence: 'high',
        source: 'magic-bytes',
        overridden,
      };
    }

    // Step 2: Try Content-Type header (for URLs) or Blob.type
    const headerMimeType = await headerPromise;
    if (headerMimeType) {
      const family = getMimeFamily(headerMimeType);
      return {
        mimeType: headerMimeType,
        family,
        confidence: 'medium',
        source: 'content-type-header',
      };
    }

    const blobMimeType = getBlobMimeType(source);
    if (blobMimeType) {
      const family = getMimeFamily(blobMimeType);
      return {
        mimeType: blobMimeType,
        family,
        confidence: 'medium',
        source: 'blob-type',
      };
    }

    // Step 3: Fall back to extension
    const extensionMimeType = detectFromExtension(source);
    if (extensionMimeType) {
      const family = getMimeFamily(extensionMimeType);
      return {
        mimeType: extensionMimeType,
        family,
        confidence: 'low',
        source: 'file-extension',
      };
    }

    // No detection succeeded
    return {
      mimeType: null,
      family: null,
      confidence: 'low',
      source: 'unknown',
    };
  } catch (error) {
    // If detection fails, return unknown
    return {
      mimeType: null,
      family: null,
      confidence: 'low',
      source: 'unknown',
    };
  }
}

/**
 * Get MIME type from Blob.type
 */
function getBlobMimeType(source: FileSource): string | null {
  if (typeof source !== 'string' && source.type) {
    return source.type;
  }
  return null;
}

/**
 * Get Content-Type from HTTP header (for URLs)
 */
async function getContentTypeFromHeader(
  source: FileSource,
  signal?: AbortSignal
): Promise<string | null> {
  if (typeof source !== 'string') return null;

  // Try for HTTP/HTTPS/FILE URLs
  if (!source.startsWith('http://') && !source.startsWith('https://') && !source.startsWith('file://')) {
    return null;
  }

  try {
    // Use HEAD request to avoid downloading the file
    const response = await fetch(source, {
      method: 'HEAD',
      signal,
    });

    const contentType = response.headers.get('Content-Type');
    if (!contentType) return null;

    // Remove charset and other parameters
    const mimeType = contentType.split(';')[0].trim();
    return mimeType || null;
  } catch (error) {
    // HEAD might fail, fall through to other methods
    return null;
  }
}
