export type FileSource = string | File | Blob;

export type MimeDetectionResult = {
  mimeType: string | null;
  family: string | null;
  confidence: 'high' | 'medium' | 'low';
  source: 'magic-bytes' | 'content-type-header' | 'blob-type' | 'file-extension' | 'unknown';
  overridden?: {
    mimeType: string;
    source: string;
  };
};

export type MimeDetectionOptions = {
  maxMagicLength?: number;
  signal?: AbortSignal;
};
