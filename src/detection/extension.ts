/**
 * MIME type detection from file extensions
 * This is a FALLBACK when magic bytes and MIME type are unavailable
 */

const EXTENSION_TO_MIME: Record<string, string> = {
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',

  // Video
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.ogv': 'video/ogg',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.wmv': 'video/x-ms-wmv',

  // Audio
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.oga': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',

  // Documents
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript',
  '.ts': 'text/typescript',
  '.tsx': 'text/typescript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',

  // Archives
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.tgz': 'application/gzip',
  '.xz': 'application/x-xz',
  '.lha': 'application/x-lha',
  '.lzh': 'application/x-lzh',

  // Code files
  '.c': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.h': 'text/x-c',
  '.hpp': 'text/x-c++',
  '.py': 'text/x-python',
  '.java': 'text/x-java',
  '.rs': 'text/x-rust',
  '.go': 'text/x-go',
  '.sh': 'text/x-shellscript',
};

/**
 * Extract file extension from filename or URL
 */
function getExtension(filename: string): string | null {
  // Remove query string and hash from URLs
  const cleanName = filename.split('?')[0].split('#')[0];

  const lastDot = cleanName.lastIndexOf('.');
  if (lastDot === -1 || lastDot === cleanName.length - 1) {
    return null;
  }

  return cleanName.substring(lastDot).toLowerCase();
}

/**
 * Get filename from source
 */
function getFilename(source: string | File | Blob): string | null {
  if (typeof source === 'string') {
    // Extract filename from URL
    const url = source.split('?')[0].split('#')[0];
    const parts = url.split('/');
    return parts[parts.length - 1] || null;
  } else if ('name' in source && source.name) {
    return source.name;
  }

  return null;
}

/**
 * Detect MIME type from file extension
 */
export function detectFromExtension(source: string | File | Blob): string | null {
  const filename = getFilename(source);
  if (!filename) return null;

  const extension = getExtension(filename);
  if (!extension) return null;

  return EXTENSION_TO_MIME[extension] || null;
}

/**
 * Get MIME family from MIME type
 */
export function getMimeFamily(mimeType: string): string | null {
  const slashIndex = mimeType.indexOf('/');
  if (slashIndex === -1) return null;

  return mimeType.substring(0, slashIndex);
}
