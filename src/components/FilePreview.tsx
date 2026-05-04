import { useState, useEffect, useRef } from 'react';
import { FileSource, detectMimeType, MimeDetectionResult } from '../detection';
import { ViewerRegistry, resolveViewer } from '../viewers/registry';
import { createObjectURL, revokeObjectURL } from '../utils/objectUrl';
import {
  DefaultImageViewer,
  DefaultVideoViewer,
  DefaultAudioViewer,
  DefaultTextViewer,
  DefaultFallbackViewer,
} from '../viewers';

type FilePreviewProps = {
  source: FileSource;
  viewers?: ViewerRegistry;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error }>;
  maxMagicLength?: number;
};

const DEFAULT_VIEWERS: ViewerRegistry = {
  byFamily: {
    'image': DefaultImageViewer,
    'video': DefaultVideoViewer,
    'audio': DefaultAudioViewer,
    'text': DefaultTextViewer,
  },
  byMimeType: {
    'image/svg+xml': DefaultImageViewer,
    'application/json': DefaultTextViewer,
    'text/plain': DefaultTextViewer,
    'text/markdown': DefaultTextViewer,
  },
  fallback: DefaultFallbackViewer,
};

function DefaultLoading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      padding: '2rem',
      color: '#666'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #2196f3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div>Detecting file type...</div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function DefaultError({ error }: { error: Error }) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      color: '#d32f2f',
      background: '#ffebee',
      borderRadius: '4px',
      margin: '2rem'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
        Failed to load preview
      </div>
      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        {error.message}
      </div>
    </div>
  );
}

export function FilePreview({
  source,
  viewers,
  loadingComponent: LoadingComponent = DefaultLoading,
  errorComponent: ErrorComponent = DefaultError,
  maxMagicLength = 64,
}: FilePreviewProps) {
  const [detection, setDetection] = useState<MimeDetectionResult | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const sourceRef = useRef<FileSource>(source);

  // Update source ref when source changes
  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  // Main detection and URL creation effect
  useEffect(() => {
    // Abort any previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let createdUrl: string | null = null;

    async function detectAndPrepare() {
      try {
        setLoading(true);
        setError(null);

        // Create object URL
        createdUrl = createObjectURL(source);

        if (controller.signal.aborted) return;

        // Detect MIME type
        const result = await detectMimeType(source, {
          maxMagicLength,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setDetection(result);
        setObjectUrl(createdUrl);
        setLoading(false);
      } catch (err: any) {
        if (controller.signal.aborted) return;

        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }

    detectAndPrepare();

    // Cleanup
    return () => {
      controller.abort();

      // Revoke object URL if it was created
      if (createdUrl) {
        revokeObjectURL(createdUrl, sourceRef.current);
      }
    };
  }, [source, maxMagicLength]);

  // Merge default viewers with custom viewers
  const mergedViewers: ViewerRegistry = {
    byMimeType: {
      ...DEFAULT_VIEWERS.byMimeType,
      ...viewers?.byMimeType,
    },
    byFamily: {
      ...DEFAULT_VIEWERS.byFamily,
      ...viewers?.byFamily,
    },
    fallback: viewers?.fallback || DEFAULT_VIEWERS.fallback,
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} />;
  }

  if (!detection || !objectUrl) {
    return <ErrorComponent error={new Error('Failed to prepare file preview')} />;
  }

  // Resolve which viewer to use
  const ViewerComponent = resolveViewer(detection, mergedViewers);

  if (!ViewerComponent) {
    return <ErrorComponent error={new Error('No viewer available for this file type')} />;
  }

  return (
    <ViewerComponent
      source={source}
      url={objectUrl}
      mimeType={detection.mimeType}
      detection={detection}
    />
  );
}
