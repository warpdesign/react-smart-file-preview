/**
 * Magic byte signatures for binary file formats
 * These are checked FIRST before MIME type or extension
 */

type MagicSignature = {
  bytes: number[];
  offset?: number;
  mimeType: string;
};

const MAGIC_SIGNATURES: MagicSignature[] = [
  // Images
  { bytes: [0xFF, 0xD8, 0xFF], offset: 0, mimeType: 'image/jpeg' },
  { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0, mimeType: 'image/png' },

  // GIF87a and GIF89a
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], offset: 0, mimeType: 'image/gif' },
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], offset: 0, mimeType: 'image/gif' },

  // PDF
  { bytes: [0x25, 0x50, 0x44, 0x46, 0x2D], offset: 0, mimeType: 'application/pdf' }, // %PDF-

  // Video formats
  // MP4 - look for ftyp box (offset 4)
  { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, mimeType: 'video/mp4' }, // ftyp

  // Audio formats
  // MP3 with ID3
  { bytes: [0x49, 0x44, 0x33], offset: 0, mimeType: 'audio/mpeg' }, // ID3

  // MP3 frame sync (0xFF followed by 0xFB or 0xFA)
  { bytes: [0xFF, 0xFB], offset: 0, mimeType: 'audio/mpeg' },
  { bytes: [0xFF, 0xFA], offset: 0, mimeType: 'audio/mpeg' },

  // OGG
  { bytes: [0x4F, 0x67, 0x67, 0x53], offset: 0, mimeType: 'audio/ogg' }, // OggS (can also be video)

  // Archives - MUST use valid ZIP signatures only
  // Valid ZIP signatures per spec
  { bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0, mimeType: 'application/zip' }, // PK\x03\x04
  { bytes: [0x50, 0x4B, 0x05, 0x06], offset: 0, mimeType: 'application/zip' }, // PK\x05\x06 (empty archive)
  { bytes: [0x50, 0x4B, 0x07, 0x08], offset: 0, mimeType: 'application/zip' }, // PK\x07\x08 (spanned archive)
];

/**
 * WebP requires special handling - RIFF container with WEBP marker
 */
function checkWebP(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;

  // Check RIFF header
  if (bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46) {
    return false;
  }

  // Check WEBP marker at offset 8
  if (bytes[8] !== 0x57 || bytes[9] !== 0x45 || bytes[10] !== 0x42 || bytes[11] !== 0x50) {
    return false;
  }

  return true;
}

/**
 * WAV requires special handling - RIFF container with WAVE marker
 */
function checkWAV(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;

  // Check RIFF header
  if (bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46) {
    return false;
  }

  // Check WAVE marker at offset 8
  if (bytes[8] !== 0x57 || bytes[9] !== 0x41 || bytes[10] !== 0x56 || bytes[11] !== 0x45) {
    return false;
  }

  return true;
}

/**
 * WebM requires EBML header check
 */
function checkWebM(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;

  // EBML header: 0x1A 0x45 0xDF 0xA3
  return bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3;
}

/**
 * Detect MIME type from magic bytes
 * IMPORTANT: Only reads up to maxMagicLength bytes
 */
export function detectFromMagicBytes(
  bytes: Uint8Array,
  maxMagicLength: number = 64
): string | null {
  // Never read more than maxMagicLength
  const bytesToCheck = bytes.slice(0, Math.min(bytes.length, maxMagicLength));

  // Check special formats first (need more context)
  if (checkWebP(bytesToCheck)) return 'image/webp';
  if (checkWAV(bytesToCheck)) return 'audio/wav';
  if (checkWebM(bytesToCheck)) return 'video/webm';

  // Check standard magic signatures
  for (const signature of MAGIC_SIGNATURES) {
    const offset = signature.offset || 0;

    // Skip if we don't have enough bytes
    if (offset + signature.bytes.length > bytesToCheck.length) {
      continue;
    }

    // Check if bytes match
    let matches = true;
    for (let i = 0; i < signature.bytes.length; i++) {
      if (bytesToCheck[offset + i] !== signature.bytes[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return signature.mimeType;
    }
  }

  return null;
}

/**
 * Read bytes from different source types
 */
export async function readBytes(
  source: string | File | Blob,
  maxLength: number,
  signal?: AbortSignal
): Promise<Uint8Array> {
  if (typeof source === 'string') {
    // URL - use Range request
    return readBytesFromURL(source, maxLength, signal);
  } else {
    // Blob/File - use slice
    const blob = source.slice(0, maxLength);

    // Handle both browser and jsdom environments
    if (typeof blob.arrayBuffer === 'function') {
      const buffer = await blob.arrayBuffer();
      return new Uint8Array(buffer);
    } else {
      // Fallback for environments without arrayBuffer (like jsdom)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const buffer = reader.result as ArrayBuffer;
          resolve(new Uint8Array(buffer));
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(blob);
      });
    }
  }
}

async function readBytesFromURL(
  url: string,
  maxLength: number,
  signal?: AbortSignal
): Promise<Uint8Array> {
  // Handle data URLs specially
  if (url.startsWith('data:')) {
    return readBytesFromDataURL(url, maxLength);
  }

  // For blob: URLs, we can't do range requests
  // Try to fetch the whole thing (or at least the beginning)
  if (url.startsWith('blob:')) {
    const response = await fetch(url, { signal });
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer).slice(0, maxLength);
  }

  // For http/https, ONLY try Range request
  // NEVER fall back to fetching the full file
  const response = await fetch(url, {
    headers: {
      'Range': `bytes=0-${maxLength - 1}`,
    },
    signal,
  });

  // Check if the response is OK
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Range request not supported or failed`);
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

function readBytesFromDataURL(dataURL: string, maxLength: number): Uint8Array {
  // Extract base64 data
  const base64Index = dataURL.indexOf('base64,');
  if (base64Index === -1) {
    // Not base64, might be plain text data URL
    // Just return empty array as we can't easily extract bytes
    return new Uint8Array(0);
  }

  const base64 = dataURL.substring(base64Index + 7);

  // Decode base64
  const binaryString = atob(base64);
  const bytes = new Uint8Array(Math.min(binaryString.length, maxLength));

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}
