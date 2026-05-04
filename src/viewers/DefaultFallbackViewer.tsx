import { ViewerComponentProps } from './types';

export function DefaultFallbackViewer({ source, url, detection }: ViewerComponentProps) {
  const fileName = typeof source !== 'string' && 'name' in source ? source.name : null;
  const fileSize = typeof source !== 'string' ? source.size : null;

  return (
    <div style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      background: '#f5f5f5',
      minHeight: '300px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem'
    }}>
      <div style={{
        fontSize: '4rem',
        opacity: 0.3
      }}>
        📄
      </div>

      <div>
        <h3 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.25rem',
          color: '#333'
        }}>
          No preview available
        </h3>
        <p style={{
          margin: 0,
          color: '#666',
          fontSize: '0.95rem'
        }}>
          This file type cannot be previewed
        </p>
      </div>

      <div style={{
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'left'
      }}>
        <dl style={{
          margin: 0,
          display: 'grid',
          gridTemplateColumns: '140px 1fr',
          gap: '0.75rem',
          fontSize: '0.9rem'
        }}>
          {fileName && (
            <>
              <dt style={{ fontWeight: 600, color: '#666' }}>File name:</dt>
              <dd style={{
                margin: 0,
                color: '#333',
                wordBreak: 'break-all',
                fontFamily: 'monospace'
              }}>{fileName}</dd>
            </>
          )}

          {fileSize !== null && (
            <>
              <dt style={{ fontWeight: 600, color: '#666' }}>Size:</dt>
              <dd style={{ margin: 0, color: '#333', fontFamily: 'monospace' }}>
                {formatBytes(fileSize)}
              </dd>
            </>
          )}

          <dt style={{ fontWeight: 600, color: '#666' }}>MIME type:</dt>
          <dd style={{ margin: 0, color: '#333', fontFamily: 'monospace' }}>
            {detection.mimeType || 'unknown'}
          </dd>

          <dt style={{ fontWeight: 600, color: '#666' }}>Detection:</dt>
          <dd style={{ margin: 0, color: '#333', fontFamily: 'monospace' }}>
            {detection.source} ({detection.confidence})
          </dd>

          {detection.overridden && (
            <>
              <dt style={{ fontWeight: 600, color: '#666' }}>Overridden:</dt>
              <dd style={{ margin: 0, color: '#f57c00', fontFamily: 'monospace' }}>
                {detection.overridden.mimeType} (from {detection.overridden.source})
              </dd>
            </>
          )}
        </dl>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#2196f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLAnchorElement).style.background = '#1976d2';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLAnchorElement).style.background = '#2196f3';
          }}
        >
          Open in new tab
        </a>

        <a
          href={url}
          download={fileName || true}
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#4caf50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLAnchorElement).style.background = '#388e3c';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLAnchorElement).style.background = '#4caf50';
          }}
        >
          Download
        </a>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
