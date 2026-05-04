import { useState, useEffect } from 'react';
import { ViewerComponentProps } from './types';

const DEFAULT_MAX_TEXT_BYTES = 1024 * 1024; // 1MB

type TextViewerOptions = {
  maxTextBytes?: number;
};

export function DefaultTextViewer({ url, detection }: ViewerComponentProps & TextViewerOptions) {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadText() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentLength = response.headers.get('Content-Length');
        const size = contentLength ? parseInt(contentLength) : null;

        // Check if we need to truncate
        const maxBytes = DEFAULT_MAX_TEXT_BYTES;
        const willTruncate = size !== null && size > maxBytes;

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const decoder = new TextDecoder();
        let result = '';
        let bytesRead = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          bytesRead += value.length;

          if (bytesRead > maxBytes) {
            // Truncate
            const remainingBytes = maxBytes - (bytesRead - value.length);
            const truncatedChunk = value.slice(0, remainingBytes);
            result += decoder.decode(truncatedChunk, { stream: false });
            setTruncated(true);
            reader.cancel();
            break;
          }

          result += decoder.decode(value, { stream: true });
        }

        if (mounted) {
          setText(result);
          setLoading(false);
          if (willTruncate) {
            setTruncated(true);
          }
        }
      } catch (err: any) {
        if (mounted && err.name !== 'AbortError') {
          setError(err.message || 'Failed to load text');
          setLoading(false);
        }
      }
    }

    loadText();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [url]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Loading text...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#d32f2f' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{
      padding: '1rem',
      background: '#f5f5f5',
      minHeight: '200px'
    }}>
      <pre style={{
        margin: 0,
        padding: '1rem',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '0.875rem',
        lineHeight: '1.5',
        fontFamily: '"Courier New", Courier, monospace',
        whiteSpace: 'pre'
      }}>
        {text}{truncated && '...'}
      </pre>
    </div>
  );
}
