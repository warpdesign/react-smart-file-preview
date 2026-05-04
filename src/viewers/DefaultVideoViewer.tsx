import { ViewerComponentProps } from './types';

export function DefaultVideoViewer({ url, detection }: ViewerComponentProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      minHeight: '200px',
      // Checkered background pattern (like Photoshop)
      backgroundImage: `
        linear-gradient(45deg, #d0d0d0 25%, transparent 25%),
        linear-gradient(-45deg, #d0d0d0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #d0d0d0 75%),
        linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
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
