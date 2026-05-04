import { ViewerComponentProps } from './types';

export function DefaultAudioViewer({ url, detection }: ViewerComponentProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4rem 2rem',
      minHeight: '200px',
      gap: '1rem'
    }}>
      <div style={{
        fontSize: '3rem',
        color: '#666',
      }}>
        🎵
      </div>
      <audio
        controls
        src={url}
        style={{
          width: '100%',
          maxWidth: '500px',
        }}
        onError={(e) => {
          const target = e.target as HTMLAudioElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `<div style="color: #d32f2f; padding: 1rem;">Failed to load audio: ${detection.mimeType || 'unknown type'}</div>`;
        }}
      >
        Your browser does not support the audio element.
      </audio>
      {detection.mimeType && (
        <div style={{
          fontSize: '0.875rem',
          color: '#666',
          fontFamily: 'monospace',
        }}>
          {detection.mimeType}
        </div>
      )}
    </div>
  );
}
