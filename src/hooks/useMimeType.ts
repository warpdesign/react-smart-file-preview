import { useState, useEffect, useRef } from 'react';
import { FileSource, detectMimeType, MimeDetectionResult } from '../detection';

export type UseMimeTypeOptions = {
  maxMagicLength?: number;
};

export type UseMimeTypeResult = {
  detection: MimeDetectionResult | null;
  loading: boolean;
  error: Error | null;
};

/**
 * React hook for detecting MIME type of a file source
 */
export function useMimeType(
  source: FileSource | null,
  options: UseMimeTypeOptions = {}
): UseMimeTypeResult {
  const [detection, setDetection] = useState<MimeDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!source) {
      setDetection(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Abort previous detection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function detect() {
      if (!source) return;

      try {
        setLoading(true);
        setError(null);

        const result = await detectMimeType(source, {
          maxMagicLength: options.maxMagicLength,
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setDetection(result);
          setLoading(false);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    detect();

    return () => {
      controller.abort();
    };
  }, [source, options.maxMagicLength]);

  return { detection, loading, error };
}
