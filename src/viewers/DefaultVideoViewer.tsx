import { ViewerComponentProps } from './types';

export function DefaultVideoViewer({ url, detection }: ViewerComponentProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      minHeight: '200px',
      background: '#000'
    }}>
      <video
        controls
        src={url}
        style={{
          maxWidth: '100%',
          maxHeight: '80vh',
        }}
        onError={(e) => {
          const target = e.target as HTMLVideoElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `<div style="color: #d32f2f; padding: 1rem;">Failed to load video: ${detection.mimeType || 'unknown type'}</div>`;
        }}
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
}
