import { describe, it, expect } from 'vitest';
import { detectMimeType } from '../detection/detector';
import { detectFromMagicBytes } from '../detection/magicBytes';

describe('MIME Detection', () => {
  describe('Magic Bytes Detection', () => {
    it('should detect JPEG from magic bytes even with .txt extension', async () => {
      // FF D8 FF E0 - JPEG magic bytes
      const bytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const file = new File([bytes], 'image.txt', { type: '' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('image/jpeg');
      expect(result.source).toBe('magic-bytes');
      expect(result.confidence).toBe('high');

      // Should show it overrode the extension
      expect(result.overridden).toBeDefined();
      expect(result.overridden?.mimeType).toBe('text/plain');
      expect(result.overridden?.source).toBe('file-extension');
    });

    it('should detect PNG from magic bytes', async () => {
      // 89 50 4E 47 0D 0A 1A 0A - PNG magic bytes
      const bytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const file = new File([bytes], 'image.png', { type: 'image/png' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('image/png');
      expect(result.source).toBe('magic-bytes');
      expect(result.confidence).toBe('high');
    });

    it('should detect WebP from RIFF/WEBP bytes', () => {
      const bytes = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // size
        0x57, 0x45, 0x42, 0x50, // WEBP
      ]);

      const mimeType = detectFromMagicBytes(bytes);
      expect(mimeType).toBe('image/webp');
    });

    it('should detect valid ZIP with PK\\x03\\x04 signature', async () => {
      // Valid ZIP signature: PK\x03\x04
      const bytes = new Uint8Array([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00]);
      const file = new File([bytes], 'archive.zip', { type: 'application/zip' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('application/zip');
      expect(result.source).toBe('magic-bytes');
      expect(result.confidence).toBe('high');
    });

    it('should NOT detect ZIP from text starting with "PKZIP"', async () => {
      // This is plain text that starts with "PKZIP" but is NOT a valid ZIP signature
      const text = 'PKZIP.EXE is a tool for unzipping files for MS/DOS.';
      const bytes = new TextEncoder().encode(text);
      const file = new File([bytes], 'readme.txt', { type: 'text/plain' });

      const result = await detectMimeType(file);

      // Should NOT detect as ZIP by magic bytes
      // Should fall back to MIME type or extension
      expect(result.mimeType).not.toBe('application/zip');

      // Should be detected as text/plain from Blob.type
      expect(result.mimeType).toBe('text/plain');
      expect(result.source).toBe('blob-type');
    });

    it('should NOT detect ZIP from just "PK" prefix', () => {
      // Just "PK" is not a valid ZIP signature
      const bytes = new Uint8Array([0x50, 0x4B, 0x00, 0x00]);

      const mimeType = detectFromMagicBytes(bytes);
      expect(mimeType).not.toBe('application/zip');
      expect(mimeType).toBeNull();
    });

    it('should detect GIF89a', () => {
      const bytes = new TextEncoder().encode('GIF89a');
      const mimeType = detectFromMagicBytes(bytes);
      expect(mimeType).toBe('image/gif');
    });

    it('should detect GIF87a', () => {
      const bytes = new TextEncoder().encode('GIF87a');
      const mimeType = detectFromMagicBytes(bytes);
      expect(mimeType).toBe('image/gif');
    });

    it('should detect PDF from %PDF- marker', () => {
      const bytes = new TextEncoder().encode('%PDF-1.4');
      const mimeType = detectFromMagicBytes(bytes);
      expect(mimeType).toBe('application/pdf');
    });

    it('should detect MP4 from ftyp box', () => {
      const bytes = new Uint8Array([
        0x00, 0x00, 0x00, 0x20, // box size
        0x66, 0x74, 0x79, 0x70, // ftyp
      ]);
      const mimeType = detectFromMagicBytes(bytes);
      expect(mimeType).toBe('video/mp4');
    });

    it('should detect MP3 with ID3 tag', () => {
      const bytes = new TextEncoder().encode('ID3');
      const mimeType = detectFromMagicBytes(bytes);
      expect(mimeType).toBe('audio/mpeg');
    });

    it('should detect WAV from RIFF/WAVE bytes', () => {
      const bytes = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // size
        0x57, 0x41, 0x56, 0x45, // WAVE
      ]);
      const mimeType = detectFromMagicBytes(bytes);
      expect(mimeType).toBe('audio/wav');
    });

    it('should detect WebM from EBML header', () => {
      const bytes = new Uint8Array([0x1A, 0x45, 0xDF, 0xA3]);
      const mimeType = detectFromMagicBytes(bytes);
      expect(mimeType).toBe('video/webm');
    });
  });

  describe('MIME Type vs Extension Priority', () => {
    it('should prioritize magic bytes over Blob MIME type', async () => {
      // JPEG magic bytes but wrong Blob type
      const bytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
      const file = new File([bytes], 'image.png', { type: 'image/png' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('image/jpeg');
      expect(result.source).toBe('magic-bytes');
      expect(result.overridden).toBeDefined();
      expect(result.overridden?.mimeType).toBe('image/png');
    });

    it('should prioritize magic bytes over file extension', async () => {
      // PNG magic bytes with .jpg extension
      const bytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const file = new File([bytes], 'image.jpg', { type: '' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('image/png');
      expect(result.source).toBe('magic-bytes');
    });

    it('should use Blob MIME type when magic bytes unavailable', async () => {
      // Plain text, no magic bytes
      const bytes = new TextEncoder().encode('Hello world');
      const file = new File([bytes], 'file.txt', { type: 'text/plain' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('text/plain');
      expect(result.source).toBe('blob-type');
      expect(result.confidence).toBe('medium');
    });

    it('should fall back to extension when magic bytes and MIME type unavailable', async () => {
      // Plain text, no Blob type
      const bytes = new TextEncoder().encode('Hello world');
      const file = new File([bytes], 'file.txt', { type: '' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('text/plain');
      expect(result.source).toBe('file-extension');
      expect(result.confidence).toBe('low');
    });
  });

  describe('Text-based Format Detection', () => {
    it('should detect text/plain from MIME type only, not content', async () => {
      const bytes = new TextEncoder().encode('This is plain text.');
      const file = new File([bytes], 'file.txt', { type: 'text/plain' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('text/plain');
      expect(result.source).toBe('blob-type');
    });

    it('should detect JSON from MIME type only, not content', async () => {
      const bytes = new TextEncoder().encode('{"test": true}');
      const file = new File([bytes], 'data.json', { type: 'application/json' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('application/json');
      expect(result.source).toBe('blob-type');
    });

    it('should detect SVG from MIME type only, not content', async () => {
      const bytes = new TextEncoder().encode('<svg></svg>');
      const file = new File([bytes], 'image.svg', { type: 'image/svg+xml' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('image/svg+xml');
      expect(result.source).toBe('blob-type');
    });

    it('should fall back to extension for .json files without MIME type', async () => {
      const bytes = new TextEncoder().encode('{"test": true}');
      const file = new File([bytes], 'data.json', { type: '' });

      const result = await detectMimeType(file);

      expect(result.mimeType).toBe('application/json');
      expect(result.source).toBe('file-extension');
    });
  });

  describe('maxMagicLength Constraint', () => {
    it('should only read maxMagicLength bytes for detection', async () => {
      // Create a file with known magic bytes at start
      const magicBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG
      const paddingBytes = new Uint8Array(1000).fill(0);
      const allBytes = new Uint8Array([...magicBytes, ...paddingBytes]);

      const file = new File([allBytes], 'image.jpg', { type: '' });

      // Set maxMagicLength to only 10 bytes
      const result = await detectMimeType(file, { maxMagicLength: 10 });

      // Should still detect JPEG from first few bytes
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.source).toBe('magic-bytes');
    });

    it('should not escalate to larger reads if detection fails within maxMagicLength', async () => {
      // File with no recognizable magic bytes
      const bytes = new Uint8Array(1000).fill(0x42);
      const file = new File([bytes], 'unknown.dat', { type: '' });

      const result = await detectMimeType(file, { maxMagicLength: 64 });

      // Should fall back to extension, not try to read more
      expect(result.mimeType).toBeNull();
      expect(result.source).toBe('unknown');
    });
  });

  describe('MIME Family Detection', () => {
    it('should extract correct MIME family from MIME type', async () => {
      const bytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
      const file = new File([bytes], 'image.jpg', { type: '' });

      const result = await detectMimeType(file);

      expect(result.family).toBe('image');
    });

    it('should handle MIME types without family', async () => {
      const bytes = new TextEncoder().encode('data');
      const file = new File([bytes], 'file', { type: '' });

      const result = await detectMimeType(file);

      expect(result.family).toBeNull();
    });
  });
});
